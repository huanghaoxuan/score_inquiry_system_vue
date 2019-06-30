import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  //mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/sidebar",
      name: "sidebar",
      component: () => import("./components/Sidebar.vue"),
      children: [
        {
          path: "/management/student_management",
          name: "student_management",
          component: () =>
            import("./views/management/student_management/status.vue")
        },
        {
          path: "/management/classes_management",
          name: "classes_management",
          component: () => import("./views/management/classes_management.vue")
        }
      ]
    },
    {
      path: "/login",
      name: "login",
      component: () => import("./components/login/Login.vue"),
      meta: { allowBack: false }
    },
    {
      path: "*",
      redirect: "/sidebar"
    }
  ]
});
