<template>
  <div class="contenedor">
    <h1 class="titulo">Gestión de Clientes</h1>

    <!-- Navegación de pestañas -->
    <div class="tab-buttons">
      <button 
        v-for="(tab, index) in tabs" 
        :key="index" 
        @click="activeTab = tab.id"
        :class="{ active: activeTab === tab.id }"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- Pestaña: Crear Cliente -->
    <section class="seccion" v-show="activeTab === 'crear'">
      <h2>Crear Cliente</h2>
      <form @submit.prevent="crearCliente">
        <input type="text" v-model="nuevoCliente.nombre" placeholder="Nombre" required />
        <input type="text" v-model="nuevoCliente.numero" placeholder="Número" required />
        <button type="submit" class="boton-principal">Guardar Cliente</button>
      </form>
    </section>

    <!-- Pestaña: Buscar Cliente -->
    <section class="seccion" v-show="activeTab === 'buscar'">
      <h2>Buscar Cliente</h2>
      <form @submit.prevent="buscarCliente">
        <input type="text" v-model="idClienteBusqueda" placeholder="ID Cliente" />
        <button type="submit" class="boton-principal">Buscar</button>
      </form>
      <div v-if="clienteEncontrado" class="resultado">
        <p><strong>ID Cliente:</strong> {{ clienteEncontrado.idCliente }}</p>
        <p><strong>Nombre:</strong> {{ clienteEncontrado.nombre }}</p>
        <p><strong>Número:</strong> {{ clienteEncontrado.numero }}</p>
      </div>
    </section>

    <!-- Pestaña: Actualizar Cliente -->
    <section class="seccion" v-show="activeTab === 'actualizar'">
      <h2>Actualizar Cliente</h2>
      <!-- Formulario de búsqueda -->
      <form @submit.prevent="buscarClienteParaActualizar" v-if="!clienteEncontradoParaActualizar">
        <input type="text" v-model="idClienteActualizacion" placeholder="ID Cliente" required />
        <button type="submit" class="boton-principal">Buscar Cliente</button>
      </form>
      
      <!-- Formulario de actualización -->
      <div v-if="clienteEncontradoParaActualizar" class="formulario-actualizacion">
        <h3>Datos del Cliente</h3>
        <div class="datos-cliente">
          <p><strong>ID Cliente:</strong> {{ clienteEncontradoParaActualizar.idCliente }}</p>
        </div>
        
        <form @submit.prevent="actualizarCliente">
          <input 
            type="text" 
            v-model="clienteParaActualizar.nombre" 
            placeholder="Nombre"
            required 
          />
          <input 
            type="text" 
            v-model="clienteParaActualizar.numero" 
            placeholder="Número"
            required 
          />
          <div class="botones-actualizacion">
            <button type="button" @click="cancelarActualizacion" class="boton-secundario">Cancelar</button>
            <button type="submit" class="boton-principal">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </section>

    <!-- Pestaña: Eliminar Cliente -->
    <section class="seccion" v-show="activeTab === 'eliminar'">
      <h2>Eliminar Cliente</h2>
      <form @submit.prevent="eliminarCliente">
        <input type="text" v-model="clienteParaEliminar.idCliente" placeholder="ID Cliente" required />
        <input type="text" v-model="clienteParaEliminar.motivo" placeholder="Motivo" required />
        <button type="submit" class="boton-principal">Eliminar Cliente</button>
      </form>
    </section>

    <!-- Pestaña: Listar Clientes -->
    <section class="seccion" v-show="activeTab === 'listar'">
      <h2>Listado de Clientes</h2>
      <button @click="obtenerTodosClientes" class="boton-secundario">Actualizar Lista</button>
      
      <div class="tabla-container">
        <table class="tabla-clientes">
          <thead>
            <tr>
              <th>ID Cliente</th>
              <th>Nombre</th>
              <th>Número</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cliente in clientes" :key="cliente.idCliente">
              <td>{{ cliente.idCliente }}</td>
              <td>{{ cliente.nombre }}</td>
              <td>{{ cliente.numero }}</td>
            </tr>
            <tr v-if="clientes.length === 0">
              <td colspan="3" class="sin-datos">No hay clientes registrados</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Pestaña: Consultar Crédito -->
    <section class="seccion" v-show="activeTab === 'credito'">
      <h2>Consultar Crédito</h2>
      <form @submit.prevent="consultarCredito">
        <input type="text" v-model="creditoConsulta.idCliente" placeholder="ID Cliente" required />
        <button type="submit" class="boton-principal">Consultar Crédito</button>
      </form>
      
      <div v-if="infoCredito" class="resultado-credito">
        <div class="info-deuda">
          <h3>Cliente: {{ infoCredito.nombre }}</h3>
          <h3>Deuda Total: ${{ formatearNumero(infoCredito.deudaTotal) }}</h3>
        </div>
        
        <div v-if="infoCredito.facturas && infoCredito.facturas.length > 0" class="historial-credito">
          <h3>Historial de Compras a Crédito</h3>
          <div class="tabla-container">
            <table>
              <thead>
                <tr>
                  <th>Factura</th>
                  <th>Fecha</th>
                  <th>Productos</th>
                  <th>Total</th>
                  <th>Saldo</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(factura, index) in infoCredito.facturas" :key="index">
                  <td>{{ factura.numeroFactura.substring(0, 8) }}...</td>
                  <td>{{ formatearFecha(factura.fechaCompra) }}</td>
                  <td>
                    <div v-for="(prod, i) in factura.productos" :key="i">
                      {{ prod.cantidad }}x {{ prod.nombre }}
                    </div>
                  </td>
                  <td>${{ formatearNumero(factura.montoTotal) }}</td>
                  <td>${{ formatearNumero(factura.saldoPendiente) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div v-if="infoCredito.facturas && infoCredito.facturas.length > 0" class="pagos-credito">
          <h3>Historial de Pagos</h3>
          <div class="tabla-container">
            <table>
              <thead>
                <tr>
                  <th>Factura</th>
                  <th>Fecha de Pago</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(factura, facturaIndex) in infoCredito.facturas">
                  <tr v-for="(pago, pagoIndex) in factura.pagos" :key="`${facturaIndex}-${pagoIndex}`">
                    <td>{{ factura.numeroFactura.substring(0, 8) }}...</td>
                    <td>{{ formatearFecha(pago.fecha) }}</td>
                    <td>${{ formatearNumero(pago.monto) }}</td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
        
        <div v-if="!infoCredito.facturas || infoCredito.facturas.length === 0" class="sin-credito">
          <p>El cliente no tiene historial de compras a crédito.</p>
        </div>
      </div>
    </section>

    <!-- Pestaña: Abonar a Crédito -->
    <section class="seccion" v-show="activeTab === 'abonar'">
      <h2>Abonar a Crédito</h2>
      
      <form @submit.prevent="verificarDeuda">
        <input type="text" v-model="abonoCredito.idCliente" placeholder="ID Cliente" required />
        <button type="submit" class="boton-secundario">Verificar Deuda</button>
      </form>
      
      <div v-if="clienteDeuda" class="info-deuda-abono">
        <p><strong>Cliente:</strong> {{ clienteDeuda.nombre }}</p>
        <p><strong>Deuda Actual:</strong> ${{ formatearNumero(clienteDeuda.deudaTotal) }}</p>
        
        <div v-if="clienteDeuda.deudaTotal > 0">
          <h3>Facturas Pendientes</h3>
          <div class="tabla-container">
            <table>
              <thead>
                <tr>
                  <th>Seleccionar</th>
                  <th>Factura</th>
                  <th>Fecha</th>
                  <th>Monto Total</th>
                  <th>Saldo Pendiente</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="factura in clienteDeuda.facturas" :key="factura.numeroFactura" 
                    v-if="factura.saldoPendiente > 0">
                  <td>
                    <input 
                      type="radio" 
                      :value="factura.numeroFactura" 
                      v-model="abonoCredito.numeroFactura"
                      @change="seleccionarFactura(factura)"
                    />
                  </td>
                  <td>{{ factura.numeroFactura.substring(0, 8) }}...</td>
                  <td>{{ formatearFecha(factura.fechaCompra) }}</td>
                  <td>${{ formatearNumero(factura.montoTotal) }}</td>
                  <td>${{ formatearNumero(factura.saldoPendiente) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <form v-if="facturaSeleccionada" @submit.prevent="registrarAbono" class="form-abono">
            <h3>Realizar Abono</h3>
            <p><strong>Factura seleccionada:</strong> {{ abonoCredito.numeroFactura.substring(0, 8) }}...</p>
            <p><strong>Saldo pendiente:</strong> ${{ formatearNumero(facturaSeleccionada.saldoPendiente) }}</p>
            
            <input 
              type="number" 
              v-model="abonoCredito.monto" 
              placeholder="Monto a abonar" 
              :max="facturaSeleccionada.saldoPendiente"
              step="0.01"
              required 
            />
            <button type="submit" class="boton-principal">Registrar Abono</button>
          </form>
        </div>
        
        <p v-else class="sin-deuda">El cliente no tiene deuda pendiente.</p>
      </div>
    </section>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      // Sistema de pestañas
      activeTab: 'crear',
      tabs: [
        { id: 'crear', name: 'Crear Cliente' },
        { id: 'buscar', name: 'Buscar Cliente' },
        { id: 'actualizar', name: 'Actualizar Cliente' },
        { id: 'eliminar', name: 'Eliminar Cliente' },
        { id: 'listar', name: 'Listar Clientes' },
        { id: 'credito', name: 'Consultar Crédito' },
        { id: 'abonar', name: 'Abonar a Crédito' }
      ],
      // Datos para operaciones
      nuevoCliente: {
        nombre: '',
        numero: ''
      },
      // Para buscar cliente
      idClienteBusqueda: '',
      clienteEncontrado: null,
      
      // Para actualizar cliente
      idClienteActualizacion: '',
      clienteEncontradoParaActualizar: null,
      clienteParaActualizar: {
        idCliente: '',
        nombre: '',
        numero: ''
      },
      
      clienteParaEliminar: {
        idCliente: '',
        motivo: ''
      },
      clientes: [],
      // Datos para crédito
      creditoConsulta: {
        idCliente: ''
      },
      usuarioActual: {
        id: null,
        nombre: "",
        rol: ""
      },
      infoCredito: null,
      abonoCredito: {
        idCliente: '',
        numeroFactura: '',
        monto: ''
      },
      clienteDeuda: null,
      facturaSeleccionada: null
    };
  },
  methods: {
    // Método para obtener el usuario actual (debe implementarse según tu sistema de autenticación)
    obtenerUsuarioActual() {
      // Implementación de ejemplo - reemplazar con tu lógica real
      // Por ejemplo, podría ser una llamada a la API:
      // axios.get('http://localhost:3001/api/usuario/actual')
      //   .then(response => {
      //     this.usuarioActual = response.data;
      //   })
      //   .catch(error => {
      //     console.error('Error al obtener usuario:', error);
      //   });
      
      // Por ahora, simularemos un usuario
      this.usuarioActual = {
        id: 1,
        nombre: "Usuario de Prueba",
        rol: "admin" // Cambia a "vendedor" para probar la restricción de pestañas
      };
    },
    
    // Método para limpiar todos los formularios
    limpiarTodosLosFormularios() {
      // Limpiar formulario de creación
      this.nuevoCliente.nombre = '';
      this.nuevoCliente.numero = '';
      
      // Limpiar búsqueda
      this.idClienteBusqueda = '';
      this.clienteEncontrado = null;

      // Limpiar actualizar
      this.idClienteActualizacion = '';
      this.clienteEncontradoParaActualizar = null;
      this.clienteParaActualizar = {
        idCliente: '',
        nombre: '',
        numero: ''
      };
      
      // Limpiar eliminación
      this.clienteParaEliminar = {
        idCliente: '',
        motivo: ''
      };
      
      // Limpiar datos de crédito
      this.creditoConsulta = {
        idCliente: ''
      };
      this.infoCredito = null;
      this.abonoCredito = {
        idCliente: '',
        numeroFactura: '',
        monto: ''
      };
      this.clienteDeuda = null;
      this.facturaSeleccionada = null;
    },
    
    // Crear cliente
    async crearCliente() {
      try {
        const response = await axios.post('http://localhost:3001/api/clientes/crear', this.nuevoCliente);
        alert(response.data.message);
        this.nuevoCliente.nombre = '';
        this.nuevoCliente.numero = '';
      } catch (error) {
        alert(error.response?.data?.error || 'Error al crear el cliente');
      }
    },
    
    // Buscar cliente
    async buscarCliente() {
      try {
        const response = await axios.get('http://localhost:3001/api/clientes/uno', {
          params: { idCliente: this.idClienteBusqueda }
        });
        this.clienteEncontrado = response.data;
      } catch (error) {
        alert(error.response?.data?.error || 'Error al buscar el cliente');
        this.clienteEncontrado = null;
      }
    },
    
    // Buscar cliente para actualizar
    async buscarClienteParaActualizar() {
      try {
        const response = await axios.get('http://localhost:3001/api/clientes/uno', {
          params: { idCliente: this.idClienteActualizacion }
        });
        
        this.clienteEncontradoParaActualizar = response.data;
        
        // Pre-llenamos los campos del formulario de actualización
        this.clienteParaActualizar = {
          idCliente: response.data.idCliente,
          nombre: response.data.nombre,
          numero: response.data.numero
        };
      } catch (error) {
        alert(error.response?.data?.error || 'Error al buscar el cliente');
        this.clienteEncontradoParaActualizar = null;
      }
    },
    
    // Actualizar cliente
    async actualizarCliente() {
      try {
        const clienteAActualizar = {
          idCliente: this.clienteParaActualizar.idCliente,
          nombre: this.clienteParaActualizar.nombre,
          numero: this.clienteParaActualizar.numero
        };

        const response = await axios.put('http://localhost:3001/api/clientes/modificar', clienteAActualizar);
        
        alert(response.data.mensaje);
        
        // Limpiar el formulario y salir del modo de actualización
        this.cancelarActualizacion();
      } catch (error) {
        if (error.response) {
          alert(error.response.data.mensaje || error.response.data.error);
        } else {
          alert('Error al actualizar el cliente.');
        }
      }
    },
    
    // Cancelar actualización
    cancelarActualizacion() {
      this.clienteEncontradoParaActualizar = null;
      this.idClienteActualizacion = '';
      this.clienteParaActualizar = { idCliente: '', nombre: '', numero: '' };
    },
    
    // Eliminar cliente
    async eliminarCliente() {
      try {
        const response = await axios.delete('http://localhost:3001/api/clientes/eliminar', {
          data: this.clienteParaEliminar
        });
        alert(response.data.mensaje);
        this.clienteParaEliminar = { idCliente: '', motivo: '' };
      } catch (error) {
        alert(error.response?.data?.error || 'Error al eliminar el cliente');
      }
    },
    
    // Obtener todos los clientes
    async obtenerTodosClientes() {
      try {
        const response = await axios.get('http://localhost:3001/api/clientes/todos');
        this.clientes = response.data;
      } catch (error) {
        alert(error.response?.data?.error || 'Error al obtener los clientes');
      }
    },
    
    // Métodos para gestión de crédito
    async consultarCredito() {
      try {
        if (!this.creditoConsulta.idCliente) {
          alert('Debe proporcionar el ID del cliente.');
          return;
        }
        
        // Actualizamos la URL para que coincida con el endpoint del backend
        const response = await axios.get(`http://localhost:3001/api/clientes/credito?idCliente=${this.creditoConsulta.idCliente}`);
        this.infoCredito = response.data;
      } catch (error) {
        alert(error.response ? error.response.data.error : 'Error al consultar el crédito');
        this.infoCredito = null;
      }
    },
    
    async verificarDeuda() {
      try {
        if (!this.abonoCredito.idCliente) {
          alert('Debe proporcionar el ID del cliente.');
          return;
        }

        const response = await axios.get('http://localhost:3001/api/clientes/credito', {
          params: { idCliente: this.abonoCredito.idCliente }
        });

        this.clienteDeuda = response.data;

        // Limpiar campos relacionados con el abono
        this.facturaSeleccionada = null;
        this.abonoCredito.numeroFactura = '';
        this.abonoCredito.monto = '';
      } catch (error) {
        alert(error.response ? error.response.data.error : 'Error al verificar la deuda');
        this.clienteDeuda = null;
      }
    },

    seleccionarFactura(factura) {
      this.facturaSeleccionada = factura;
      this.abonoCredito.numeroFactura = factura.numeroFactura;  // Aseguramos que se envíe al backend
      this.abonoCredito.monto = '';
    },

    async registrarAbono() {
      try {
        if (!this.facturaSeleccionada) {
          alert('Debe seleccionar una factura para abonar.');
          return;
        }

        if (!this.abonoCredito.numeroFactura) {
          alert('Debe seleccionar una factura válida.');
          return;
        }

        if (!this.abonoCredito.monto || parseFloat(this.abonoCredito.monto) <= 0) {
          alert('Debe proporcionar un monto válido.');
          return;
        }

        if (parseFloat(this.abonoCredito.monto) > this.facturaSeleccionada.saldoPendiente) {
          alert('El monto a abonar no puede ser mayor que el saldo pendiente de la factura.');
          return;
        }

        // Envío del abono al backend
        const response = await axios.post('http://localhost:3001/api/clientes/credito/abonar', {
          idCliente: this.abonoCredito.idCliente,
          numeroFactura: this.abonoCredito.numeroFactura,
          monto: parseFloat(this.abonoCredito.monto)
        });

        alert(`Abono registrado con éxito. Nuevo saldo pendiente: $${response.data.nuevoSaldo.toFixed(2)}`);

        // Recargamos la deuda actualizada
        await this.verificarDeuda();

        // Limpiamos el formulario
        this.abonoCredito.numeroFactura = '';
        this.abonoCredito.monto = '';
        this.facturaSeleccionada = null;
      } catch (error) {
        alert(error.response ? error.response.data.error : 'Error al registrar el abono');
      }
    },
    
    // Métodos auxiliares
    formatearNumero(numero) {
      if (typeof numero !== 'number') return '0.00';
      return numero.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    formatearFecha(fecha) {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-MX');
    }
  },
  mounted() {
    // Cargar la lista de clientes al iniciar el componente
    this.obtenerTodosClientes();
  }
};
</script>

<style scoped>
.contenedor {
  max-width: 900px;
  margin: auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px;
}

.titulo {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  color: #1a237e;
}

/* Estilos para la navegación de pestañas */
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

.tab-buttons button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.4);
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
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

input {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus {
  border-color: #1a237e;
  outline: none;
  box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.2);
}

.boton-principal {
  width: 100%;
  padding: 12px;
  background-color: #1a237e;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.boton-principal:hover {
  background-color: #3f51b5;
}

.boton-secundario {
  padding: 8px 16px;
  background-color: #e0e0e0;
  color: #333;
  border: none;
  border-radius: 4px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.boton-secundario:hover {
  background-color: #bdbdbd;
}

.resultado {
  margin-top: 15px;
  background-color: #e8eaf6;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #1a237e;
}

/* Estilos para el formulario de actualización */
.formulario-actualizacion {
  background-color: #e8eaf6;
  padding: 20px;
  border-radius: 6px;
  margin-top: 20px;
}

.datos-cliente {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #c5cae9;
  border-radius: 4px;
}

.botones-actualizacion {
  display: flex;
  gap: 10px;
}

.botones-actualizacion .boton-secundario {
  flex: 1;
  margin-bottom: 0;
  padding: 12px;
}

.botones-actualizacion .boton-principal {
  flex: 2;
}

/* Estilos para la tabla de clientes */
.tabla-container {
  overflow-x: auto;
  margin-top: 20px;
}

.tabla-clientes {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border-radius: 4px;
  overflow: hidden;
}

.tabla-clientes th, .tabla-clientes td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.tabla-clientes th {
  background-color: #1a237e;
  color: white;
  font-weight: 500;
}

.tabla-clientes tr:last-child td {
  border-bottom: none;
}

.tabla-clientes tr:hover {
  background-color: #f5f5f5;
}

.sin-datos {
  text-align: center;
  padding: 20px;
  color: #757575;
}

/* Estilos para las tablas de crédito */
.resultado-credito {
  margin-top: 20px;
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.info-deuda {
  background-color: #e8eaf6;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  border-left: 4px solid #1a237e;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

th {
  background-color: #1a237e;
  color: white;
  font-weight: 500;
}

tr:hover {
  background-color: #f5f5f5;
}

.sin-credito, .sin-deuda {
  background-color: #e8f5e9;
  padding: 15px;
  border-radius: 6px;
  margin-top: 15px;
  border-left: 4px solid #4caf50;
}

.form-abono {
  background-color: #e8eaf6;
  padding: 20px;
  border-radius: 6px;
  margin-top: 20px;
  border-left: 4px solid #1a237e;
}

.info-deuda-abono {
  margin-top: 20px;
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
</style>