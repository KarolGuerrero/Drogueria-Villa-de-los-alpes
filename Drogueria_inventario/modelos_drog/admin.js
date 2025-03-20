const mongoose = require('mongoose');
const crypto = require('crypto');

const adminSchema = new mongoose.Schema({
  nombreUsuario: { type: String, unique: true, required: true },
  contrasena: { type: String, required: true },
  fechaRegistro: { type: Date, default: Date.now },
  rol: { type: String, default: 'ADMIN' }, // Se asigna 'ADMIN' por defecto
});

// Middleware para aplicar el hash MD5 a la contraseña antes de guardar
adminSchema.pre('save', function (next) {
  if (this.isModified('contrasena')) {
    this.contrasena = crypto.createHash('md5').update(this.contrasena).digest('hex');
  }
  next();
});

// Verificar si ya existe un administrador en la base de datos
adminSchema.statics.crearAdminPorDefecto = async function () {
  const existeAdmin = await this.findOne({ nombreUsuario: 'admin' });

  if (!existeAdmin) {
    const adminPorDefecto = new this({
      nombreUsuario: 'admin',
      contrasena: '123456',
      rol: 'ADMIN',
    });
    await adminPorDefecto.save();
    console.log('Administrador por defecto creado: admin / 123456');
  }
};

module.exports = mongoose.model('Admin', adminSchema);