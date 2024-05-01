<template>
  <div class="bg-dark py-3 py-md-5 mt-5">
    <div class="container">
      <div class="row justify-content-md-center">
        <div class="col-12 col-md-8 col-lg-6 col-xl-5 col-xxl-4">
          <div
            class="bg-black p-4 p-md-5 rounded shadow-sm border border-light"
          >
            <div class="row">
              <div class="col-12">
                <div class="mb-5">
                  <h3 class="text-white">Reset Password</h3>
                </div>
              </div>
            </div>
            <form @submit.prevent="resetPassword">
              <div class="row gy-3 gy-md-4 overflow-hidden">
                <div class="col-12">
                  <label for="password" class="form-label text-white"
                    >Password <span class="text-info">*</span></label
                  >
                  <input
                    v-model="password"
                    type="password"
                    class="form-control bg-dark text-white"
                    name="password"
                    id="password"
                    placeholder="Enter your new password"
                    required
                  />
                </div>
                <div class="col-12">
                  <label for="confirmPassword" class="form-label text-white"
                    >Confirm Password <span class="text-info">*</span></label
                  >
                  <input
                    v-model="confirmPassword"
                    type="password"
                    class="form-control bg-dark text-white"
                    name="confirmPassword"
                    id="confirmPassword"
                    placeholder="Confirm your new password"
                    required
                  />
                </div>
                <div class="col-12">
                  <div class="d-grid">
                    <button class="btn btn-lg btn-neon-blue" type="submit">
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const password = ref("");
const confirmPassword = ref("");
const route = useRoute();
const router = useRouter();

async function resetPassword() {
  if (password.value !== confirmPassword.value) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8081/reset-password/${route.params.token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: password.value,
        }),
      }
    );
    const data = await response.json();
    if (response.status === 200) {
      console.log(data.message);
      router.push("/user");
    }
  } catch (error) {
    console.error(error);
  }
}
</script>

<style scoped>
.btn-neon-blue {
  background-color: #00ccff;
  border-color: #00ccff;
  color: #000;
}
</style>
