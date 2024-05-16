<template>
  <!-- Signup - Dark Theme -->
  <div class="bg-dark py-3 py-md-5 mt-5">
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
                  <label for="name" class="form-label text-white"
                    >Name <span class="text-info">*</span></label
                  >
                  <input
                    type="text"
                    class="form-control bg-dark text-white"
                    name="name"
                    id="name"
                    placeholder="First Name"
                    required
                  />
                </div>
                <div class="col-12">
                  <label for="surname" class="form-label text-white"
                    >Surname <span class="text-info">*</span></label
                  >
                  <input
                    type="text"
                    class="form-control bg-dark text-white"
                    name="surname"
                    id="surname"
                    placeholder="Last Name"
                    required
                  />
                </div>
                <div class="col-12">
                  <label for="email" class="form-label text-white"
                    >Email <span class="text-info">*</span></label
                  >
                  <input
                    type="email"
                    class="form-control bg-dark text-white"
                    name="email"
                    id="email"
                    placeholder="Email"
                    required
                  />
                </div>
                <div class="col-12">
                  <label for="username" class="form-label text-white"
                    >Username <span class="text-info">*</span></label
                  >
                  <input
                    type="text"
                    class="form-control bg-dark text-white"
                    name="username"
                    id="username"
                    placeholder="Username"
                    required
                  />
                </div>
                <div class="col-12">
                  <label for="password" class="form-label text-white"
                    >Password <span class="text-info">*</span></label
                  >
                  <font-awesome-icon
                    :icon="['fas', 'eye']"
                    style="color: white; cursor: pointer"
                    class="ms-2"
                    @click="showPassword = !showPassword"
                  />
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control bg-dark text-white"
                    name="password"
                    id="password"
                    required
                  />
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
                    >Already have an account?</RouterLink
                  >
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
import { formatISO, subDays } from "date-fns";

document.addEventListener("DOMContentLoaded", function () {
  const dobInput = document.getElementById("dob");
  const today = new Date();
  const maxDate = formatISO(subDays(today, 1), { representation: "date" });
  dobInput.max = maxDate;
});

export default {
  data() {
    return {
      showPassword: false,
    };
  },
  methods: {
    isValidPassword(password) {
      const regex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return regex.test(password);
    },
    validateInput(input) {
      const regex = /^[a-zA-Z]+$/; // This regex allows only alphabets

      if (!regex.test(input)) {
        return false;
      }
      return true;
    },
    async submitForm() {
      const name = document.getElementById("name").value;
      const surname = document.getElementById("surname").value;
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const email = document.getElementById("email").value;

      if (!this.validateInput(name)) {
        alert(
          "Invalid input in Name field. Please enter appropriate and valid information."
        );
        return;
      }

      if (!this.validateInput(surname)) {
        alert(
          "Invalid input in Surname field. Please enter appropriate and valid information."
        );
        return;
      }

      if (!this.isValidPassword(password)) {
        alert(
          "Invalid input in Password field. Please enter appropriate and valid information."
        );
        return;
      }

      const userData = {
        name: name,
        surname: surname,
        username: username,
        password: password,
        email: email,
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
          // Redirect the user or clear the form here
        } else {
          alert("Signup failed!");
        }
      } catch (error) {
        console.error("Error:", error);
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
</style>
