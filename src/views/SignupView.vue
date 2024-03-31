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
                  <input
                    type="password"
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
import { formatISO, subDays } from "date-fns";

document.addEventListener("DOMContentLoaded", function () {
  const dobInput = document.getElementById("dob");
  const today = new Date();
  const maxDate = formatISO(subDays(today, 1), { representation: "date" });
  dobInput.max = maxDate;
});

export default {
  methods: {
    async submitForm() {
      const userData = {
        name: document.getElementById("name").value,
        surname: document.getElementById("surname").value,
        username: document.getElementById("username").value, // Assuming this is the email field

        password: document.getElementById("password").value,
        email: document.getElementById("email").value,
      };

      try {
        const response = await fetch("http://localhost:8081/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        if (response.ok) {
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
