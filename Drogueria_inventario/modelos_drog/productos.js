const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  codigoBarras: { type: String, unique: true, required: true },
  descripcion: { type: String, required: true },
  cantidadStock: { type: Number, required: true, min: 0 },
  tipoVenta: { 
    type: String, 
    required: true, 
    enum: ['unidad', 'caja', 'ambas'] 
  },
  cantidadPorCaja: { 
    type: Number, 
    required: function() { return this.tipoVenta !== 'unidad'; }, 
    min: 1 
  }, // Solo requerido si se vende en cajas o ambas opciones
  precioCompra: { type: Number, required: true, min: 0 },
  precioVenta: { 
    type: Number, 
    required: true, 
    min: function() { return this.precioCompra; } // Evitar que el precio de venta sea menor al de compra
  },
  fechaVencimiento: { type: Date, required: true }
});

module.exports = mongoose.model('Producto', productoSchema);
