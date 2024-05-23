<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center">
      <input
        type="text"
        class="form-control me-5"
        placeholder="Search by name..."
        v-model="searchQuery"
      />
      <input
        type="text"
        class="form-control me-5"
        placeholder="Search by tags..."
        v-model="searchQuery"
      />
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
      v-for="dream in filteredDreams"
      :key="dream.Id"
      class="card text-white bg-dark mb-3"
    >
      <div class="card-body">
        <p class="card-text text-white">{{ dream.username }}</p>
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
              @click="dream.showComments = !dream.showComments"
            >
              <font-awesome-icon
                :icon="['fas', 'comment']"
                style="color: white"
              />
              {{ dream.comments.length }}
            </button>
          </div>
        </div>
      </div>

      <Comments
        :comments="dream.comments"
        :showComments="dream.showComments"
        :dreamId="dream.Id"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Comments from "../components/Comments.vue";

const showComments = ref(false);
const searchQuery = ref("");
const comments = ref([]);
const sharedDreams = ref([]);
const loading = ref(true);

const token = localStorage.getItem("token");
const decodedToken = jwtDecode(token);
const userId = decodedToken.userId;

const selected = ref(null);
const filteredDreams = computed(() => {
  if (!searchQuery.value) {
    return sharedDreams.value;
  }
  return sharedDreams.value.filter((dream) =>
    dream.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

onMounted(async () => {
  try {
    const response = await axios.get("http://localhost:8081/api/shared-dreams");
    if (response.data && Array.isArray(response.data)) {
      sharedDreams.value = response.data.map((dream) => ({
        ...dream,
        likeStatus: "neutral",
        comments: [],
        showComments: false,
      }));

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

        try {
          const commentsResponse = await axios.get(
            `http://localhost:8081/api/shared-dreams/${dream.Id}/comments`
          );

          dream.comments = [...comments.value, ...commentsResponse.data];
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
  try {
    if (dream.likeStatus === "liked") {
      await axios.post(
        `http://localhost:8081/api/shared-dreams/${dream.Id}/${userId}/unlike`
      );
      dream.Likes--;
      dream.likeStatus = "neutral";
    } else if (dream.likeStatus === "disliked") {
      await axios.post(
        `http://localhost:8081/api/shared-dreams/${dream.Id}/${userId}/likeFromDislike`
      );
      dream.Likes += 2;
      dream.likeStatus = "liked";
    } else {
      await axios.post(
        `http://localhost:8081/api/shared-dreams/${dream.Id}/${userId}/like`
      );
      dream.Likes++;
      dream.likeStatus = "liked";
    }
  } catch (error) {
    console.error("Error checking likes:", error);
  }
};

const decreaseLikes = async (dream) => {
  try {
    if (dream.likeStatus === "disliked") {
      await axios.post(
        `http://localhost:8081/api/shared-dreams/${dream.Id}/${userId}/undislike`
      );
      dream.Likes++;
      dream.likeStatus = "neutral";
    } else if (dream.likeStatus === "liked") {
      await axios.post(
        `http://localhost:8081/api/shared-dreams/${dream.Id}/${userId}/dislikeFromLike`
      );
      dream.Likes -= 2;
      dream.likeStatus = "disliked";
    } else {
      await axios.post(
        `http://localhost:8081/api/shared-dreams/${dream.Id}/${userId}/dislike`
      );
      dream.Likes--;
      dream.likeStatus = "disliked";
    }
  } catch (error) {
    console.error("Error checking dislikes:", error);
  }
};

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

<style scoped>
/* Base styles */
.container {
  margin-top: 200px;
  color: white;
}

.card {
  color: white;
  background-color: black;
}

/* Styles for larger screens */
@media (min-width: 768px) {
  .d-flex {
    align-items: center;
  }

  .form-control {
    width: 200px;
  }

  .my-4 {
    margin: 2rem 0;
  }
}

/* Styles for mobile devices */
@media (max-width: 767px) {
  .container {
    margin-top: 100px;
    padding: 10px;
  }

  .d-flex {
    align-items: flex-start;
  }

  .form-control {
    width: 100%;
    margin-bottom: 10px;
  }

  .my-4 {
    margin: 1rem 0;
  }

  h1 {
    font-size: 1.5rem;
  }
}
</style>
