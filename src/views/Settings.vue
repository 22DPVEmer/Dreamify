<template>
  <div v-if="!loading && user" class="root bg-dark text-white p-4">
    <h1 class="text-white">Settings</h1>
    <div>
      <h2 class="text-white">Username</h2>
      <div>
        <input
          type="text"
          class="form-control bg-dark text-white"
          v-model="user.username"
        />
      </div>
    </div>
    <div>
      <h2 class="text-white">Name</h2>
      <div>
        <input
          type="text"
          class="form-control bg-dark text-white"
          v-model="user.name"
        />
      </div>
    </div>
    <div>
      <h2 class="text-white">Surname</h2>
      <div>
        <input
          type="text"
          class="form-control bg-dark text-white"
          v-model="user.surname"
        />
      </div>
    </div>
    <div>
      <h2 class="text-white">Change Password</h2>
      <div>
        <label for="currentPassword" class="text-white">Current Password</label>
        <input
          type="password"
          id="currentPassword"
          class="form-control bg-dark text-white"
          v-model="user.password"
        />
      </div>
      <div>
        <label for="newPassword" class="text-white">New Password</label>
        <input
          type="password"
          id="newPassword"
          class="form-control bg-dark text-white"
          v-model="user.newPassword"
        />
      </div>
      <div>
        <label for="confirmPassword" class="text-white">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          class="form-control bg-dark text-white"
          v-model="user.confirmPassword"
        />
      </div>
      <button class="btn btn-primary mt-3" @click="output">Submit</button>
    </div>
    <div class="mt-4">
      <h2 class="text-white">Avatar</h2>
      <div
        @click="selectImage"
        class="avatar-container bg-secondary p-3 text-center"
        style="cursor: pointer"
      >
        <img
          :src="avatarUrl"
          alt="Avatar"
          class="img-fluid rounded-circle"
          style="max-width: 150px"
        />
        <input
          type="file"
          ref="fileInput"
          @change="handleFileChange"
          class="d-none"
        />
        <p class="text-white mt-2">Click to change avatar</p>
      </div>
    </div>
  </div>
  <div v-else-if="loading" class="text-white">Loading...</div>
  <div v-else class="text-white">Error loading user data.</div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Fixing the import statement

const user = ref({});
const loading = ref(true);
const avatarUrl = ref("default-avatar.png"); // Placeholder for the avatar URL

const fileInput = ref(null);

const selectImage = () => {
  fileInput.value.click();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarUrl.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

onMounted(async () => {
  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token); // decode without verification
  const userId = decodedToken.userId;

  try {
    const response = await axios.get(
      `http://localhost:8081/api/users/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.data) {
      // Assign the fetched data to user.value
      user.value = {
        password: "",
        newPassword: "",
        confirmPassword: "",
        ...response.data, // Map the response data to user
      };
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
  margin-top: 200px;
}
.avatar-container {
  display: inline-block;
  border-radius: 50%;
  overflow: hidden;
  width: 150px;
  height: 150px;
  position: relative;
  background-color: #6c757d;
}
.avatar-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
