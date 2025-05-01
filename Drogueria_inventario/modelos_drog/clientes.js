
const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  idCliente: { type: Number, unique: true }, // Número en lugar de UUID
  nombre: { type: String, required: true, unique: true },
  numero: { type: String, required: true, unique: true },
  fechaRegistro: { type: Date, default: Date.now },

  // Créditos acumulativos del cliente
  creditos: {
    deudaTotal: { type: Number, default: 0 }, // Deuda acumulada total
    facturas: [
      {
        numeroFactura: { type: String, required: true },
        fechaCompra: { type: Date, default: Date.now },
        productos: [
          {
            nombre: { type: String, required: true },
            cantidad: { type: Number, required: true, min: 1 },
            deuda: { type: Number, required: true, min: 0 },
          }
        ],
        montoTotal: { type: Number, required: true, min: 0 },
        pagos: [
          {
            fecha: { type: Date, default: Date.now },
            monto: { type: Number, required: true, min: 0 },
          }
        ],
        saldoPendiente: { type: Number, required: true, min: 0 }, // Saldo pendiente de esta factura
      }
    ]
  }
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