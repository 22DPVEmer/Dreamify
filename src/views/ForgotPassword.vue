<template>
  <div class="bg-black py-3 py-md-5 mt-5">
    <div class="container">
      <div class="row justify-content-md-center">
        <div class="col-12 col-md-8 col-lg-6 col-xl-5 col-xxl-4">
          <div
            class="bg-black p-4 p-md-5 rounded shadow-sm border border-light"
          >
            <div class="row">
              <div class="col-12">
                <div class="mb-5">
                  <h3 class="text-white">Forgot Password</h3>
                </div>
              </div>
            </div>
            <form @submit.prevent="forgotPassword">
              <div class="row gy-3 gy-md-4 overflow-hidden">
                <div class="col-12 text-white">
                  Please enter your email address and we will email you a link
                  to create a new password.
                </div>
                <div class="col-12">
                  <label for="email" class="form-label text-white"
                    >Email <span class="text-info">*</span></label
                  >
                  <input
                    v-model="email"
                    type="email"
                    class="form-control bg-dark text-white"
                    name="email"
                    id="email"
                    placeholder="name@example.com"
                    required
                  />
                </div>
                <div class="col-12">
                  <div class="d-grid">
                    <button class="btn btn-lg btn-neon-blue" type="submit">
                      Send Reset Link
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

const email = ref("");

async function forgotPassword() {
  try {
    const response = await fetch("http://localhost:8081/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.value,
      }),
    });
    const data = await response.json();
    if (response.status === 200) {
      console.log(data.message);
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
