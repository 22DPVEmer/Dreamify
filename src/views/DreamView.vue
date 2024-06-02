<template>
  <div class="container mt-5" style="padding-top: 100px">
    <div v-if="dream">
      <div class="card mb-3 bg-dark text-white">
        <div class="card-body">
          <h1 class="card-title text-center">
            <span v-if="editing">
              <input
                type="text"
                v-model="editedTitle"
                class="form-control bg-dark text-white"
              />
            </span>
            <span v-else>{{ dream.title }}</span>
          </h1>
          <div class="text-center mb-3">
            <button
              type="button"
              data-bs-toggle="modal"
              data-bs-target="#dreamEntryModal"
              class="btn neon-btn"
            >
              Edit
            </button>

            <button class="btn neon-btn ms-2" @click="deleteDream">
              Delete
            </button>
            <button class="btn neon-btn ms-2" @click="shareDream">Share</button>
          </div>
          <p class="card-text text-center">
            <small class="text-muted"
              >{{ formattedDate(dream.date) }} -
              {{ dream.private ? "private" : "public" }}</small
            >
          </p>
          <p class="card-text mt-3">
            <span v-if="editing">
              <textarea
                v-model="editedDescription"
                class="form-control bg-dark text-white"
              ></textarea>
            </span>
            <span v-else>{{ dream.description }}</span>
          </p>
          <p class="card-text mt-3">
            <span class="role-label">ROLE</span>
            <span>{{ dream.role }}</span>
          </p>
        </div>
      </div>
    </div>
    <div v-else>
      <p>No dream selected.</p>
    </div>
    <DreamInfo @dream-updated="handleDreamUpdated" />
  </div>
</template>
<script setup>
import DreamInfo from "../components/DreamInfosave.vue";
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import store from "../store/store.js";

const route = useRoute();
const router = useRouter();

const dreamId = store.state.selectedDreamId;
console.log("The dream id is:", dreamId);
const dream = ref(null);
const editing = ref(false);
const editedTitle = ref("");
const editedDescription = ref("");

const token = localStorage.getItem("token");

const shareDream = async () => {
  console.log("Sharing dream with id:", dreamId);
  try {
    const response = await axios.post(
      `http://localhost:8081/api/dreams/${dreamId}/share`
    );
    if (response.data.message === "Dream shared successfully") {
      alert("Dream shared successfully!");
    } else {
      alert("Failed to share dream.");
    }
  } catch (error) {
    alert("An error occurred while sharing the dream.");
  }
};

onMounted(async () => {
  try {
    const response = await axios.get(
      `http://localhost:8081/api/dreams/${dreamId}`
    );
    console.log("Dream response:", response.data);
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

const handleDreamUpdated = (updatedDream) => {
  dream.value = { ...dream.value, ...updatedDream };
};

const deleteDream = async () => {
  try {
    await axios.delete(`http://localhost:8081/api/dreams/${dreamId}/delete`, {
      headers: { Authorization: `Bearer ${token}` },
    });
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
  border: 1px solid rgba(255, 255, 255, 0.125);
  background-color: #1e1e1e;
}

.text-white {
  color: #ffffff !important;
}

.neon-btn {
  border: 2px solid #00ccff;
  color: #00ccff;
  background: none;
  transition: background-color 0.3s, color 0.3s;
}

.neon-btn:hover {
  background-color: #00ccff;
  color: #000000;
}

.card-title {
  font-size: 2.5rem;
  font-weight: bold;
}

.role-label {
  font-weight: bold;
  margin-right: 10px;
}

textarea.form-control,
input.form-control {
  color: #ffffff;
  background-color: #1e1e1e;
  border: 1px solid #00ccff;
}

textarea.form-control:focus,
input.form-control:focus {
  box-shadow: 0 0 10px #00ccff;
  border-color: #00ccff;
}

.text-muted {
  color: #6c757d !important;
}

.container {
  margin-top: 50px;
  color: white;
}
</style>
add tags, categories, lucid, regular etc to show instantly have share, become
hide if already in dreamboard
