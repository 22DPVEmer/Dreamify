<template>
  <div class="calendar border-bottom">
    <div class="controls d-flex justify-content-center align-items-center mb-1">
      <div @click="prevMonth" class="arrow clickable display-2 me-2"><</div>
      <div class="month display-5">{{ currentMonth }}</div>
      <div @click="nextMonth" class="arrow clickable display-2 ms-2">></div>
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
          <div class="dream-bullet invisible-bullet">•</div>
        </div>
        <span
          v-if="isSelectedDate(day.fullDate)"
          :class="[
            'selected-circle',
            day.weekHasDreams ? 'selected-circle-low' : 'selected-circle-high',
          ]"
        ></span>
      </div>
    </div>
    <div class="text-end">
      <div class="neon-blue">• Lucid dream</div>
      <div>• Regular dream</div>
    </div>
  </div>
  <div v-if="selectedDreams.length > 0" class="dreams-container">
    <div class="dreams-title">Dreams for {{ selectedDateFormatted }}</div>
    <div v-for="(dream, index) in selectedDreams" :key="index" class="dream">
      <div class="dream-title">{{ dream.title }}</div>
      <div class="dream-description">{{ dream.description }}</div>
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

const selectedDreams = computed(() => {
  const selectedDateString = currentDate.value.toISOString().split("T")[0];
  const dreamsForSelectedDate = dreamsByDate.value[selectedDateString] || [];
  console.log("Selected Dreams:", dreamsForSelectedDate);
  return dreamsForSelectedDate;
});

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
  let weekHasDreams = false;

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
      weekHasDreams: false,
    });
  }

  for (let i = 1; i <= totalDays; i++) {
    const date = new Date(year, month, i);
    const dateString = date.toISOString().split("T")[0];
    const hasDreams =
      dreamsByDate.value[dateString] &&
      dreamsByDate.value[dateString].length > 0;
    weekHasDreams = weekHasDreams || hasDreams;

    daysArray.push({
      date: i,
      fullDate: date,
      otherMonth: false,
      hasDreams,
      weekHasDreams: false,
    });

    if ((daysArray.length + 1) % 7 === 0 || i === totalDays) {
      daysArray.forEach((day) => {
        if (day.fullDate.getMonth() === month) {
          day.weekHasDreams = weekHasDreams;
        }
      });
      weekHasDreams = false;
    }
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
    for (const dream of dreams.value) {
      console.log(dream);
      console.log(dream.title);
    }

    dreamsByDate.value = dreams.value.reduce((acc, dream) => {
      const date = new Date(dream.date);
      const dateString = date.toISOString().split("T")[0];
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
.invisible-bullet {
  visibility: hidden;
}

.neon-blue {
  color: #00ffff;
}
.arrow {
  color: #00ffff;
}
.calendar {
  font-family: Arial, sans-serif;
  background-color: black;
  padding: 15px;
  border-radius: 10px;
  width: 95vw;
}

.clickable {
  cursor: pointer;
}

.controls {
  margin-bottom: 10px;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.day-label {
  padding: 6px;
  text-align: center;
  border: 1px solid black;
  color: white;
  border-radius: 3px;
}

.day {
  padding: 6px;
  text-align: center;
  border: 1px solid black;
  border-radius: 3px;
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
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  background-color: #00ffff;
  border-radius: 50%;
  z-index: 1;
  pointer-events: none;
}

.selected-circle-low {
  top: 35%;
}

.selected-circle-high {
  top: 35%;
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
  margin-top: 3px;
  position: relative;
  z-index: 2;
}

.dream-bullet {
  font-size: 14px;
  line-height: 1;
  margin: 0 1px;
}

.lucid-dream {
  color: #00ffff;
}

.regular-dream {
  color: white;
}

.border-bottom {
  border-bottom: 1px solid #00ffff;
}
</style>
