<template>
  <div
    class="modal fade"
    id="dreamEntryModal"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
    tabindex="-1"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title text-dark h1 mx-5 text-white">Edit mode</h5>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div class="mb-3 text-white">
              <label for="dreamDate" class="form-label">Date</label>
              <input
                type="date"
                class="form-control input-background text-white"
                id="dreamDate"
                v-model="dreamDate"
                :max="maxDate"
              />
            </div>
            <div class="mb-3 text-dark">
              <label for="dreamTitle" class="form-label text-white"
                >Title</label
              >
              <input
                type="text"
                class="form-control input-background text-white"
                id="dreamTitle"
                v-model="dreamTitle"
                maxlength="30"
              />
            </div>
            <div class="mb-3 text-dark">
              <label for="dreamDescription" class="form-label text-white"
                >Description</label
              >
              <textarea
                class="form-control no-resize input-background text-white"
                id="dreamDescription"
                placeholder="Write your dream here..."
                rows="5"
                v-model="dreamDescription"
              ></textarea>
            </div>

            <div>
              <div v-if="isInputVisible" class="d-flex align-items-center">
                <input
                  type="text"
                  class="form-control form-control-sm mb-3 input-background text-white"
                  placeholder="Add tag"
                  @keydown.space="addTag"
                  @input="updateCharacterCount"
                  @keydown.backspace="handleBackspace"
                  v-model="currentTag"
                  ref="inputRef"
                />
                <div>{{ totalCharacterCount }}/40</div>
                <button
                  class="btn btn-dark btn-sm ms-2 mb-3"
                  @click="toggleInputVisibility"
                >
                  X
                </button>
              </div>
              <button
                v-else
                class="btn btn-dark rounded-pill mb-3"
                @click="toggleInputVisibility"
              >
                <font-awesome-icon :icon="['fas', 'plus']" class="fa-1x" />
                Add tags
              </button>
            </div>
            <div class="mb-3 text-dark text-center">
              <label for="dreamType" class="form-label text-white fs-4">
                What type of dream did you have?
              </label>
              <div class="d-flex justify-content-center">
                <div
                  class="dream-type-option rounded p-2 fs-3 mx-2"
                  :class="{ 'neon-selected': dreamType === 'regular' }"
                  @click="dreamType = 'regular'"
                >
                  Regular
                </div>
                <div
                  class="dream-type-option rounded p-2 fs-3 mx-2"
                  :class="{ 'neon-selected': dreamType === 'lucid' }"
                  @click="dreamType = 'lucid'"
                >
                  Lucid
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center">
              <button
                type="button"
                class="btn btn-dark"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>

              <button
                type="submit"
                class="btn btn-dark"
                :disabled="!isFormValid"
                data-bs-dismiss="modal"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { formatISO, subDays } from "date-fns";
import { watch } from "vue";
import store from "../store/store.js";

const dreamId = store.state.selectedDreamId; // shis fakin works

const dreamDate = ref(formatISO(new Date(), { representation: "date" }));
const dreamTitle = ref("");
const dreamDescription = ref("");
const dreamType = ref("regular");
const maxDate = formatISO(new Date(), { representation: "date" });
const tags = ref([]);
const currentTag = ref("");
const tagLimit = ref(40);

const isFormValid = computed(() => {
  return (
    dreamDate.value.trim() !== "" &&
    dreamTitle.value.trim() !== "" &&
    dreamDescription.value.trim() !== ""
  );
});
function checkFormValidity() {
  return isFormValid.value;
}

const totalCharacterCount = computed(() => {
  if (tags.value.length < 40) {
    return tags.value.join(" ").length + currentTag.value.length;
  }
});

function addTag(event) {
  // Prevent default behavior of all keys

  const totalLength = totalCharacterCount.value;

  if (
    event.key !== " " && // Check if the pressed key is not a space
    totalLength < tagLimit.value // Check if total length is less than the limit
  ) {
    // Append non-space characters
    currentTag.value += event.key;
  }
}

function updateCharacterCount() {
  if (totalCharacterCount.value > tagLimit.value) {
    currentTag.value = currentTag.value.substring(0, tagLimit.value); // Enforce character limit in input
  }
}

function handleBackspace(event) {
  if (event.key === "Backspace" && currentTag.value.length > 0) {
    currentTag.value = currentTag.value.slice(0, -1); // Remove the last character
  }
}

async function submitForm() {
  if (!checkFormValidity()) return;
  if (currentTag.value.trim() !== "") {
    tags.value = currentTag.value.trim().split(/\s+/);
  }
  console.log("Tags:", tags.value); // Log the tags array

  const dreamEntry = {
    dreamId: dreamId,
    date: dreamDate.value,
    title: dreamTitle.value,
    description: dreamDescription.value,
    lucid: dreamType.value === "lucid" ? 1 : 0,
    tags: tags.value,
  };

  currentTag.value = "";

  const token = localStorage.getItem("token");
  console.log("Sending token:", token);

  const response = await fetch("http://localhost:8081/user/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(dreamEntry),
  });
  try {
    if (response.ok) {
      alert("Dream entry successful!");
    } else {
      alert("Dream entry failed!");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// For the tags button
const isInputVisible = ref(false);
const inputRef = ref(null);

function toggleInputVisibility() {
  isInputVisible.value = !isInputVisible.value;
}

async function fetchDreamData() {
  if (!dreamId) return;

  const response = await fetch(
    `http://localhost:8081/api/dreams/${dreamId}/fetch`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!response.ok) {
    console.error("Failed to fetch dream data");
    return;
  }

  const dreamData = await response.json();

  dreamDate.value = formatISO(new Date(), { representation: "date" }); //dreamData.date;
  dreamTitle.value = dreamData.title;
  dreamDescription.value = dreamData.description;
  dreamType.value = dreamData.lucid ? "lucid" : "regular";
  tags.value = dreamData.tags;
}
fetchDreamData();
watch(() => store.state.selectedDreamId, fetchDreamData);
</script>
<style scoped>
.dot {
  color: gray;
}

.dot-active {
  color: white;
}
.dream-type-option {
  padding: 10px;
  margin: 10px;
  border: 1px solid #757b7c;
  cursor: pointer;
}

.neon-selected {
  border-color: #00ccff;
  color: #00ccff;
}
.d-flex {
  align-items: center;
}
.dots {
  position: relative;
  transform: translateY(-24%);
  color: #757b7c;
  font-size: 3rem;
  font-weight: bold;
}
.icon {
  fill: #780d6a;
}
.modal-header {
  background: rgb(4, 0, 36);
  background: linear-gradient(
    90deg,
    rgba(4, 0, 36, 1) 0%,
    rgba(121, 9, 73, 1) 44%,
    rgba(0, 212, 255, 1) 89%,
    rgba(0, 212, 255, 1) 90%
  );
}
.modal-content {
  background-color: #3c294f !important;
}

.input-background {
  background-color: #5c4178 !important;
}
::placeholder {
  color: white;
  opacity: 1; /* Firefox */
}

.color {
  color: #00ccff;
}
</style>
