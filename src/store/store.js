// store.js
import { createStore } from "vuex";

export default createStore({
  state: {
    isLoggedIn: !!localStorage.getItem("token"),
    selectedDreamId: null, // Add this line
  },
  mutations: {
    setLoggedIn(state, value) {
      state.isLoggedIn = value;
    },
    setSelectedDreamId(state, value) {
      // Add this mutation
      state.selectedDreamId = value;
    },
  },
  actions: {
    login({ commit }) {
      commit("setLoggedIn", true);
    },
    logout({ commit }) {
      localStorage.removeItem("token");
      commit("setLoggedIn", false);
    },
  },
  getters: {
    isLoggedIn: (state) => state.isLoggedIn,
    selectedDreamId: (state) => state.selectedDreamId, // Add this getter
  },
});
