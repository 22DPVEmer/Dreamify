import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"), // Closing parenthesis added here
    },
    {
      path: "/signup",
      name: "signup",
      component: () => import("../views/SignupView.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: "/user",
      name: "user",
      component: () => import("../views/UserView.vue"),
    },

    {
      path: "/profile",
      name: "profile",
      component: () => import("../views/Profile.vue"),
    },
    {
      path: "/dreams/:id",
      name: "dreams",
      component: () => import("../views/DreamView.vue"),
    },
  ],
});

export default router;
