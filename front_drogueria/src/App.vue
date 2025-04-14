<template>
  <div id="app">
    <nav v-if="isAuthenticated" class="navbar">
      <ul>
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
        <button @click="verAlertas">
          <i class="fas fa-bell" style="color: yellow;"></i> Alertas
        </button>
        <div class="dropdown">
          <button class="user-btn" @click="toggleDropdown">
            <i class="fas fa-user" style="color: purple;"></i> {{ nombreUsuario }}
          </button>
          <div v-if="showDropdown" class="dropdown-menu">
            <button @click="logout">Log Out</button>
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
      nombreUsuario: this.nombreUsuario,
      showDropdown: false,
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
          this.isAuthenticated = true;
          this.nombreUsuario = payload.id ;
          this.userRole = payload.rol;
        } catch (error) {
          console.error("Token inválido:", error);
        }
      }
    },
    logout() {
      localStorage.removeItem("token");
      this.isAuthenticated = false;
      alert("Sesión cerrada");
      this.$router.replace('/');
    }
  },
  created() {
    this.checkAuthStatus();
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
    this.$watch(() => this.$route.path, () => {
      this.checkAuthStatus();
    });
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  }
};
</script>


<style>
.navbar {
    background-color: #1E2A78;
    padding: 30px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.navbar ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
}

.navbar ul li {
    margin-right: 20px;
}

.navbar ul li a {
    color: white;
    text-decoration: none;
    font-size: 16px;
}

.navbar ul li a:hover {
    text-decoration: underline;
}

.usuario {
    display: flex;
    align-items: center;
    gap: 15px;
    position: relative;
}

.usuario button {
    background: none;
    border: none;
    color: white;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
}

.usuario button:hover {
    text-decoration: underline;
}

.usuario button i {
    font-size: 18px;
}

.dropdown {
    position: relative;
}

.dropdown-menu {
    position: absolute;
    top: 30px;
    right: -20px;
    background: #3a4bb6;
    display: flex;
    flex-direction: column;
    box-shadow: 0px 0px 0px rgba(0, 0, 0, 0.2);
    width: 105px;
    z-index: 100;
}

.dropdown-menu button {
    background: none;
    border: none;
    color: white;
    padding: 5px 22px;
    width: 1px 0px;
    text-align: right;
    cursor: pointer;
}

.dropdown-menu button:hover {
    background: #555;
}
</style>
