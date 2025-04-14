// Importación de módulos necesarios
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Importar modelos
const Administrador = require('./modelos_drog/admin.js');
const Vendedor = require('./modelos_drog/vendedor.js');
const Ventas = require('./modelos_drog/ventas.js');
const Productos = require('./modelos_drog/productos.js');
const Clientes = require('./modelos_drog/clientes.js');
const { importarExcel, upload } = require('./modelos_drog/importExcel');



// Clave secreta para JWT
const JWT_SECRET = 'tu_clave_secreta';

const app = express();

// Middleware para parsear JSON en las solicitudes
app.use(express.json());

// Conexión a la base de datos MongoDB
const conexion = "mongodb+srv://wench2707:Lukas$2011@cluster0.thilx.mongodb.net/drogueria_invetario?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(conexion, {})
  .then(() => {
    console.log("✅ Conectado a MongoDB");
    
    // Crear administrador por defecto si no existe
    Administrador.crearAdminPorDefecto();
  })
  .catch(err => console.log("❌ Error al conectar a MongoDB:", err));

// Configuración de CORS para permitir solicitudes desde el frontend en Vue.js
app.use(cors({
  origin: 'http://localhost:8080',  // Permite solicitudes desde el frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
  credentials: true // Habilita cookies si es necesario
}));

// Middleware para verificar el token JWT
const autenticarJWT = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    // Verificar el token y obtener la información del usuario
    const datos = jwt.verify(token, JWT_SECRET);
    req.usuarioId = datos.id;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token inválido' });
  }
};

// Rutas para las API
//----------------------------------Administrador----------------------------------------------------------------------------

// 📌 Ruta para obtener todos los vendedores (solo para propósitos de prueba)
app.get('/api/vendedores', async (req, res) => {
  try {
    const vendedores = await Vendedor.find();
    res.json(vendedores);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener vendedores", error });
  }
});

// Ruta de login unificada para vendedores y administradores
app.post('/api/login', async (req, res) => {
  const { nombreUsuario, contrasena } = req.body;

  try {
    // Buscar usuario en ambas colecciones
    let usuario = await Vendedor.findOne({ nombreUsuario });
    let rol = 'vendedor';
    
    if (!usuario) {
      usuario = await Administrador.findOne({ nombreUsuario });
      rol = 'administrador';
    }
    
    if (!usuario) {
      return res.status(400).json({ error: 'Clave o Usuario incorrecto' });
    }
    
    // Comparar contraseñas con hash MD5
    const cont2 = crypto.createHash('md5').update(contrasena).digest('hex');
    
    if (cont2 !== usuario.contrasena) {
      return res.status(400).json({ error: 'Clave o Usuario incorrecto' });
    }
    
    const token1 =  jwt.sign(
      { id: nombreUsuario, rol: rol }, 
      JWT_SECRET, // Aquí pones tu clave secreta
      { expiresIn: '5m' }
    );
    
    res.json({
      token: token1,
      mensaje: `Bienvenido, ${usuario.nombreUsuario}`,
      rol
    });
    

  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor', detalle: error.message });
  }
});


