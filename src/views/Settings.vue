<template>
  <div
    v-if="!loading && user"
    class="root container bg-dark text-white p-4 text-center"
  >
    <div class="row">
      <div
        class="col-md-4 d-flex justify-content-center align-items-center flex-column h1"
      >
        Avatar
        <div
          class="avatar-container bg-secondary p-3 text-center"
          @click="selectImage"
          style="cursor: pointer"
        >
          <img :src="avatarUrl" alt="Avatar" class="img-fluid rounded-circle" />
          <input
            type="file"
            ref="fileInput"
            @change="handleFileChange"
            class="d-none"
          />
          <p class="text-white mt-2">Click to change avatar</p>
        </div>
        <div>Username</div>
        <div class="h3 mt-4">{{ user.username }}</div>
        <div class="h3 mt-4">{{ formattedDate(user.created_at) }}</div>
      </div>

      <div class="col-md-8">
        <h1 class="text-white mb-4">Settings</h1>

        <div class="mb-3">
          <h2 class="text-white">Username</h2>
          <input
            type="text"
            class="form-control bg-dark text-white"
            v-model="user.username"
          />
        </div>

        <div class="mb-3">
          <h2 class="text-white">Name</h2>
          <input
            type="text"
            class="form-control bg-dark text-white"
            v-model="user.name"
          />
        </div>

        <div class="mb-3">
          <h2 class="text-white">Surname</h2>
          <input
            type="text"
            class="form-control bg-dark text-white"
            v-model="user.surname"
          />
        </div>

        <div class="mb-3">
          <h2 class="text-white">Gender</h2>
          <select class="form-select bg-dark text-white" v-model="user.gender">
            <option value="FEMALE">FEMALE</option>
            <option value="MALE">MALE</option>
            <option value="OTHER">OTHER</option>
            <option value="NOT DECLARED">NOT DECLARED</option>
          </select>
        </div>

        <div class="mb-3">
          <h2 class="text-white">Date of Birth</h2>
          <div class="d-flex gap-2">
            <select
              class="form-select bg-dark text-white"
              v-model="user.year"
              required
            >
              <option disabled value="">YEAR</option>
              <option v-for="year in years" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
            <select
              class="form-select bg-dark text-white"
              v-model="user.month"
              required
            >
              <option disabled value="">MONTH</option>
              <option
                v-for="(month, index) in months"
                :key="index"
                :value="index + 1"
              >
                {{ month }}
              </option>
            </select>
            <select
              class="form-select bg-dark text-white"
              v-model="user.day"
              required
            >
              <option disabled value="">DAY</option>
              <option v-for="day in days" :key="day" :value="day">
                {{ day }}
              </option>
            </select>
          </div>
        </div>

        <div class="d-flex justify-content-between">
          <button class="btn neon-btn btn-lg mt-3" @click="output">
            Submit
          </button>
          <button class="btn neon-btn btn-danger btn-lg mt-3" @click="deletion">
            Delete profile
          </button>
        </div>
      </div>
    </div>

    <div v-if="showCropper" class="cropper-dialog">
      <div class="cropper-container">
        <vue-cropper
          ref="cropperRef"
          :src="croppingImage"
          :aspect-ratio="1"
          autoCrop
        />
        <div class="cropper-controls">
          <button class="btn btn-secondary" @click="saveCroppedImage">
            Save
          </button>
          <button class="btn btn-secondary" @click="cancelCropping">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="loading" class="text-white">Loading...</div>
  <div v-else class="text-white">Error loading user data.</div>
</template>

<script setup>
import { nextTick, ref, onMounted } from "vue";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import VueCropper from "vue-cropperjs";
import "cropperjs/dist/cropper.css";
import store from "../store/store.js";
import { useRouter } from "vue-router";
const router = useRouter();

const user = ref({});
const loading = ref(true);
const avatarUrl = ref("default-avatar.png");
const fileInput = ref(null);
const showCropper = ref(false);
const croppingImage = ref(null);
const cropperRef = ref(null);

const years = Array.from(
  { length: 100 },
  (v, i) => new Date().getFullYear() - i
);
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const days = Array.from({ length: 31 }, (v, i) => i + 1);

const resetCropperState = () => {
  croppingImage.value = null;
  showCropper.value = false;
};

const selectImage = () => {
  fileInput.value.value = null;
  fileInput.value.click();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      croppingImage.value = e.target.result;
      nextTick(() => {
        showCropper.value = true;
      });
    };
    reader.readAsDataURL(file);
  }
};

const saveCroppedImage = async () => {
  if (cropperRef.value && cropperRef.value.cropper) {
    const cropper = cropperRef.value.cropper;
    const croppedDataUrl = cropper.getCroppedCanvas().toDataURL("image/png");
    resetCropperState();

    try {
      const response = await axios.post("http://localhost:8081/upload-avatar", {
        image: croppedDataUrl,
        userId: user.value.id,
      });

      if (response.data.success) {
        avatarUrl.value = `http://localhost:8081${response.data.avatarPath}`;
        console.log("Avatar updated successfully:", response.data.avatarPath);
      } else {
        console.error("Failed to update avatar:", response.data.message);
      }
    } catch (error) {
      console.error("Error updating avatar:", error);
    }
  } else {
    console.error("Cropper is not initialized yet");
  }
};

const cancelCropping = () => {
  resetCropperState();
};

const deletion = async () => {
  const token = localStorage.getItem("token");
  alert("User profile deleted successfully.");
  localStorage.removeItem("token");
  store.dispatch("logout");
  router.push("/");
  try {
    const response = await axios.delete(
      `http://localhost:8081/api/userDelete/${user.value.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  } catch (error) {
    console.error(
      "Error deleting user profile:",
      error.response ? error.response.data : error.message
    );
    alert("Failed to delete user profile.");
  }
};

const output = async () => {
  const token = localStorage.getItem("token");

  try {
    const formattedDateOfBirth = formattedDate(
      user.value.year,
      user.value.month,
      user.value.day
    );

    const response = await axios.put(
      `http://localhost:8081/api/users/settings/${user.value.id}`,
      {
        username: user.value.username,
        name: user.value.name,
        surname: user.value.surname,
        gender: user.value.gender,
        date_of_birth: formattedDateOfBirth,
        avatar: avatarUrl.value,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status === 200) {
      alert("User data updated successfully.");
    }
  } catch (error) {
    console.error(
      "Error updating user data:",
      error.response ? error.response.data : error.message
    );
    alert("Failed to update user data.");
  }
};

const formattedDate = (year, month, day) => {
  if (!year || !month || !day) return "";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
};

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
    console.log("response data is:", response.data);

    if (response.data) {
      const [year, month, day] = response.data.date_of_birth.split("-");
      user.value = {
        ...response.data,
        year: parseInt(year),
        month: parseInt(month),
        day: parseInt(day),
      };
      avatarUrl.value = `http://localhost:8081${response.data.avatar_url}`;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.root {
  margin-top: 100px;
}

.avatar-container {
  display: inline-block;
  border-radius: 50%;
  overflow: hidden;
  width: 300px;
  height: 300px;
  position: relative;
}

.avatar-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cropper-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
}

.cropper-container {
  background: white;
  padding: 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cropper-controls {
  margin-top: 10px;
  display: flex;
  gap: 10px;
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

.neon-btn {
  border: 2px solid #00ccff;
  color: #00ccff;
  background: none;
  transition: background-color 0.3s, color 0.3s;
}

.neon-btn:hover {
  background-color: #00ccff;
  color: #000;
}
</style>
