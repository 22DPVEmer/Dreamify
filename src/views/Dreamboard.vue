<template>
  <div class="container" style="margin-top: 200px; color: white">
    <h1 class="my-4 me-5 text-white">Dreamboard</h1>
    <div v-if="loading">Loading...</div>
    <div
      v-else
      v-for="dream in sharedDreams"
      :key="dream.Id"
      class="card text-white bg-dark mb-3"
      style="color: white; background-color: black"
    >
      <div class="card-body">
        <h2 class="card-title text-white">{{ dream.title }}</h2>
        <p class="card-text text-white">{{ dream.description }}</p>
        <p class="card-text text-white">
          {{ new Date(dream.Date).toLocaleDateString() }}
        </p>
        <div>
          <div class="d-flex align-items-center">
            <button class="btn" @click="increaseLikes(dream)">
              <font-awesome-icon
                :icon="['fas', 'thumbs-up']"
                style="color: white"
              />
            </button>
            <div class="text-white">
              {{ dream.Likes === null ? 0 : dream.Likes }}
            </div>

            <button class="btn" @click="decreaseLikes(dream)">
              <font-awesome-icon
                :icon="['fas', 'thumbs-down']"
                style="color: white"
              />
            </button>
            <button class="btn">
              <font-awesome-icon
                :icon="['fas', 'comment']"
                style="color: white"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Import jwtDecode directly

const sharedDreams = ref([]);
const loading = ref(true);
//for the token so that the user can like the dream
const token = localStorage.getItem("token");
const decodedToken = jwtDecode(token); // decode without verification
const userId = decodedToken.userId;
onMounted(async () => {
  try {
    const response = await axios.get("http://localhost:8081/api/shared-dreams");
    if (response.data && Array.isArray(response.data)) {
      sharedDreams.value = response.data;
      console.log("Shared dreams:", sharedDreams.value);
    } else {
      console.error("Unexpected response data:", response.data);
    }
  } catch (error) {
    console.error("Error fetching shared dreams:", error);
  } finally {
    loading.value = false;
  }
});

const increaseLikes = async (dream) => {
  // Increase the likes count in the local data

  // Call your API to increase the likes count for this dream
  await updateLikes(dream);
  dream.Likes++;
};

const decreaseLikes = async (dream) => {
  // Decrease the likes count in the local data, but not below zero
  if (dream.Likes > 0) {
    dream.Likes--;

    // Call your API to decrease the likes count for this dream
    await updateLikes(dream);
  }
};

const updateLikes = async (dream) => {
  // Call your API to update the likes count for this dream
  // You'll need to replace this with your actual API call
  try {
    axios.interceptors.request.use(function (config) {
      const token = localStorage.getItem("token");
      config.headers.Authorization = token ? `Bearer ${token}` : "";
      return config;
    });
    await axios.post(
      `http://localhost:8081/api/shared-dreams/${dream.Id}/${userId}/like`
    );
  } catch (error) {
    console.error("Error updating likes:", error);
  }
};
</script>

<style scoped></style>
