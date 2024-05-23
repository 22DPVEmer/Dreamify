<script setup>
import Calendar from "../components/Calendar.vue";
import SearchBar from "../components/SearchBar.vue";
import NavJournal from "../components/NavJournal.vue";
</script>

<template>
  <div class="User">
    <Calendar />
    <NavJournal />
  </div>
</template>

<style scoped>
.User {
  height: 100vh;
  margin-top: 90px;
  color: white;
}

.icon {
  color: #00ccff;
  filter: drop-shadow(0 0 10px #00ccff);

  cursor: pointer;
}
</style>
