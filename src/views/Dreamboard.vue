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
        <p class="card-text text-white">{{ dream.Date }}</p>
        <div>
          <button>
            <font-awesome-icon :icon="['fas', 'thumbs-up']" />
          </button>
          <button>
            <font-awesome-icon :icon="['fas', 'thumbs-down']" />
          </button>
          <button>
            <font-awesome-icon :icon="['fas', 'comment']" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const sharedDreams = ref([]);
const loading = ref(true);

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
</script>

<style scoped></style>
