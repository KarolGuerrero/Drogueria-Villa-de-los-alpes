const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
  tipoVenta: { 
    type: String, 
    required: true, 
    enum: ['mostrador', 'cliente'] 
  },
  cliente: { 
    id: { 
      type: String, 
      ref: 'Cliente',
      required: function() { return this.tipoVenta === 'cliente'; }
    },
    nombre: {
      type: String,
      required: function() { return this.tipoVenta === 'cliente'; }
    }
  }, // Guarda ID y nombre si es venta a cliente

  productos: [{
    codigoBarras: { type: String, required: true },
    descripcion: { type: String, required: true },
    cantidad: { type: Number, required: true, min: 1 },
    precioUnitario: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 }
  }],
  total: { type: Number, required: true, min: 0 },
  pago: {
    metodo: { type: String, required: true, enum: ['efectivo', 'credito'] },
    montoPagado: { type: Number, required: function() { return this.pago.metodo === 'efectivo'; } },
    cambio: { type: Number, default: 0 }
  },
  observaciones: { type: String },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Venta', ventaSchema);
