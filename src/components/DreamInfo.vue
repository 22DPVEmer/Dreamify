<template>
  <div
    class="modal fade"
    id="dreamEntryModal"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
    tabindex="-1"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title text-dark h1 mx-5 text-white">New Dream</h5>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div class="mb-3 text-white">
              <label for="dreamDate" class="form-label h4">Date</label>
              <input
                type="date"
                class="form-control input-background text-white"
                id="dreamDate"
                v-model="dreamDate"
                :max="maxDate"
              />
            </div>
            <div class="mb-3 text-dark">
              <label for="dreamTitle" class="form-label text-white h4"
                >Title</label
              >
              <input
                type="text"
                class="form-control input-background text-white h1"
                id="dreamTitle"
                v-model="dreamTitle"
                maxlength="30"
              />
            </div>
            <div class="mb-3 text-dark">
              <label for="dreamDescription" class="form-label text-white h4"
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
            <div class="mb-3 text-dark">
              <label for="dd" class="form-label text-white h4 text-center w-100"
                >Category</label
              >
              <div class="row justify-content-center">
                <div
                  class="form-check col-6 col-md-3 my-2"
                  v-for="category in categories"
                  :key="category.id"
                >
                  <input
                    class="form-check-input h6"
                    type="radio"
                    :id="'category' + category.id"
                    name="category"
                    v-model="selectedCategory"
                    :value="category"
                  />
                  <label
                    class="form-check-label text-white h5"
                    :for="'category' + category.id"
                  >
                    {{ category.name }}
                  </label>
                </div>
              </div>
            </div>

            <div>
              <div v-if="isInputVisible" class="d-flex align-items-center">
                <input
                  type="text"
                  class="form-control form-control-lg mb-3 input-background text-white"
                  placeholder="Add tag"
                  @keydown.enter.prevent="addTag"
                  @keydown.space.prevent="addTag"
                  @input="updateCharacterCount"
                  @keydown.backspace="handleBackspace"
                  v-model="currentTag"
                  ref="inputRef"
                />
                <button
                  class="btn btn-dark btn-lg ms-2 mb-3"
                  @click="addTag"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Submit"
                  type="button"
                >
                  ✓
                </button>

                <button
                  class="btn btn-dark btn-lg ms-2 mb-3"
                  @click="toggleInputVisibility"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Close"
                  type="button"
                >
                  X
                </button>
              </div>

              <button
                v-else
                class="btn btn-dark rounded-pill mb-3 btn-lg"
                @click="toggleInputVisibility"
                type="button"
              >
                <font-awesome-icon :icon="['fas', 'plus']" class="fa-1x" />
                Add tags
              </button>
            </div>

            <div class="mb-3 text-dark">
              <div
                v-for="(tag, index) in tags"
                :key="index"
                class="btn btn-dark rounded-pill mb-3 btn-lg"
              >
                {{ tag }}
                <button
                  @click="removeTag(index)"
                  class="btn btn-close btn-sm ms-2 btn-close-white"
                ></button>
              </div>
            </div>

            <div class="mb-3 text-dark text-center">
              <label for="dreamType" class="form-label text-white fs-4">
                What type of dream did you have?
              </label>
              <div class="d-flex justify-content-center">
                <div
                  class="dream-type-option rounded p-3 fs-2 mx-3"
                  :class="{ 'neon-selected': dreamType === 'regular' }"
                  @click="dreamType = 'regular'"
                >
                  Regular
                </div>
                <div
                  class="dream-type-option rounded p-3 fs-2 mx-3"
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
                class="btn btn-dark btn-lg"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>

              <button
                type="submit"
                class="btn btn-dark btn-lg"
                :disabled="!isFormValid"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { formatISO } from "date-fns";

const dreamDate = ref(formatISO(new Date(), { representation: "date" }));
const dreamTitle = ref("");
const dreamDescription = ref("");
const dreamType = ref("regular");
const maxDate = formatISO(new Date(), { representation: "date" });
const tags = ref([]);
const currentTag = ref("");
const tagLimit = ref(40);
const selectedCategory = ref(null);

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

watch(selectedCategory, (newCategory) => {
  if (newCategory) {
    console.log("Selected category:", newCategory.id);
    console.log("Selected category name:", newCategory.name);
    console.log(selectedCategory.value.id);
  }
});

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
  return tags.value.join(" ").length + currentTag.value.length;
});

function addTag(event) {
  if (
    currentTag.value.trim() !== "" &&
    totalCharacterCount.value <= tagLimit.value
  ) {
    tags.value.push(currentTag.value.trim());
    currentTag.value = "";
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

function removeTag(index) {
  tags.value.splice(index, 1);
}

async function submitForm() {
  if (!checkFormValidity()) return;

  if (currentTag.value.trim() !== "") {
    tags.value.push(currentTag.value.trim());
    currentTag.value = "";
  }

  console.log("Tags:", tags.value); // Log the tags array

  const dreamEntry = {
    date: dreamDate.value,
    title: dreamTitle.value,
    description: dreamDescription.value,
    lucid: dreamType.value === "lucid" ? 1 : 0,
    tags: tags.value,
    category: selectedCategory.value.id,
  };

  const token = localStorage.getItem("token");
  console.log("Sending token:", token);

  const response = await fetch("http://localhost:8081/user", {
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

  // Clear form
  dreamDate.value = formatISO(new Date(), { representation: "date" });
  dreamTitle.value = "";
  dreamDescription.value = "";
  dreamType.value = "regular";
  tags.value = [];
  currentTag.value = "";
  selectedCategory.value = null;
}

// For the tags button
const isInputVisible = ref(false);
const inputRef = ref(null);

function toggleInputVisibility() {
  isInputVisible.value = !isInputVisible.value;
}
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

.tag {
  display: inline-block;
  background-color: #6c757d;
  color: white;
  padding: 0.5rem;
  border-radius: 0.5rem;
  margin: 0.25rem;
}
.btn-close-white {
  filter: invert(1);
  opacity: 1;
}
</style>
