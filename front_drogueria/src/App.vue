#poner icono en la pestaña
<link rel="icon" type="image/png" href="https://images.vexels.com/media/users/3/208407/isolated/preview/7ad2615dc81ce96bf6618e9a48ee5b3b-icono-de-bolsa-de-farmacia.png" />
<template>
  <div id="app">
    <nav v-if="isAuthenticated" class="navbar no-imprimir">
      <div class="nav-content">
        <div class="nav-brand">
          <h1 class="site-title">Drogueria Villa de los Alpes</h1>
        </div>
        <ul class="nav-links">
          <li><router-link to="/facturar">Venta</router-link></li>
          <li><router-link to="/inventario">Inventario</router-link></li>
          <li v-if="userRole !== 'vendedor'">
            <router-link to="/clientes">Clientes</router-link>
          </li>
          <li v-if="userRole !== 'vendedor'">
            <router-link to="/reportes">Reportes</router-link>
          </li>
          <li v-if="userRole !== 'vendedor'">
            <router-link to="/vendedores">Vendedores</router-link>
          </li>
        </ul>
        <div class="usuario">
          <div class="dropdown">
            <button class="user-btn" @click="toggleDropdown">
              <i class="fas fa-user" style="color: purple;"></i>
              <span>{{ nombreUsuario }}</span>
            </button>
            <div v-if="showDropdown" class="dropdown-menu">
              <button @click="logout">Log Out</button>
            </div>
          </div>
        </div>
      </div>
    </nav>
    <router-view/>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isAuthenticated: false,
      nombreUsuario: '',
      userRole: '',
      showDropdown: false,
      authInterval: null
    };
  },
  methods: {
    verAlertas() {
      alert("No hay alertas nuevas");
    },
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    handleClickOutside(event) {
      if (this.showDropdown && !this.$el.contains(event.target)) {
        this.showDropdown = false;
      }
    },
    checkAuthStatus() {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const currentTime = Math.floor(Date.now() / 1000); // tiempo actual en segundos

          if (payload.exp && payload.exp < currentTime) {
            // Token expirado
            alert("Tu sesión ha expirado. Inicia sesión nuevamente.");
            this.logout();
          } else {
            this.isAuthenticated = true;
            this.nombreUsuario = payload.id;
            this.userRole = payload.rol;
          }
        } catch (error) {
          console.error("Token inválido:", error);
          this.logout();
        }
      }
    },
    logout() {
      localStorage.removeItem("token");
      this.isAuthenticated = false;
      this.nombreUsuario = '';
      this.userRole = '';
      this.$router.replace('/');
    }
  },
  created() {
    this.checkAuthStatus();
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);

    // Verifica cada vez que cambia la ruta
    this.$watch(() => this.$route.path, () => {
      this.checkAuthStatus();
    });

    // Verificación automática cada minuto
    this.authInterval = setInterval(() => {
      this.checkAuthStatus();
    }, 60000); // cada 60 segundos
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
    clearInterval(this.authInterval);
  }
};
</script>

<style>
/* Estilos globales */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
  background-color: #f5f5f5;
}

/* Navbar mejorado */
.navbar {
  background-color: #1E2A78;
  padding: 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.nav-brand {
  display: flex;
  align-items: center;
}

.site-title {
  color: white;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin: 0;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
}

.nav-links {
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
}

.nav-links li {
  margin: 0 5px;
}

.nav-links li a {
  color: white;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  display: block;
  padding: 10px 15px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.nav-links li a:hover {
  background-color: rgba(255,255,255,0.1);
  text-decoration: none;
  transform: translateY(-2px);
}

.usuario {
  display: flex;
  align-items: center;
  gap: 15px;
}

.alert-btn, .user-btn {
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.alert-btn:hover, .user-btn:hover {
  background: rgba(255,255,255,0.2);
  text-decoration: none;
}

.usuario button i {
  font-size: 16px;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 5px;
  background: #3a4bb6;
  border-radius: 4px;
  min-width: 120px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  z-index: 100;
  overflow: hidden;
}

.dropdown-menu button {
  width: 100%;
  text-align: left;
  padding: 10px 15px;
  background: none;
  border: none;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-menu button:hover {
  background: #4a5bc6;
}

/* Efecto activo para los enlaces de navegación */
.router-link-active {
  background-color: rgba(255,255,255,0.2);
  font-weight: 600;
}

/* Estilos para impresión */
@media print {
  /* Ocultar el navbar */
  .navbar
  .no-imprimir {
    display: none !important;
  }

  /* Mostrar solo la sección de reportes */
  .imprimir {
    visibility: visible;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }
}


</style>