<template>
  <div class="contenedor">
    <h1 class="titulo">Gestión de Inventario</h1>

    <!-- Navegación de pestañas -->
    <div class="tab-buttons">
      <button 
        v-for="(tab, index) in filteredTabs" 
        :key="index" 
        @click="activeTab = tab.id"
        :class="{ active: activeTab === tab.id }"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- Pestaña: Listar Productos -->
    <section class="seccion" v-show="activeTab === 'listar'">
      <h2>Listado de Productos</h2>
      <div class="botones-actualizacion">
        <button @click="obtenerProductos" class="boton-secundario">Actualizar Lista</button>
        <button @click="exportarCSV" class="boton-principal">Exportar Inventario</button>
      </div>
      <div class="tabla-container">
        <table class="tabla-clientes">
          <thead>
            <tr>
              <th>Código</th>
              <th>Descripción</th>
              <th>Stock</th>
              <th>Precio Compra</th>
              <th>Precio Venta</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="producto in productos" :key="producto.codigoBarras">
              <td>{{ producto.codigoBarras }}</td>
              <td>{{ producto.descripcion }}</td>
              <td>{{ producto.cantidadStock }}</td>
              <td>{{ producto.precioCompra }}</td>
              <td>{{ producto.precioVenta }}</td>
            </tr>
            <tr v-if="productos.length === 0">
              <td colspan="5" class="sin-datos">No hay productos registrados</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Pestaña: Buscar Producto -->
    <section class="seccion" v-show="activeTab === 'buscar'">
      <h2>Buscar Producto</h2>
      <form @submit.prevent="buscarProducto">
        <input v-model="codigoBusqueda" placeholder="Código de Barras" class="input-field" required>
        <button type="submit" class="boton-principal">Buscar</button>
      </form>
      <div v-if="productoEncontrado" class="resultado">
        <p><strong>Código:</strong> {{ productoEncontrado.codigoBarras }}</p>
        <p><strong>Descripción:</strong> {{ productoEncontrado.descripcion }}</p>
        <p><strong>Stock:</strong> {{ productoEncontrado.cantidadStock }}</p>
        <p><strong>Precio Compra:</strong> {{ productoEncontrado.precioCompra }}</p>
        <p><strong>Precio Venta:</strong> {{ productoEncontrado.precioVenta }}</p>
      </div>
    </section>

    <!-- Pestaña: Crear Producto -->
    <section class="seccion" v-show="activeTab === 'crear'">
      <h2>Crear Producto</h2>
      <form @submit.prevent="crearProducto">
        <input v-model="producto.codigoBarras" placeholder="Código de Barras" class="input-field" required>
        <input v-model="producto.descripcion" placeholder="Descripción" class="input-field" required>
        <input v-model.number="producto.cantidadStock" type="number" placeholder="Cantidad en Stock" class="input-field" required>
        <input v-model.number="producto.precioCompra" type="number" placeholder="Precio de Compra" class="input-field" required>
        <input v-model.number="producto.precioVenta" type="number" placeholder="Precio de Venta" class="input-field" required>
        <input v-model="producto.fechaVencimiento" type="date" class="input-field" required>
        <button type="submit" class="boton-principal">Guardar Producto</button>
      </form>
    </section>

    <!-- Pestaña: Modificar Producto -->
    <section class="seccion" v-show="activeTab === 'modificar'">
      <h2>Modificar Producto</h2>
      <form @submit.prevent="cargarProductoModificar" v-if="!productoModificar">
        <input v-model="codigoModificar" placeholder="Código de Barras" class="input-field" required>
        <button type="submit" class="boton-principal">Cargar Datos</button>
      </form>
      <form v-if="productoModificar" @submit.prevent="modificarProducto">
        <label for="descripcion">Descripción:</label>
        <input id="descripcion" v-model="productoModificar.descripcion" placeholder="Descripción" class="input-field" required>

        <label for="cantidadStock">Stock:</label>
        <input id="cantidadStock" v-model.number="productoModificar.cantidadStock" type="number" placeholder="Stock" class="input-field" required>

        <label for="precioCompra">Precio Compra:</label>
        <input id="precioCompra" v-model.number="productoModificar.precioCompra" type="number" placeholder="Precio Compra" class="input-field" required>

        <label for="precioVenta">Precio Venta:</label>
        <input id="precioVenta" v-model.number="productoModificar.precioVenta" type="number" placeholder="Precio Venta" class="input-field" required>

        <label for="fechaVencimiento">Fecha de Vencimiento:</label>
        <input id="fechaVencimiento" v-model="productoModificar.fechaVencimiento" type="date" class="input-field" required>

        <div class="botones-actualizacion">
          <button type="button" @click="cancelarAjuste" class="boton-secundario">Cancelar</button>
          <button type="submit" class="boton-principal">Guardar Cambios</button>
        </div>
      </form>
    </section>

    <!-- Pestaña: Eliminar Producto -->
    <section class="seccion" v-show="activeTab === 'eliminar'">
      <h2>Eliminar Producto</h2>
      <form @submit.prevent="eliminarProducto">
        <input v-model="codigoEliminar" placeholder="Código de Barras" class="input-field" required>
        <input v-model="motivo" placeholder="Motivo de eliminación" class="input-field" required>
        <button type="submit" class="boton-principal">Eliminar</button>
      </form>
    </section>

    <!-- Pestaña: Actualizar Stock -->
    <section class="seccion" v-show="activeTab === 'stock'">
      <h2>Añadir Stock</h2>
      <!-- Paso 1: Buscar el producto -->
      <div v-if="!productoStock" class="mb-4">
        <div class="flex gap-2">
          <input 
            v-model="codigoStock" 
            placeholder="Código de Barras" 
            class="input-field flex-grow"
            @keydown.enter.prevent="procesarCodigoBarras('stock')"
          >
          <button @click="buscarProductoStock" class="boton-principal flex-shrink-0">Buscar</button>
        </div>
      </div>
      
      <!-- Paso 2: Mostrar información del producto y añadir stock -->
      <div v-if="productoStock" class="mt-4">
        <h3 class="font-semibold mb-2">Información del Producto</h3>
        <div class="resultado">
          <p><strong>Código:</strong> {{ productoStock.codigoBarras }}</p>
          <p><strong>Descripción:</strong> {{ productoStock.descripcion }}</p>
          <p><strong>Stock Actual:</strong> {{ productoStock.cantidadStock }}</p>
          <p><strong>Precio Compra:</strong> {{ productoStock.precioCompra }}</p>
          <p><strong>Precio Venta:</strong> {{ productoStock.precioVenta }}</p>
        </div>
        
        <h3 class="font-semibold mb-2">Ajustar Stock</h3>
        <input v-model.number="cantidadAjuste" type="number" placeholder="Cantidad a agregar" class="input-field">
        <div class="botones-actualizacion">
          <button @click="ajustarStock" class="boton-principal">Añadir al Stock</button>
          <button @click="cancelarAjuste" class="boton-secundario">Cancelar</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      activeTab: 'crear',
      tabs: [
        { id: 'listar', name: 'Listar Productos' },
        { id: 'buscar', name: 'Buscar Producto' },
        { id: 'crear', name: 'Crear Producto' },
        { id: 'modificar', name: 'Modificar Producto' },
        { id: 'eliminar', name: 'Eliminar Producto' },
        { id: 'stock', name: 'Actualizar Stock' }
      ],
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
      productoStock: null,
      usuarioActual: {
        id: null,
        nombre: "",
        rol: ""
      },
      options: {
        crear: { label: "Crear Producto" },
        reporte: { label: "Reporte Inventario" },
        buscar: { label: "Buscar Producto" },
        modificar: { label: "Modificar Producto" },
        eliminar: { label: "Eliminar Producto" },
        stock: { label: "Añadir Stock" }
      },
      codigosProcesados: {
        crear: false,
        buscar: false,
        modificar: false,
        eliminar: false,
        stock: false
      }
    };
  },
  computed: {
    // Filtra las opciones según el rol del usuario
      filteredOptions() {
        // Si el usuario es vendedor, excluir modificar, reporte y eliminar
        if (this.usuarioActual.rol === "vendedor") {
          const filteredOpts = { ...this.options };
          delete filteredOpts.modificar;
          delete filteredOpts.reporte;
          delete filteredOpts.eliminar;
          return filteredOpts;
        }
        // Para todos los demás roles, mostrar todas las opciones
        return this.options;
      },
      // Establece la opción activa por defecto basada en las opciones disponibles
      defaultActiveOption() {
        return Object.keys(this.filteredOptions)[0] || null;
      },
      filteredTabs() {
        // Exclude 'modificar' and 'eliminar' tabs if the user is a 'vendedor'
        if (this.usuarioActual.rol === "vendedor") {
          return this.tabs.filter(tab => tab.id !== 'modificar' && tab.id !== 'eliminar');
        }
        return this.tabs;
      }
    },
  created() {
    // Obtener información del usuario actual al cargar el componente
    this.obtenerUsuarioActual();
    
    // Establecer la opción activa por defecto después de obtener el usuario
    this.$nextTick(() => {
      if (!this.activeOption || !this.filteredOptions[this.activeOption]) {
        this.activeOption = this.defaultActiveOption;
      }
    });
  },
  watch: {
    // Observer cambios en las opciones filtradas y ajuste la opción activa si es necesario
    filteredOptions: {
      handler(newOptions) {
        // Si la opción activa ya no está disponible, cambiar a la primera opción disponible
        if (this.activeOption && !newOptions[this.activeOption]) {
          this.activeOption = this.defaultActiveOption;
        }
      },
      deep: true
    },
    // NUEVO: Observar cambios en activeOption para limpiar los formularios
    activeOption(newOption, oldOption) {
      // Solo limpiar si realmente cambiamos de opción
      if (newOption !== oldOption) {
        this.limpiarTodosLosFormularios();
      }
    }
  },
  methods: {
    // NUEVO: Método para limpiar todos los formularios
    limpiarTodosLosFormularios() {
      // Limpiar formulario de creación
      this.producto = {
        codigoBarras: "",
        descripcion: "",
        cantidadStock: null,
        precioCompra: null,
        precioVenta: null,
        fechaVencimiento: ""
      };
      
      // Limpiar búsqueda
      this.codigoBusqueda = "";
      this.productoEncontrado = null;
      
      // Limpiar modificación
      this.codigoModificar = "";
      this.productoModificar = null;
      
      // Limpiar eliminación
      this.codigoEliminar = "";
      this.motivo = "";
      
      // Limpiar ajuste de stock
      this.codigoStock = "";
      this.productoStock = null;
      this.cantidadAjuste = 0;
      
      // Resetear todos los estados de procesamiento de códigos
      for (const key in this.codigosProcesados) {
        this.codigosProcesados[key] = false;
      }
    },
    
    // Método para procesar el código de barras según la sección activa
    procesarCodigoBarras(seccion) {
      // Prevenir procesamiento múltiple del mismo código
      if (this.codigosProcesados[seccion]) return;
      
      this.codigosProcesados[seccion] = true;
      
      // Procesar según la sección
      switch(seccion) {
        case 'crear':
          if (this.producto.codigoBarras) {
            // Solo aplicar el filtro si comienza con "+"
            if (this.producto.codigoBarras.startsWith("+")) {
              this.producto.codigoBarras = this.producto.codigoBarras.slice(3, -1);
            }
            // Enfocar el siguiente campo
            this.$nextTick(() => {
              document.querySelector('[placeholder="Descripción"]').focus();
            });
          }
          break;
          
        case 'buscar':
          if (this.codigoBusqueda) {
            // Solo aplicar el filtro si comienza con "+"
            if (this.codigoBusqueda.startsWith("+")) {
              this.codigoBusqueda = this.codigoBusqueda.slice(3, -1);
            }
            this.buscarProducto();
          }
          break;
          
        case 'modificar':
          if (this.codigoModificar) {
            // Solo aplicar el filtro si comienza con "+"
            if (this.codigoModificar.startsWith("+")) {
              this.codigoModificar = this.codigoModificar.slice(3, -1);
            }
            this.cargarProductoModificar();
          }
          break;
          
        case 'eliminar':
          if (this.codigoEliminar) {
            // Solo aplicar el filtro si comienza con "+"
            if (this.codigoEliminar.startsWith("+")) {
              this.codigoEliminar = this.codigoEliminar.slice(3, -1);
            }
            // Enfocar el campo del motivo
            this.$nextTick(() => {
              document.querySelector('[placeholder="Motivo de eliminación"]').focus();
            });
          }
          break;
          
        case 'stock':
          if (this.codigoStock) {
            // Solo aplicar el filtro si comienza con "+"
            if (this.codigoStock.startsWith("+")) {
              this.codigoStock = this.codigoStock.slice(3, -1);
            }
            this.buscarProductoStock();
          }
          break;
      }
      
      // Resetear el estado de procesamiento después de un tiempo
      setTimeout(() => {
        this.codigosProcesados[seccion] = false;
      }, 300);
    },
    
    obtenerUsuarioActual() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            this.usuarioActual = {
              id: payload.id || null,
              nombre: payload.nombre || payload.id || "Usuario",
              rol: payload.rol || ""
            };
          } catch (error) {
            console.error("Token inválido:", error);
            this.usuarioActual = { 
              id: null, 
              nombre: 'Error de Autenticación', 
              rol: '' 
            };
          }
        } else {
          // Si no hay token en localStorage
          console.warn("No se encontró token de autenticación");
          this.usuarioActual = { 
            id: null, 
            nombre: 'Usuario No Autenticado', 
            rol: '' 
          };
        }
      } catch (error) {
        console.error('Error al obtener el usuario actual:', error);
        this.usuarioActual = { 
          id: null, 
          nombre: 'Usuario Desconocido', 
          rol: '' 
        };
      }
    },
    
    async buscarProductoStock() {
      if (!this.codigoStock) {
        alert("Ingrese un código de Barras");
        return;
      }
      
      try {
        const res = await axios.get(`http://localhost:3001/api/producto/uno?codigoBarras=${this.codigoStock}`);
        if (res.data) {
          this.productoStock = res.data;
          this.cantidadAjuste = 0; // Reset cantidad
          
          // Enfocar el campo de cantidad a agregar
          this.$nextTick(() => {
            document.querySelector('[placeholder="Cantidad a agregar"]').focus();
          });
        } else {
          alert("Producto no encontrado");
        }
      } catch (error) {
        console.error("Error al buscar el producto:", error);
        alert("Hubo un error al buscar el producto");
      }
    },
    
    // Método para cancelar el ajuste
    cancelarAjuste() {
      this.productoStock = null;
      this.codigoStock = "";
      this.cantidadAjuste = 0;
      
      // Resetear el estado de procesamiento
      this.codigosProcesados.stock = false;
    },
    
    // Método modificado para ajustar stock
    async ajustarStock() {
      if (!this.productoStock) {
        alert("Primero debe buscar un producto");
        return;
      }
      
      if (this.cantidadAjuste <= 0) {
        alert("Ingrese una cantidad válida mayor a cero");
        return;
      }
      
      try {
        // Actualizar cantidad en el objeto local
        this.productoStock.cantidadStock += this.cantidadAjuste;
        
        // Enviar la actualización al backend
        await axios.put("http://localhost:3001/api/producto/modificar", this.productoStock);
        
        alert("Stock actualizado correctamente");
        
        // Reiniciar formulario
        this.cancelarAjuste();
      } catch (error) {
        console.error("Error al actualizar el stock:", error);
        alert("Hubo un error al actualizar el stock");
      }
    },
    
    async crearProducto() {
      try {
        // Ya no necesitamos la variable filtro, ya procesamos el código en procesarCodigoBarras
        await axios.post("http://localhost:3001/api/producto/crear", this.producto);
        alert("Producto creado");
        this.limpiarFormulario();
        // Resetear el estado de procesamiento
        this.codigosProcesados.crear = false;
      } catch (error) {
        console.error("Error al crear el producto:", error.response?.data || error.message);
        alert("Error: " + (error.response?.data?.error || error.message));
      }
    },
    
    async obtenerProductos() {
      try {
        const res = await axios.get("http://localhost:3001/api/producto/todos");
        this.productos = res.data;
      } catch (error) {
        console.error("Error al obtener productos:", error);
        alert("Error al obtener productos: " + error.message);
      }
    },
    
    async buscarProducto() {
      try {
        const res = await axios.get(`http://localhost:3001/api/producto/uno?codigoBarras=${this.codigoBusqueda}`);
        if (res.data) {
          this.productoEncontrado = res.data;
        } else {
          alert("Producto no encontrado");
          this.productoEncontrado = null;
        }
        // Resetear el estado de procesamiento
        this.codigosProcesados.buscar = false;
      } catch (error) {
        console.error("Error al buscar el producto:", error);
        alert("Error al buscar el producto: " + error.message);
        this.codigosProcesados.buscar = false;
      }
    },

    async cargarProductoModificar() {
      try {
        const res = await axios.get(`http://localhost:3001/api/producto/uno?codigoBarras=${this.codigoModificar}`);
        if (res.data) {
          this.productoModificar = res.data;
          // Enfocar el primer campo del formulario de modificación
          this.$nextTick(() => {
            document.querySelector('[v-model="productoModificar.descripcion"]').focus();
          });
        } else {
          alert("Producto no encontrado");
          this.productoModificar = null;
        }
        // Resetear el estado de procesamiento
        this.codigosProcesados.modificar = false;
      } catch (error) {
        console.error("Error al cargar el producto:", error);
        alert("Error al cargar el producto: " + error.message);
        this.codigosProcesados.modificar = false;
      }
    },
    
    async modificarProducto() {
      try {
        await axios.put("http://localhost:3001/api/producto/modificar", this.productoModificar);
        alert("Producto modificado");
        this.productoModificar = null;
        this.codigoModificar = "";
        // Resetear el estado de procesamiento
        this.codigosProcesados.modificar = false;
      } catch (error) {
        console.error("Error al modificar el producto:", error);
        alert("Error al modificar el producto: " + error.message);
      }
    },
    
    async eliminarProducto() {
      if (!this.codigoEliminar) {
        alert("Ingrese un código de barras para eliminar");
        return;
      }
      
      if (!this.motivo || this.motivo.trim() === "") {
        alert("Debe ingresar un motivo para la eliminación");
        return;
      }
      
      if (confirm("¿Estás seguro de eliminar este producto?")) {
        try {
          const res = await axios.delete("http://localhost:3001/api/producto/eliminar", {
            data: { codigoBarras: this.codigoEliminar, motivo: this.motivo }
          });
          // Mostrar respuesta del backend
          alert(res.data.mensaje); // Asegúrate de que el backend mande un campo `mensaje`
          console.log("Respuesta del backend:", res.data);
          
          this.codigoEliminar = '';
          this.motivo = '';
          // Resetear el estado de procesamiento
          this.codigosProcesados.eliminar = false;
        } catch (error) {
          console.error("Error al eliminar el producto:", error.response?.data || error.message);
          alert("Error: " + (error.response?.data?.error || error.message));
          this.codigosProcesados.eliminar = false;
        }
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
      // Resetear todos los estados de procesamiento
      for (const key in this.codigosProcesados) {
        this.codigosProcesados[key] = false;
      }
    }
  }
};
</script>

