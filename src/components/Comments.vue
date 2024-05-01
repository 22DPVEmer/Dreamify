<template>
  <div v-if="showComments">
    <div>
      <input v-model="newComment" type="text" placeholder="Add a comment..." />
      <button @click="addComment">Submit</button>
    </div>
    <div v-for="comment in comments" :key="comment.ID">
      <h3>{{ comment.author }}</h3>
      <p class="text-white">{{ comment.Contents }}</p>
      <div class="d-flex align-items-center">
        <button class="btn" @click="increaseLikes(comment)">
          <font-awesome-icon
            :icon="['fas', 'thumbs-up']"
            :style="{
              color: comment.likeStatus === 'liked' ? '#00ccff' : 'white',
            }"
          />
        </button>
        <div class="text-white">
          {{ comment.Likes }}
        </div>
        <button class="btn" @click="decreaseLikes(comment)">
          <font-awesome-icon
            :icon="['fas', 'thumbs-down']"
            :style="{
              color: comment.likeStatus === 'disliked' ? '#00ccff' : 'white',
            }"
          />
        </button>
        <button class="btn text-white">
          <font-awesome-icon
            :icon="['fas', 'message']"
            :style="{
              color: 'white',
            }"
          />
          Reply
        </button>
        <button class="btn text-white" @click="clicked = !clicked">
          <font-awesome-icon :icon="['fas', clicked ? 'minus' : 'plus']" />
        </button>
        <div v-if="clicked">
          <input type="text" placeholder="Add a reply..." />
          <button>Submit</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Import jwtDecode directly

const props = defineProps({
  comments: Array,
  showComments: Boolean,
  dreamId: Number,
});

const newComment = ref("");
const token = localStorage.getItem("token");
const decodedToken = jwtDecode(token); // decode without verification
const userId = decodedToken.userId;
const clicked = ref(false);

onMounted(async () => {
  // Iterate over each comment
  for (const comment of props.comments) {
    const userResponse = await axios.get(
      `http://localhost:8081/api/users/${comment.UserID}/comments`
    );
    comment.author = userResponse.data.username;

    console.log("User ID:", comment);

    try {
      const response = await axios.get(
        `http://localhost:8081/api/shared-dreams/comments/${comment.ID}/${userId}/likeStatus`
      );
      if (response.data.likeStatus === "liked") {
        comment.likeStatus = "liked";
      } else if (response.data.likeStatus === "disliked") {
        comment.likeStatus = "disliked";
      } else {
        comment.likeStatus = "neutral";
      }
    } catch (error) {
      console.error("Error fetching like status for comment:", error);
    }
  }
});
const addComment = async () => {
  try {
    // Get the username of the user

    const response = await axios.post(
      `http://localhost:8081/api/shared-dreams/comments/${userId}`,
      {
        text: newComment.value,
        dreamId: props.dreamId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Add the new comment to the comments array
    props.comments.push({
      author: decodedToken.username, // Replace with the actual username
      Contents: newComment.value,
      Likes: 0, // Initialize likes to 0
      likeStatus: null, // Initialize likeStatus to null
      // Add other necessary fields
    });

    // Clear the input field
    newComment.value = "";
  } catch (error) {
    // Handle error
    console.error("Error:", error.response.status);
  }
};

const increaseLikes = async (comment) => {
  console.log("increaseLikes called with comment:", comment);
  try {
    if (comment.likeStatus === "liked") {
      console.log("Comment is already liked. Unliking...");
      await axios.post(
        `http://localhost:8081/api/shared-dreams/comments/${comment.ID}/${userId}/unlike`
      );
      comment.Likes--;
      comment.likeStatus = "neutral";
    } else if (comment.likeStatus === "disliked") {
      console.log("Comment was disliked. Liking from dislike...");
      await axios.post(
        `http://localhost:8081/api/shared-dreams/comments/${comment.ID}/${userId}/likeFromDislike`
      );
      comment.Likes += 2;
      comment.likeStatus = "liked";
    } else {
      console.log("Comment is not liked. Liking...");
      await axios.post(
        `http://localhost:8081/api/shared-dreams/comments/${comment.ID}/${userId}/like`
      );
      comment.Likes++;
      comment.likeStatus = "liked";
    }
    console.log("Final comment state:", comment);
  } catch (error) {
    console.error("Error checking likes:", error);
  }
};

const decreaseLikes = async (comment) => {
  console.log("decreaseLikes called with comment:", comment);
  try {
    if (comment.likeStatus === "disliked") {
      console.log("Comment is already disliked. Undisliking...");
      await axios.post(
        `http://localhost:8081/api/shared-dreams/comments/${comment.ID}/${userId}/undislike`
      );
      comment.Likes++;
      comment.likeStatus = "neutral";
    } else if (comment.likeStatus === "liked") {
      console.log("Comment was liked. Disliking from like...");
      await axios.post(
        `http://localhost:8081/api/shared-dreams/comments/${comment.ID}/${userId}/dislikeFromLike`
      );
      comment.Likes -= 2;
      comment.likeStatus = "disliked";
    } else {
      console.log("Comment is not disliked. Disliking...");
      await axios.post(
        `http://localhost:8081/api/shared-dreams/comments/${comment.ID}/${userId}/dislike`
      );
      comment.Likes--;
      comment.likeStatus = "disliked";
    }
    console.log("Final comment state:", comment);
  } catch (error) {
    console.error("Error checking dislikes:", error);
  }
};
</script>
