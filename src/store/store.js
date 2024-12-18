import { createStore } from "vuex";
import jwtDecode from "jwt-decode"; // Fix the import

// Function to get the initial state
const getInitialState = () => {
  const token = localStorage.getItem("token");
  let isLoggedIn = false;
  let userId = null;

  if (token) {
    try {
      const decodedToken = jwtDecode(token); // decode without verification
      const currentTime = Date.now() / 1000; // current time in seconds
      if (decodedToken.exp < currentTime) {
        // Token is expired
        localStorage.removeItem("token");
        console.error("Token expired");
      } else {
        userId = decodedToken.userId;
        console.log("userId", userId);
        if (userId) {
          isLoggedIn = true;
        } else {
          console.error("Invalid token: userId is null");
        }
      }
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("token");
    }
  }

  return {
    isLoggedIn,
    userId,
    selectedDreamId: localStorage.getItem("selectedDreamId"), // Get from localStorage
  };
};

export default createStore({
  state: getInitialState(),
  mutations: {
    setLoggedIn(state, value) {
      state.isLoggedIn = value;
    },
    setSelectedDreamId(state, value) {
      localStorage.setItem("selectedDreamId", value);
      state.selectedDreamId = value;
    },
    setUserId(state, value) {
      state.userId = value;
    },
  },
  actions: {
    login({ commit }) {
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token); // decode without verification
      const userId = decodedToken.userId;
      commit("setUserId", userId); // Set the userId in the state
      commit("setLoggedIn", true);
    },
    logout({ commit }) {
      localStorage.removeItem("token");
      localStorage.removeItem("selectedDreamId"); // Remove from localStorage
      commit("setLoggedIn", false);
      commit("setUserId", null); // Clear the userId from the state
    },
  },
  getters: {
    isLoggedIn: (state) => state.isLoggedIn,
    selectedDreamId: (state) => state.selectedDreamId,
    userId: (state) => state.userId, // Add this getter
  },
});
