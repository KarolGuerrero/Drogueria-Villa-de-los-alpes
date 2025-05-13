
<template>
  

  <div class="reportes-container imprimir space-y-8">

    <h1 class="text-3xl font-bold text-gray-800 border-b pb-4 custom-font-h1">📊 Reportes y Estadísticas</h1>



    <!-- Filtros de fecha -->
    <div class="date-filters no-imprimir">
      <h2>Filtrar por período</h2>
      <div class="filters-row">
        <div>
          <label>Fecha inicio:</label>
          <input type="date" v-model="fechaInicio" />
        </div>
        <div>
          <label>Fecha fin:</label>
          <input type="date" v-model="fechaFin" />
        </div>
        <div class="buttons">
          <button @click="cargarEstadisticas">Aplicar filtros</button>
          <button @click="exportarPDF" class="export">Exportar PDF</button>
        </div>
      </div>
    </div>


    <div v-if="cargando" class="text-center p-6">
      <p>Cargando estadísticas...</p>
    </div>

    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
      <p class="text-red-700">{{ error }}</p>
    </div>

    <div class="dashboard">
      <div v-if="estadisticas">
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
                  <td colspan="4" class="border p-2 text-center">No hay datos de ventas en el período seleccionado
                  </td>
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
                  <td colspan="3" class="border p-2 text-center">No hay datos de ventas en el período seleccionado
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <div v-else>
        <p>Cargando estadísticas...</p>
      </div>

    </div>
  </div>
</template>

<script>
import { onMounted, ref, nextTick } from 'vue';

export default {
  name: 'ReportesView',

  data() {
    return {
      activeTab: 'inventario',
      fechaInicio: '',
      fechaFin: '',
      estadisticas: null,
      cargando: false,
      error: null,
      grafico: null // Referencia al gráfico
    };
  },

  mounted() {
    this.cargarEstadisticas();
  },

  methods: {
    async cargarEstadisticas() {
      this.cargando = true;
      this.error = null;

      try {
        const params = new URLSearchParams();
        if (this.fechaInicio) params.append('fechaInicio', this.fechaInicio);
        if (this.fechaFin) params.append('fechaFin', this.fechaFin);

        const response = await fetch('http://localhost:3001/api/estadisticas/inventario');
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error al cargar las estadísticas: ${response.status} - ${errorText}`);
        }

        this.estadisticas = await response.json();

        await nextTick(); // Espera a que el DOM se actualice
        this.generarGrafico(); // Genera el gráfico con los datos
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
      return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    },

    calcularValorInventario() {
      if (!this.estadisticas?.inventarioActual) return 0;
      return this.estadisticas.inventarioActual.reduce((total, producto) => {
        return total + producto.precioCompra * producto.cantidadStock;
      }, 0);
    },

    exportarPDF() {
      window.print();
    }
  }
};
</script>

<style scoped>
.date-filters {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f3f4f6;
  border-radius: 8px;
  font-family: sans-serif;
  text-align: center;
  display:  flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
 
}

.date-filters h2 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.filters-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
}

.filters-row label {
  display: block;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  color: #333;
}

.filters-row input[type="date"] {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
}

.buttons {
  display: flex;
  gap: 0.5rem;
}

.buttons button {
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  color: #fff;
  background-color: #3b82f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.buttons button:hover {
  background-color: #2563eb;
}

.buttons .export {
  background-color: #10b981;
}

.buttons .export:hover {
  background-color: #059669;
}

/* Estructura general del dashboard */
.dashboard {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 2rem;
  background-color: #f9f9f9;
  color: #333;
}

/* Tarjetas de resumen */
.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  display:  flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.stat-card h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.stat-card p {
  font-size: 1.8rem;
  font-weight: bold;
}

/* Tablas */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th,
td {
  padding: 0.75rem;
  border: 1px solid #ddd;
}

thead {
  background-color: #e2e8f0;
}

tbody tr:nth-child(even) {
  background-color: #f7f7f7;
}

/* Secciones */
.low-stock,
.expiring-products,
.top-products,
.sales-type,
.current-inventory {
  margin-bottom: 3rem;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

/* Fila crítica */
tr.bg-red-100 {
  background-color: #ffe5e5 !important;
}

/* Responsive */
@media screen and (max-width: 768px) {
  .stats-summary {
    grid-template-columns: 1fr;
  }
}


.reportes-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  background-color: #f9fafb;
  border-radius: 1rem;
}

/* Estilos para impresión */
@media print {
  body {
    background: white !important;
    color: black !important;
    font-size: 12px;
    margin: 0;
    padding: 0;
  }

  /* Oculta todo lo que no quieres que salga en la impresión */
  .router-link-active,
  .no-imprimir {
    display: none !important;
  }

  /* Cambia el diseño para que parezca factura o reporte limpio */
  .contenido-principal {
    width: 100%;
    padding: 0;
    margin: 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    border: 1px solid rgb(0, 0, 0);
    padding: 6px;
    text-align: left;
  }

  /* Fuerza el salto de página donde quieras */
  .salto-pagina {
    page-break-before: always;
  }

  /* Evita cortar títulos o tablas a la mitad */
  h1,
  h2,
  h3,
  table,
  tr {
    page-break-inside: avoid;
  }
}

.custom-font-h1 {
  text-align: center;
  font-family: 'Roboto', sans-serif;
}
</style>
