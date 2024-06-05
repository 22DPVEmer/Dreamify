<template>
  <div v-if="showComments">
    <div class="comment-box">
      <img
        v-if="avatar.valueOf() !== ''"
        :src="'/backend' + avatar.valueOf()"
        alt=""
        class="rounded-circle me-3"
        style="width: 50px; height: 50px"
      />
      <input
        v-model="newComment"
        type="text"
        placeholder="Add a comment..."
        class="comment-input"
      />
      <button @click="submitComment" class="comment-button">Comment</button>
    </div>
    <div>
      <div v-for="comment in localComments" :key="comment.ID">
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
              <div v-if="isAuthor(comment) && !comment.showSettings">
                <button class="btn text-white" @click="toggleMenu(comment)">
                  <font-awesome-icon
                    :icon="['fas', 'ellipsis-vertical']"
                    class="ms-auto"
                  />
                </button>
              </div>
            </div>
            <div v-if="comment.showMenu" class="comment-menu">
              <button @click="editComment(comment)">Edit</button>
              <button @click="deleteComment(comment.ID)">Delete</button>
            </div>
            <div v-if="comment.editing" class="edit-comment">
              <input v-model="comment.Contents" />
              <button @click="saveComment(comment)">Save</button>
              <button @click="cancelEdit(comment)">Cancel</button>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <p class="text-white mb-0">{{ comment.formatted_date }}</p>
            </div>
            <div class="d-flex align-items-center">
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
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const props = defineProps({
  comments: { type: Array, default: () => [] },
  showComments: Boolean,
  dreamId: Number,
});

const emit = defineEmits(["comment-added"]);

const newComment = ref("");
const localComments = ref([...props.comments]);
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

const avatar = ref("");
const fetchAvatar = async () => {
  try {
    const response = await axios.get(
      `http://localhost:8081/api/users/${userId}/avatar`
    );
    avatar.value = response.data.avatar_url || "";
  } catch (error) {
    console.error("Error fetching avatar:", error);
  }
};

const fetchReplies = async (comment) => {
  try {
    const response = await axios.get(
      `http://localhost:8081/api/shared-dreams/comments/${comment.ID}/replies`
    );
    comment.replies = response.data || [];
  } catch (error) {
    comment.replies = [];
    if (error.response && error.response.status !== 404) {
      console.error("Error fetching replies:", error);
    }
  }
};

const fetchCommentsWithLikeStatus = async () => {
  for (let comment of localComments.value) {
    comment.replies = [];
    comment.showSettings = false;
    await fetchLikeStatus(comment);
    await fetchReplies(comment);
  }
};

onMounted(() => {
  fetchCommentsWithLikeStatus();
  fetchAvatar();
});

const submitComment = async () => {
  if (!newComment.value.trim()) return;

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

    if (!response.data.commentId) return;

    const newCommentObject = {
      avatar_url: avatar.value,
      username: decodedToken.username,
      Contents: newComment.value,
      Likes: 0,
      likeStatus: "neutral",
      ID: response.data.commentId,
      UserID: userId,
      showReplies: false,
      replies: [],
    };

    localComments.value.push(newCommentObject);
    emit("comment-added", newCommentObject);
    newComment.value = "";
  } catch (error) {
    console.error("Error:", error);
  }
};

const increaseLikes = async (comment) => {
  try {
    if (comment.likeStatus === "liked") {
      await axios.post(
        `http://localhost:8081/api/shared-dreams/comments/${comment.ID}/${userId}/unlike`
      );
      comment.Likes--;
      comment.likeStatus = "neutral";
    } else if (comment.likeStatus === "disliked") {
      await axios.post(
        `http://localhost:8081/api/shared-dreams/comments/${comment.ID}/${userId}/likeFromDislike`
      );
      comment.Likes += 2;
      comment.likeStatus = "liked";
    } else {
      await axios.post(
        `http://localhost:8081/api/shared-dreams/comments/${comment.ID}/${userId}/like`
      );
      comment.Likes++;
      comment.likeStatus = "liked";
    }
  } catch (error) {
    console.error("Error checking likes:", error);
  }
};

const decreaseLikes = async (comment) => {
  try {
    if (comment.likeStatus === "disliked") {
      await axios.post(
        `http://localhost:8081/api/shared-dreams/comments/${comment.ID}/${userId}/undislike`
      );
      comment.Likes++;
      comment.likeStatus = "neutral";
    } else if (comment.likeStatus === "liked") {
      await axios.post(
        `http://localhost:8081/api/shared-dreams/comments/${comment.ID}/${userId}/dislikeFromLike`
      );
      comment.Likes -= 2;
      comment.likeStatus = "disliked";
    } else {
      await axios.post(
        `http://localhost:8081/api/shared-dreams/comments/${comment.ID}/${userId}/dislike`
      );
      comment.Likes--;
      comment.likeStatus = "disliked";
    }
  } catch (error) {
    console.error("Error checking dislikes:", error);
  }
};

const toggleReplies = async (comment) => {
  if (!comment.showReplies) {
    await fetchReplies(comment);
  }
  comment.showReplies = !comment.showReplies;
};

const addReplyToComment = (commentId, newReply) => {
  const comment = localComments.value.find(
    (comment) => comment.ID === commentId
  );
  if (comment) {
    comment.replies.push(newReply);
  }
};

const toggleMenu = (comment) => {
  comment.showMenu = !comment.showMenu;
};

const editComment = (comment) => {
  comment.editing = true;
  comment.showSettings = !comment.showSettings;
  comment.showMenu = false;
};

const deleteComment = async (commentId) => {
  const originalComments = [...localComments.value];
  localComments.value = localComments.value.filter(
    (comment) => comment.ID !== commentId
  );

  try {
    await axios.delete(
      `http://localhost:8081/api/shared-dreams/comments/${commentId}/${userId}`
    );
    console.log("Comment deleted successfully");
  } catch (error) {
    localComments.value = originalComments;
    console.error("Error deleting comment:", error);
  }
};

const saveComment = async (comment) => {
  console.log("The comment is:", comment);
  comment.editing = false;
  comment.showSettings = !comment.showSettings;

  try {
    const response = await axios.put(
      `http://localhost:8081/api/shared-dreams/comments/${comment.ID}`,
      {
        text: comment.Contents,
      }
    );
    console.log("The response status is:", response);

    comment.editing = false;
    comment.showSettings = !comment.showSettings;
  } catch (error) {
    console.error("Error saving comment:", error);
  }
};

const cancelEdit = (comment) => {
  comment.editing = false;
  comment.showSettings = !comment.showSettings;
};

const isAuthor = (comment) => {
  return comment.UserID === userId;
};
</script>

<style scoped>
.comment-menu {
  position: absolute;
  background-color: #333;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 100;
  margin-left: 150px;
}

.comment-menu button {
  display: block;
  background: none;
  border: none;
  color: white;
  padding: 10px;
  text-align: left;
  width: 100%;
  cursor: pointer;
}

.comment-menu button:hover {
  background-color: #444;
}

.edit-comment {
  display: flex;
  align-items: center;
}

.edit-comment input {
  flex-grow: 1;
  padding: 10px;
  margin-right: 10px;
  border: 1px solid #ccc;
  border-radius: 20px;
}

.edit-comment button {
  background-color: #00ccff;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  cursor: pointer;
}

.edit-comment button:hover {
  background-color: #00ccff;
}
.replies-section {
  margin-left: 50px;
}
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
  background-color: #00ccff;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  margin-left: 5px;
  cursor: pointer;
}

.comment-button:hover {
  background-color: #00ccff;
}
</style>
