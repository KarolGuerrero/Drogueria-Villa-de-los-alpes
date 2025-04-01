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
          <input type="text" v-model="clienteId" placeholder="ID del Cliente" />
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
            <th>Acciones</th>
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
                @change="actualizarTotal"
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
          <input type="number" v-model.number="montoPagado" min="0" />
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
  
      <!-- Modal de Confirmación -->
      <div v-if="mostrarModalError" class="modal-error">
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
            <button @click="confirmarCobro(true)">Imprimir</button>
            <button @click="confirmarCobro(false)">No Imprimir</button>
            <button @click="mostrarModalCobro = false">Cancelar</button>
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
        metodoPago: 'efectivo',
        montoPagado: 0,
        cambio: 0,
        mostrarModalCobro: false,
      };
    },
    methods: {
     calcularCambio() {
        this.cambio = Math.max(0, this.montoPagado - this.total);
     },
     cobrar() {
        if (this.metodoPago === "efectivo" && this.montoPagado < this.total) {
        this.mostrarError("El monto pagado no es suficiente.");
        return;
        }
        this.mostrarModalCobro = true;
     },
     confirmarCobro(imprimir) {
        console.log(imprimir ? "Imprimiendo recibo..." : "Venta realizada sin impresión.");
        alert("Venta completada.");
        this.cancelarVenta();
        this.mostrarModalCobro = false;
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
      },
      eliminarProducto(index) {
        this.productos.splice(index, 1);
        this.actualizarTotal();
      },
      actualizarTotal() {
        this.total = this.productos.reduce((acc, producto) => acc + producto.precioVenta * producto.cantidad, 0);
      },
      async cobrar() {
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
            }
          };
    
          const response = await axios.post('http://localhost:3001/api/producto/factura', facturaData);
          
          alert(response.data.message);
          this.cancelarVenta();
        } catch (error) {
          this.mostrarError(error.response?.data?.error || 'Error al procesar la factura');
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
        this.metodoPago = 'efectivo';
        this.montoPagado = 0;
      },
      mostrarError(mensaje) {
        this.mensajeError = mensaje;
        this.mostrarModalError = true;
      },
      verAlertas() {
        // Implementar lógica de alertas
        alert('Función de alertas próximamente');
      },
      verUsuario() {
        // Implementar lógica de usuario
        alert('Perfil de usuario próximamente');
      }
    }
  };
  </script>
  
  <style scoped>
  /* Todos los estilos del frontend original se mantienen igual */
  .venta-container {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    padding: 20px;
    max-width: 1200px;
    margin: auto;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  /* Resto de los estilos del frontend original se mantienen igual */
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
  
  .modal-error .modal-content {
    width: 300px;
    background-color: white;
    border: 2px solid #e74c3c;
    padding: 20px;
    text-align: center;
    border-radius: 10px;
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
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
}
.modal-content button {
  margin: 10px;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
}
  </style>