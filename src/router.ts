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
          path: "/management/teacher_management",
          name: "teacher_management",
          component: () =>
            import("./views/management/teacher_management/status.vue")
        },
        {
          path: "/management/course_management",
          name: "course_management",
          component: () =>
            import("./views/management/course_management/status.vue")
        },
        {
          path: "/management/class_status_management",
          name: "class_status_management",
          component: () =>
            import("./views/management/class_status_management/status.vue")
        },
        {
          path: "/scores_input/stage",
          name: "scores_input_stage",
          component: () => import("./views/scores_input/stage/status.vue")
        },
        {
          path: "/scores_input/final",
          name: "scores_input_final",
          component: () => import("./views/scores_input/final/status.vue")
        },
        {
          path: "/show_scores",
          name: "show_scores",
          component: () => import("./views/show_sources/final.vue")
        },
        {
          path: "/show_all_scores",
          name: "show_all_scores",
          component: () => import("./views/show_all_sources/status.vue")
        },
        {
          path: "/out_scores",
          name: "out_scores",
          component: () => import("./views/out_scores/status.vue")
        },
        {
          path: "/welcome",
          name: "welcome",
          component: () => import("./views/welcome/welcome.vue")
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
      path: "/show_scores_mobile",
      name: "show_scores_mobile",
      component: () => import("./views/show_sources/final_mobile.vue")
    },
    {
      path: "*",
      redirect: "/welcome"
    }
  ]
});
