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
              @click="toggleEdit"
            >
              Edit
            </button>

            <button class="btn neon-btn ms-2" @click="deleteDream">
              Delete
            </button>
            <button
              v-if="!isShared"
              class="btn neon-btn ms-2"
              @click="shareDream"
            >
              Share
            </button>
            <button
              v-if="isShared"
              class="btn neon-btn ms-2"
              @click="unshareDream"
            >
              Unshare
            </button>
          </div>
          <p class="card-text text-center">
            <small class="text-muted"
              >{{ formattedDate(dream.date) }} -
              {{ isShared ? "public" : "private" }}</small
            >
          </p>
          <div class="separator"></div>
          <p class="card-text mt-3">
            <span v-if="editing">
              <textarea
                v-model="editedDescription"
                class="form-control bg-dark text-white"
              ></textarea>
            </span>
            <span v-else>{{ dream.description }}</span>
          </p>
          <div class="separator"></div>
          <p class="card-text mt-3">
            <span class="role-label">Tags: </span>
            <span>{{ dream.tags.join(", ") }}</span>
          </p>
          <div class="separator"></div>
          <p class="card-text mt-3">
            <span class="role-label">Category: </span>
            <span>{{ getCategoryName(dream.category) }}</span>
          </p>
          <div class="separator"></div>
          <p class="card-text mt-3">
            <span class="role-label">Lucidity: </span>
            <span
              :class="{
                'lucid-box': dream.lucid === 1,
                'regular-box': dream.lucid === 0,
              }"
            >
              {{ dream.lucid === 1 ? "Lucid" : "Regular" }}
            </span>
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
const dream = ref(null);
const isShared = ref(false); // Separate state for shared status
const editing = ref(false);
const editedTitle = ref("");
const editedDescription = ref("");

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

const token = localStorage.getItem("token");

const checkIfShared = async () => {
  try {
    const response = await axios.get(
      `http://localhost:8081/api/shared-dreams/${dreamId}/dream-status`
    );
    isShared.value = response.status === 200;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      isShared.value = false;
    } else {
      console.error("Error fetching shared status:", error);
    }
  }
};

const shareDream = async () => {
  try {
    const response = await axios.post(
      `http://localhost:8081/api/dreams/${dreamId}/share`
    );
    if (response.data.message === "Dream shared successfully") {
      alert("Dream shared successfully!");
      isShared.value = true;
    } else {
      alert("Failed to share dream.");
    }
  } catch (error) {
    alert("An error occurred while sharing the dream.");
  }
};

const unshareDream = async () => {
  try {
    const response = await axios.post(
      `http://localhost:8081/api/dreams/${dreamId}/unshare`
    );

    if (response.data.message === "Dream unshared successfully") {
      alert("Dream unshared successfully!");
      isShared.value = false;
    } else {
      alert("Failed to unshare dream.");
    }
  } catch (error) {
    alert("An error occurred while unsharing the dream.");
  }
};

onMounted(async () => {
  try {
    const response = await axios.get(
      `http://localhost:8081/api/dreams/${dreamId}/fetch`
    );
    dream.value = response.data;
    editedTitle.value = dream.value.title;
    editedDescription.value = dream.value.description;
    await checkIfShared();
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

const getCategoryName = (categoryId) => {
  const category = categories.value.find((cat) => cat.id === categoryId);
  return category ? category.name : "Unknown Category";
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

.separator {
  border-top: 1px solid #00ccff;
  margin: 20px 0;
}

.lucid-box,
.regular-box {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 5px;
  font-weight: bold;
}

.lucid-box {
  background-color: #00ccff;
  color: #000;
}

.regular-box {
  background-color: #888;
  color: #fff;
}
</style>
