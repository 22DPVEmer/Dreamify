// store.js
import { createStore } from "vuex";

export default createStore({
  state: {
    isLoggedIn: false,
  },
  mutations: {
    setLoggedIn(state, value) {
      state.isLoggedIn = value;
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
  },
});
