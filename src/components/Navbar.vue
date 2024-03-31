<template>
  <div class="navbar fixed-top w-100 p-3">
    <RouterLink class="router text-white text-decoration-none" to="/">
      <div
        class="d-flex align-items-center ps-5 fs-3"
        :class="{ 'text-info': selectedLink === '/' }"
      >
        <font-awesome-icon :icon="['fas', 'moon']" class="icon me-2" />Dreamify
      </div>
    </RouterLink>

    <div class="d-flex justify-content-end mx-3 pe-5">
      <RouterLink
        v-if="isLoggedIn"
        to="/user"
        class="router text-white fs-4 mx-3 text-decoration-none"
      >
        <div :class="{ 'text-dark': selectedLink === '/user' }">Journal</div>
      </RouterLink>
      <RouterLink
        v-if="!isLoggedIn"
        to="/signup"
        class="router text-white fs-4 mx-3 text-decoration-none"
      >
        <div :class="{ 'text-dark': selectedLink === '/signup' }">Sign Up</div>
      </RouterLink>
      <RouterLink
        v-if="isLoggedIn"
        class="router text-white fs-4 mx-3 text-decoration-none"
        to="/"
      >
        <div :class="{ 'text-dark': selectedLink === '/' }">Dreamboard</div>
      </RouterLink>
      <div class="log text-white fs-4 mx-3 text-decoration-none">
        <div
          :class="{ 'text-dark': selectedLink === '/login' }"
          @click="toggleLogin"
        >
          {{ isLoggedIn ? "Logout" : "Login" }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, watch, computed } from "vue";
import store from "../store/store.js";

const router = useRouter();
const selectedLink = ref(router.currentRoute.value.path);

const isLoggedIn = computed(() => store.state.isLoggedIn);

watch(
  () => router.currentRoute.value,
  (newRoute) => {
    selectedLink.value = newRoute.path;
  }
);
const linkTo = computed(() => (isLoggedIn.value ? "/" : "/login"));

const toggleLogin = () => {
  console.log("isLoggedIn:", isLoggedIn.value);
  if (isLoggedIn.value) {
    store.dispatch("logout");
    console.log("Logging out...");
    console.log(linkTo.value);
    router.push("/");
  } else {
    console.log("Logging in...");
    console.log(linkTo.value);
    router.push("/login");
  }
};
</script>

<style scoped>
.log {
  cursor: pointer;
}
.navbar {
  /* Apply linear gradient background */
  background: rgb(4, 0, 36);
  background: linear-gradient(
    90deg,
    rgba(4, 0, 36, 1) 0%,
    rgba(121, 9, 73, 1) 44%,
    rgba(0, 212, 255, 1) 89%,
    rgba(0, 212, 255, 1) 90%
  );
  box-shadow: 0 10px 10px -6px #00ccff;
}

.icon {
  color: #00ccff;
  filter: drop-shadow(0 0 10px #00ccff);
}
</style>
