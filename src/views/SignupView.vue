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
                    E-mail <span class="text-info">*</span>
                  </label>
                  <input
                    type="email"
                    :class="[
                      'form-control',
                      'bg-dark',
                      'text-white',
                      {
                        'is-invalid':
                          validationErrors.email || serverErrors.email,
                      },
                    ]"
                    name="email"
                    id="email"
                    placeholder="Email"
                    v-model="formData.email"
                    required
                  />
                  <div
                    class="text-danger"
                    v-if="validationErrors.email || serverErrors.email"
                  >
                    {{ validationErrors.email || serverErrors.email }}
                  </div>
                </div>
                <div class="col-12">
                  <label for="gender" class="form-label text-white">
                    Gender
                  </label>
                  <select
                    class="form-select bg-dark text-white"
                    v-model="formData.gender"
                  >
                    <option value="FEMALE">FEMALE</option>
                    <option value="MALE">MALE</option>
                    <option value="OTHER">OTHER</option>
                    <option value="NOT DECLARED">NOT DECLARED</option>
                  </select>
                </div>
                <div class="col-12">
                  <label for="dob" class="form-label text-white">
                    Date of Birth
                  </label>
                  <div class="d-flex gap-2">
                    <select
                      class="form-select bg-dark text-white"
                      v-model="formData.year"
                      required
                    >
                      <option disabled value="">YEAR</option>
                      <option v-for="year in years" :key="year" :value="year">
                        {{ year }}
                      </option>
                    </select>
                    <select
                      class="form-select bg-dark text-white"
                      v-model="formData.month"
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
                      v-model="formData.day"
                      required
                    >
                      <option disabled value="">DAY</option>
                      <option v-for="day in days" :key="day" :value="day">
                        {{ day }}
                      </option>
                    </select>
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
                      {
                        'is-invalid':
                          validationErrors.username || serverErrors.username,
                      },
                    ]"
                    name="username"
                    id="username"
                    placeholder="Username"
                    v-model="formData.username"
                    required
                  />
                  <div
                    class="text-danger"
                    v-if="validationErrors.username || serverErrors.username"
                  >
                    {{ validationErrors.username || serverErrors.username }}
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
        gender: "",
        year: "",
        month: "",
        day: "",
      },
      validationErrors: {},
      serverErrors: {},
      years: Array.from(
        { length: 100 },
        (v, i) => new Date().getFullYear() - i
      ),
      months: [
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
      ],
      days: Array.from({ length: 31 }, (v, i) => i + 1),
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
    formatDate(year, month, day) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
        2,
        "0"
      )}`;
    },
    async submitForm() {
      this.validationErrors = this.validateInput();
      this.serverErrors = {};

      if (Object.keys(this.validationErrors).length === 0) {
        const date_of_birth = this.formatDate(
          this.formData.year,
          this.formData.month,
          this.formData.day
        );

        const userData = {
          ...this.formData,
          date_of_birth,
        };

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

            console.log("Token:", response.data.token);
            localStorage.setItem("token", response.data.token);

            store.dispatch("login");

            this.$router.push("/user");
          } else {
            alert("Signup failed!");
          }
        } catch (error) {
          console.error("Error:", error);
          if (error.response && error.response.status === 409) {
            if (error.response.data.message.includes("Email")) {
              this.serverErrors.email = error.response.data.message;
            } else if (error.response.data.message.includes("Username")) {
              this.serverErrors.username = error.response.data.message;
            }
          } else {
            alert("Signup failed due to an error!");
          }
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
