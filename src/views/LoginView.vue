<template>
  <div class="py-3 py-md-5 mt-5">
    <div class="container">
      <div class="row justify-content-md-center">
        <div class="col-12 col-md-11 col-lg-8 col-xl-7 col-xxl-6">
          <div
            class="bg-black p-4 p-md-5 rounded shadow-sm border border-light"
          >
            <div class="row">
              <div class="col-12">
                <div class="mb-5">
                  <h3 class="text-white">Log in</h3>
                </div>
              </div>
            </div>
            <form @submit.prevent="login">
              <div class="row gy-3 gy-md-4 overflow-hidden">
                <div class="col-12">
                  <label for="email" class="form-label text-white">
                    Email <span class="text-info">*</span>
                  </label>
                  <input
                    type="email"
                    :class="[
                      'form-control',
                      'bg-dark',
                      'text-white',
                      { 'is-invalid': invalidCredentials },
                    ]"
                    name="email"
                    id="email"
                    placeholder="name@example.com"
                    required
                  />
                </div>
                <div class="col-12">
                  <label for="password" class="form-label text-white">
                    Password <span class="text-info">*</span>
                  </label>
                  <input
                    type="password"
                    :class="[
                      'form-control',
                      'bg-dark',
                      'text-white',
                      { 'is-invalid': invalidCredentials },
                    ]"
                    name="password"
                    id="password"
                    required
                  />
                </div>
                <div class="col-12 text-danger" v-if="invalidCredentials">
                  Invalid credentials.
                </div>
                <div class="col-12">
                  <div class="d-grid">
                    <button class="btn btn-lg btn-neon-blue" type="submit">
                      Login
                    </button>
                  </div>
                </div>
              </div>
            </form>
            <div class="row">
              <div class="col-12">
                <hr class="mt-5 mb-4 border-secondary-subtle" />
                <div
                  class="d-flex gap-2 gap-md-4 flex-column flex-md-row justify-content-md-end"
                >
                  <RouterLink
                    to="/signup"
                    class="link-white text-decoration-none"
                  >
                    Create new account
                  </RouterLink>
                  <RouterLink
                    to="/forgot-password"
                    class="link-white text-decoration-none"
                  >
                    Forgot password
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import store from "../store/store.js";
import { useRouter } from "vue-router";

export default {
  setup() {
    const isLoggedIn = ref(false);
    const invalidCredentials = ref(false);
    const router = useRouter(); // Use the useRouter hook

    async function login() {
      try {
        const response = await fetch("http://localhost:8081/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
          }),
        });

        const data = await response.json();

        if (response.status === 200) {
          console.log(data);

          localStorage.setItem("token", data.token);
          store.dispatch("login");
          router.push("/user"); // Use router instance to navigate
        } else {
          invalidCredentials.value = true;
        }
      } catch (error) {
        console.error(error);
        invalidCredentials.value = true;
      }
    }

    return {
      isLoggedIn,
      invalidCredentials,
      login,
    };
  },
};
</script>

<style scoped>
.btn-neon-blue {
  background-color: #00ccff;
  border-color: #00ccff;
  color: #000;
}

.is-invalid {
  border-color: #dc3545;
  background-color: #f8d7da;
}
</style>
