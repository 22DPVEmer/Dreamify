<template>
  <div class="container" style="margin-top: 200px; color: white">
    <div class="d-flex justify-content-center align-items-center">
      <h1
        class="my-4 me-5 text-white"
        :class="{
          'text-decoration-underline text-primary': selected === 'New',
        }"
        @click="selected = 'New'"
      >
        New
      </h1>
      <h1
        class="my-4 me-5 text-white"
        :class="{
          'text-decoration-underline text-primary': selected === 'Hot',
        }"
        @click="selected = 'Hot'"
      >
        Hot
      </h1>
      <h1
        class="my-4 me-5 text-white"
        :class="{
          'text-decoration-underline text-primary': selected === 'Top',
        }"
        @click="selected = 'Top'"
      >
        Top
      </h1>
    </div>
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
              {{ dream.Likes }}
            </div>

            <button class="btn" @click="decreaseLikes(dream)">
              <font-awesome-icon
                :icon="['fas', 'thumbs-down']"
                :style="{
                  color: dream.likeStatus === 'disliked' ? '#00ccff' : 'white',
                }"
              />
            </button>

            <button
              class="btn text-white"
              @click="showComments = !showComments"
            >
              <font-awesome-icon
                :icon="['fas', 'comment']"
                style="color: white"
              />
              {{ comments.length }}
            </button>
            <!-- Needs to be its own thing seperate from this container I guess, maybe a component mayb not-->
            <div class="text-white"></div>
          </div>
          <div v-if="showComments">
            <div v-for="com in comments" :key="com.ID">
              <h3>{{ com.author }}</h3>
              <p class="text-white">{{ com.Contents }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Import jwtDecode directly

//const hasDisliked = ref(false);
const showComments = ref(false);
const comments = ref([]);
const sharedDreams = ref([]);
const loading = ref(true);
//for the token so that the user can like the dream
const token = localStorage.getItem("token");
const decodedToken = jwtDecode(token); // decode without verification
const userId = decodedToken.userId;

const selected = ref(null);
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
          } else if (response.data.likeStatus === "disliked") {
            dream.likeStatus = "disliked";
          } else {
            dream.likeStatus = "neutral";
          }
        } catch (error) {
          console.error("Error fetching like status:", error);
        }

        // Doesnt work yet
        // Fetch comments for each dream

        try {
          const commentsResponse = await axios.get(
            `http://localhost:8081/api/shared-dreams/${dream.Id}/comments`
          );
          console.log("Comments response:", commentsResponse.data); // Log the response
          comments.value = [...comments.value, ...commentsResponse.data]; // Append new comments
          console.log("Comments:", comments.value); // Log the comments
        } catch (error) {
          console.error("Error fetching comments:", error);
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
const increaseLikes = async (dream) => {
  console.log("increaseLikes called with dream:", dream);
  try {
    if (dream.likeStatus === "liked") {
      console.log("Dream is already liked. Unliking...");
      await axios.post(
        `http://localhost:8081/api/shared-dreams/${dream.Id}/${userId}/unlike`
      );
      dream.Likes--;
      dream.likeStatus = "neutral";
    } else if (dream.likeStatus === "disliked") {
      console.log("Dream was disliked. Liking from dislike...");
      await axios.post(
        `http://localhost:8081/api/shared-dreams/${dream.Id}/${userId}/likeFromDislike`
      );
      dream.Likes += 2;
      dream.likeStatus = "liked";
    } else {
      console.log("Dream is not liked. Liking...");
      await axios.post(
        `http://localhost:8081/api/shared-dreams/${dream.Id}/${userId}/like`
      );
      dream.Likes++;
      dream.likeStatus = "liked";
    }
    console.log("Final dream state:", dream);
  } catch (error) {
    console.error("Error checking likes:", error);
  }
};
// code for decreasing the likes
const decreaseLikes = async (dream) => {
  console.log("decreaseLikes called with dream:", dream);
  try {
    if (dream.likeStatus === "disliked") {
      console.log("Dream is already disliked. Undisliking...");
      await axios.post(
        `http://localhost:8081/api/shared-dreams/${dream.Id}/${userId}/undislike`
      );
      dream.Likes++;
      dream.likeStatus = "neutral";
    } else if (dream.likeStatus === "liked") {
      console.log("Dream was liked. Disliking from like...");
      await axios.post(
        `http://localhost:8081/api/shared-dreams/${dream.Id}/${userId}/dislikeFromLike`
      );
      dream.Likes -= 2;
      dream.likeStatus = "disliked";
    } else {
      console.log("Dream is not disliked. Disliking...");
      await axios.post(
        `http://localhost:8081/api/shared-dreams/${dream.Id}/${userId}/dislike`
      );
      dream.Likes--;
      dream.likeStatus = "disliked";
    }
    console.log("Final dream state:", dream);
  } catch (error) {
    console.error("Error checking dislikes:", error);
  }
};

/// for sortng the dreams
const filterDreams = () => {
  if (selected.value === "New") {
    sharedDreams.value.sort((a, b) => new Date(b.Date) - new Date(a.Date));
  } else if (selected.value === "Hot") {
    sharedDreams.value.sort((a, b) => {
      const timeA = new Date() - new Date(a.Date);
      const timeB = new Date() - new Date(b.Date);
      return b.Likes / timeB - a.Likes / timeA;
    });
  } else if (selected.value === "Top") {
    sharedDreams.value.sort((a, b) => b.Likes - a.Likes);
  }
};

watch(selected, filterDreams);
</script>

<style scoped></style>

Try using userid
