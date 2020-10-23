import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loader: false
  },
  mutations: {
    showLoader (state) {
      state.loader = true;
    },
    hideLoader (state) {
      state.loader = false;
    }
  },
  actions: {
  },
  modules: {
  }
})
