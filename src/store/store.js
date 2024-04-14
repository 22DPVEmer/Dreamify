// store.js
import { createStore } from "vuex";

export default createStore({
  state: {
    isLoggedIn: !!localStorage.getItem("token"),
    selectedDreamId: localStorage.getItem("selectedDreamId"), // Get from localStorage
  },
  mutations: {
    setLoggedIn(state, value) {
      state.isLoggedIn = value;
    },
    setSelectedDreamId(state, value) {
      // Save to localStorage
      localStorage.setItem("selectedDreamId", value);
      state.selectedDreamId = value;
    },
  },
  actions: {
    login({ commit }) {
      commit("setLoggedIn", true);
    },
    logout({ commit }) {
      localStorage.removeItem("token");
      localStorage.removeItem("selectedDreamId"); // Remove from localStorage
      commit("setLoggedIn", false);
    },
  },
  getters: {
    isLoggedIn: (state) => state.isLoggedIn,
    selectedDreamId: (state) => state.selectedDreamId,
  },
});
