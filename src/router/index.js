import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '../views/Home.vue'
import Register from '../views/Register.vue'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import RestaurantView from '../views/RestaurantView.vue'
import Order from '../views/Order.vue'
import OrderView from '../views/OrderView.vue'
import SetAddress from '../views/SetAddress.vue'
import CreateOrder from '../views/CreateOrder.vue'
import DeleteOrder from '../views/DeleteOrder.vue'
import PaypalCreatePayment from '../views/PaypalCreatePayment.vue'
import PaypalReturnPayment from '../views/PaypalReturnPayment.vue'
import PaypalCancelPayment from '../views/PaypalCancelPayment.vue'

import { auth } from '../firebase-config'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/restaurant/:restaurant_id',
    name: 'RestaurantView',
    component: RestaurantView,
    props: true,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/orders',
    name: 'Order',
    component: Order,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/orders/:order_id',
    name: 'OrderView',
    component: OrderView,
    props: true,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/orders/:order_id/delete',
    name: 'OrderView',
    component: DeleteOrder,
    props: true,
  },
  {
    path: '/your-delivery-location',
    name: 'SetAddress',
    component: SetAddress,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/create-order",
    name: "CreateOrder",
    component: CreateOrder,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/payment/:order_id/paypal",
    name: "PaypalCreatePayment",
    component: PaypalCreatePayment,
  },
  /* {
    path: "/payment/:order_id/paypal/success",
    name: "PaypalCreatePayment",
    component: PaypalCreatePayment,
  }, */
  /* {
    path: "/payment/:order_id/paypal/create",
    name: "PaypalCreatePayment",
    component: PaypalCreatePayment,
  }, */
  {
    path: "/payment/paypal/return",
    name: "PaypalReturnPayment",
    component: PaypalReturnPayment
  },
  {
    path: "/payment/paypal/cancel",
    name: "PaypalReturnPayment",
    component: PaypalCancelPayment
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(x => x.meta.requiresAuth)

  if (requiresAuth && !auth.currentUser) {
    next('/login');
  }
  
  if (auth.currentUser && to.name == "Login") {
    next('/dashboard');
  }

  next()
  
})


export default router
