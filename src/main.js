import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { auth } from './firebase-config'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import VueSession from 'vue-session'
// import GoogleMapsApiLoader from 'google-maps-api-loader'

Vue.use(VueSession)

Vue.config.productionTip = false

let app
auth.onAuthStateChanged(() => {
  if (!app) {
    new Vue({
      router,
      store,
      render: h => h(App)
    }).$mount('#app')
  }
});
