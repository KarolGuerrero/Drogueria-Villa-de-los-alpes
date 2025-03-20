// Importación de módulos necesarios
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');

// Importar modelos
const Administrador = require('./modelos_drog/admin.js');
const Vendedor = require('./modelos_drog/vendedor.js');
const Ventas = require('./modelos_drog/ventas.js');
const Productos = require('./modelos_drog/productos.js');
const vendedor = require('./modelos_drog/vendedor.js');

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

// Rutas para la API

//Administrador----------------------------------------------------------------------------

// 📌 Ruta para obtener todos los administradores (solo para propósitos de prueba)
app.get('/api/vendedores', async (req, res) => {
  try {
    const vendedores = await vendedor.find();
    res.json(vendedores);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener vendedores", error });
  }
});

// 📌 Ruta para iniciar sesión como administrador
app.post('/api/admin/login', async (req, res) => {
  const { nombreUsuario, contrasena } = req.body;
  
  try {
    // Verificar si el administrador existe
    const admin = await Administrador.findOne({ nombreUsuario: nombreUsuario });

    if (!admin) return res.status(400).json({ error: 'Clave o Usuario incorrecto' });
    
    // Comparación del hash almacenado con la contraseña en texto claro
    const cont2 = crypto.createHash('md5').update(contrasena).digest('hex');
    
    if (cont2 !== admin.contrasena) {
      return res.status(400).json({ error: 'Clave o Usuario incorrecto' });
    }

    // Si la contraseña es válida, responder con un mensaje de bienvenida
    res.json({ mensaje: `Bienvenido, ${admin.nombreUsuario}` });

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

// Configuración del servidor
app.listen(3001, '0.0.0.0', () => {
  console.log("🚀 Servidor corriendo en http://localhost:3001");
});
