const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  idCliente: { type: Number, unique: true }, // Número en lugar de UUID
  nombre: { type: String, required: true, unique: true },
  numero: { type: String, required: true, unique: true },
  fechaRegistro: { type: Date, default: Date.now },

  // Opción de crédito
  credito: {
    numeroFactura: { type: String, unique: true, sparse: true }, // Único si existe
    productos: [
      {
        nombre: { type: String, required: true },
        cantidad: { type: Number, required: true, min: 1 },
        Deuda: { type: Number, required: true, min: 0 },
      },
    ],
  },
});

// Esquema para almacenar el contador
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 1 },
});

const Counter = mongoose.model('Counter', counterSchema);

// Middleware para asignar idCliente incremental
clienteSchema.pre('save', async function (next) {
  if (!this.idCliente) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'clienteId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.idCliente = counter.seq;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model('Cliente', clienteSchema);