// 📌 Ruta para cambiar la contraseña del administrador
app.put('/api/admin/cambiar-contrasena', async (req, res) => {
  try {
    const { nombreUsuario, contrasena } = req.body;

    // Encriptar la nueva contraseña
    const nuevaContrasenaHash = require('crypto').createHash('md5').update(contrasena).digest('hex');

    // Buscar y actualizar la contraseña del administrador
    const adminActualizado = await Administrador.findOneAndUpdate(
      { nombreUsuario },
      { contrasena: nuevaContrasenaHash },
      { new: true }
    );

    if (!adminActualizado) {
      return res.status(404).json({ mensaje: "Administrador no encontrado" });
    }

    res.json({ mensaje: "Contraseña actualizada con éxito" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar la contraseña", error });
  }
});

// 📌 Ruta para crear un nuevo vendedor (solo accesible por un administrador)
app.post('/api/admin/crear-vendedor', async (req, res) => {
  const { nombreUsuario, contrasena } = req.body;
  
  try {

    // Verificar que el usuario no exista
    const vendedorExistente = await Vendedor.findOne({ nombreUsuario });
    if (vendedorExistente) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }
    

    // Crear el vendedor en la base de datos
    const nuevoVendedor = new Vendedor({
      nombreUsuario,
      contrasena: contrasena,
      rol:'VENDEDOR',
    });

    await nuevoVendedor.save();
    res.status(201).json({ mensaje: "Vendedor creado con éxito" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear el vendedor", error });
  }
});

// 📌 Ruta para eliminar un vendedor (solo accesible por un administrador)
app.delete('/api/admin/eliminar-vendedor', async (req, res) => {
  const { nombreUsuario} = req.body;
  try {
    const vendedorEliminado = await Vendedor.findOneAndDelete({nombreUsuario});
    if (!vendedorEliminado) {
      return res.status(404).json({ mensaje: "Vendedor no encontrado" });
    }

    res.json({ mensaje: "Vendedor eliminado con éxito" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar el vendedor", error });
  }
});

//---------------------------------------------------------------------------------------------

//--------------------PRODUCTOS----------------------------------------------------------------
//Crear producto (revisar)
app.post('/api/producto/crear', async (req, res) => {
  try {
    let { codigoBarras, descripcion, cantidadStock, precioCompra, precioVenta, fechaVencimiento } = req.body;

    // Validaciones previas
    if (!codigoBarras || !descripcion || cantidadStock === undefined || !precioCompra || !precioVenta || !fechaVencimiento) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    // Verificar si el producto ya existe
    const productoExistente = await Productos.findOne({codigoBarras });
    if (productoExistente) {
      return res.status(400).json({ error: `El producto "${descripcion}" ya está registrado con este codigo.` });
    }
    const precioCompra_ = Number(req.body.precioCompra);
    const precioVenta_ = Number(req.body.precioVenta);
    // Validación adicional
    if (precioVenta_ < precioCompra_) {
      return res.status(400).json({ error: "El precio de venta no puede ser menor al precio de compra." });
    }

    // Crear y guardar el producto
    const nuevoProducto = new Productos({
      codigoBarras,
      descripcion,
      cantidadStock,
      precioCompra,
      precioVenta,
      fechaVencimiento
    });

    await nuevoProducto.save();
    res.status(201).json({ message: 'Producto registrado correctamente.' });

  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor", detalle: error.message });
  }
});

// Obtener todos los productos
app.get('/api/producto/todos', async (req, res) => {
  try {
    const productos = await Productos.find(); // Obtiene todos los productos de la BD
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los productos", detalle: error.message });
  }
});

//Obtener un producto especifico
app.get('/api/producto/uno', async (req, res) => {
  try {
    const { codigoBarras } = req.  query; 

    if (!codigoBarras ) {
      return res.status(400).json({ error: "Debe proporcionar código de barras" });
    }
    const producto = await Productos.findOne({codigoBarras:codigoBarras});

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar el producto", detalle: error.message });
  }
});


// Actualizar un PRODUCTO (revisar con front)
app.put('/api/producto/modificar', async (req, res) => {
  try {
    // Verificar que se proporcione un código de barras para identificar el producto
    const { codigoBarras } = req.body;
    
    if (!codigoBarras) {
      return res.status(400).json({ 
        success: false, 
        mensaje: 'El código de barras es obligatorio para modificar un producto' 
      });
    }

    // Buscar el producto por su código de barras
    const productoExistente = await Productos.findOne({ codigoBarras });
    
    if (!productoExistente) {
      return res.status(404).json({ 
        success: false, 
        mensaje: 'Producto no encontrado' 
      });
    }

    // Validar que la cantidad de stock no sea negativa
    if (req.body.cantidadStock !== undefined && req.body.cantidadStock < 0) {
      return res.status(400).json({
        success: false,
        mensaje: 'La cantidad de stock no puede ser negativa'
      });
    }

    // Validar que el precio de compra no sea negativo
    if (req.body.precioCompra !== undefined && req.body.precioCompra < 0) {
      return res.status(400).json({
        success: false,
        mensaje: 'El precio de compra no puede ser negativo'
      });
    }

    // Validar que el precio de venta no sea negativo
    if (req.body.precioVenta !== undefined && req.body.precioVenta < 0) {
      return res.status(400).json({
        success: false,
        mensaje: 'El precio de venta no puede ser negativo'
      });
    }

    // Actualizar el producto con la nueva información
    const productoActualizado = await Productos.findOneAndUpdate(
      { codigoBarras },
      req.body,
      { new: true, runValidators: true }
    );

    // Responder con el producto actualizado
    res.status(200).json({
      success: true,
      mensaje: 'Producto actualizado exitosamente',
      producto: productoActualizado
    });
    
  } catch (error) {
    // Manejar errores específicos
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        mensaje: 'Error de validación',
        errores: Object.values(error.errors).map(err => err.message)
      });
    }
    
    // Error de duplicado (nombre o código de barras)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        mensaje: 'Ya existe un producto con ese nombre o código de barras'
      });
    }
    
    // Otros errores
    console.error('Error al actualizar producto:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al actualizar el producto',
      error: error.message
    });
  }
});


