<template>
  <div v-if="showComments">
    <div class="comment-box">
      <input
        v-model="newComment"
        type="text"
        placeholder="Add a comment..."
        class="comment-input"
      />
      <button @click="submitComment" class="comment-button">Comment</button>
    </div>
    <div>
      <div v-for="comment in comments" :key="comment.ID">
        <div class="d-flex align-items-start">
          <img
            :src="'/backend' + comment.avatar_url"
            alt=""
            class="rounded-circle me-3"
            style="width: 50px; height: 50px"
          />
          <div>
            <p class="text-white mb-0">{{ comment.username }}</p>
            <div class="d-flex justify-content-between align-items-center">
              <p class="text-white mb-0">{{ comment.Contents }}</p>
              <font-awesome-icon
                :icon="['fas', 'ellipsis-vertical']"
                class="ms-auto"
              />
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <p class="text-white mb-0">{{ comment.formatted_date }}</p>
            </div>
            <div class="d-flex align-items-center ml-3">
              <button class="btn me-2" @click="increaseLikes(comment)">
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
              <button class="btn text-white" @click="toggleReplies(comment)">
                <font-awesome-icon
                  :icon="['fas', 'message']"
                  :style="{ color: 'white' }"
                />
                {{ comment.replies?.length || 0 }} Reply
              </button>
            </div>
          </div>
        </div>
        <div v-if="comment.showReplies" class="replies-section">
          <Replies
            :replies="comment.replies"
            :showReplies="comment.showReplies"
            :commentId="comment.ID"
            @reply-added="addReplyToComment(comment.ID, $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Replies from "./Replies.vue";
import { ref, onMounted } from "vue";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const props = defineProps({
  comments: { type: Array, default: () => [] },
  showComments: Boolean,
  dreamId: Number,
});

const emit = defineEmits(["comment-added"]);

const newComment = ref("");
const token = localStorage.getItem("token");
const decodedToken = jwtDecode(token);
const userId = decodedToken.userId;

const fetchLikeStatus = async (comment) => {
  try {
    const response = await axios.get(
      `http://localhost:8081/api/shared-dreams/comments/${comment.ID}/${userId}/likeStatus`
    );
    comment.likeStatus = response.data.likeStatus;
  } catch (error) {
    console.error("Error fetching like status:", error);
  }
};
const avatar = ref(null);
const fetchavatar = async () => {
  try {
    const response = await axios.get(
      `http://localhost:8081/api/users/${userId}/avatar`
    );
    avatar.value = response.data.avatar;
  } catch (error) {
    console.error("Error fetching avatar:", error);
  }
};

const fetchReplies = async (comment) => {
  console.log("Fetching replies for comment:", comment);
  console.log("comment.ID:", comment.ID);

  try {
    const response = await axios.get(
      `http://localhost:8081/api/shared-dreams/comments/${comment.ID}/replies`
    );
    comment.replies = response.data || [];
  } catch (error) {
    console.error("Error fetching replies:", error);
    comment.replies = [];
  }
};

const fetchCommentsWithLikeStatus = async () => {
  for (let comment of props.comments) {
    comment.replies = []; // Initialize replies as an empty array
    await fetchLikeStatus(comment);
    await fetchReplies(comment); // Fetch replies for each comment
  }
};

onMounted(() => {
  fetchCommentsWithLikeStatus();
});

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
      showReplies: false,
      replies: [],
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
      console.log("comment.ID:", comment.ID);

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

const toggleReplies = async (comment) => {
  console.log(
    "Toggling replies for comment ID:",
    comment.ID,
    "Current showReplies:",
    comment.showReplies
  );
  if (!comment.showReplies) {
    await fetchReplies(comment); // Fetch replies if not already fetched
  }
  comment.showReplies = !comment.showReplies;
  console.log("New showReplies state:", comment.showReplies);
};

const addReplyToComment = (commentId, newReply) => {
  const comment = props.comments.find((comment) => comment.ID === commentId);
  if (comment) {
    comment.replies.push(newReply);
  }
};
</script>

<style scoped>
.comment-box {
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

.comment-input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 20px;
}

.comment-button {
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  margin-left: 10px;
  cursor: pointer;
}

.comment-button:hover {
  background-color: #45a049;
}
</style>
