<template>
  <div class="contenedor">
    <h1 class="titulo">Gestión de Clientes</h1>

    <!-- Navegación de pestañas -->
    <div class="tab-buttons">
      <button 
        v-for="(tab, index) in tabs" 
        :key="index" 
        @click="activeTab = tab.id"
        :class="{ active: activeTab === tab.id }"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- Pestaña: Crear Cliente -->
    <section class="seccion" v-show="activeTab === 'crear'">
      <h2>Crear Cliente</h2>
      <form @submit.prevent="crearCliente">
        <input type="text" v-model="nuevoCliente.nombre" placeholder="Nombre" required />
        <input type="text" v-model="nuevoCliente.numero" placeholder="Número" required />
        <button type="submit" class="boton-principal">Guardar Cliente</button>
      </form>
    </section>

    <!-- Pestaña: Buscar Cliente -->
    <section class="seccion" v-show="activeTab === 'buscar'">
      <h2>Buscar Cliente</h2>
      <form @submit.prevent="buscarCliente">
        <input type="text" v-model="nombreBusqueda" placeholder="Nombre" />
        <button type="submit" class="boton-principal">Buscar</button>
      </form>
      <div v-if="clienteEncontrado" class="resultado">
        <p><strong>Nombre:</strong> {{ clienteEncontrado.nombre }}</p>
        <p><strong>Número:</strong> {{ clienteEncontrado.numero }}</p>
      </div>
    </section>

    <!-- Pestaña: Actualizar Cliente -->
    <section class="seccion" v-show="activeTab === 'actualizar'">
      <h2>Actualizar Cliente</h2>
      <form @submit.prevent="actualizarCliente">
        <input type="text" v-model="clienteParaActualizar.idCliente" placeholder="ID Cliente"  />
        <input type="text" v-model="clienteParaActualizar.nombre" placeholder="nombre"  />
        <input type="text" v-model="clienteParaActualizar.numero" placeholder="Nuevo Número" />
        <button type="submit" class="boton-principal">Actualizar Cliente</button>
      </form>
    </section>

    <!-- Pestaña: Eliminar Cliente -->
    <section class="seccion" v-show="activeTab === 'eliminar'">
      <h2>Eliminar Cliente</h2>
      <form @submit.prevent="eliminarCliente">
        <input type="text" v-model="clienteParaEliminar.idCliente" placeholder="ID Cliente" required />
        <input type="text" v-model="clienteParaEliminar.motivo" placeholder="Motivo" required />
        <button type="submit" class="boton-principal">Eliminar Cliente</button>
      </form>
    </section>

    <!-- Pestaña: Listar Clientes -->
    <section class="seccion" v-show="activeTab === 'listar'">
      <h2>Listado de Clientes</h2>
      <button @click="obtenerTodosClientes" class="boton-secundario">Actualizar Lista</button>
      <ul class="lista-clientes">
        <li v-for="cliente in clientes" :key="cliente.idCliente">
          {{ cliente.nombre }} - {{ cliente.numero }}
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      // Sistema de pestañas
      activeTab: 'crear',
      tabs: [
        { id: 'crear', name: 'Crear Cliente' },
        { id: 'buscar', name: 'Buscar Cliente' },
        { id: 'actualizar', name: 'Actualizar Cliente' },
        { id: 'eliminar', name: 'Eliminar Cliente' },
        { id: 'listar', name: 'Listar Clientes' }
      ],
      // Datos para operaciones
      nuevoCliente: {
        nombre: '',
        numero: ''
      },
      nombreBusqueda: '',
      clienteEncontrado: null,
      clienteParaActualizar: {
        idCliente: '',
        nombre: '',
        numero: ''
      },
      clienteParaEliminar: {
        idCliente: '',
        motivo: ''
      },
      clientes: []
    };
  },
  methods: {
    async crearCliente() {
      try {
        const response = await axios.post('http://localhost:3001/api/clientes/crear', this.nuevoCliente);
        alert(response.data.message);
        this.nuevoCliente.nombre = '';
        this.nuevoCliente.numero = '';
      } catch (error) {
        alert(error.response.data.error);
      }
    },
    async buscarCliente() {
      try {
        const response = await axios.get('http://localhost:3001/api/clientes/uno', {
          params: { nombre: this.nombreBusqueda }
        });
        this.clienteEncontrado = response.data;
      } catch (error) {
        alert(error.response.data.error);
        this.clienteEncontrado = null;
      }
    },
    async actualizarCliente() {
      try {
        // Verificar que se proporcione un ID de cliente y el nuevo número


        if (!this.clienteParaActualizar.numero) {
          alert('Debe proporcionar el nuevo número de teléfono.');
          return;
        }

        // Crear el objeto con los datos a actualizar: solo idCliente y numero
        const clienteAActualizar = {
          idCliente: this.clienteParaActualizar.idCliente,
          nombre: this.clienteParaActualizar.nombre,
          numero: this.clienteParaActualizar.numero
        };

        // Realizar la solicitud de actualización
        const response = await axios.put('http://localhost:3001/api/clientes/modificar', clienteAActualizar);
        
        // Mostrar el mensaje de éxito
        alert(response.data.mensaje);
        
        // Limpiar el formulario de actualización
        this.clienteParaActualizar = { idCliente: '', nombre: '', numero: '' };
      } catch (error) {
        // Manejar posibles errores de la respuesta del servidor
        if (error.response) {
          alert(error.response.data.mensaje || error.response.data.error);
        } else {
          alert('Error al actualizar el cliente.');
        }
      }
    },
    async eliminarCliente() {
      try {
        const response = await axios.delete('http://localhost:3001/api/clientes/eliminar', {
          data: this.clienteParaEliminar
        });
        alert(response.data.mensaje);
        this.clienteParaEliminar = { idCliente: '', motivo: '' };
      } catch (error) {
        alert(error.response.data.error);
      }
    },
    async obtenerTodosClientes() {
      try {
        const response = await axios.get('http://localhost:3001/api/clientes/todos');
        this.clientes = response.data;
      } catch (error) {
        alert(error.response.data.error);
      }
    }
  },
  mounted() {
    // Cargar la lista de clientes al iniciar el componente
    this.obtenerTodosClientes();
  }
};
</script>

<style scoped>
.contenedor {
  max-width: 900px;
  margin: auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px;
}

.titulo {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  color: #1a237e;
}

/* Estilos para la navegación de pestañas */
.tab-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 30px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 10px;
  flex-wrap: wrap;
}

.tab-buttons button {
  padding: 12px 20px;
  background-color: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 8px 8px 0 0;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-buttons button.active {
  background-color: #1a237e;
  color: white;
}

.tab-buttons button:hover:not(.active) {
  background-color: #e0e0e0;
}

.seccion {
  background-color: #f9f9f9;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

input {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus {
  border-color: #1a237e;
  outline: none;
  box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.2);
}

.boton-principal {
  width: 100%;
  padding: 12px;
  background-color: #1a237e;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.boton-principal:hover {
  background-color: #3f51b5;
}

.boton-secundario {
  padding: 8px 16px;
  background-color: #e0e0e0;
  color: #333;
  border: none;
  border-radius: 4px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.boton-secundario:hover {
  background-color: #bdbdbd;
}

.resultado {
  margin-top: 15px;
  background-color: #e8eaf6;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #1a237e;
}

.lista-clientes {
  list-style-type: none;
  padding: 0;
}

.lista-clientes li {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.lista-clientes li:last-child {
  border-bottom: none;
}
</style>
