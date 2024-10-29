import { createRouter, createWebHistory } from "vue-router";
import store from "../store/store"; // Import your Vuex store

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("../views/HomeView.vue"),
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
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: "profile",
    component: () => import("../views/Profile.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/dreams",
    name: "dreams",
    component: () => import("../views/DreamView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/dreamboard",
    name: "dreamboard",
    component: () => import("../views/Dreamboard.vue"),
    meta: { requiresAuth: true },
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
    meta: { requiresAuth: true },
  },
  {
    path: "/comment",
    name: "comment",
    component: () => import("../components/Comments.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/oopsie",
    name: "oopsie",
    component: () => import("../views/OopsieWrongPage.vue"),
  },
  {
    path: "/:catchAll(.*)",
    redirect: { name: "oopsie" },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!store.state.isLoggedIn) {
      next({ name: "login" });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
