<template>
  <div class="container mt-5" style="padding-top: 100px">
    <div v-if="dream">
      <div class="card mb-3">
        <div class="card-body">
          <h5 class="card-title">
            <span v-if="editing">
              <input type="text" v-model="editedTitle" class="form-control" />
            </span>
            <span v-else>{{ dream.title }}</span>
            <button class="btn btn-sm btn-primary ms-2" @click="toggleEdit">
              {{ editing ? "Save" : "Edit" }}
            </button>
            <button class="btn btn-sm btn-info ms-2" @click="shareDream">
              Share
            </button>
          </h5>
          <p class="card-text">
            <span v-if="editing">
              <textarea
                v-model="editedDescription"
                class="form-control"
              ></textarea>
            </span>
            <span v-else>{{ dream.description }}</span>
          </p>
          <p class="card-text">
            <small class="text-muted">{{ formattedDate(dream.date) }}</small>
          </p>
          <button class="btn btn-sm btn-danger" @click="deleteDream">
            Delete
          </button>
        </div>
      </div>
    </div>
    <div v-else>
      <p>No dream selected.</p>
    </div>
  </div>
</template>

<script setup>
//New File, doesnt work
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import store from "../store/store.js";

import { jwtDecode } from "jwt-decode"; // Import jwtDecode directly

const route = useRoute();
const router = useRouter();

const dreamId = store.state.selectedDreamId; // shis fakin works
//const dreamId = route.params.id;
console.log("The dream id is:", dreamId);
const dream = ref(null);
const editing = ref(false);
let editedTitle = ref("");
let editedDescription = ref("");

//post request for sharing dream

const shareDream = async () => {
  console.log("Sharing dream with id:", dreamId);
  try {
    const response = await axios.post(
      `http://localhost:8081/api/dreams/${dreamId}/share`
    );

    if (response.data.message === "Dream shared successfully") {
      // Handle successful share (e.g., show a success message)
      alert("Dream shared successfully!");
    } else {
      // Handle unsuccessful share (e.g., show an error message)
      alert("Failed to share dream.");
    }
  } catch (error) {
    // Handle error (e.g., show an error message)
    alert("An error occurred while sharing the dream.");
  }
};

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

const toggleEdit = () => {
  if (editing.value) {
    saveChanges();
  } else {
    editing.value = true;
  }
};

const saveChanges = async () => {
  const requestBody = {
    title: editedTitle.value, // Access the actual value of the 'title' reactive property
    description: editedDescription.value, // Access the actual value of the 'description' reactive property
  };

  try {
    await axios.put(`http://localhost:8081/api/dreams/${dreamId}`, requestBody);

    editing.value = false;
  } catch (error) {
    console.error(error);
  }
};

const deleteDream = async () => {
  try {
    await axios.delete(`http://localhost:8081/api/dreams/${dreamId}`);
    // Navigate to dream list or perform any other action after successful deletion
    router.push({ name: "profile" });
  } catch (error) {
    console.error(error);
  }
};

const formattedDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
};
</script>

<style scoped>
.card {
  border: 1px solid rgba(0, 0, 0, 0.125);
}
</style>
