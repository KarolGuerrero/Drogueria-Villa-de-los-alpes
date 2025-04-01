<template>
    <div class="p-6 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-4">Gestión de Inventario</h1>
  
      <!-- Botones de navegación -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button 
          v-for="(option, key) in options" 
          :key="key" 
          @click="activeOption = key"
          class="px-4 py-2 rounded shadow text-white"
          :class="activeOption === key ? 'bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'"
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
          <button type="submit" class="btn-primary">Guardar Cambios</button>
        </form>
      </div>
  
      <!-- Eliminar Producto -->
      <div v-if="activeOption === 'eliminar'" class="bg-white p-4 shadow rounded">
        <h2 class="text-xl font-bold mb-4">Eliminar Producto</h2>
        <input v-model="codigoEliminar" placeholder="Código de Barras" class="input-field">
        <button @click="eliminarProducto" class="btn-danger">Eliminar</button>
      </div>

            <!-- Añadir Stock -->
      <div v-if="activeOption === 'stock'" class="bg-white p-4 shadow rounded">
        <h2 class="text-xl font-bold mb-4">Añadir Stock</h2>
        <input v-model="codigoStock" placeholder="Código de Barras" class="input-field">
        <input v-model.number="cantidadAjuste" type="number" placeholder="Cantidad a agregar" class="input-field">
        <button @click="ajustarStock" class="btn-primary">Añadir al Stock</button>
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
        await axios.post("http://localhost:3001/api/producto/crear", this.producto);
        alert("Producto creado");
        this.limpiarFormulario();
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
          await axios.delete("http://localhost:3001/api/producto/eliminar", { data: { codigoBarras: this.codigoEliminar } });
          alert("Producto eliminado");
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
  .input-field {
    display: block;
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  .btn-primary { background: blue; color: white; padding: 8px 12px; border-radius: 5px; }
  .btn-danger { background: red; color: white; padding: 8px 12px; border-radius: 5px; }
  </style>
