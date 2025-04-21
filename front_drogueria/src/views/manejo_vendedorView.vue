<template>
    <div class="p-6 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-4">Gestión de Vendedores</h1>
  
      <!-- Botones de navegación -->
      <div class="button-container">
        <button 
          v-for="(option, key) in filteredOptions" 
          :key="key" 
          @click="activeOption = key"
          class="nav-button"
          :class="activeOption === key ? 'active' : ''"
        >
          {{ option.label }}
        </button>
      </div>
  
      <!-- Formulario para Crear Vendedor -->
      <div v-if="activeOption === 'crear'" class="bg-white p-4 shadow rounded">
        <h2 class="text-xl font-bold mb-4">Crear Vendedor</h2>
        <form @submit.prevent="crearVendedor">
          <input v-model="vendedor.nombreUsuario" placeholder="Nombre de usuario" class="input-field" required>
          <input v-model="vendedor.contrasena" type="password" placeholder="Contraseña" class="input-field" required>
          <button type="submit" class="btn-primary">Guardar Vendedor</button>
        </form>
      </div>
  
      <!-- Ver vendedores -->
      <div v-if="activeOption === 'reporte'" class="bg-white p-4 shadow rounded">
        <h2 class="text-xl font-bold mb-4">Vendedores</h2>
        <button @click="obtenerVendedores" class="btn-primary mb-4">Cargar Vendedores</button>
        <table class="inventory-table">
          <thead>
            <tr class="bg-gray-200">
              <th class="border px-4 py-2">Nombre de Usuario</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in vendedores" :key="v.nombreUsuario">
              <td class="border px-4 py-2">{{ v.nombreUsuario }}</td>
            </tr>
            <tr v-if="vendedores.length === 0">
              <td colspan="1" class="no-data">No hay Vendedores para mostrar.</td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Eliminar Vendedor -->
      <div v-if="activeOption === 'eliminar'" class="bg-white p-4 shadow rounded">
        <h2 class="text-xl font-bold mb-4">Eliminar Vendedor</h2>
        <form @submit.prevent="eliminarVendedor">
          <input v-model="nombreUsuario" placeholder="Nombre de usuario" class="input-field" required>
          <button type="submit" class="btn-danger">Eliminar</button>
        </form>
      </div>
  
      <!-- Cambio de Contraseña -->
      <div v-if="activeOption === 'contrasenas'" class="bg-white p-4 shadow rounded">
        <h2 class="text-xl font-bold mb-4">Cambiar Contraseña</h2>
        <form @submit.prevent="cambiarContrasenaVendedor">
          <input v-model="cambioContrasena.nombreUsuario" placeholder="Nombre de usuario" class="input-field" required>
          <input v-model="cambioContrasena.contrasena" type="password" placeholder="Nueva contraseña" class="input-field" required>
          <button type="submit" class="btn-primary">Cambiar Contraseña</button>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        activeOption: null,
        vendedor: {
          nombreUsuario: "",
          contrasena: "",
        },
        vendedores: [],
        nombreUsuario: "",
        cambioContrasena: {
          nombreUsuario: "",
          contrasena: ""
        },
        usuarioActual: {
          id: null,
          nombre: "",
          rol: ""
        },
        options: {
          crear: { label: "Crear Vendedor" },
          reporte: { label: "Ver Vendedores" },
          eliminar: { label: "Eliminar Vendedor" },
          contrasenas: { label: "Cambiar Contraseñas" }
        }
      };
    },
    computed: {
      // Filtra las opciones según el rol del usuario
      filteredOptions() {
        // Si el usuario es vendedor, excluir todas las opciones
        if (this.usuarioActual.rol === "VENDEDOR") {
          return {};
        }
        // Para administradores, mostrar todas las opciones
        return this.options;
      },
      // Establece la opción activa por defecto basada en las opciones disponibles
      defaultActiveOption() {
        return Object.keys(this.filteredOptions)[0] || null;
      }
    },
    created() {
      // Obtener información del usuario actual al cargar el componente
      this.obtenerUsuarioActual();
      
      // Establecer la opción activa por defecto después de obtener el usuario
      this.$nextTick(() => {
        if (!this.activeOption || !this.filteredOptions[this.activeOption]) {
          this.activeOption = this.defaultActiveOption;
        }
      });
    },
    watch: {
      // Observer cambios en las opciones filtradas y ajuste la opción activa si es necesario
      filteredOptions: {
        handler(newOptions) {
          // Si la opción activa ya no está disponible, cambiar a la primera opción disponible
          if (this.activeOption && !newOptions[this.activeOption]) {
            this.activeOption = this.defaultActiveOption;
          }
        },
        deep: true
      },
      // Observar cambios en activeOption para limpiar los formularios
      activeOption(newOption, oldOption) {
        // Solo limpiar si realmente cambiamos de opción
        if (newOption !== oldOption) {
          this.limpiarTodosLosFormularios();
        }
      }
    },
    methods: {
      // Método para limpiar todos los formularios
      limpiarTodosLosFormularios() {
        // Limpiar formulario de creación
        this.vendedor = {
          nombreUsuario: "",
          contrasena: ""
        };
        
        // Limpiar eliminación
        this.nombreUsuario = "";
        
        // Limpiar cambio de contraseña
        this.cambioContrasena = {
          nombreUsuario: "",
          contrasena: ""
        };
      },
      
      obtenerUsuarioActual() {
        try {
          const token = localStorage.getItem("token");
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split(".")[1]));
              this.usuarioActual = {
                id: payload.id || null,
                nombre: payload.nombre || payload.id || "Usuario",
                rol: payload.rol || ""
              };
            } catch (error) {
              console.error("Token inválido:", error);
              this.usuarioActual = { 
                id: null, 
                nombre: 'Error de Autenticación', 
                rol: '' 
              };
            }
          } else {
            // Si no hay token en localStorage
            console.warn("No se encontró token de autenticación");
            this.usuarioActual = { 
              id: null, 
              nombre: 'Usuario No Autenticado', 
              rol: '' 
            };
          }
        } catch (error) {
          console.error('Error al obtener el usuario actual:', error);
          this.usuarioActual = { 
            id: null, 
            nombre: 'Usuario Desconocido', 
            rol: '' 
          };
        }
      },
      
      async crearVendedor() {
        if (!this.vendedor.nombreUsuario || !this.vendedor.contrasena) {
          alert("Por favor complete todos los campos");
          return;
        }
        
        try {
          const response = await axios.post("http://localhost:3001/api/admin/crear-vendedor", this.vendedor);
          alert(response.data.mensaje || "Vendedor creado exitosamente");
          this.limpiarTodosLosFormularios();
          this.obtenerVendedores(); // Actualizar lista de vendedores si estamos en esa vista
        } catch (error) {
          console.error("Error al crear el vendedor:", error.response?.data || error.message);
          alert("Error: " + (error.response?.data?.error || error.message));
        }
      },
      
      async obtenerVendedores() {
        try {
          const response = await axios.get("http://localhost:3001/api/vendedores");
          this.vendedores = response.data;
        } catch (error) {
          console.error("Error al obtener vendedores:", error);
          alert("Error al obtener vendedores: " + error.message);
        }
      },
      
      async eliminarVendedor() {
        if (!this.nombreUsuario) {
          alert("Debe ingresar un nombre de usuario para eliminar");
          return;
        }
        
        if (confirm("¿Está seguro de eliminar este vendedor?")) {
          try {
            const response = await axios.delete("http://localhost:3001/api/admin/eliminar-vendedor", {
              data: { nombreUsuario: this.nombreUsuario }
            });
            
            alert(response.data.mensaje || "Vendedor eliminado exitosamente");
            this.nombreUsuario = "";
            this.obtenerVendedores(); // Actualizar lista si estamos en esa vista
          } catch (error) {
            console.error("Error al eliminar el vendedor:", error.response?.data || error.message);
            alert("Error: " + (error.response?.data?.mensaje || error.message));
          }
        }
      },
      
      async cambiarContrasenaVendedor() {
        if (!this.cambioContrasena.nombreUsuario || !this.cambioContrasena.contrasena) {
          alert("Por favor complete todos los campos");
          return;
        }
        
        try {
          const response = await axios.put("http://localhost:3001/api/admin/cambiar-contrasena-vendedor", this.cambioContrasena);
          alert(response.data.mensaje || "Contraseña actualizada exitosamente");
          this.cambioContrasena = { nombreUsuario: "", contrasena: "" };
        } catch (error) {
          console.error("Error al cambiar la contraseña:", error.response?.data || error.message);
          alert("Error: " + (error.response?.data?.mensaje || error.message));
        }
      }
    }
  };
  </script>
  
  <style>
  /* Campos de entrada */
  .input-field {
    display: block;
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  /* Contenedor de botones de navegación */
  .button-container {
    display: flex;
    width: 100%;
    margin-bottom: 1.5rem;
    gap: 0.5rem;
  }
  
  /* Botones de navegación */
  .nav-button {
    flex: 1;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    color: white;
    background-color: #1E2A78;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: background-color 0.2s ease-in-out;
    border: none;
    cursor: pointer;
  }
  
  .nav-button:hover {
    background-color: #2563eb;
  }
  
  .nav-button.active {
    background-color: #1d4ed8;
  }
  
  /* Tarjetas */
  .card {
    background-color: white;
    border-radius: 1rem;
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
    padding: 2rem;
    max-width: 400px;
    margin: 1rem auto;
  }
  
  /* Botón primario */
  .btn-primary {
    background-color: #202A96;
    color: white;
    font-weight: bold;
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 0.75rem;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
    width: 100%;
  }
  
  .btn-primary:hover {
    background-color: #1B237F;
  }
  
  /* Botón secundario */
  .btn-secondary {
    background-color: #6366f1;
    color: white;
    font-weight: bold;
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 0.75rem;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
    width: 100%;
  }
  
  .btn-secondary:hover {
    background-color: #4f46e5;
  }
  
  /* Botón de peligro */
  .btn-danger {
    background-color: #dc2626;
    color: white;
    font-weight: bold;
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 0.75rem;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
    width: 100%;
  }
  
  .btn-danger:hover {
    background-color: #b91c1c;
  }
  </style>
  
  <style scoped>
  .inventory-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border: 1px solid #ccc;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #fff;
  }
  
  .inventory-table thead {
    background-color: #f5f5f5;
  }
  
  .inventory-table th {
    text-align: left;
    padding: 12px 16px;
    font-weight: 600;
    font-size: 14px;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .inventory-table td {
    padding: 12px 16px;
    font-size: 14px;
    color: #333;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .inventory-table tbody tr:hover {
    background-color: #e2e2ff;
    transition: background-color 0.2s ease-in-out;
  }
  
  .no-data {
    text-align: center;
    padding: 20px;
    color: #6b7280;
    font-style: italic;
  }
  </style>