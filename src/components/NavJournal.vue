<template>
  <div class="container">
    <div class="navbar fixed-bottom w-100">
      <RouterLink to="/dreams">
        <div class="">
          <font-awesome-icon
            :icon="['fas', 'book-journal-whills']"
            class="fa-3x text-dark"
          /></div
      ></RouterLink>

      <div class="">
        <button
          type="button"
          class="btn btn-dark btn-lg rounded-pill"
          data-bs-toggle="modal"
          data-bs-target="#dreamEntryModal"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="fa-2x text-info" />
        </button>
      </div>
      <RouterLink to="/profile">
        <div class="profile">
          <font-awesome-icon
            icon="fa-solid fa-user "
            class="fa-3x text-dark"
          /></div
      ></RouterLink>
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
