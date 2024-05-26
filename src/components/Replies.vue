<template>
  <div v-if="showReplies">
    <div>
      <input v-model="newReply" type="text" placeholder="Add a reply..." />
      <button @click="submitReply">Submit</button>
    </div>
    <div>
      <div v-for="reply in replies" :key="reply.ID">
        <div>
          <h3>{{ reply.author }}</h3>
          <div class="d-flex justify-content-between align-items-center">
            <p class="text-white mb-0">{{ reply.Contents }}</p>
            <font-awesome-icon
              :icon="['fas', 'ellipsis-vertical']"
              class="ms-auto"
            />
          </div>
          <div class="d-flex align-items-center">
            <button class="btn" @click="increaseLikes(reply)">
              <font-awesome-icon
                :icon="['fas', 'thumbs-up']"
                :style="{
                  color: reply.likeStatus === 'liked' ? '#00ccff' : 'white',
                }"
              />
            </button>
            <div class="text-white">{{ reply.Likes }}</div>
            <button class="btn" @click="decreaseLikes(reply)">
              <font-awesome-icon
                :icon="['fas', 'thumbs-down']"
                :style="{
                  color: reply.likeStatus === 'disliked' ? '#00ccff' : 'white',
                }"
              />
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
  replies: Array,
  showReplies: Boolean,
  commentId: Number,
});

const emit = defineEmits(["reply-added"]);

const newReply = ref("");
const token = localStorage.getItem("token");
const decodedToken = jwtDecode(token);
const userId = decodedToken.userId;

const submitReply = async () => {
  console.log("submitReply called with newReply:", newReply.value);

  if (!newReply.value.trim()) return; // Prevent empty replies

  try {
    const response = await axios.post(
      `http://localhost:8081/api/shared-dreams/replies/${userId}`,
      {
        text: newReply.value,
        commentId: props.commentId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("API response:", response);

    if (!response.data.replyId) {
      console.error("API response did not contain replyId");
      return;
    }

    const newReplyObject = {
      author: decodedToken.username,
      Contents: newReply.value,
      Likes: 0,
      likeStatus: null,
      ID: response.data.replyId,
      UserID: userId,
    };

    console.log("Emitting reply-added event with:", newReplyObject);
    // Emit the new reply to the parent component
    emit("reply-added", newReplyObject);

    // Clear the input field
    newReply.value = "";
  } catch (error) {
    console.error("Error:", error);
  }
};

const increaseLikes = async (reply) => {
  console.log("increaseLikes called with reply:", reply);
  try {
    if (reply.likeStatus === "liked") {
      console.log("Reply is already liked. Unliking...");
      await axios.post(
        `http://localhost:8081/api/shared-dreams/replies/${reply.ID}/${userId}/unlike`
      );
      reply.Likes--;
      reply.likeStatus = "neutral";
    } else if (reply.likeStatus === "disliked") {
      console.log("Reply was disliked. Liking from dislike...");
      await axios.post(
        `http://localhost:8081/api/shared-dreams/replies/${reply.ID}/${userId}/likeFromDislike`
      );
      reply.Likes += 2;
      reply.likeStatus = "liked";
    } else {
      console.log("Reply is not liked. Liking...");
      await axios.post(
        `http://localhost:8081/api/shared-dreams/replies/${reply.ID}/${userId}/like`
      );
      reply.Likes++;
      reply.likeStatus = "liked";
    }
    console.log("Final reply state:", reply);
  } catch (error) {
    console.error("Error checking likes:", error);
  }
};

const decreaseLikes = async (reply) => {
  console.log("decreaseLikes called with reply:", reply);
  try {
    if (reply.likeStatus === "disliked") {
      console.log("Reply is already disliked. Undisliking...");
      await axios.post(
        `http://localhost:8081/api/shared-dreams/replies/${reply.ID}/${userId}/undislike`
      );
      reply.Likes++;
      reply.likeStatus = "neutral";
    } else if (reply.likeStatus === "liked") {
      console.log("Reply was liked. Disliking from like...");
      await axios.post(
        `http://localhost:8081/api/shared-dreams/replies/${reply.ID}/${userId}/dislikeFromLike`
      );
      reply.Likes -= 2;
      reply.likeStatus = "disliked";
    } else {
      console.log("Reply is not disliked. Disliking...");
      await axios.post(
        `http://localhost:8081/api/shared-dreams/replies/${reply.ID}/${userId}/dislike`
      );
      reply.Likes--;
      reply.likeStatus = "disliked";
    }
    console.log("Final reply state:", reply);
  } catch (error) {
    console.error("Error checking dislikes:", error);
  }
};
</script>
