<template>
  <div class="reportes-container space-y-8">
    <h1 class="text-3xl font-bold text-gray-800 border-b pb-4">📊 Reportes y Estadísticas</h1>

    <!-- Tabs -->
    <div class="tabs-navigation mb-6">
      <div class="flex border-b gap-2">
        <button 
          @click="activeTab = 'inventario'" 
          :class="[
            'tab-button py-2 px-4 rounded-t-lg transition-colors duration-300',
            activeTab === 'inventario' 
              ? 'bg-white border-l border-r border-t border-blue-500 text-blue-600 font-semibold' 
              : 'bg-gray-100 text-gray-600 hover:text-blue-600 hover:bg-white'
          ]">
          Inventario
        </button>
        <button 
          @click="activeTab = 'ventas'" 
          :class="[
            'tab-button py-2 px-4 rounded-t-lg transition-colors duration-300',
            activeTab === 'ventas' 
              ? 'bg-white border-l border-r border-t border-blue-500 text-blue-600 font-semibold' 
              : 'bg-gray-100 text-gray-600 hover:text-blue-600 hover:bg-white'
          ]">
          Ventas
        </button>
        <button 
          @click="activeTab = 'clientes'" 
          :class="[
            'tab-button py-2 px-4 rounded-t-lg transition-colors duration-300',
            activeTab === 'clientes' 
              ? 'bg-white border-l border-r border-t border-blue-500 text-blue-600 font-semibold' 
              : 'bg-gray-100 text-gray-600 hover:text-blue-600 hover:bg-white'
          ]">
          Clientes
        </button>
      </div>
    </div>
  
      <!-- Panel de contenido para Inventario -->
      <div v-if="activeTab === 'inventario'" class="tab-content">
        <!-- Filtros de fecha -->
        <div class="date-filters mb-6 p-4 bg-gray-100 rounded">
          <h2 class="text-lg font-semibold mb-3">Filtrar por período</h2>
          <div class="flex flex-wrap gap-4">
            <div>
              <label class="block text-sm mb-1">Fecha inicio:</label>
              <input type="date" v-model="fechaInicio" class="border rounded p-2" />
            </div>
            <div>
              <label class="block text-sm mb-1">Fecha fin:</label>
              <input type="date" v-model="fechaFin" class="border rounded p-2" />
            </div>
            <div class="flex items-end">
              <button @click="cargarEstadisticas" class="bg-blue-500 text-white px-4 py-2 rounded">
                Aplicar filtros
              </button>
              <button @click="exportarPDF" class="bg-green-500 text-white px-4 py-2 rounded ml-2">
                Exportar PDF
              </button>
            </div>
          </div>
        </div>
  
        <div v-if="cargando" class="text-center p-6">
          <p>Cargando estadísticas...</p>
        </div>
  
        <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
          <p class="text-red-700">{{ error }}</p>
        </div>
  
        <div v-else>
          <!-- Resumen de inventario -->
          <div class="stats-summary mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="stat-card bg-blue-100 p-4 rounded shadow">
              <h3 class="text-lg font-semibold mb-1">Total Productos</h3>
              <p class="text-2xl">{{ estadisticas?.inventarioActual?.length || 0 }}</p>
            </div>
            
            <div class="stat-card bg-yellow-100 p-4 rounded shadow">
              <h3 class="text-lg font-semibold mb-1">Productos Bajo Stock</h3>
              <p class="text-2xl">{{ estadisticas?.bajoStock?.length || 0 }}</p>
            </div>
            
            <div class="stat-card bg-orange-100 p-4 rounded shadow">
              <h3 class="text-lg font-semibold mb-1">Por Vencer</h3>
              <p class="text-2xl">{{ estadisticas?.productosProximosVencer?.length || 0 }}</p>
            </div>
            
            <div class="stat-card bg-green-100 p-4 rounded shadow">
              <h3 class="text-lg font-semibold mb-1">Valor Total Inventario</h3>
              <p class="text-2xl">${{ formatNumber(calcularValorInventario()) }}</p>
            </div>
          </div>
  
          <!-- Productos con bajo stock -->
          <div class="low-stock mb-8">
            <h2 class="text-xl font-semibold mb-3">Productos con Bajo Stock</h2>
            <div class="overflow-x-auto">
              <table class="w-full border-collapse">
                <thead>
                  <tr class="bg-gray-200">
                    <th class="border p-2 text-left">Código</th>
                    <th class="border p-2 text-left">Descripción</th>
                    <th class="border p-2 text-right">Stock Actual</th>
                    <th class="border p-2 text-right">Precio Venta</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="producto in estadisticas?.bajoStock" :key="producto.codigoBarras" 
                      :class="producto.cantidadStock <= 5 ? 'bg-red-100' : ''">
                    <td class="border p-2">{{ producto.codigoBarras }}</td>
                    <td class="border p-2">{{ producto.descripcion }}</td>
                    <td class="border p-2 text-right">{{ producto.cantidadStock }}</td>
                    <td class="border p-2 text-right">${{ formatNumber(producto.precioVenta) }}</td>
                  </tr>
                  <tr v-if="!estadisticas?.bajoStock?.length">
                    <td colspan="4" class="border p-2 text-center">No hay productos con bajo stock</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
  
          <!-- Productos próximos a vencer -->
          <div class="expiring-products mb-8">
            <h2 class="text-xl font-semibold mb-3">Productos Próximos a Vencer (30 días)</h2>
            <div class="overflow-x-auto">
              <table class="w-full border-collapse">
                <thead>
                  <tr class="bg-gray-200">
                    <th class="border p-2 text-left">Código</th>
                    <th class="border p-2 text-left">Descripción</th>
                    <th class="border p-2 text-right">Stock</th>
                    <th class="border p-2 text-right">Fecha Vencimiento</th>
                    <th class="border p-2 text-right">Días Restantes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="producto in estadisticas?.productosProximosVencer" :key="producto.codigoBarras"
                      :class="calcularDiasRestantes(producto.fechaVencimiento) <= 7 ? 'bg-red-100' : ''">
                    <td class="border p-2">{{ producto.codigoBarras }}</td>
                    <td class="border p-2">{{ producto.descripcion }}</td>
                    <td class="border p-2 text-right">{{ producto.cantidadStock }}</td>
                    <td class="border p-2 text-right">{{ formatDate(producto.fechaVencimiento) }}</td>
                    <td class="border p-2 text-right">{{ calcularDiasRestantes(producto.fechaVencimiento) }}</td>
                  </tr>
                  <tr v-if="!estadisticas?.productosProximosVencer?.length">
                    <td colspan="5" class="border p-2 text-center">No hay productos próximos a vencer</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
  
          <!-- Productos más vendidos -->
          <div class="top-products mb-8">
            <h2 class="text-xl font-semibold mb-3">Productos Más Vendidos</h2>
            <div class="overflow-x-auto">
              <table class="w-full border-collapse">
                <thead>
                  <tr class="bg-gray-200">
                    <th class="border p-2 text-left">Código</th>
                    <th class="border p-2 text-left">Descripción</th>
                    <th class="border p-2 text-right">Cantidad Vendida</th>
                    <th class="border p-2 text-right">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="producto in estadisticas?.ventasProductos" :key="producto._id">
                    <td class="border p-2">{{ producto._id }}</td>
                    <td class="border p-2">{{ producto.descripcion }}</td>
                    <td class="border p-2 text-right">{{ producto.cantidadVendida }}</td>
                    <td class="border p-2 text-right">${{ formatNumber(producto.ingresoTotal) }}</td>
                  </tr>
                  <tr v-if="!estadisticas?.ventasProductos?.length">
                    <td colspan="4" class="border p-2 text-center">No hay datos de ventas en el período seleccionado</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
  
          <!-- Estadísticas por tipo de venta -->
          <div class="sales-type mb-8">
            <h2 class="text-xl font-semibold mb-3">Ventas por Tipo</h2>
            <div class="overflow-x-auto">
              <table class="w-full border-collapse">
                <thead>
                  <tr class="bg-gray-200">
                    <th class="border p-2 text-left">Tipo de Venta</th>
                    <th class="border p-2 text-right">Cantidad</th>
                    <th class="border p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="tipo in estadisticas?.ventasPorTipo" :key="tipo._id">
                    <td class="border p-2">{{ tipo._id === 'mostrador' ? 'Mostrador' : 'Cliente' }}</td>
                    <td class="border p-2 text-right">{{ tipo.count }}</td>
                    <td class="border p-2 text-right">${{ formatNumber(tipo.total) }}</td>
                  </tr>
                  <tr v-if="!estadisticas?.ventasPorTipo?.length">
                    <td colspan="3" class="border p-2 text-center">No hay datos de ventas en el período seleccionado</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
  
          <!-- Inventario Actual -->
          <div class="current-inventory">
            <h2 class="text-xl font-semibold mb-3">Inventario Actual</h2>
            <div class="overflow-x-auto">
              <table class="w-full border-collapse">
                <thead>
                  <tr class="bg-gray-200">
                    <th class="border p-2 text-left">Código</th>
                    <th class="border p-2 text-left">Descripción</th>
                    <th class="border p-2 text-right">Stock</th>
                    <th class="border p-2 text-right">Valor Compra</th>
                    <th class="border p-2 text-right">Valor Venta</th>
                    <th class="border p-2 text-right">Fecha Vencimiento</th>
                    <th class="border p-2 text-right">Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="producto in estadisticas?.inventarioActual" :key="producto.codigoBarras">
                    <td class="border p-2">{{ producto.codigoBarras }}</td>
                    <td class="border p-2">{{ producto.descripcion }}</td>
                    <td class="border p-2 text-right">{{ producto.cantidadStock }}</td>
                    <td class="border p-2 text-right">${{ formatNumber(producto.precioCompra) }}</td>
                    <td class="border p-2 text-right">${{ formatNumber(producto.precioVenta) }}</td>
                    <td class="border p-2 text-right">{{ formatDate(producto.fechaVencimiento) }}</td>
                    <td class="border p-2 text-right">${{ formatNumber(producto.precioCompra * producto.cantidadStock) }}</td>
                  </tr>
                  <tr v-if="!estadisticas?.inventarioActual?.length">
                    <td colspan="7" class="border p-2 text-center">No hay productos en el inventario</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Panel de contenido para Ventas -->
      <div v-else-if="activeTab === 'ventas'" class="tab-content">
        <div class="p-6 bg-gray-100 rounded text-center">
          <h2 class="text-xl mb-3">Estadísticas de Ventas</h2>
          <p class="mb-4">Este módulo está en desarrollo. Pronto podrás ver estadísticas detalladas de ventas.</p>
        </div>
      </div>
  
      <!-- Panel de contenido para Clientes -->
      <div v-else-if="activeTab === 'clientes'" class="tab-content">
        <div class="p-6 bg-gray-100 rounded text-center">
          <h2 class="text-xl mb-3">Estadísticas de Clientes</h2>
          <p class="mb-4">Este módulo está en desarrollo. Pronto podrás ver estadísticas detalladas de clientes.</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ReportesView',
    data() {
      return {
        activeTab: 'inventario',
        fechaInicio: '',
        fechaFin: '',
        estadisticas: null,
        cargando: false,
        error: null
      }
    },
    mounted() {
      this.cargarEstadisticas();
    },
    methods: {
        async cargarEstadisticas() {
          this.cargando = true;
          this.error = null;

          try {
            // Construir query params
            const params = new URLSearchParams();

            // Puedes comentar las fechas si estás depurando:
            if (this.fechaInicio) params.append('fechaInicio', this.fechaInicio);
            // if (this.fechaFin) params.append('fechaFin', this.fechaFin);

            // Reemplaza aquí con el bloque que me pasaste:
            const response = await fetch('http://localhost:3001/api/estadisticas/inventario');
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Error al cargar las estadísticas: ${response.status} - ${errorText}`);
            }

            this.estadisticas = await response.json();
          } catch (error) {
            this.error = error.message;
            console.error(error);
          } finally {
            this.cargando = false;
          }
        },
      formatNumber(value) {
        return new Intl.NumberFormat('es-MX', { 
          minimumFractionDigits: 2,
          maximumFractionDigits: 2 
        }).format(value);
      },
      formatDate(dateString) {
        const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-MX', options);
      },
      calcularDiasRestantes(fechaVencimiento) {
        const hoy = new Date();
        const fechaVence = new Date(fechaVencimiento);
        const diferencia = fechaVence - hoy;
        return Math.ceil(diferencia / (1000 * 60 * 60 * 24)); // Convertir milisegundos a días
      },
      calcularValorInventario() {
        if (!this.estadisticas?.inventarioActual) return 0;
        
        return this.estadisticas.inventarioActual.reduce((total, producto) => {
          return total + (producto.precioCompra * producto.cantidadStock);
        }, 0);
      },
      exportarPDF() {
        // Esta es una función básica que aprovecha la funcionalidad de impresión del navegador
        window.print();
      }
    }
  }
  </script>
  
  <style scoped>
  .reportes-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  background-color: #f9fafb;
  border-radius: 1rem;
}

/* Estilos para impresión */
@media print {
  .tabs-navigation,
  .date-filters button {
    display: none;
  }

  .reportes-container {
    padding: 0;
  }

  table {
    page-break-inside: auto;
  }

  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }

  h1, h2, h3 {
    page-break-after: avoid;
  }
}

  </style>


