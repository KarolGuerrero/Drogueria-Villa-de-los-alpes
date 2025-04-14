const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  codigoBarras: { type: String, unique: true, required: true },
  descripcion: { type: String, required: true },
  cantidadStock: { type: Number, required: true, min: 0 },
  precioCompra: { type: Number, required: true, min: 0 },
  precioVenta: { 
    type: Number, 
    required: true, 
    min: 0
  },
  fechaVencimiento: { type: Date, required: true }
});

module.exports = mongoose.model('Producto', productoSchema);
