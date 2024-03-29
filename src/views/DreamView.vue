<template>
  <div class="container mt-4">
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
import { useRoute } from "vue-router";
import { jwtDecode } from "jwt-decode"; // Import jwtDecode directly
/*onMounted(async () => {
  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token); // decode without verification
  const userId = decodedToken.userId;
*/
const route = useRoute();
const dreamId = route.params.id;
console.log("The dream id is:", dreamId);
const dream = ref(null);
const editing = ref(false);
let editedTitle = ref("");
let editedDescription = ref("");

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
  try {
    await axios.put(`http://localhost:8081/api/dreams/${dreamId}`, {
      title: editedTitle,
      description: editedDescription,
    });
    dream.value.title = editedTitle;
    dream.value.description = editedDescription;
    editing.value = false;
  } catch (error) {
    console.error(error);
  }
};

const deleteDream = async () => {
  try {
    await axios.delete(`http://localhost:8081/api/dreams/${dreamId}`);
    // Navigate to dream list or perform any other action after successful deletion
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
