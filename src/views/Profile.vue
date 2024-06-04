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
            class="form-control mx-auto text-white bg-dark border-info"
            placeholder="Search by title or tag..."
            v-model="searchQuery"
            style="width: 300px"
          />
        </div>
        <div class="filter-controls mb-4">
          <div class="text-center mb-2">
            <h5 class="text-white">Lucidity</h5>
            <div class="d-flex justify-content-center">
              <div class="form-check form-check-inline text-white">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="lucidCheckbox"
                  v-model="lucidFilter"
                />
                <label class="form-check-label" for="lucidCheckbox"
                  >Lucid</label
                >
              </div>
              <div class="form-check form-check-inline text-white">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="nonLucidCheckbox"
                  v-model="nonLucidFilter"
                />
                <label class="form-check-label" for="nonLucidCheckbox"
                  >Non-Lucid</label
                >
              </div>
            </div>
          </div>
          <div class="text-center mb-2">
            <h5 class="text-white">Categories</h5>
            <div class="d-flex justify-content-center flex-wrap">
              <div
                class="form-check form-check-inline text-white"
                v-for="category in categories"
                :key="category.id"
              >
                <input
                  class="form-check-input"
                  type="checkbox"
                  :id="'category-' + category.id"
                  :value="category.id"
                  v-model="categoryFilter"
                />
                <label
                  class="form-check-label"
                  :for="'category-' + category.id"
                  >{{ category.name }}</label
                >
              </div>
            </div>
          </div>
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
                  <span
                    class="text-primary"
                    v-for="(tag, index) in dream.tags"
                    :key="index"
                  >
                    #{{ tag }}
                  </span>
                </p>
                <p class="card-text">
                  <span>{{ getCategoryName(dream.category) }}</span>
                </p>
                <p class="card-text">
                  <span>{{ getDreamLucidity(dream.lucid) }}</span>
                </p>
                <p class="card-text">
                  <small class="text-muted">{{ formatDate(dream.date) }}</small>
                </p>
              </div>
            </div>
          </div>
          <div class="statistics bg-dark text-white p-3 ms-md-4 mt-4 mt-md-0">
            <h4>Dreaming Statistics</h4>
            <p><strong>Tracked Dreams:</strong> {{ dreams.length }}</p>
            <p><strong>Current dream streak:</strong> {{ currentStreak }}</p>
            <p><strong>Longest dream streak:</strong> {{ longestStreak }}</p>
            <p><strong>Dreams Each Week:</strong> 0</p>
            <p>
              <strong>Number of Lucid dreams:</strong> {{ lucidDreamCount }}
            </p>
            <p>
              <strong>Most popular category:</strong> {{ popularCategoryName }}
            </p>
            <p><strong>Is Your Dreamiest Day:</strong> {{ dreamiestDay }}</p>
            <p>
              <strong>Was Your Dreamiest Month:</strong>
              {{ dreamiestMonth }}
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
import store from "../store/store.js";

const user = ref(null);
const dreams = ref([]);
const currentStreak = ref(0);
const longestStreak = ref(0);
const lucidDreamCount = ref(0);
const popularCategory = ref("");
const dreamiestDay = ref("");
const dreamiestMonth = ref("");
const loading = ref(true);
const searchQuery = ref("");
const lucidFilter = ref(true);
const nonLucidFilter = ref(true);
const categoryFilter = ref([]);

const categories = ref([
  { id: 1, name: "Adventure & Exploration" },
  { id: 2, name: "Nightmares & Fears" },
  { id: 3, name: "Relationships & Family" },
  { id: 4, name: "Work & Career" },
  { id: 5, name: "Learning & Discovery" },
  { id: 6, name: "Fantasy & Mythology" },
  { id: 7, name: "Animals & Nature" },
  { id: 8, name: "Health & Healing" },
  { id: 9, name: "Mystical & Spiritual" },
  { id: 10, name: "Celebration & Joy" },
]);

const getCategoryName = (categoryId) => {
  const category = categories.value.find((cat) => cat.id === categoryId);
  return category ? category.name : "Unknown Category";
};

const getDreamLucidity = (lucid) => {
  return lucid === 1 ? "Lucid" : "Not lucid";
};

const selectDream = (id) => {
  store.commit("setSelectedDreamId", id);
};

const filteredDreams = computed(() => {
  return dreams.value.filter((dream) => {
    const matchesSearchQuery =
      dream.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      dream.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.value.toLowerCase())
      );

    const matchesLucidity =
      (lucidFilter.value && dream.lucid === 1) ||
      (nonLucidFilter.value && dream.lucid === 0);

    const matchesCategory =
      categoryFilter.value.length === 0 ||
      categoryFilter.value.includes(dream.category);

    return matchesSearchQuery && matchesLucidity && matchesCategory;
  });
});

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const popularCategoryName = computed(() => {
  const category = categories.value.find(
    (cat) => cat.id === popularCategory.value
  );
  return category ? category.name : "No Category";
});

onMounted(async () => {
  const token = localStorage.getItem("token");

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

    // Sort the dreams by date in descending order (most recent first)
    dreams.value = dreamsResponse.data.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    console.log("Dreams:", dreams.value);
    console.log("User:", user.value);

    // Fetch the streaks
    const streaksResponse = await axios.get(
      `http://localhost:8081/api/users/${userId}/streaks`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    currentStreak.value = streaksResponse.data.current_streak;
    longestStreak.value = streaksResponse.data.longest_streak;

    // Fetch the number of lucid dreams
    const lucidDreamsResponse = await axios.get(
      `http://localhost:8081/api/users/${userId}/lucid-dreams`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    lucidDreamCount.value = lucidDreamsResponse.data.lucidDreamCount;

    // Fetch the most popular category
    const popularCategoryResponse = await axios.get(
      `http://localhost:8081/api/users/${userId}/popular-category`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    popularCategory.value = popularCategoryResponse.data.popularCategory;

    // Fetch the dreamiest day
    const dreamiestDayResponse = await axios.get(
      `http://localhost:8081/api/users/${userId}/dreamiest-day`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    dreamiestDay.value = dreamiestDayResponse.data.dreamiestDay;

    // Fetch the dreamiest month
    const dreamiestMonthResponse = await axios.get(
      `http://localhost:8081/api/users/${userId}/dreamiest-month`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    dreamiestMonth.value = dreamiestMonthResponse.data.dreamiestMonth;
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