// Eliminar un PRODUCTO con motivo
app.delete('/api/producto/eliminar', async (req, res) => {
  try {
    const { codigoBarras , motivo } = req.body;
    

    if (!motivo || motivo.trim() === "") {
      return res.status(400).send({ error: "Debe proporcionar un motivo para la eliminación." });
    }

    const producto = await Productos.findOneAndDelete({codigoBarras:codigoBarras});

    if (!producto) {
      return res.status(404).send({ error: "Producto no encontrado." });
    }

    res.send({ mensaje: `Producto ${producto.descripcion} fue eliminado por este Motivo: ${motivo}` });
  } catch (error) {
    res.status(500).send({ error: "Error al eliminar el Producto", detalles: error.message });
  }
});


//Cargar un archivo excel con productos:
app.post('/api/productos/importar', upload.single('archivoExcel'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Debe subir un archivo Excel" });
    }

    const resultado = await importarExcel(req.file.buffer);
    res.status(resultado.success ? 200 : 500).json(resultado);
});


//--------------------------------------------------------------------------------------------

//----------------Clientes--------------------------------------------------------------------
//Crear cliente
app.post('/api/clientes/crear', async (req, res) => {
  try {
    let { nombre,numero } = req.body;

    // Validaciones previas
    if (!nombre || numero === undefined ) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    // Verificar si el cliente ya existe

    const clienteExistente = await Clientes.findOne({nombre});
    if (clienteExistente) {
      return res.status(400).json({ error: `El cliente "${nombre}" ya está registrado.` });
    }

    const clienteExistentenum = await Clientes.findOne({numero});
    if (clienteExistentenum) {
      return res.status(400).json({ error: `El cliente "${clienteExistentenum.nombre}" ya está registrado con este número.` });
    }
    const tamaño = numero.length; 
    if (tamaño !== 10) {
      return res.status(400).json({ error: `Revise el número "${numero}", tiene más o menos de 10 dígitos.` });
    }

    // Crear y guardar el Cliente
    const nuevoCliente = new Clientes({
      nombre,
      numero,
    });

    await nuevoCliente.save();
    res.status(201).json({ message: 'Cliente registrado correctamente.'});

  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor", detalle: error.message });
  }
});

// Obtener todos los clientes
app.get('/api/clientes/todos', async (req, res) => {
  try {
    const clientes = await Clientes.find(); // Obtiene todos los clientes de la BD
    res.status(200).json(clientes);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los clientes", detalle: error.message });
  }
});

