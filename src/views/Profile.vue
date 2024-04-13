<template>
  <div class="container" style="margin-top: 70px">
    <h1 class="text-center text-white">Profile</h1>
    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    <div v-else>
      <div class="card mt-3">
        <div class="card-body">
          <h5 class="card-title">Name: {{ user.name }}</h5>
          <p class="card-text">Email: {{ user.email }}</p>
        </div>
      </div>
      <div v-if="dreams.length" class="mt-3">
        <h2 class="text-white">Dreams:</h2>
        <div
          v-for="dream in dreams"
          :key="dream.id"
          class="card mt-2"
          @click="selectDream(dream.id)"
        >
          <div class="card-body">
            <h5 class="card-title">
              {{ dream.title
              }}<router-link
                :to="{ name: 'dreams' }"
                @click.stop="selectDream(dream.id)"
              >
                <font-awesome-icon
                  :icon="['fas', 'pen-to-square']"
                  class="text-info ms-2"
                />
              </router-link>
              <router-link
                :to="{ name: 'dreamboard' }"
                @click.stop="selectDream(dream.id)"
              >
                <font-awesome-icon
                  :icon="['fas', 'share']"
                  class="text-info ml-5"
              /></router-link>
            </h5>
            <p class="card-text">{{ dream.description }}</p>
            <p class="card-text">
              <small class="text-muted">{{
                new Date(dream.date).toLocaleDateString()
              }}</small>
            </p>
          </div>
        </div>
      </div>
      <div class="mt-3">
        <h2 class="text-white">Statistics</h2>
        <p class="text-white">
          <strong class="text-white">Dream count:</strong> {{ dreams.length }}
        </p>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Import jwtDecode directly
import router from "@/router";
import store from "../store/store.js";
/* 




get back to this later

nav veel github so safe




*/
const user = ref(null);
const dreams = ref([]); // Create a ref to hold the dreams
const loading = ref(true); // Create a ref to hold the loading state

const selectDream = (id) => {
  store.commit("setSelectedDreamId", id);
  router.push({ name: "DreamView" });
};

onMounted(async () => {
  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token); // decode without verification
  const userId = decodedToken.userId;

  try {
    const response = await axios.get(
      `http://localhost:8081/api/users/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    user.value = response.data;

    // Fetch the dreams
    const dreamsResponse = await axios.get(
      `http://localhost:8081/api/users/${userId}/dreams`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    dreams.value = dreamsResponse.data; // Assign the dreams to the dreams ref
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false; // Set loading to false when done
  }
});
</script>

<style scoped>
.profile {
  background-color: #343a40; /* Bootstrap's dark background color */
  color: #fff; /* Bootstrap's dark text color */
}
</style>
