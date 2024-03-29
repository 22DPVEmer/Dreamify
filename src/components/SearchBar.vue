<template>
  <div>
    <button @click="toggleSearchBar" class="btn btn-primary">Search</button>
    <div v-if="showSearchBar" class="search-container">
      <div class="search-bar">
        <span class="search-prefix">Search</span>
        <input
          type="text"
          v-model="searchText"
          @keydown.enter="performSearch"
          placeholder="Type here..."
        />
        <i class="fas fa-magnifying-glass"></i>
      </div>
    </div>
    <div v-if="showResults" class="search-results">
      <!-- Your search results here -->
      <button @click="showResults = false" class="btn btn-secondary">
        Back
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const showSearchBar = ref(false);
const searchText = ref("");
const showResults = ref(false);

const toggleSearchBar = () => {
  showSearchBar.value = !showSearchBar.value;
};

const performSearch = () => {
  // Implement your search functionality here
  // For demonstration, let's just show the results
  showResults.value = true;
};
</script>

<style scoped>
.search-container {
  margin-top: 20px;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: #f2f2f2;
  padding: 10px;
  border-radius: 5px;
}

.search-bar input {
  flex: 1;
  border: none;
  outline: none;
  padding-left: 10px;
}

.search-bar i {
  margin-left: 10px;
}

.search-results {
  margin-top: 20px;
}
</style>
