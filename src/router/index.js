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
      path: "/dreams",
      name: "dreams",
      component: () => import("../views/DreamView.vue"),
    },
    {
      path: "/dreamboard",
      name: "dreamboard",
      component: () => import("../views/Dreamboard.vue"),
    },
    {
      path: "/forgot-password",
      name: "Forgot",
      component: () => import("../views/ForgotPassword.vue"),
    },
    {
      path: "/reset-password/:token",
      name: "Reset",
      component: () => import("../views/ResetPassword.vue"),
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("../views/Settings.vue"),
    },
  ],
});

export default router;
