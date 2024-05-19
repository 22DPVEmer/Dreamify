<template>
  <div
    v-if="!loading && user"
    class="root container bg-dark text-white p-4 text-center"
  >
    <div class="row">
      <!-- Avatar Section -->
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
      </div>

      <!-- Settings Section -->
      <div class="col-md-8">
        <h1 class="text-white mb-4">Settings</h1>
        <!-- Username Input -->
        <div class="mb-3">
          <h2 class="text-white">Username</h2>
          <input
            type="text"
            class="form-control bg-dark text-white"
            v-model="user.username"
          />
        </div>
        <!-- Name Input -->
        <div class="mb-3">
          <h2 class="text-white">Name</h2>
          <input
            type="text"
            class="form-control bg-dark text-white"
            v-model="user.name"
          />
        </div>
        <!-- Surname Input -->
        <div class="mb-3">
          <h2 class="text-white">Surname</h2>
          <input
            type="text"
            class="form-control bg-dark text-white"
            v-model="user.surname"
          />
        </div>
        <!-- Change Password Section -->
        <div>
          <h2 class="text-white">Change Password</h2>
          <div class="mb-3">
            <label for="currentPassword" class="text-white"
              >Current Password</label
            >
            <div class="input-group">
              <input
                type="password"
                id="currentPassword"
                class="form-control bg-dark text-white"
                v-model="user.password"
              />
              <button
                class="btn btn-outline-secondary"
                @click="toggleShowPassword('currentPassword')"
              >
                Show
              </button>
            </div>
          </div>
          <div class="mb-3">
            <label for="newPassword" class="text-white">New Password</label>
            <div class="input-group">
              <input
                type="password"
                id="newPassword"
                class="form-control bg-dark text-white"
                v-model="user.newPassword"
              />
              <button
                class="btn btn-outline-secondary"
                @click="toggleShowPassword('newPassword')"
              >
                Show
              </button>
            </div>
          </div>
          <div class="mb-3">
            <label for="confirmPassword" class="text-white"
              >Confirm Password</label
            >
            <div class="input-group">
              <input
                type="password"
                id="confirmPassword"
                class="form-control bg-dark text-white"
                v-model="user.confirmPassword"
              />
              <button
                class="btn btn-outline-secondary"
                @click="toggleShowPassword('confirmPassword')"
              >
                Show
              </button>
            </div>
          </div>
          <div class="d-flex justify-content-between">
            <button class="btn btn-primary btn-lg mt-3" @click="output">
              Submit
            </button>
            <button class="btn btn-danger btn-lg mt-3" @click="deletion">
              Delete profile
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Cropping Dialog -->
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

const user = ref({});
const loading = ref(true);
const avatarUrl = ref("default-avatar.png");
const fileInput = ref(null);
const showCropper = ref(false);
const croppingImage = ref(null);
const cropperRef = ref(null);

const resetCropperState = () => {
  croppingImage.value = null;
  showCropper.value = false;
};

const selectImage = () => {
  fileInput.value.value = null; // Reset the file input so it can be used again
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
        avatarUrl.value = `http://localhost:8081${response.data.avatarPath}`; // Update the avatar URL
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

  try {
    const response = await axios.delete(
      `http://localhost:8081/api/userDelete/${user.value.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (response.status === 200) {
      alert("User profile deleted successfully.");
      localStorage.removeItem("token");
      this.$router.push("/login");
    }
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
    const response = await axios.put(
      `http://localhost:8081/api/users/settings/${user.value.id}`,
      {
        username: user.value.username,
        name: user.value.name,
        surname: user.value.surname,
        avatar: avatarUrl.value, // Make sure to update the avatar URL in the user profile
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

const toggleShowPassword = (fieldId) => {
  const input = document.getElementById(fieldId);
  if (input.type === "password") {
    input.type = "text";
  } else {
    input.type = "password";
  }
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

    if (response.data) {
      user.value = {
        password: "",
        newPassword: "",
        confirmPassword: "",
        ...response.data,
      };
      console.log("User response data fetched:", response.data);
      avatarUrl.value = `http://localhost:8081${response.data.avatar_url}`;
      console.log("User data fetched:", user.value);
    } else {
      console.log("User data is null");
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
  margin-top: 150px;
}

.avatar-container {
  display: inline-block;
  border-radius: 50%;
  overflow: hidden;
  width: 300px;
  height: 300px;
  position: relative;
  background-color: #6c757d;
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

.input-group {
  display: flex;
  align-items: center;
}

.input-group button {
  margin-left: 5px;
}
</style>
