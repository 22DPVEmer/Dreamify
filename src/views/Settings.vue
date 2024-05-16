<template>
  <div class="root">
    <h1>Settings</h1>
    <div>
      <h2>Change Password</h2>
      <div>
        <label for="currentPassword">Current Password</label>
        <input type="password" id="currentPassword" v-model="user.password" />
      </div>
      <div>
        <label for="newPassword">New Password</label>
        <input type="password" id="newPassword" v-model="user.name" />
      </div>
      <div>
        <label for="confirmPassword">Confirm Password</label>
        <input type="password" id="confirmPassword" v-model="user.surname" />
      </div>
      <button class="btn btn-primary" @click="output">Change Password</button>
    </div>
  </div>
</template>

<script setup>
import DreamInfo from "../components/DreamInfosave.vue";
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import store from "../store/store.js";
const user = ref(null);

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
      user.value = response.data;
      console.log("User:", user.value);
    } else {
      console.log("User data is null");
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false; // Set loading to false when done
  }
});
</script>

<style scoped>
.root {
  margin-top: 200px;
}
</style>
