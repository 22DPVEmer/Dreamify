<template>
  <div class="container">
    <div
      class="navbar fixed-bottom w-100 d-flex justify-content-center align-items-center"
    >
      <button
        type="button"
        class="btn btn-dark btn-lg rounded-pill"
        data-bs-toggle="modal"
        data-bs-target="#dreamEntryModal"
      >
        <font-awesome-icon :icon="['fas', 'plus']" class="fa-2x text-info" />
      </button>
    </div>
  </div>
  <DreamInfo />
</template>

<script setup>
import DreamInfo from "./DreamInfo.vue";
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
</script>

<style scoped>
.navbar {
  background: rgb(0, 212, 255);
  background: linear-gradient(
    90deg,
    rgba(0, 212, 255, 1) 0%,
    rgba(4, 0, 36, 1) 6%,
    rgba(121, 9, 73, 1) 49%,
    rgba(66, 101, 155, 1) 92%
  );
}
</style>
