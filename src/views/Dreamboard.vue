<template>
  <div class="container">
    <h1 class="my-4">Dreamboard</h1>
    <div class="card" v-if="dream">
      <div class="card-body">
        <h2 class="card-title">{{ dream.title }}</h2>
        <p class="card-text">{{ dream.description }}</p>
        <button class="btn btn-primary" @click="toggleEdit">
          {{ editing ? "Save" : "Edit" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import store from "../store/store.js";

import { jwtDecode } from "jwt-decode"; // Import jwtDecode directly
/*onMounted(async () => {
  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token); // decode without verification
  const userId = decodedToken.userId;
*/

const route = useRoute();
const router = useRouter();

const dreamId = store.state.selectedDreamId; // shis fakin works
//const dreamId = route.params.id;
console.log("The dream id is:", dreamId);
const dream = ref(null);
const editing = ref(false);
let editedTitle = ref("");
let editedDescription = ref("");

//this works
onMounted(async () => {
  try {
    const response = await axios.get(
      `http://localhost:8081/api/dreams/${dreamId}`
    );
    dream.value = response.data;
    editedTitle.value = dream.value.title;
    editedDescription.value = dream.value.description;
  } catch (error) {
    console.error(error);
  }
});
</script>

<style scoped></style>
