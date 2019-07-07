import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    loginStatus: false,
    name: "",
    studentId: "",
    permissions: 0,
    token: ""
  },
  mutations: {
    isLogin(state, status) {
      state.loginStatus = status;
    },
    setToken(state, token) {
      state.token = token;
    },
    setNameStudentId(state, data) {
      state.name = data.name;
      state.studentId = data.studentId;
      state.permissions = data.permissions;
    }
  },
  actions: {},
  plugins: [createPersistedState({ storage: window.localStorage })]
});
