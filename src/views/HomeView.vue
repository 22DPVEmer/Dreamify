<template>
  <section class=".bg-dark.bg-gradient text-white pt-5 pb-5 mt-5 mb-5">
    <div class="container">
      <div class="d-flex justify-content-center align-items-center">
        <div class="me-5">
          <img
            id="logo"
            :src="logo"
            class="rounded-pill"
            style="width: 600px; height: 600px"
          />
        </div>
        <div>
          <h1>
            <font-awesome-icon :icon="['fas', 'moon']" class="icon" />Dreamify
          </h1>
          <h1>
            Make your dreams <span class="text-neon-blue">come true</span>
          </h1>
          <p>
            With Dreamify, you can make your dreams come true. Just sign up and
            start dreaming!
          </p>
          <RouterLink class="router" to="/signup">
            <div class="nav-item user fs-5">
              <button type="button" class="btn btn-outline-info btn-lg">
                Sign Up
              </button>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { useRouter } from "vue-router";
import logo from "../assets/neon_moon.webp";

export default {
  data() {
    return {
      logo: logo,
    };
  },
};
</script>

<style scoped>
.icon {
  color: #00ccff;
  filter: drop-shadow(0 0 10px #00ccff);
  margin-right: 10px;
}

.text-neon-blue,
.btn-neon {
  color: #00ccff;
  text-shadow: 0 0 10px #00ccff, 0 0 20px #00ccff, 0 0 40px #00ccff,
    0 0 80px #00ccff;
}

.btn-neon:hover {
  background-color: #00ccff;
  border-color: #00ccff;
  color: #000;
  text-shadow: none;
}
</style>
