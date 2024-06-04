<template>
  <div class="calendar" :style="{ borderBottom: '1px solid #0bf' }">
    <div class="controls d-flex justify-content-center align-items-center mb-2">
      <div @click="prevMonth" class="arrow clickable display-2 me-3"><</div>
      <div class="month display-5">{{ currentMonth }}</div>
      <div @click="nextMonth" class="arrow clickable display-2 ms-3">></div>
    </div>
    <div class="days">
      <div class="day-label">Sun</div>
      <div class="day-label">Mon</div>
      <div class="day-label">Tue</div>
      <div class="day-label">Wed</div>
      <div class="day-label">Thu</div>
      <div class="day-label">Fri</div>
      <div class="day-label">Sat</div>
      <div
        v-for="(day, index) in days"
        :key="index"
        class="day"
        :class="{
          'current-date': isCurrentDate(day.fullDate),
          'selected-date': isSelectedDate(day.fullDate),
          'other-month': day.otherMonth,
        }"
      >
        <a
          @click="selectDate(day.date)"
          :class="{ 'other-month-day': day.otherMonth }"
          >{{ day.date }}</a
        >
        <div class="dreams-bullets">
          <div
            v-if="
              dreamsByDate[day.fullDate.toISOString().split('T')[0]] &&
              dreamsByDate[day.fullDate.toISOString().split('T')[0]].some(
                (dream) => dream.lucid
              )
            "
            class="dream-bullet lucid-dream"
          >
            •
          </div>
          <div
            v-if="
              dreamsByDate[day.fullDate.toISOString().split('T')[0]] &&
              dreamsByDate[day.fullDate.toISOString().split('T')[0]].some(
                (dream) => !dream.lucid
              )
            "
            class="dream-bullet regular-dream"
          >
            •
          </div>
        </div>
        <span
          v-if="isSelectedDate(day.fullDate)"
          class="selected-circle"
        ></span>
      </div>
    </div>
    <div class="text-end" style="border-bottom: 1px solid black">
      <div class="neon-blue">• Lucid dream</div>
      <div>• Regular dream</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const dreams = ref([]);
const currentDate = ref(new Date());
const selectedDate = ref(new Date().getDate());
const dreamsByDate = ref({});

const prevMonth = () => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() - 1);
  currentDate.value = newDate;
};

const nextMonth = () => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() + 1);
  currentDate.value = newDate;
};

const currentMonth = computed(() => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = currentDate.value.getMonth();
  const year = currentDate.value.getFullYear();
  return `${monthNames[month]} ${year}`;
});

const days = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDay = firstDayOfMonth.getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const daysArray = [];

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDay - 1; i >= 0; i--) {
    const date = new Date(
      year,
      month - 1 < 0 ? 11 : month - 1,
      prevMonthLastDay - i
    );
    daysArray.push({
      date: date.getDate(),
      fullDate: date,
      otherMonth: true,
    });
  }

  for (let i = 1; i <= totalDays; i++) {
    const date = new Date(year, month, i);
    daysArray.push({
      date: i,
      fullDate: date,
      otherMonth: false,
    });
  }

  return daysArray;
});

const isCurrentDate = (fullDate) => {
  const today = new Date();
  return (
    today.getFullYear() === fullDate.getFullYear() &&
    today.getMonth() === fullDate.getMonth() &&
    today.getDate() === fullDate.getDate()
  );
};

const isSelectedDate = (fullDate) => {
  const selected = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth(),
    selectedDate.value
  );
  return (
    selected.getFullYear() === fullDate.getFullYear() &&
    selected.getMonth() === fullDate.getMonth() &&
    selected.getDate() === fullDate.getDate()
  );
};

const selectDate = (day) => {
  selectedDate.value = day;
};

const fetchDreams = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  const decodedToken = jwtDecode(token);
  const userId = decodedToken.userId;
  try {
    const response = await axios.get(
      `http://localhost:8081/api/users/${userId}/dreams`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    dreams.value = response.data;
    dreamsByDate.value = dreams.value.reduce((acc, dream) => {
      const date = new Date(dream.date);
      const dateString = date.toISOString().split("T")[0]; // Get YYYY-MM-DD format
      if (!acc[dateString]) acc[dateString] = [];
      acc[dateString].push(dream);
      return acc;
    }, {});
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  fetchDreams();
});
</script>

<style scoped>
.neon-blue {
  color: #00ffff;
}
.arrow {
  color: #00ffff;
}
.calendar {
  font-family: Arial, sans-serif;
  background-color: black;
  padding: 20px;
  border-radius: 10px;
  width: 95vw;
}

.clickable {
  cursor: pointer;
}

.controls button {
  background-color: #00ffff; /* Neon blue */
  color: black;
  border: none;
  border-radius: 5px;
  padding: 10px;
  cursor: pointer;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.day-label {
  padding: 10px;
  text-align: center;
  border: 1px solid black;
  color: white;
  border-radius: 5px;
}

.day {
  padding: 10px;
  text-align: center;
  border: 1px solid black;
  border-radius: 5px;
  position: relative;
}

.day a {
  position: relative;
  z-index: 2;
  color: white;
  text-decoration: none;
  cursor: pointer;
  display: inline-block;
}

.selected-circle {
  position: absolute;
  top: 35%; /* Adjusted to move the circle higher */
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  background-color: #00ffff;
  border-radius: 50%;
  z-index: 1;
}

.current-date a {
  position: relative;
}

.other-month a {
  color: white;
  opacity: 0.5;
}

.dreams-bullets {
  display: flex;
  justify-content: center;
  margin-top: 5px;
}

.dream-bullet {
  font-size: 18px;
  line-height: 1;
  margin: 0 2px;
}

.lucid-dream {
  color: #00ffff;
}

.regular-dream {
  color: white;
}

.neonblue {
  border-color: #39ff14 !important; /* Neon blue color */
}

.border-bottom {
  border-bottom: 1px solid #00ffff;
}
</style>
