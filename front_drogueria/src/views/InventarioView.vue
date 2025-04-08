<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Gestión de Inventario</h1>

    <!-- Botones de navegación -->
    <div class="button-container">
      <button 
        v-for="(option, key) in options" 
        :key="key" 
        @click="activeOption = key"
        class="nav-button"
        :class="activeOption === key ? 'active' : ''"
      >
        {{ option.label }}
      </button>
    </div>

    <!-- Formulario para Crear Producto -->
    <div v-if="activeOption === 'crear'" class="bg-white p-4 shadow rounded">
      <h2 class="text-xl font-bold mb-4">Crear Producto</h2>
      <form @submit.prevent="crearProducto">
        <input v-model="producto.codigoBarras" placeholder="Código de Barras" class="input-field">
        <input v-model="producto.descripcion" placeholder="Descripción" class="input-field">
        <input v-model.number="producto.cantidadStock" type="number" placeholder="Cantidad en Stock" class="input-field">
        <input v-model="producto.precioCompra" type="number" placeholder="Precio de Compra" class="input-field">
        <input v-model="producto.precioVenta" type="number" placeholder="Precio de Venta" class="input-field">
        <input v-model="producto.fechaVencimiento" type="date" class="input-field">
        <button type="submit" class="btn-primary">Guardar Producto</button>
      </form>
    </div>

    <!-- Reporte de Inventario -->
    <div v-if="activeOption === 'reporte'" class="bg-white p-4 shadow rounded">
      <h2 class="text-xl font-bold mb-4">Reporte de Inventario</h2>
      <button @click="obtenerProductos" class="btn-primary mb-4">Cargar Productos</button>
      <button @click="exportarCSV" class="btn-secondary mb-4">Exportar CSV</button>
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-200">
            <th class="border px-4 py-2">Código</th>
            <th class="border px-4 py-2">Descripción</th>
            <th class="border px-4 py-2">Stock</th>
            <th class="border px-4 py-2">Precio compra</th>
            <th class="border px-4 py-2">Precio Venta</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in productos" :key="p.codigoBarras">
            <td class="border px-4 py-2">{{ p.codigoBarras }}</td>
            <td class="border px-4 py-2">{{ p.descripcion }}</td>
            <td class="border px-4 py-2">{{ p.cantidadStock }}</td>
            <td class="border px-4 py-2">{{ p.precioCompra }}</td>
            <td class="border px-4 py-2">{{ p.precioVenta }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Buscar Producto -->
    <div v-if="activeOption === 'buscar'" class="bg-white p-4 shadow rounded">
      <h2 class="text-xl font-bold mb-4">Buscar Producto</h2>
      <input v-model="codigoBusqueda" placeholder="Código de Barras" class="input-field">
      <button @click="buscarProducto" class="btn-primary">Buscar</button>
      <div v-if="productoEncontrado">
        <h3 class="mt-4 text-lg font-semibold">Información del Producto</h3>
        <p><strong>Descripción:</strong> {{ productoEncontrado.descripcion }}</p>
        <p><strong>Stock:</strong> {{ productoEncontrado.cantidadStock }}</p>
        <p><strong>Precio Compra:</strong> {{ productoEncontrado.precioCompra }}</p>
        <p><strong>Precio Venta:</strong> {{ productoEncontrado.precioVenta }}</p>
      </div>
    </div>

    <!-- Modificar Producto -->
    <div v-if="activeOption === 'modificar'" class="bg-white p-4 shadow rounded">
      <h2 class="text-xl font-bold mb-4">Modificar Producto</h2>
      <input v-model="codigoModificar" placeholder="Código de Barras" class="input-field">
      <button @click="cargarProductoModificar" class="btn-primary">Cargar Datos</button>
      <form v-if="productoModificar" @submit.prevent="modificarProducto">
        <input v-model="productoModificar.descripcion" placeholder="Descripción" class="input-field">
        <input v-model.number="productoModificar.cantidadStock" type="number" placeholder="Stock" class="input-field">
        <input v-model.number="productoModificar.precioCompra" type="number" placeholder="Precio Compra" class="input-field">
        <input v-model.number="productoModificar.precioVenta" type="number" placeholder="Precio Venta" class="input-field">
        <input v-model="productoModificar.fechaVencimiento" type="date" placeholder="Fecha de vencimiento" class="input-field">
        <button type="submit" class="btn-primary">Guardar Cambios</button>
      </form>
    </div>

    <!-- Eliminar Producto -->
    <div v-if="activeOption === 'eliminar'" class="bg-white p-4 shadow rounded">
      <h2 class="text-xl font-bold mb-4">Eliminar Producto</h2>
      <input v-model="codigoEliminar" placeholder="Código de Barras" class="input-field">
      <input v-model="motivo" placeholder="Motivo de eliminación" class="input-field">
      <button @click="eliminarProducto" class="btn-danger">Eliminar</button>
    </div>

    <!-- Añadir Stock -->
    <div v-if="activeOption === 'stock'" class="bg-white p-4 shadow rounded">
      <h2 class="text-xl font-bold mb-4">Añadir Stock</h2>
      <input v-model="codigoStock" placeholder="Código de Barras" class="input-field">
      <input v-model.number="cantidadAjuste" type="number" placeholder="Cantidad a agregar" class="input-field">
      <button @click="ajustarStock" class="btn-primary">Añadir al Stock</button>
    </div>

    <!-- Registrar Venta -->
    <div v-if="activeOption === 'venta'" class="bg-white p-4 shadow rounded">
      <h2 class="text-xl font-bold mb-4">Registrar Venta</h2>
      <input v-model="codigoVenta" placeholder="Código de Barras" class="input-field">
      <input v-model.number="cantidadVenta" type="number" placeholder="Cantidad Vendida" class="input-field">
      <button @click="registrarVenta" class="btn-primary">Registrar Venta</button>
    </div>

    <!-- Consultar Ventas -->
    <div v-if="activeOption === 'ventas'" class="bg-white p-4 shadow rounded">
      <h2 class="text-xl font-bold mb-4">Consultar Ventas por Fecha</h2>
      <input v-model="fechaConsulta" type="date" class="input-field">
      <button @click="consultarVentasPorFecha" class="btn-primary">Consultar</button>
      <div v-if="ventas.length">
        <table class="w-full border-collapse mt-4">
          <thead>
            <tr class="bg-gray-200">
              <th class="border px-4 py-2">Código</th>
              <th class="border px-4 py-2">Cantidad</th>
              <th class="border px-4 py-2">Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="venta in ventas" :key="venta._id">
              <td class="border px-4 py-2">{{ venta.codigoBarras }}</td>
              <td class="border px-4 py-2">{{ venta.cantidad }}</td>
              <td class="border px-4 py-2">{{ venta.fecha }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        activeOption: null,
        cantidadAjuste: 0,
        producto: {
          codigoBarras: "",
          descripcion: "",
          cantidadStock: null,
          precioCompra: null,
          precioVenta: null,
          fechaVencimiento: ""
        },
        productos: [],
        codigoBusqueda: "",
        productoEncontrado: null,
        codigoModificar: "",
        productoModificar: null,
        codigoEliminar: "",
        motivo: "",
        codigoStock: "",
        options: {
          crear: { label: "Crear Producto" },
          reporte: { label: "Reporte Inventario" },
          buscar: { label: "Buscar Producto" },
          modificar: { label: "Modificar Producto" },
          eliminar: { label: "Eliminar Producto" },
          stock: {label: "Añadir Stock"}
        }
      };
    },
    methods: {
        async ajustarStock() {
    if (this.cantidadAjuste > 0 && this.codigoStock) {
        try {
            // 1. Obtener el producto con el código de barras ingresado
            const res = await axios.get(`http://localhost:3001/api/producto/uno?codigoBarras=${this.codigoStock}`);
            const producto = res.data;

            if (!producto) {
                alert("Producto no encontrado");
                return;
            }

            // 2. Sumar la cantidad al stock actual
            producto.cantidadStock += this.cantidadAjuste;

            // 3. Enviar la actualización al backend
            await axios.put("http://localhost:3001/api/producto/modificar", producto);

            alert("Stock actualizado correctamente");

            // 4. Limpiar los campos
            this.cantidadAjuste = 0;
            this.codigoStock = "";
        } catch (error) {
            console.error("Error al actualizar el stock:", error);
            alert("Hubo un error al actualizar el stock");
                }
            } else {
                if (!this.codigoStock) {
                    alert("Ingrese un código de Barras");
                } else {
                    alert("Ingrese una cantidad válida");
                }
            }
        },
      async crearProducto() {
        try{
        await axios.post("http://localhost:3001/api/producto/crear", this.producto);
        alert("Producto creado");
        this.limpiarFormulario();
      } catch (error) {
          console.error("Error al crear el producto:", error.response?.data || error.message);
          alert("Error: " + (error.response?.data?.error || error.message));
          this.limpiarFormulario();
        }
    },
      async obtenerProductos() {
        const res = await axios.get("http://localhost:3001/api/producto/todos");
        this.productos = res.data;
      },
      async buscarProducto() {
        const res = await axios.get(`http://localhost:3001/api/producto/uno?codigoBarras=${this.codigoBusqueda}`);
        this.productoEncontrado = res.data;
      },
      async cargarProductoModificar() {
        const res = await axios.get(`http://localhost:3001/api/producto/uno?codigoBarras=${this.codigoModificar}`);
        this.productoModificar = res.data;
      },
      async modificarProducto() {
        await axios.put("http://localhost:3001/api/producto/modificar", this.productoModificar);
        alert("Producto modificado");
      },
      async eliminarProducto() {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
        try {
          const res = await axios.delete("http://localhost:3001/api/producto/eliminar", {
            data: { codigoBarras: this.codigoEliminar, motivo: this.motivo }
          });
          // Mostrar respuesta del backend
          alert(res.data.mensaje); // Asegúrate de que el backend mande un campo `mensaje`
          console.log("Respuesta del backend:", res.data);
          
        } catch (error) {
          console.error("Error al eliminar el producto:", error.response?.data || error.message);
          alert("Error: " + (error.response?.data?.error || error.message));
        }
        this.codigoEliminar = '';
        this.motivo = '';
      }
    },
        exportarCSV() {
    if (this.productos.length === 0) {
        alert("No hay productos para exportar.");
        return;
    }

    // Definir separador: usa "," o ";" según la configuración regional de Excel
    const separador = ","; 

    // Encabezados
    const headers = ["Código de Barras", "Descripción", "Cantidad en Stock", "Precio Compra", "Precio Venta"];

    // Crear filas de datos asegurando que las descripciones estén entre comillas
    const filas = this.productos.map(p => [
        p.codigoBarras,
        `"${p.descripcion}"`,  // Se usan comillas para evitar problemas con comas dentro del texto
        p.cantidadStock,
        p.precioCompra,
        p.precioVenta
    ]);

    // Unir los datos en formato CSV
    const contenidoCSV = [
        headers.join(separador),  // Encabezados
        ...filas.map(fila => fila.join(separador))  // Datos
    ].join("\n");

    // Convertir el contenido a UTF-8 con BOM para evitar problemas con caracteres especiales
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + contenidoCSV], { type: "text/csv;charset=utf-8;" });

    // Crear un enlace de descarga dinámico
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reporte_inventario.csv"; // Nombre del archivo

    // Agregar el enlace al documento y hacer clic automáticamente
    document.body.appendChild(link);
    link.click();

    // Eliminar el enlace después de la descarga
    document.body.removeChild(link);
    },

      limpiarFormulario() {
        this.producto = {
          codigoBarras: "",
          descripcion: "",
          cantidadStock: null,
          precioCompra: null,
          precioVenta: null,
          fechaVencimiento: ""
        };
      }
    }
  };
  </script>
  
  <style>
