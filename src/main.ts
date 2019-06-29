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
  console.log("欢迎报考东南大学成贤学院");
  console.log("电子与计算机工程学院欢迎您的到来");
  console.log(
    "若您想参与本项目，若您对网站开发有兴趣，亦或者您对后台开发或前端开发有兴趣，请前往成贤院211，谢修娟老师处报名"
  );
  console.log("制作人黄浩轩及其团队欢迎您的加入");
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
