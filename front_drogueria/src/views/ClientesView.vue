<template>
    <div class="container">
      <h1>Gestión de Clientes</h1>
      
      <!-- Formulario para agregar cliente -->
      <form @submit.prevent="crearCliente" class="formulario">
        <input v-model="nuevoCliente.nombre" placeholder="Nombre del Cliente" required />
        <input v-model="nuevoCliente.numero" placeholder="Número (10 dígitos)" required />
        <button type="submit">Agregar Cliente</button>
      </form>
  
      <h2>Lista de Clientes</h2>
      <ul class="lista-clientes">
        <li v-for="cliente in clientes" :key="cliente._id" class="cliente-item">
          <span>{{ cliente.nombre }} - {{ cliente.numero }}</span>
          <div>
            <button @click="editarCliente(cliente)">Editar</button>
            <button @click="eliminarCliente(cliente._id)" class="eliminar">Eliminar</button>
          </div>
        </li>
      </ul>
  
      <!-- Modal de edición -->
      <div v-if="clienteEditando" class="modal">
        <div class="modal-content">
          <h3>Editar Cliente</h3>
          <input v-model="clienteEditando.nombre" placeholder="Nombre" />
          <input v-model="clienteEditando.numero" placeholder="Número" />
          <div class="modal-buttons">
            <button @click="actualizarCliente">Guardar Cambios</button>
            <button @click="clienteEditando = null" class="cancelar">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        clientes: [],
        nuevoCliente: { nombre: '', numero: '' },
        clienteEditando: null
      };
    },
    methods: {
      async obtenerClientes() {
        try {
          const res = await axios.get('/api/clientes/todos');
          this.clientes = res.data;
        } catch (error) {
          console.error('Error al obtener clientes', error);
        }
      },
      async crearCliente() {
        try {
          await axios.post('/api/clientes/crear', this.nuevoCliente);
          this.nuevoCliente = { nombre: '', numero: '' };
          this.obtenerClientes();
        } catch (error) {
          console.error('Error al crear cliente', error);
        }
      },
      editarCliente(cliente) {
        this.clienteEditando = { ...cliente };
      },
      async actualizarCliente() {
        try {
          await axios.put('/api/clientes/modificar', this.clienteEditando);
          this.clienteEditando = null;
          this.obtenerClientes();
        } catch (error) {
          console.error('Error al actualizar cliente', error);
        }
      },
      async eliminarCliente(idCliente) {
        const motivo = prompt('Ingrese el motivo de eliminación:');
        if (!motivo) return;
        try {
          await axios.delete('/api/clientes/eliminar', { data: { idCliente, motivo } });
          this.obtenerClientes();
        } catch (error) {
          console.error('Error al eliminar cliente', error);
        }
      }
    },
    mounted() {
      this.obtenerClientes();
    }
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 600px;
    margin: auto;
    padding: 20px;
    font-family: Arial, sans-serif;
  }
  
  h1, h2 {
    text-align: center;
  }
  
  .formulario {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  button {
    padding: 8px 12px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button.eliminar {
    background-color: #dc3545;
  }
  
  button.cancelar {
    background-color: #6c757d;
  }
  
  .lista-clientes {
    list-style: none;
    padding: 0;
  }
  
  .cliente-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #ddd;
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
    border-radius: 8px;
    text-align: center;
  }
  
  .modal-buttons {
    display: flex;
    justify-content: space-around;
    margin-top: 10px;
  }
  </style>