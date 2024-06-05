<template>
  <div v-if="showReplies">
    <div class="reply-box">
      <img
        v-if="avatar.valueOf() !== ''"
        :src="'/backend' + avatar.valueOf()"
        alt=""
        class="rounded-circle me-3"
        style="width: 50px; height: 50px"
      />
      <input
        v-model="newReply"
        type="text"
        placeholder="Add a reply..."
        class="reply-input"
      />
      <button @click="submitReply" class="reply-button">Reply</button>
    </div>
    <div>
      <div v-for="reply in replies" :key="reply.Id">
        <div class="d-flex align-items-start">
          <img
            :src="'/backend' + reply.avatar_url"
            alt=""
            class="rounded-circle me-3"
            style="width: 50px; height: 50px"
          />
          <div>
            <p class="text-white mb-0">{{ reply.username }}</p>
            <div class="d-flex justify-content-between align-items-center">
              <p class="text-white mb-0">{{ reply.Contents }}</p>
              <font-awesome-icon
                :icon="['fas', 'ellipsis-vertical']"
                class="ms-auto"
              />
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <p class="text-white mb-0">{{ reply.formatted_date }}</p>
            </div>
            <div class="d-flex align-items-center">
              <button class="btn me-2" @click="increaseLikes(reply)">
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
                    color:
                      reply.likeStatus === 'disliked' ? '#00ccff' : 'white',
                  }"
                />
              </button>
              <button class="btn text-white" @click="toggleReplies(reply)">
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const props = defineProps({
  replies: { type: Array, default: () => [] },
  showReplies: Boolean,
  commentId: Number,
});

const emit = defineEmits(["reply-added"]);

const newReply = ref("");
const token = localStorage.getItem("token");
const decodedToken = jwtDecode(token);
const userId = decodedToken.userId;

const fetchLikeStatus = async (reply) => {
  try {
    const response = await axios.get(
      `http://localhost:8081/api/shared-dreams/replies/${reply.Id}/${userId}/likeStatus`
    );
    reply.likeStatus = response.data.likeStatus;
    console.log("Like status for reply:", reply);
    console.log("like status:", reply.likeStatus);
  } catch (error) {
    console.error("Error fetching like status:", error);
  }
};
const avatar = ref("");
const fetchavatar = async () => {
  try {
    const response = await axios.get(
      `http://localhost:8081/api/users/${userId}/avatar`
    );
    console.log("Avatar response:", response);
    console.log("Avatar response.data:", response.data.avatar_url);

    avatar.value = response.data.avatar_url || "";
    console.log("Avatar URL:", avatar.value);
  } catch (error) {
    console.error("Error fetching avatar:", error);
  }
};

watch(
  () => props.replies,
  (newReplies) => {
    if (Array.isArray(newReplies)) {
      for (let reply of newReplies) {
        fetchLikeStatus(reply);
      }
    }
  },
  { immediate: true }
);

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
      likeStatus: "neutral",
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
  console.log("Reply ID:", reply.Id);

  try {
    if (reply.likeStatus === "liked") {
      console.log("Reply is already liked. Unliking...");
      await axios.post(
        `http://localhost:8081/api/shared-dreams/replies/${reply.Id}/${userId}/unlike`
      );
      reply.Likes--;
      reply.likeStatus = "neutral";
    } else if (reply.likeStatus === "disliked") {
      console.log("Reply was disliked. Liking from dislike...");
      await axios.post(
        `http://localhost:8081/api/shared-dreams/replies/${reply.Id}/${userId}/likeFromDislike`
      );
      reply.Likes += 2;
      reply.likeStatus = "liked";
    } else {
      console.log("Reply is not liked. Liking...");
      console.log("Reply ID:", reply.Id);

      await axios.post(
        `http://localhost:8081/api/shared-dreams/replies/${reply.Id}/${userId}/like`
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
        `http://localhost:8081/api/shared-dreams/replies/${reply.Id}/${userId}/undislike`
      );
      reply.Likes++;
      reply.likeStatus = "neutral";
    } else if (reply.likeStatus === "liked") {
      console.log("Reply was liked. Disliking from like...");
      await axios.post(
        `http://localhost:8081/api/shared-dreams/replies/${reply.Id}/${userId}/dislikeFromLike`
      );
      reply.Likes -= 2;
      reply.likeStatus = "disliked";
    } else {
      console.log("Reply is not disliked. Disliking...");
      await axios.post(
        `http://localhost:8081/api/shared-dreams/replies/${reply.Id}/${userId}/dislike`
      );
      reply.Likes--;
      reply.likeStatus = "disliked";
    }
    console.log("Final reply state:", reply);
  } catch (error) {
    console.error("Error checking dislikes:", error);
  }
};
onMounted(() => {
  fetchavatar();
});
</script>

<style scoped>
.reply-box {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.reply-input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 20px;
}

.reply-button {
  background-color: #1e90ff;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  margin-left: 10px;
  cursor: pointer;
}

.reply-button:hover {
  background-color: #1c86ee;
}
</style>
