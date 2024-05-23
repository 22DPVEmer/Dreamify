<template>
  <!-- Signup - Dark Theme -->
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
                  <h3 class="text-white">Sign Up</h3>
                </div>
              </div>
            </div>
            <form @submit.prevent="submitForm">
              <div class="row gy-3 gy-md-4 overflow-hidden">
                <div class="col-12">
                  <label for="name" class="form-label text-white">
                    Name <span class="text-info">*</span>
                  </label>
                  <input
                    type="text"
                    :class="[
                      'form-control',
                      'bg-dark',
                      'text-white',
                      { 'is-invalid': validationErrors.name },
                    ]"
                    name="name"
                    id="name"
                    placeholder="First Name"
                    v-model="formData.name"
                    required
                  />
                  <div class="text-danger" v-if="validationErrors.name">
                    {{ validationErrors.name }}
                  </div>
                </div>
                <div class="col-12">
                  <label for="surname" class="form-label text-white">
                    Surname <span class="text-info">*</span>
                  </label>
                  <input
                    type="text"
                    :class="[
                      'form-control',
                      'bg-dark',
                      'text-white',
                      { 'is-invalid': validationErrors.surname },
                    ]"
                    name="surname"
                    id="surname"
                    placeholder="Last Name"
                    v-model="formData.surname"
                    required
                  />
                  <div class="text-danger" v-if="validationErrors.surname">
                    {{ validationErrors.surname }}
                  </div>
                </div>
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
                      { 'is-invalid': validationErrors.email },
                    ]"
                    name="email"
                    id="email"
                    placeholder="Email"
                    v-model="formData.email"
                    required
                  />
                  <div class="text-danger" v-if="validationErrors.email">
                    {{ validationErrors.email }}
                  </div>
                </div>
                <div class="col-12">
                  <label for="username" class="form-label text-white">
                    Username <span class="text-info">*</span>
                  </label>
                  <input
                    type="text"
                    :class="[
                      'form-control',
                      'bg-dark',
                      'text-white',
                      { 'is-invalid': validationErrors.username },
                    ]"
                    name="username"
                    id="username"
                    placeholder="Username"
                    v-model="formData.username"
                    required
                  />
                  <div class="text-danger" v-if="validationErrors.username">
                    {{ validationErrors.username }}
                  </div>
                </div>
                <div class="col-12">
                  <label for="password" class="form-label text-white">
                    Password <span class="text-info">*</span>
                  </label>
                  <font-awesome-icon
                    :icon="['fas', 'eye']"
                    style="color: white; cursor: pointer"
                    class="ms-2"
                    @click="showPassword = !showPassword"
                  />
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    :class="[
                      'form-control',
                      'bg-dark',
                      'text-white',
                      { 'is-invalid': validationErrors.password },
                    ]"
                    name="password"
                    id="password"
                    v-model="formData.password"
                    required
                  />
                  <div class="text-danger" v-if="validationErrors.password">
                    {{ validationErrors.password }}
                  </div>
                </div>
                <div class="col-12">
                  <div class="d-grid">
                    <button class="btn btn-lg btn-neon-blue" type="submit">
                      Sign up now
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
                    class="link-white text-decoration-none"
                    to="/login"
                  >
                    Already have an account?
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
import axios from "axios";
import store from "../store/store.js";

export default {
  data() {
    return {
      showPassword: false,
      formData: {
        name: "",
        surname: "",
        username: "",
        email: "",
        password: "",
      },
      validationErrors: {},
    };
  },
  methods: {
    validateInput() {
      const errors = {};
      const regex = /^[a-zA-Z]+$/;
      if (!regex.test(this.formData.name)) {
        errors.name = "Name can only contain alphabets.";
      }
      if (!regex.test(this.formData.surname)) {
        errors.surname = "Surname can only contain alphabets.";
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.formData.email)) {
        errors.email = "Invalid email address.";
      }
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(this.formData.password)) {
        errors.password =
          "Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character, and be at least 8 characters long.";
      }
      return errors;
    },
    async submitForm() {
      this.validationErrors = this.validateInput();

      if (Object.keys(this.validationErrors).length === 0) {
        const userData = { ...this.formData };

        try {
          const response = await axios.post(
            "http://localhost:8081/api/signup",
            userData,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.status >= 200 && response.status < 300) {
            alert("Signup successful!");

            // Store the token in local storage
            localStorage.setItem("token", response.data.token);
            store.dispatch("login");

            // Redirect to user view
            this.$router.push("/user");
          } else {
            alert("Signup failed!");
          }
        } catch (error) {
          console.error("Error:", error);
          alert("Signup failed due to an error!");
        }
      }
    },
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
