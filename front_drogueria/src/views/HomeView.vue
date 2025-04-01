<template>
  <div class="login-container">
    <h2>Inicio de sesión</h2>
    <form @submit.prevent="login">
      <label for="usuario">Nombre de usuario</label>
      <input id="usuario" v-model="nombreUsuario" type="text" required />
      
      <label for="contrasena">Contraseña</label>
      <input id="contrasena" v-model="contrasena" type="password" required />
      
      <button type="submit">Inicio</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      nombreUsuario: '',
      contrasena: '',
      error: null,
    };
  },
  methods: {
    async login() {
      try {
        const response = await axios.post('http://localhost:3001/api/login', {
          nombreUsuario: this.nombreUsuario,
          contrasena: this.contrasena,
        });
        alert(response.data.mensaje);

        
        // Guardar estado de sesión en localStorage
        localStorage.setItem('user', JSON.stringify(response.data.usuario)); 

        this.$router.push('/facturar');

      } catch (err) {
        this.error = err.response?.data?.error || 'Error al iniciar sesión';
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  background: #1E2A78;
  color: white;
  max-width: 350px;
  margin: 100px auto;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.3);
}

h2 {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 20px;
}

label {
  display: block;
  font-size: 14px;
  text-align: left;
  margin: 10px 0 5px;
}

input {
  display: block;
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 15px;
  border: none;
  outline: none;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
}

button {
  width: 100%;
  padding: 10px;
  background: white;
  color: black;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
}

.error {
  color: red;
  margin-top: 10px;
}
</style>
