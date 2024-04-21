<template>
  <div class="container" style="margin-top: 200px; color: white">
    <h1 class="my-4 me-5 text-white">Dreamboard</h1>
    <div v-if="loading">Loading...</div>
    <div
      v-else
      v-for="dream in sharedDreams"
      :key="dream.Id"
      class="card text-white bg-dark mb-3"
      style="color: white; background-color: black"
    >
      <div class="card-body">
        <h2 class="card-title text-white">{{ dream.title }}</h2>
        <p class="card-text text-white">{{ dream.description }}</p>
        <p class="card-text text-white">
          {{ new Date(dream.Date).toLocaleDateString() }}
        </p>
        <div>
          <div class="d-flex align-items-center">
            <button class="btn" @click="increaseLikes(dream)">
              <font-awesome-icon
                :icon="['fas', 'thumbs-up']"
                :style="{
                  color: dream.likeStatus === 'liked' ? '#00ccff' : 'white',
                }"
              />
            </button>
            <div class="text-white">
              {{ dream.Likes === null ? 0 : dream.Likes }}
            </div>

            <button class="btn" @click="decreaseLikes(dream)">
              <font-awesome-icon
                :icon="['fas', 'thumbs-down']"
                :style="{
                  color: dream.likeStatus === 'disliked' ? '#00ccff' : 'white',
                }"
              />
            </button>
            <button class="btn">
              <font-awesome-icon
                :icon="['fas', 'comment']"
                style="color: white"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Import jwtDecode directly

//const hasDisliked = ref(false);

const sharedDreams = ref([]);
const loading = ref(true);
//for the token so that the user can like the dream
const token = localStorage.getItem("token");
const decodedToken = jwtDecode(token); // decode without verification
const userId = decodedToken.userId;
onMounted(async () => {
  try {
    const response = await axios.get("http://localhost:8081/api/shared-dreams");
    if (response.data && Array.isArray(response.data)) {
      // Add a likeStatus property to each dream
      sharedDreams.value = response.data.map((dream) => ({
        ...dream,
        likeStatus: "neutral",
      }));
      console.log("Shared dreams:", sharedDreams.value);

      // Check if the user has liked each dream
      for (const dream of sharedDreams.value) {
        try {
          const response = await axios.get(
            `http://localhost:8081/api/shared-dreams/${dream.Id}/${userId}/likeStatus`
          );
          if (response.data.likeStatus === "liked") {
            dream.likeStatus = "liked";
            console.log(dream.likeStatus);
            console.log("User has liked dream:", dream.Id);
          } else if (response.data.likeStatus === "disliked") {
            dream.likeStatus = "disliked";
            console.log(dream.likeStatus);
            console.log("User has disliked dream:", dream.Id);
          } else {
            dream.likeStatus = "neutral";
            console.log(dream.likeStatus);
            console.log("User has not liked dream:", dream.Id);
          }
        } catch (error) {
          console.error(error);
        }
      }
    } else {
      console.error("Unexpected response data:", response.data);
    }
  } catch (error) {
    console.error("Error fetching shared dreams:", error);
  } finally {
    loading.value = false;
  }
});
// Increase the likes count for the dream
const increaseLikes = async (dream) => {
  try {
    if (dream.likeStatus === "liked") {
      // If the dream is already liked, then unlike it
      await axios.post(
        `http://localhost:8081/api/shared-dreams/${dream.Id}/${userId}/unlike`
      );
      dream.Likes--;
      dream.likeStatus = "neutral";
    } else {
      // If the dream is not liked, then like it
      await axios.post(
        `http://localhost:8081/api/shared-dreams/${dream.Id}/${userId}/like`
      );
      dream.Likes++;
      dream.likeStatus = "liked";
      if (dream.likeStatus === "disliked") {
        // If the dream was disliked, then increase the likes count again
        dream.Likes++;
      }
    }
  } catch (error) {
    console.error("Error checking likes:", error);
  }
};
// code for decreasing the likes
const decreaseLikes = async (dream) => {
  try {
    // Check if the user has already disliked this dream
    const response = await axios.post(
      `http://localhost:8081/api/shared-dreams/${dream.Id}/${userId}/dislike`
    );

    if (response.data.message === "You have already disliked this dream") {
      // The user has already disliked this dream, so can't dislike again
      console.log("You have already disliked this dream");
    } else if (response.data.message === "Dream disliked successfully") {
      // The user has not disliked this dream yet, so the dislike was successful
      if (dream.Likes > 0) {
        dream.Likes--;
      }
      console.log("Dream disliked successfully");
    } else {
      // The user has not liked this dream yet, so just added the dislike
      console.log(
        "You haven't liked this dream yet, but it was disliked successfully"
      );
    }
  } catch (error) {
    console.error("Error disliking dream:", error);
  }
};
</script>

<style scoped></style>