//Obtener un cliente especifico
app.get('/api/clientes/uno', async (req, res) => {
  try {
    const { nombre, idCliente } = req.  body; // Recibe los parámetros desde la URL

    if (!nombre && !idCliente) {
      return res.status(400).json({ error: "Debe proporcionar nombre o numero de cliente" });
    }

    const filtro = {};
    if (idCliente) filtro.idCliente = idCliente;
    if (nombre)filtro.nombre  = { $regex: nombre, $options: 'i' }; // Búsqueda parcial e insensible a mayúsculas

    const cliente = await Clientes.findOne(filtro);

    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.status(200).json(cliente);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar el producto", detalle: error.message });
  }
});


// Actualizar un cliente (revisar con front)
app.put('/api/clientes/modificar', async (req, res) => {
  try {
    // Verificar que se proporcione un numero de clientes para identificar el producto
    const { nombre, idCliente } = req.  body; 

    if (!nombre && !idCliente) {
      return res.status(400).json({ error: "Debe proporcionar nombre o numero de cliente" });
    }

    const filtro = {};
    if (idCliente) filtro.idCliente = idCliente;
    if (nombre)filtro.nombre  = { $regex: nombre, $options: 'i' }; // Búsqueda parcial e insensible a mayúsculas


    // Buscar el producto por su código de barras
    const clienteExistente = await Clientes.findOne({filtro});
    
    if (!clienteExistente) {
      return res.status(404).json({ 
        success: false, 
        mensaje: 'cliente no encontrado' 
      });
    }

    // Actualizar el cliente con la nueva información
    const clienteActualizado = await Clientes.findOneAndUpdate(
      { nombre },
      req.body,
      { new: true, runValidators: true }
    );

    // Responder con el cliente actualizado
    res.status(200).json({
      success: true,
      mensaje: 'Cloiente actualizado exitosamente',
      producto: clienteActualizado
    });
    
  } catch (error) {
    // Manejar errores específicos
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        mensaje: 'Error de validación',
        errores: Object.values(error.errors).map(err => err.message)
      });
    }
    
    // Error de duplicado (nombre o id)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        mensaje: 'Ya existe un cliente con ese nombre o id'
      });
    }
    
    // Otros errores
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al actualizar el cliente',
      error: error.message
    });
  }
});


  
// Eliminar un Cliente con motivo
app.delete('/api/clientes/eliminar', async (req, res) => {
  try {
    const { idCliente , motivo } = req.body;
    

    if (!idCliente || motivo.trim() === "") {
      return res.status(400).send({ error: "Debe proporcionar un motivo para la eliminación." });
    }

    const cliente = await Clientes.findOneAndDelete(idCliente);

    if (!cliente) {
      return res.status(404).send({ error: "cliente no encontrado." });
    }

    console.log(`cliente eliminado. Cliente: ${cliente.nombre}, Motivo: ${motivo}`);

    res.send({ mensaje: "cliente eliminado con éxito.", cliente, motivo });
  } catch (error) {
    res.status(500).send({ error: "Error al eliminar el Cliente", detalles: error.message });
  }
});
//--------------------------------------------------------------------------------------------


//-----------------------------------------Ventas----------------------------------------------

