<template>
  <div class="oopsie-page">
    <h1>Oopsie! Wrong Page</h1>
    <p>The page you are looking for does not exist.</p>
    <RouterLink to="/">
      <button class="btn btn-primary">Return to Home</button>
    </RouterLink>
  </div>
</template>

<script setup>
import { RouterLink } from "vue-router";
</script>

<style scoped>
.oopsie-page {
  text-align: center;
  margin-top: 50px;
}
</style>