/* Campos de entrada */
.input-field {
  display: block;
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

/* Contenedor de botones de navegación */
.button-container {
  display: flex;
  width: 100%;
  margin-bottom: 1.5rem;
  gap: 0.5rem;
}

/* Botones de navegación */
.nav-button {
  flex: 1;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  color: white;
  background-color: #1E2A78;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s ease-in-out;
  border: none;
  cursor: pointer;
}

.nav-button:hover {
  background-color: #2563eb;
}

.nav-button.active {
  background-color: #1d4ed8;
}

/* Tarjetas */
.card {
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
  padding: 2rem;
  max-width: 400px;
  margin: 1rem auto;
}

/* Botón primario */
.btn-primary {
  background-color: #202A96;
  color: white;
  font-weight: bold;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  width: 100%;
}

.btn-primary:hover {
  background-color: #1B237F;
}

/* Botón secundario */
.btn-secondary {
  background-color: #6366f1;
  color: white;
  font-weight: bold;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  width: 100%;
}

.btn-secondary:hover {
  background-color: #4f46e5;
}

/* Botón de peligro */
.btn-danger {
  background-color: #dc2626;
  color: white;
  font-weight: bold;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  width: 100%;
}

.btn-danger:hover {
  background-color: #b91c1c;
}
</style>
