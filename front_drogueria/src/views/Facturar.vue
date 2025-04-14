<template>
  <div class="venta-container">
    <div class="factura-opciones">
      <div>
        <label>Tipo de Venta:</label>
        <select v-model="tipoVenta">
          <option value="mostrador">Mostrador</option>
          <option value="cliente">Cliente</option>
        </select>
      </div>
      
      <div v-if="tipoVenta === 'cliente'" class="cliente-input">
        <input 
          type="text" 
          v-model="clienteId" 
          placeholder="ID del Cliente" 
          @input="buscarCliente"
        />
        <span v-if="nombreCliente" class="nombre-cliente">{{ nombreCliente }}</span>
      </div>
    </div>
    
    <div class="buscador">
      <input 
        v-model="codigoBarras" 
        placeholder="Escanea o digita el código de barras" 
        @keyup.enter="agregarProducto"
      />
      <div class="cantidad-control">
        <input 
          type="number" 
          v-model.number="cantidad" 
          min="1" 
          @change="validarCantidad"
        />
      </div>
      <button @click="agregarProducto">Agregar</button>
    </div>

    <table class="tabla-productos" v-if="productos.length">
      <thead>
        <tr>
          <th>Item</th>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Precio unidad</th>
          <th>Total</th>
          <th>Eliminar</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(producto, index) in productos" :key="index">
          <td>{{ index + 1 }}</td>
          <td>{{ producto.descripcion }}</td>
          <td>
            <input 
              type="number" 
              v-model.number="producto.cantidad" 
              min="1" 
              @input="actualizarTotal"
            />
          </td>
          <td>{{ producto.precioVenta.toFixed(2) }}</td>
          <td>{{ (producto.precioVenta * producto.cantidad).toFixed(2) }}</td>
          <td>
            <button @click="eliminarProducto(index)">❌</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="mensaje-vacio">
      No hay productos agregados
    </div>

    <div class="metodo-pago">
      <label>Método de Pago:</label>
      <select v-model="metodoPago">
        <option value="efectivo">Efectivo</option>
        <option value="credito">Crédito</option>
      </select>

      <div v-if="metodoPago === 'efectivo'" class="pago-efectivo">
        <label>Monto Pagado:</label>
        <input 
          type="number" 
          v-model.number="montoPagado" 
          min="0" 
          @input="calcularCambio"
        />
        <p><strong>Cambio:</strong> ${{ cambio.toFixed(2) }}</p>
      </div>
    </div>

    <div class="total-container">
      <h3>Total</h3>
      <p>${{ total.toFixed(2) }}</p>
      <div class="botones-cobro">
        <button @click="cobrar" :disabled="productos.length === 0">Cobrar</button>
        <button @click="cancelarVenta" :disabled="productos.length === 0">Cancelar</button>
      </div>
    </div>

    <!-- Información del usuario actual -->
    <div class="usuario-actual">
      <p><strong>Usuario actual:</strong> {{ usuarioActual.nombre }}</p>
    </div>

    <!-- Modal de Confirmación -->
    <div v-if="mostrarModalError" class="modal-error modal">
      <div class="modal-content">
        <h2>Error</h2>
        <p>{{ mensajeError }}</p>
        <button @click="mostrarModalError = false">Cerrar</button>
      </div>
    </div>

    <!-- Modal de confirmación de cobro -->
    <div v-if="mostrarModalCobro" class="modal">
      <div class="modal-content">
        <h2>¿Desea imprimir el recibo?</h2>
        <button @click="confirmarCobro(true)" class="btn-confirmar">Imprimir</button>
        <button @click="confirmarCobro(false)" class="btn-confirmar">No Imprimir</button>
        <button @click="mostrarModalCobro = false" class="btn-cancelar">Cancelar</button>
      </div>
    </div>

    <!-- Modal de vista previa del ticket -->
    <div v-if="mostrarTicket" class="modal">
      <div class="modal-content ticket-modal">
        <h2>Vista Previa del Ticket</h2>
        <div class="ticket-preview" ref="ticketElement">
          <div class="ticket-header">
            <h2>{{ datosNegocio.nombre }}</h2>
            <p>{{ datosNegocio.direccion }}</p>
            <p>{{ datosNegocio.telefono }}</p>
            <p>NIT: {{ datosNegocio.nit }}</p>
            <div class="ticket-info">
              <p><strong>Fecha:</strong> {{ fechaActual }}</p>
              <p><strong>Hora:</strong> {{ horaActual }}</p>
              <p><strong>Vendedor:</strong> {{ usuarioActual.nombre }}</p>
              <p v-if="tipoVenta === 'cliente'"><strong>Cliente:</strong> {{ nombreCliente || 'No especificado' }}</p>
              <p><strong>Tipo de Venta:</strong> {{ tipoVenta === 'mostrador' ? 'Mostrador' : 'Cliente' }}</p>
              <p><strong>Método de Pago:</strong> {{ metodoPago === 'efectivo' ? 'Efectivo' : 'Crédito' }}</p>
            </div>
          </div>
          <div class="ticket-productos">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cant.</th>
                  <th>Precio</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(producto, index) in productos" :key="index">
                  <td>{{ producto.descripcion }}</td>
                  <td>{{ producto.cantidad }}</td>
                  <td>${{ producto.precioVenta.toFixed(2) }}</td>
                  <td>${{ (producto.precioVenta * producto.cantidad).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="ticket-footer">
            <div class="ticket-totales">
              <p><strong>Subtotal:</strong> ${{ total.toFixed(2) }}</p>
              <p><strong>IVA:</strong> Incluido</p>
              <p class="total-ticket"><strong>TOTAL:</strong> ${{ total.toFixed(2) }}</p>
              <div v-if="metodoPago === 'efectivo'">
                <p><strong>Recibido:</strong> ${{ montoPagado.toFixed(2) }}</p>
                <p><strong>Cambio:</strong> ${{ cambio.toFixed(2) }}</p>
              </div>
            </div>
            <div class="ticket-mensaje">
              <p>¡Gracias por su compra!</p>
              <p>Visite nuestra página web: {{ datosNegocio.web }}</p>
            </div>
          </div>
        </div>
        <div class="ticket-actions">
          <button @click="imprimirTicket" class="btn-confirmar">Imprimir</button>
          <button @click="finalizarVenta" class="btn-confirmar">Finalizar Venta</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      codigoBarras: '',
      cantidad: 1,
      productos: [],
      total: 0,
      mostrarModalError: false,
      mensajeError: '',
      tipoVenta: 'mostrador',
      clienteId: '',
      nombreCliente: '',
      metodoPago: 'efectivo',
      montoPagado: 0,
      cambio: 0,
      mostrarModalCobro: false,
      mostrarTicket: false,
      fechaActual: '',
      horaActual: '',
      usuarioActual: {
        id: null,
        nombre: 'Cargando...',
        rol: ''
      },
      datosNegocio: {
        nombre: 'DROGUERÍA SALUD TOTAL',
        direccion: 'Calle Principal #123, Ciudad',
        telefono: '(123) 456-7890',
        nit: '900.123.456-7',
        web: 'www.saludtotal.com'
      }
    };
  },
  created() {
    // Cargar la información del usuario al iniciar el componente
    this.obtenerUsuarioActual();
  },
  methods: {
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
    obtenerFechaHora() {
      const ahora = new Date();
      
      // Formato de fecha: DD/MM/YYYY
      const dia = String(ahora.getDate()).padStart(2, '0');
      const mes = String(ahora.getMonth() + 1).padStart(2, '0');
      const año = ahora.getFullYear();
      this.fechaActual = `${dia}/${mes}/${año}`;
      
      // Formato de hora: HH:MM:SS
      const hora = String(ahora.getHours()).padStart(2, '0');
      const minutos = String(ahora.getMinutes()).padStart(2, '0');
      const segundos = String(ahora.getSeconds()).padStart(2, '0');
      this.horaActual = `${hora}:${minutos}:${segundos}`;
    },
    calcularCambio() {
      this.cambio = Math.max(0, this.montoPagado - this.total);
    },
    cobrar() {
      if (this.productos.length === 0) {
        this.mostrarError("No hay productos para cobrar.");
        return;
      }
      
      if (this.metodoPago === "efectivo" && this.montoPagado < this.total) {
        this.mostrarError("El monto pagado no es suficiente.");
        return;
      }
      
      // Mostrar modal de opciones de impresión
      this.mostrarModalCobro = true;
    },
    confirmarCobro(imprimir) {
      this.mostrarModalCobro = false;
      
      if (imprimir) {
        // Obtener fecha y hora actual antes de mostrar el ticket
        this.obtenerFechaHora();
        // Mostrar vista previa del ticket
        this.mostrarTicket = true;
      } else {
        // Proceder con la venta sin imprimir
        this.procesarVenta(false);
      }
    },
    imprimirTicket() {
      // Abrir ventana de impresión para el ticket
      const contenidoTicket = this.$refs.ticketElement.innerHTML;
      const ventanaImpresion = window.open('', '_blank', 'width=600,height=600');
      
      ventanaImpresion.document.write(`
        <html>
          <head>
            <title>Ticket de venta</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                width: 80mm;
                margin: 0 auto;
                padding: 5mm;
              }
              h2 {
                text-align: center;
                margin: 5px 0;
                font-size: 14px;
              }
              p {
                margin: 3px 0;
                line-height: 1.2;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 10px 0;
              }
              th, td {
                text-align: left;
                padding: 3px;
                border-bottom: 1px dashed #ccc;
                font-size: 12px;
              }
              .total-ticket {
                font-size: 14px;
                margin-top: 10px;
              }
              .ticket-mensaje {
                text-align: center;
                margin-top: 15px;
                border-top: 1px dashed #000;
                padding-top: 10px;
              }
            </style>
          </head>
          <body>
            ${contenidoTicket}
          </body>
        </html>
      `);
      
      ventanaImpresion.document.close();
      ventanaImpresion.focus();
      ventanaImpresion.print();
      // Después de imprimir procesar la venta
      this.procesarVenta(true);
    },
    async procesarVenta(imprimirTicket) {
      try {
        // Mapear productos para envío
        const productosParaFactura = this.productos.map(p => ({
          codigoBarras: p.codigoBarras,
          cantidad: p.cantidad
        }));

        const facturaData = {
          tipoVenta: this.tipoVenta,
          cliente: this.tipoVenta === 'cliente' ? this.clienteId : '',
          productos: productosParaFactura,
          pago: {
            metodo: this.metodoPago,
            montoPagado: this.metodoPago === 'efectivo' ? this.montoPagado : 0
          },
          imprimirTicket: imprimirTicket,
          vendedor: this.usuarioActual.id, // Enviamos el ID del vendedor
          nombreVendedor: this.usuarioActual.nombre // Añadimos también el nombre del vendedor
        };
  
        const response = await axios.post('http://localhost:3001/api/producto/factura', facturaData);
        
        // Cerrar modal del ticket si está abierto
        if (this.mostrarTicket) {
          this.mostrarTicket = false;
        }
        
        alert(response.data.message);
        this.cancelarVenta();
      } catch (error) {
        this.mostrarError(error.response?.data?.error || 'Error al procesar la factura');
        if (this.mostrarTicket) {
          this.mostrarTicket = false;
        }
      }
    },
    finalizarVenta() {
      // Cerrar la vista previa del ticket y procesar la venta
      this.mostrarTicket = false;
      this.procesarVenta(true);
    },
    async buscarCliente() {
      if (!this.clienteId) {
        this.nombreCliente = '';
        return;
      }
      
      try {
        const response = await axios.get('http://localhost:3001/api/clientes/buscar', {
          params: { id: this.clienteId }
        });
        
        if (response.data && response.data.nombre) {
          this.nombreCliente = response.data.nombre;
        } else {
          this.nombreCliente = '';
        }
      } catch (error) {
        this.nombreCliente = '';
        console.error('Error al buscar cliente:', error);
      }
    },
    async agregarProducto() {
      if (!this.codigoBarras) return;
      
      try {
        const response = await axios.get('http://localhost:3001/api/producto/uno', {
          params: { codigoBarras: this.codigoBarras }
        });
        
        const producto = response.data;
        
        // Verificar si el producto ya existe en la lista
        const productoExistente = this.productos.find(p => p.codigoBarras === producto.codigoBarras);
        
        if (productoExistente) {
          // Incrementar cantidad si ya existe
          productoExistente.cantidad += this.cantidad;
        } else {
          // Añadir nuevo producto
          producto.cantidad = this.cantidad;
          this.productos.push(producto);
        }
        
        this.actualizarTotal();
        this.codigoBarras = '';
        this.cantidad = 1;
      } catch (error) {
        this.mostrarError(error.response?.data?.error || 'Error al buscar producto');
      }
    },
    incrementarCantidad() {
      this.cantidad++;
    },
    decrementarCantidad() {
      if (this.cantidad > 1) this.cantidad--;
    },
    validarCantidad() {
      // Asegurar que la cantidad sea al menos 1
      this.cantidad = Math.max(1, this.cantidad);
      this.actualizarTotal();
    },
    eliminarProducto(index) {
      this.productos.splice(index, 1);
      this.actualizarTotal();
    },
    actualizarTotal() {
      this.total = this.productos.reduce((acc, producto) => acc + producto.precioVenta * producto.cantidad, 0);
      // Si hay un monto pagado, recalcular el cambio
      if (this.montoPagado > 0) {
        this.calcularCambio();
      }
    },
    cancelarVenta() {
      // Limpiar lista de productos y total
      this.productos = [];
      this.total = 0;
      this.codigoBarras = '';
      this.cantidad = 1;
      this.tipoVenta = 'mostrador';
      this.clienteId = '';
      this.nombreCliente = '';
      this.metodoPago = 'efectivo';
      this.montoPagado = 0;
      this.cambio = 0;
    },
    mostrarError(mensaje) {
      this.mensajeError = mensaje;
      this.mostrarModalError = true;
    }
  }
};
</script>

