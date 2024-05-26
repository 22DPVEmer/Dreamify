<template>
  <div v-if="showComments">
    <div>
      <input v-model="newComment" type="text" placeholder="Add a comment..." />
      <button @click="submitComment">Submit</button>
    </div>
    <div>
      <div v-for="comment in comments" :key="comment.ID">
        <div>
          <h3>{{ comment.author }}</h3>
          <div class="d-flex justify-content-between align-items-center">
            <p class="text-white mb-0">{{ comment.Contents }}</p>
            <font-awesome-icon
              :icon="['fas', 'ellipsis-vertical']"
              class="ms-auto"
            />
          </div>
          <div class="d-flex align-items-center">
            <button class="btn" @click="increaseLikes(comment)">
              <font-awesome-icon
                :icon="['fas', 'thumbs-up']"
                :style="{
                  color: comment.likeStatus === 'liked' ? '#00ccff' : 'white',
                }"
              />
            </button>
            <div class="text-white">{{ comment.Likes }}</div>
            <button class="btn" @click="decreaseLikes(comment)">
              <font-awesome-icon
                :icon="['fas', 'thumbs-down']"
                :style="{
                  color:
                    comment.likeStatus === 'disliked' ? '#00ccff' : 'white',
                }"
              />
            </button>
            <button class="btn text-white">
              <font-awesome-icon
                :icon="['fas', 'message']"
                :style="{ color: 'white' }"
              />
              Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const props = defineProps({
  comments: Array,
  showComments: Boolean,
  dreamId: Number,
});

const emit = defineEmits(["comment-added"]);

const newComment = ref("");
const token = localStorage.getItem("token");
const decodedToken = jwtDecode(token);
const userId = decodedToken.userId;

const submitComment = async () => {
  console.log("submitComment called with newComment:", newComment.value);

  if (!newComment.value.trim()) return; // Prevent empty comments

  try {
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

    console.log("API response:", response);

    if (!response.data.commentId) {
      console.error("API response did not contain commentId");
      return;
    }

    const newCommentObject = {
      author: decodedToken.username,
      Contents: newComment.value,
      Likes: 0,
      likeStatus: "neutral",
      ID: response.data.commentId,
      UserID: userId,
    };

    console.log("Emitting comment-added event with:", newCommentObject);
    // Emit the new comment to the parent component
    emit("comment-added", newCommentObject);

    // Clear the input field
    newComment.value = "";
  } catch (error) {
    console.error("Error:", error);
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

need a path for likestatus and likes then replies the the same for replies then
admin panel and all sorts of filltering bs