//Factura de Productos y almacenamiento de la venta 
app.post('/api/producto/factura', async (req, res) => {
  try {
    // Extraemos los datos de la solicitud
    let { tipoVenta, cliente, productos, pago } = req.body;
    
    // Validamos que haya productos en la factura
    if (!productos || productos.length === 0) {
      return res.status(400).json({ error: "Debe enviar al menos un producto" });
    }

    if(tipoVenta === 'cliente'){
      if (!cliente) {
        return res.status(400).json({ error: "Debe enviar el ID del cliente" });
      }

      cliente = await Clientes.findOne({idCliente:cliente});

      if (!cliente) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

        // (cliente.id y cliente.nombre)
      datosCliente = {
        id: cliente.idCliente,
        nombre: cliente.nombre
      };

    }

    let total = 0; // Variable para calcular el total de la factura
    let productosProcesados = []; // Lista donde guardaremos los productos con sus detalles para la BD

    // Iteramos sobre los productos enviados en la solicitud
    for (const item of productos) {
      // Buscamos el producto en la base de datos usando el código de barras
      const producto = await Productos.findOne({ codigoBarras: item.codigoBarras });

      // Si el producto no existe, devolvemos un error
      if (!producto) {
        return res.status(404).json({ error: `Producto con código ${item.codigoBarras} no encontrado` });
      }
      // Validamos que haya suficiente stock para vender la cantidad solicitada
      if (producto.cantidadStock < item.cantidad) {
        return res.status(400).json({ error: `Stock insuficiente para ${producto.descripcion}` });
      }

      // Calculamos el precio final considerando un posible descuento
      let precioFinal = producto.precioVenta;
      if (producto.descuento) {
        precioFinal -= (producto.descuento / 100) * producto.precioVenta;
      }

      // Calculamos el subtotal del producto
      const subtotal = precioFinal * item.cantidad;
      total += subtotal; // Sumamos el subtotal al total de la factura

      // Agregamos los detalles del producto a la lista de productosProcesados
      productosProcesados.push({
        codigoBarras: producto.codigoBarras, // Referencia al producto en la base de datos
        descripcion: producto.descripcion,
        cantidad: item.cantidad,
        tipoVenta: tipoVenta,
        precioUnitario: producto.precioVenta,
        subtotal
      });

      // Actualizamos el stock del producto en la base de datos
      //await Productos.updateOne({ codigoBarras: item.codigoBarras }, { $inc: { cantidadStock: -item.cantidad } });
    }

    // Validamos que el método de pago sea válido
    if (!['efectivo', 'credito'].includes(pago.metodo)) {
      return res.status(400).json({ error: "Método de pago no válido" });
    }

    // Calculamos el cambio si el pago es en efectivo
    let montoPagado = pago.metodo === 'efectivo' ? pago.montoPagado || 0 : 0;
    let cambio = montoPagado - total > 0 ? montoPagado - total : 0;



    // Creamos la nueva factura en la base de datos
    const nuevaFactura = new Ventas({
      tipoVenta, // "mostrador" o "cliente"
      cliente: tipoVenta === 'cliente' ? datosCliente : undefined, // Solo se guarda el cliente si es una venta de cliente
      productos: productosProcesados, // Lista de productos con detalles
      total, // Total de la factura
      pago: {
        metodo: pago.metodo, // "efectivo" o "credito"
        montoPagado, // Solo si el método es efectivo
        cambio // Calculado solo si se pagó con efectivo
      },
      fecha: new Date() // Fecha y hora actual
    });


    // Guardamos la factura en la base de datos
    await nuevaFactura.save();

    // Descontar inventario solo si la factura fue exitosa
    for (const item of productos) {
      await Productos.updateOne(
        { codigoBarras: item.codigoBarras },
        { $inc: { cantidadStock: -item.cantidad } }
      );
    }

    if (tipoVenta === 'cliente' && pago.metodo === 'credito') {
      // Buscar cliente por idCliente
      const clienteEncontrado = await Clientes.findOne({ idCliente: datosCliente.id });
    
      if (!clienteEncontrado) {
        return res.status(404).json({ error: 'Cliente no encontrado para registrar deuda' });
      }
    
      // Generar número de factura (puedes usar el _id de la venta o un contador)
      const numeroFactura = nuevaFactura._id.toString();
    
      const productosDeuda = productosProcesados.map(p => ({
        nombre: p.descripcion,
        cantidad: p.cantidad,
        Deuda: p.subtotal
      }));
    
      // Actualizar el campo de crédito
      clienteEncontrado.credito = {
        numeroFactura,
        productos: productosDeuda
      };
    
      await clienteEncontrado.save();
    }

    // Enviamos la respuesta con la información de la venta
    res.status(201).json({ message: "Factura generada con éxito", total, cambio });

  } catch (error) {
    // Capturamos cualquier error inesperado y devolvemos un mensaje de error
    res.status(500).json({ error: "Error al procesar la factura", detalle: error.message });
  }
});

