<template>
  <div class="contenedor">
    <h1 class="titulo">Gestión de Vendedores</h1>

    <!-- Navegación de pestañas -->
    <div class="tab-buttons">
      <button 
        v-for="(tab, index) in filteredTabs" 
        :key="index" 
        @click="activeTab = tab.id"
        :class="{ active: activeTab === tab.id }"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- Pestaña: Crear Vendedor -->
    <section class="seccion" v-show="activeTab === 'crear'">
      <h2>Crear Vendedor</h2>
      <form @submit.prevent="crearVendedor">
        <input v-model="vendedor.nombreUsuario" placeholder="Nombre de usuario" class="input-field" required>
        <input v-model="vendedor.contrasena" type="password" placeholder="Contraseña" class="input-field" required>
        <button type="submit" class="boton-principal">Guardar Vendedor</button>
      </form>
    </section>

    <!-- Pestaña: Ver Vendedores -->
    <section class="seccion" v-show="activeTab === 'reporte'">
      <h2>Vendedores</h2>
      <button @click="obtenerVendedores" class="boton-secundario">Cargar Vendedores</button>
      <div class="tabla-container">
        <table class="tabla-clientes">
          <thead>
            <tr>
              <th>Nombre de Usuario</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in vendedores" :key="v.nombreUsuario">
              <td>{{ v.nombreUsuario }}</td>
            </tr>
            <tr v-if="vendedores.length === 0">
              <td colspan="1" class="sin-datos">No hay Vendedores para mostrar.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Pestaña: Eliminar Vendedor -->
    <section class="seccion" v-show="activeTab === 'eliminar'">
      <h2>Eliminar Vendedor</h2>
      <form @submit.prevent="eliminarVendedor">
        <input v-model="nombreUsuario" placeholder="Nombre de usuario" class="input-field" required>
        <button type="submit" class="boton-principal">Eliminar</button>
      </form>
    </section>

    <!-- Pestaña: Cambiar Contraseña -->
    <section class="seccion" v-show="activeTab === 'contrasenas'">
      <h2>Cambiar Contraseña</h2>
      <form @submit.prevent="cambiarContrasenaVendedor">
        <input v-model="cambioContrasena.nombreUsuario" placeholder="Nombre de usuario" class="input-field" required>
        <input v-model="cambioContrasena.contrasena" type="password" placeholder="Nueva contraseña" class="input-field" required>
        <button type="submit" class="boton-principal">Cambiar Contraseña</button>
      </form>
    </section>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      activeTab: 'crear',
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
      tabs: [
        { id: 'crear', name: 'Crear Vendedor' },
        { id: 'reporte', name: 'Ver Vendedores' },
        { id: 'eliminar', name: 'Eliminar Vendedor' },
        { id: 'contrasenas', name: 'Cambiar Contraseñas' }
      ]
    };
  },
  computed: {
    // Filtra las pestañas según el rol del usuario
    filteredTabs() {
      // Si el usuario es vendedor, excluir todas las pestañas
      if (this.usuarioActual.rol === "VENDEDOR") {
        return [];
      }
      // Para administradores, mostrar todas las pestañas
      return this.tabs;
    }
  },
  created() {
    // Obtener información del usuario actual al cargar el componente
    this.obtenerUsuarioActual();
  },
  watch: {
    // Observer cambios en las pestañas filtradas y ajuste la pestaña activa si es necesario
    filteredTabs: {
      handler(newTabs) {
        // Si la pestaña activa ya no está disponible, cambiar a la primera pestaña disponible
        if (this.activeTab && !newTabs.find(tab => tab.id === this.activeTab)) {
          this.activeTab = newTabs[0]?.id || 'crear';
        }
      },
      deep: true
    },
    // Observar cambios en activeTab para limpiar los formularios
    activeTab(newTab, oldTab) {
      // Solo limpiar si realmente cambiamos de pestaña
      if (newTab !== oldTab) {
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
@import '../assets/global-styles.css';

.titulo {
  font-size: 2rem;
  color: #1a237e;
  margin-bottom: 20px;
}

.contenedor {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 900px;
  margin: auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px;
}

/* Ajustes específicos para InventarioView */
.input-field {
  display: block;
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.input-field:focus {
  border-color: #1a237e;
  outline: none;
  box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.2);
}

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
  width: 100%;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
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

.inventory-table tbody tr:hover {
  background-color: #e2e2ff;
  transition: background-color 0.2s ease-in-out;
}

.reporte-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 14px;
  color: #374151;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.reporte-table th,
.reporte-table td {
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  text-align: left;
}

.reporte-table thead {
  background-color: #4f46e5;
  color: white;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 1;
}

.reporte-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

.reporte-table tbody tr:hover {
  background-color: #f1f5f9;
  transition: background-color 0.3s ease;
}

.reporte-table td.text-center {
  text-align: center;
}

/* Estilo para cuando no hay productos */
.reporte-table .no-data {
  text-align: center;
  padding: 20px;
  color: #6b7280;
  font-style: italic;
}
</style>