<style scoped>
.venta-container {
  font-family: Arial, sans-serif;
  background-color: #f4f4f4;
  padding: 20px;
  max-width: 1200px;
  margin: auto;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.navbar {
  display: flex;
  justify-content: space-between;
  background-color: #333;
  color: #fff;
  padding: 10px 20px;
  border-radius: 5px;
}
.navbar ul {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
}
.navbar li {
  margin-right: 20px;
}
.navbar a {
  color: #fff;
  text-decoration: none;
}
.navbar a:hover {
  text-decoration: underline;
}

.usuario button {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  margin-left: 10px;
  cursor: pointer;
}
.usuario button:hover {
  color: #1e90ff;
}

.buscador {
  display: flex;
  margin: 20px 0;
}
.buscador input {
  flex: 1;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.buscador button {
  background-color: #1e90ff;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  margin-left: 10px;
}
.buscador button:hover {
  background-color: #0056b3;
}

.tabla-productos {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}
.tabla-productos th,
.tabla-productos td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}
.tabla-productos th {
  background-color: #333;
  color: white;
}

.total-container {
  margin-top: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 5px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.total-container h3 {
  margin-bottom: 10px;
  color: #333;
}
.total-container p {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e90ff;
}
.botones-cobro button {
  background-color: #333;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  margin: 10px;
}
.botones-cobro button:hover {
  background-color: #1e90ff;
}

/* Nuevos estilos para elementos añadidos */
.factura-opciones, .metodo-pago {
  display: flex;
  gap: 10px;
  margin: 10px 0;
  align-items: center;
}
.factura-opciones select, 
.metodo-pago select,
.factura-opciones input,
.metodo-pago input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.cliente-input {
  flex-grow: 1;
  position: relative;
}
.nombre-cliente {
  position: absolute;
  left: 10px;
  top: calc(100% + 5px);
  background-color: #f0f0f0;
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.pago-efectivo {
  display: flex;
  align-items: center;
  gap: 10px;
}
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
  min-width: 300px;
}
.modal-content button {
  margin: 10px;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}
.btn-confirmar {
  background-color: #1e90ff;
  color: white;
}
.btn-confirmar:hover {
  background-color: #0056b3;
}
.btn-cancelar {
  background-color: #f44336;
  color: white;
}
.btn-cancelar:hover {
  background-color: #d32f2f;
}
.mensaje-vacio {
  text-align: center;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 5px;
  color: #666;
  margin: 20px 0;
}

/* Estilos para la vista previa del ticket */
.ticket-modal {
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.ticket-preview {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-family: 'Courier New', monospace;
  text-align: left;
  margin: 20px 0;
}

.ticket-header {
  text-align: center;
  margin-bottom: 15px;
  border-bottom: 1px dashed #000;
  padding-bottom: 10px;
}

.ticket-header h2 {
  margin: 5px 0;
  font-size: 18px;
}

.ticket-header p {
  margin: 3px 0;
  font-size: 12px;
}

.ticket-info {
  text-align: left;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #ccc;
}

.ticket-info p {
  margin: 5px 0;
  font-size: 12px;
}

.ticket-productos table {
  width: 100%;
  border-collapse: collapse;
  margin: 15px 0;
}

.ticket-productos th,
.ticket-productos td {
  padding: 5px;
  text-align: left;
  border-bottom: 1px dashed #ccc;
  font-size: 12px;
}

.ticket-footer {
  margin-top: 15px;
  border-top: 1px dashed #000;
  padding-top: 10px;
}

.ticket-totales {
  margin-bottom: 15px;
}

.ticket-totales p {
  margin: 3px 0;
  text-align: right;
  font-size: 12px;
}

.total-ticket {
  font-size: 16px;
  font-weight: bold;
  margin-top: 5px;
  padding-top: 5px;
  border-top: 1px dashed #ccc;
}

.ticket-mensaje {
  text-align: center;
  margin-top: 20px;
  font-size: 12px;
}

.ticket-actions {
  margin-top: 20px;
}

/* Estilo para mostrar el usuario actual */
.usuario-actual {
  background-color: #e8f4ff;
  padding: 10px;
  border-radius: 5px;
  margin-top: 15px;
  text-align: right;
  font-size: 14px;
  color: #333;
  border-left: 4px solid #1e90ff;
}
</style>