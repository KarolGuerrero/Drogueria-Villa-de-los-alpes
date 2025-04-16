<template>
  <div class="container">
    <h1>Gestión de Clientes</h1>

    <!-- Crear Cliente -->
    <section>
      <h2>Crear Cliente</h2>
      <form @submit.prevent="crearCliente">
        <input v-model="nuevoCliente.nombre" placeholder="Nombre" />
        <input v-model="nuevoCliente.numero" placeholder="Número (10 dígitos)" />
        <button>Crear</button>
        <p v-if="mensajeCrear">{{ mensajeCrear }}</p>
      </form>
    </section>

    <!-- Listar Clientes -->
    <section>
      <h2>Lista de Clientes</h2>
      <button @click="obtenerClientes">Refrescar</button>
      <ul>
        <li v-for="cliente in clientes" :key="cliente._id">
          {{ cliente.nombre }} - {{ cliente.numero }}
        </li>
      </ul>
    </section>

    <!-- Buscar Cliente -->
    <section>
      <h2>Buscar Cliente</h2>
      <input v-model="busqueda.nombre" placeholder="Buscar por nombre" />
      <button @click="buscarCliente">Buscar</button>
      <div v-if="clienteBuscado">
        <p>Resultado: {{ clienteBuscado.nombre }} - {{ clienteBuscado.numero }}</p>
      </div>
    </section>

    <!-- Editar Cliente -->
    <section>
      <h2>Editar Cliente</h2>
      <input v-model="editar.nombre" placeholder="Nombre del cliente a editar" />
      <input v-model="editar.nuevoNumero" placeholder="Nuevo número" />
      <button @click="editarCliente">Actualizar</button>
      <p v-if="mensajeEditar">{{ mensajeEditar }}</p>
    </section>

    <!-- Eliminar Cliente -->
    <section>
      <h2>Eliminar Cliente</h2>
      <input v-model="eliminar.idCliente" placeholder="ID del cliente" />
      <input v-model="eliminar.motivo" placeholder="Motivo de eliminación" />
      <button @click="eliminarCliente">Eliminar</button>
      <p v-if="mensajeEliminar">{{ mensajeEliminar }}</p>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// Crear cliente
const nuevoCliente = ref({ nombre: '', numero: '' })
const mensajeCrear = ref('')

const crearCliente = async () => {
  try {
    const res = await axios.post('http://localhost:3001/api/clientes/crear', nuevoCliente.value)
    mensajeCrear.value = res.data.message
    obtenerClientes()
  } catch (err) {
    mensajeCrear.value = err.response?.data?.error || 'Error al crear cliente'
  }
}

// Listar clientes
const clientes = ref([])

const obtenerClientes = async () => {
  try {
    const res = await axios.get('http://localhost:3001/api/clientes/todos')
    clientes.value = res.data
  } catch (err) {
    console.error('Error al obtener clientes')
  }
}
onMounted(obtenerClientes)

// Buscar cliente
const busqueda = ref({ nombre: ''})

const clienteBuscado = ref(null)
const buscarCliente = async () => {
  try {
    const res = await axios.get('http://localhost:3001/api/clientes/uno', busqueda.value)
    clienteBuscado.value = res.data
  } catch (err) {
    clienteBuscado.value = null
    alert(err.response?.data?.error || 'Cliente no encontrado')
  }
}

// Editar cliente
const editar = ref({ nombre: '', nuevoNumero: '' })
const mensajeEditar = ref('')

const editarCliente = async () => {
  try {
    const res = await axios.put('http://localhost:3001/api/clientes/modificar', {
      nombre: editar.value.nombre,
      numero: editar.value.nuevoNumero
    })
    mensajeEditar.value = res.data.mensaje
    obtenerClientes()
  } catch (err) {
    mensajeEditar.value = err.response?.data?.mensaje || 'Error al editar cliente'
  }
}

// Eliminar cliente
const eliminar = ref({ idCliente: '', motivo: '' })
const mensajeEliminar = ref('')

const eliminarCliente = async () => {
  try {
    const res = await axios.delete('http://localhost:3001/api/clientes/eliminar', {
      data: eliminar.value
    })
    mensajeEliminar.value = res.data.mensaje
    obtenerClientes()
  } catch (err) {
    mensajeEliminar.value = err.response?.data?.error || 'Error al eliminar cliente'
  }
}
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: auto;
  font-family: Arial, sans-serif;
}
section {
  margin-bottom: 2rem;
  border-bottom: 1px solid #ccc;
  padding-bottom: 1rem;
}
input {
  margin: 0.3rem;
  padding: 0.4rem;
}
button {
  margin-left: 0.5rem;
  padding: 0.4rem 0.7rem;
}
</style>
