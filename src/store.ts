import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    loginStatus: false,
    token: ""
  },
  mutations: {
    isLogin(state, status) {
      state.loginStatus = status;
    },
    setToken(state, token) {
      state.token = token;
    }
  },
  actions: {},
  plugins: [createPersistedState({ storage: window.sessionStorage })]
});
