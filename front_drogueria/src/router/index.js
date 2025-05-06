import Vue from 'vue';
import VueRouter from 'vue-router';
import HomeView from '../views/HomeView.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/facturar',
    name: 'facturar',
    component: function () {
      return import(/* webpackChunkName: "about" */ '../views/Facturar.vue');
    },
    meta: { requiresAuth: true }, // Protegida
  },
  {
    path: '/inventario',
    name: 'inventario',
    component: function () {
      return import(/* webpackChunkName: "about" */ '../views/InventarioView.vue');
    },
    meta: { requiresAuth: true }, // Protegida
  },
  {
    path: '/clientes',
    name: 'clientes',
    component: function () {
      return import(/* webpackChunkName: "about" */ '../views/ClientesView.vue');
    },
    meta: { requiresAuth: true }, // Protegida
  },
  {
    path: '/reportes',
    name: 'reportes',
    component: function () {
      return import(/* webpackChunkName: "about" */ '../views/reportesView.vue');
    },
    meta: { requiresAuth: true }, // Protegida
  },
  {
    path: '/vendedores',
    name: 'vendedores',
    component: function () {
      return import(/* webpackChunkName: "about" */ '../views/manejo_vendedorView.vue');
    },
    meta: { requiresAuth: true }, // Protegida
  },
];

const router = new VueRouter({
  routes,
});

// Verificar autenticación antes de cada navegación
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token'); // Obtener el token del almacenamiento local
  if (to.meta.requiresAuth && !token) {
    alert('Debes iniciar sesión para acceder a esta página.');
    next('/'); // Redirigir al home si no está autenticado
  } else {
    next(); // Continuar con la navegación
  }
});

export default router;