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
      <div v-for="reply in localReplies" :key="reply.Id">
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
              <div v-if="isAuthor(reply) && !reply.showSettings">
                <button class="btn text-white" @click="toggleMenu(reply)">
                  <font-awesome-icon
                    :icon="['fas', 'ellipsis-vertical']"
                    class="ms-auto"
                  />
                </button>
              </div>
            </div>
            <div v-if="reply.showMenu" class="reply-menu">
              <button @click="editReply(reply)">Edit</button>
              <button @click="deleteReply(reply.Id)">Delete</button>
            </div>
            <div v-if="reply.editing" class="edit-reply">
              <input v-model="reply.Contents" />
              <button @click="saveReply(reply)">Save</button>
              <button @click="cancelEdit(reply)">Cancel</button>
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

const localReplies = ref([...props.replies]);

const fetchLikeStatus = async (reply) => {
  try {
    const response = await axios.get(
      `http://localhost:8081/api/shared-dreams/replies/${reply.Id}/${userId}/likeStatus`
    );
    reply.likeStatus = response.data.likeStatus;
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

watch(
  () => props.replies,
  (newReplies) => {
    localReplies.value = newReplies.map((reply) => ({
      ...reply,
      showMenu: false,
      editing: false,
    }));
    for (let reply of localReplies.value) {
      fetchLikeStatus(reply);
    }
  },
  { immediate: true }
);

const submitReply = async () => {
  if (!newReply.value.trim()) return;

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

    if (!response.data.replyId) return;

    const newReplyObject = {
      avatar_url: avatar.value,
      username: decodedToken.username,
      Contents: newReply.value,
      Likes: 0,
      likeStatus: "neutral",
      Id: response.data.replyId,
      UserId: userId,
      showMenu: false,
      editing: false,
    };

    localReplies.value.push(newReplyObject);
    emit("reply-added", newReplyObject);
    newReply.value = "";
  } catch (error) {
    console.error("Error:", error);
  }
};

const increaseLikes = async (reply) => {
  try {
    if (reply.likeStatus === "liked") {
      await axios.post(
        `http://localhost:8081/api/shared-dreams/replies/${reply.Id}/${userId}/unlike`
      );
      reply.Likes--;
      reply.likeStatus = "neutral";
    } else if (reply.likeStatus === "disliked") {
      await axios.post(
        `http://localhost:8081/api/shared-dreams/replies/${reply.Id}/${userId}/likeFromDislike`
      );
      reply.Likes += 2;
      reply.likeStatus = "liked";
    } else {
      await axios.post(
        `http://localhost:8081/api/shared-dreams/replies/${reply.Id}/${userId}/like`
      );
      reply.Likes++;
      reply.likeStatus = "liked";
    }
  } catch (error) {
    console.error("Error checking likes:", error);
  }
};

const decreaseLikes = async (reply) => {
  try {
    if (reply.likeStatus === "disliked") {
      await axios.post(
        `http://localhost:8081/api/shared-dreams/replies/${reply.Id}/${userId}/undislike`
      );
      reply.Likes++;
      reply.likeStatus = "neutral";
    } else if (reply.likeStatus === "liked") {
      await axios.post(
        `http://localhost:8081/api/shared-dreams/replies/${reply.Id}/${userId}/dislikeFromLike`
      );
      reply.Likes -= 2;
      reply.likeStatus = "disliked";
    } else {
      await axios.post(
        `http://localhost:8081/api/shared-dreams/replies/${reply.Id}/${userId}/dislike`
      );
      reply.Likes--;
      reply.likeStatus = "disliked";
    }
  } catch (error) {
    console.error("Error checking dislikes:", error);
  }
};

const toggleReplies = async (reply) => {
  if (!reply.showReplies) {
    // Implement fetchReplies if nested replies are needed
  }
  reply.showReplies = !reply.showReplies;
};

const toggleMenu = (reply) => {
  reply.showMenu = !reply.showMenu;
};

const editReply = (reply) => {
  reply.editing = true;
  reply.showMenu = false;
};

const deleteReply = async (replyId) => {
  const originalReplies = [...localReplies.value];
  localReplies.value = localReplies.value.filter(
    (reply) => reply.Id !== replyId
  );

  try {
    await axios.delete(
      `http://localhost:8081/api/shared-dreams/replies/${replyId}/${userId}`
    );
  } catch (error) {
    localReplies.value = originalReplies;
    console.error("Error deleting reply:", error);
  }
};

const saveReply = async (reply) => {
  reply.editing = false;

  try {
    await axios.put(
      `http://localhost:8081/api/shared-dreams/replies/${reply.Id}`,
      {
        text: reply.Contents,
      }
    );
  } catch (error) {
    console.error("Error saving reply:", error);
  }
};

const cancelEdit = (reply) => {
  reply.editing = false;
};

const isAuthor = (reply) => {
  return reply.user_id === userId;
};

onMounted(() => {
  fetchAvatar();
  for (let reply of localReplies.value) {
    fetchLikeStatus(reply);
  }
});
</script>

<style scoped>
.reply-box {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.reply-input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solId #ccc;
  border-radius: 20px;
}

.reply-button {
  background-color: #00ccff;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  margin-left: 5px;
  cursor: pointer;
}

.reply-button:hover {
  background-color: #00ccff;
}

.reply-menu {
  position: absolute;
  background-color: #333;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 100;
  margin-left: 150px;
}

.reply-menu button {
  display: block;
  background: none;
  border: none;
  color: white;
  padding: 10px;
  text-align: left;
  width: 100%;
  cursor: pointer;
}

.reply-menu button:hover {
  background-color: #444;
}

.edit-reply {
  display: flex;
  align-items: center;
}

.edit-reply input {
  flex-grow: 1;
  padding: 10px;
  margin-right: 10px;
  border: 1px solId #ccc;
  border-radius: 20px;
}

.edit-reply button {
  background-color: #00ccff;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  cursor: pointer;
}

.edit-reply button:hover {
  background-color: #00ccff;
}
</style>
