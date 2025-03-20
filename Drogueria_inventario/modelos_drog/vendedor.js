const mongoose = require('mongoose');
const crypto = require('crypto');

const vendedorSchema = new mongoose.Schema({
  nombreUsuario: { type: String, unique: true, required: true },
  contrasena: { type: String, required: true },
  fechaRegistro: { type: Date, default: Date.now },
  rol: { type: String, default: 'VENDEDOR' }, // Se asigna 'VENDEDOR' por defecto
  permisos: { 
    type: [String], 
    enum: ['facturar', 'ver_inventario', 'generar_reportes', 'añadir_inventario'], 
    default: ['facturar', 'añadir_inventario'] 
  }
});

// Middleware para aplicar el hash MD5 a la contraseña antes de guardar
vendedorSchema.pre('save', function (next) {
  if (this.isModified('contrasena')) {
    this.contrasena = crypto.createHash('md5').update(this.contrasena).digest('hex');
  }
  next();
});

module.exports = mongoose.model('Vendedor', vendedorSchema);