<style>
@import '../assets/global-styles.css';

.titulo {
  font-size: 2rem;
  color: #1a237e;
  margin-bottom: 20px;
}

.contenedor {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 900px;
  margin: auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px;
}

/* Ajustes específicos para InventarioView */
.input-field {
  display: block;
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.input-field:focus {
  border-color: #1a237e;
  outline: none;
  box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.2);
}

.tab-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 30px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 10px;
  flex-wrap: wrap;
}

.tab-buttons button {
  padding: 12px 20px;
  background-color: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 8px 8px 0 0;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-buttons button.active {
  background-color: #1a237e;
  color: white;
}

.tab-buttons button:hover:not(.active) {
  background-color: #e0e0e0;
}

.seccion {
  background-color: #f9f9f9;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  animation: fadeIn 0.3s ease;
  width: 100%;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

<style scoped>
.inventory-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #fff;
}

.inventory-table thead {
  background-color: #f5f5f5;
}

.inventory-table th {
  text-align: left;
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 1px solid #e0e0e0;
}

.inventory-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.inventory-table tbody tr:hover {
  background-color: #e2e2ff;
  transition: background-color 0.2s ease-in-out;
}

.inventory-table tbody tr:hover {
  background-color: #e2e2ff;
  transition: background-color 0.2s ease-in-out;
}

.reporte-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 14px;
  color: #374151;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.reporte-table th,
.reporte-table td {
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  text-align: left;
}

.reporte-table thead {
  background-color: #4f46e5;
  color: white;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 1;
}

.reporte-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

.reporte-table tbody tr:hover {
  background-color: #f1f5f9;
  transition: background-color 0.3s ease;
}

.reporte-table td.text-center {
  text-align: center;
}

/* Estilo para cuando no hay productos */
.reporte-table .no-data {
  text-align: center;
  padding: 20px;
  color: #6b7280;
  font-style: italic;
}
</style>