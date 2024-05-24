<script setup>
import { RouterLink, RouterView } from "vue-router";

import info from "./components/info.vue";
import Navbar from "./components/Navbar.vue";
import LoginView from "./views/LoginView.vue";
import HomeView from "./views/HomeView.vue";
</script>

<template>
  <Navbar />

  <RouterView />
</template>

<style scoped></style>
