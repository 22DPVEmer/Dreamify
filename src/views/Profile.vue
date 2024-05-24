<template>
  <div class="container" style="margin-top: 100px">
    <h1 class="text-center text-white mt-5">Your dream journal</h1>
    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    <div v-else>
      <div v-if="dreams.length" class="mt-3">
        <div class="text-center mb-4">
          <input
            type="text"
            class="form-control mx-auto"
            placeholder="Search by name..."
            v-model="searchQuery"
            style="width: 200px"
          />
        </div>
        <div class="d-flex flex-column flex-md-row">
          <div class="flex-grow-1">
            <div
              v-for="dream in filteredDreams"
              :key="dream.id"
              class="card mt-2 dream-card text-white bg-dark"
              @click="selectDream(dream.id)"
            >
              <div class="card-body">
                <h5
                  class="card-title d-flex justify-content-between align-items-center"
                >
                  <div>
                    <span class="me-2">{{ formatDate(dream.date) }}</span>
                    <strong>{{ dream.title }}</strong>
                  </div>
                  <div>
                    <router-link
                      to="/dreams"
                      @click.stop="selectDream(dream.id)"
                    >
                      <font-awesome-icon
                        :icon="['fas', 'pen-to-square']"
                        class="text-info ms-2"
                      />
                    </router-link>
                    <router-link to="/dreamboard">
                      <font-awesome-icon
                        :icon="['fas', 'share']"
                        class="text-info ms-2"
                      />
                    </router-link>
                  </div>
                </h5>
                <p class="card-text">{{ dream.description }}</p>
                <p class="card-text">
                  <small class="text-muted">{{ formatDate(dream.date) }}</small>
                </p>
              </div>
            </div>
          </div>
          <div class="statistics bg-dark text-white p-3 ms-md-4 mt-4 mt-md-0">
            <h4>Dreaming Statistics</h4>
            <p><strong>Tracked Dreams:</strong> {{ dreams.length }}</p>
            <p><strong>Current dream streak:</strong> 0</p>
            <p><strong>Dreams Each Week:</strong> 0</p>
            <p><strong>Is Your Dreamiest Day:</strong> Sunday</p>
            <p>
              <strong>Was Your Dreamiest Month:</strong>
              {{ formatMonth(new Date()) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import router from "@/router";
import store from "../store/store.js";

const user = ref(null);
const dreams = ref([]);
const loading = ref(true);
const searchQuery = ref("");

const selectDream = (id) => {
  store.commit("setSelectedDreamId", id);
};

const filteredDreams = computed(() => {
  if (!searchQuery.value) {
    return dreams.value;
  }
  return dreams.value.filter((dream) =>
    dream.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatMonth = (date) => {
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
};

onMounted(async () => {
  const token = localStorage.getItem("token");
  console.log("Token:", token);

  const decodedToken = jwtDecode(token);
  const userId = decodedToken.userId;

  try {
    const response = await axios.get(
      `http://localhost:8081/api/users/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    user.value = response.data;

    const dreamsResponse = await axios.get(
      `http://localhost:8081/api/users/${userId}/dreams`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    dreams.value = dreamsResponse.data;
    console.log("Dreams:", dreams.value);
    console.log("User:", user.value);
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.profile {
  background-color: #343a40;
  color: #fff;
}
.dream-card {
  background-color: #2c2f33;
}
.statistics {
  min-width: 200px;
}
</style>