//---------------------------------------------------------------------------------------------


// Endpoint para estadísticas de inventario
app.get('/api/estadisticas/inventario', async (req, res) => {
  try {
    // Obtener filtros de fecha opcionales de los parámetros de consulta
    const { fechaInicio, fechaFin } = req.query;
    
    // Construir filtro de fecha si se proporcionan fechas
    const dateFilter = {};
    if (fechaInicio || fechaFin) {
      dateFilter.fecha = {};
      if (fechaInicio) dateFilter.fecha.$gte = new Date(fechaInicio);
      if (fechaFin) dateFilter.fecha.$lte = new Date(fechaFin);
    }

    // Obtener estadísticas de ventas de productos
    const ventasStats = await Ventas.aggregate([
      { $match: dateFilter },
      { $unwind: '$productos' },
      { $group: {
          _id: '$productos.codigoBarras',
          descripcion: { $first: '$productos.descripcion' },
          cantidadVendida: { $sum: '$productos.cantidad' },
          ingresoTotal: { $sum: { $multiply: ['$productos.cantidad', '$productos.precioUnitario'] } },
          ventasCount: { $sum: 1 }
      }},
      { $sort: { cantidadVendida: -1 } },
      { $limit: 10 } // Limitar a los 10 productos más vendidos
    ]);

    // Obtener niveles de inventario actuales
    const inventarioActual = await Productos.find({}, {
      codigoBarras: 1,
      descripcion: 1,
      cantidadStock: 1,
      precioVenta: 1,
      precioCompra: 1,
      fechaVencimiento: 1,
      _id: 0
    }).sort({ cantidadStock: 1 }); // Ordenar por cantidad en stock ascendente
    
    // Obtener ventas por método de pago
    const metodosPago = await Ventas.aggregate([
      { $match: dateFilter },
      { $group: {
          _id: '$pago.metodo',
          total: { $sum: '$total' },
          count: { $sum: 1 }
      }}
    ]);
    
    // Total de ventas en el período
    const ventasTotales = await Ventas.aggregate([
      { $match: dateFilter },
      { $group: {
          _id: null,
          total: { $sum: '$total' },
          count: { $sum: 1 }
      }}
    ]);

    // Productos con bajo stock (menos de 10 unidades)
    const bajoStock = inventarioActual.filter(p => p.cantidadStock < 10);
    
    // Productos próximos a vencer (en los próximos 30 días)
    const hoy = new Date();
    const treintaDiasDespues = new Date();
    treintaDiasDespues.setDate(hoy.getDate() + 30);
    
    const productosProximosVencer = inventarioActual.filter(p => {
      const fechaVencimiento = new Date(p.fechaVencimiento);
      return fechaVencimiento >= hoy && fechaVencimiento <= treintaDiasDespues && p.cantidadStock > 0;
    });

    // Estadísticas de tipo de venta (mostrador vs cliente)
    const ventasPorTipo = await Ventas.aggregate([
      { $match: dateFilter },
      { $group: {
          _id: '$tipoVenta',
          total: { $sum: '$total' },
          count: { $sum: 1 }
      }}
    ]);

    res.json({
      ventasProductos: ventasStats,
      inventarioActual,
      metodosPago,
      ventasTotales: ventasTotales[0] || { total: 0, count: 0 },
      bajoStock,
      productosProximosVencer,
      ventasPorTipo
    });

  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ 
      error: "Error al obtener estadísticas", 
      detalle: error.message 
    });
  }
});


//--------------------------------------------------------------------------------------------

//---------------------------------------------------------------------------------------------
// Configuración del servidor
app.listen(3001, '0.0.0.0', () => {
  console.log("🚀 Servidor corriendo en http://localhost:3001");
});

//------------------------------------------------------------------------------------------


