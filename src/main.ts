import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./registerServiceWorker";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/antd.css";
import axios from "axios";
import Qs from "qs";
import "@babel/polyfill";

Vue.prototype.axios = axios;
Vue.prototype.qs = Qs;
axios.defaults.baseURL = "/api";
Vue.use(Antd);

Vue.config.productionTip = false;

router.beforeEach((to, from, next) => {
  //console.log(store.state.loginStatus);
  if (store.state.loginStatus) {
    next();
  } else {
    store.commit("isLogin", true);
    next("/login");

    let allowBack = true; //    给个默认值true
    if (to.meta.allowBack !== undefined) {
      allowBack = to.meta.allowBack;
    }
    if (!allowBack) {
      history.pushState(null, "", location.href);
    }
  }
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
