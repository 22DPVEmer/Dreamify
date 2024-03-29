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
          'current-date': isCurrentDate(day.date),
          'selected-date': isSelectedDate(day.date),
          'other-month': day.otherMonth,
        }"
      >
        <a
          @click="selectDate(day.date)"
          :class="{ 'other-month-day': day.otherMonth }"
          >{{ day.date }}</a
        >
        <span v-if="isSelectedDate(day.date)" class="selected-circle"></span>
      </div>
    </div>
  </div  style="border-bottom:1px solid black">
  
</template>

<script setup>
import { ref, computed } from "vue";

const currentDate = ref(new Date());
const selectedDate = ref(new Date().getDate());

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
  const startingDay = firstDayOfMonth.getDay(); // 0 (Sunday) to 6 (Saturday)
  const totalDays = new Date(year, month + 1, 0).getDate();

  const daysArray = [];
  // Add days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDay - 1; i >= 0; i--) {
    const date = prevMonthLastDay - i;
    daysArray.push({
      date: date,
      month: month - 1 < 0 ? 11 : month - 1,
      weekday: i, // Dummy value for previous month days
      otherMonth: true, // Marking days from the previous month as part of another month
    });
  }

  // Add days from current month
  for (let i = 1; i <= totalDays; i++) {
    daysArray.push({
      date: i,
      month: month,
      weekday: (startingDay + i - 1) % 7,
      otherMonth: false, // Marking days from the current month as part of the current month
    });
  }

  return daysArray;
});

const isCurrentDate = (day) => {
  const today = new Date();
  return (
    today.getFullYear() === currentDate.value.getFullYear() &&
    today.getMonth() === currentDate.value.getMonth() &&
    day === today.getDate()
  );
};

const isSelectedDate = (day) => {
  return selectedDate.value === day;
};

const selectDate = (day) => {
  selectedDate.value = day;
};
</script>

<style scoped>
.arrow{
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
  /*background-color: #00ffff;*/
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
  top: 50%;
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
.neonblue {
  border-color: #39ff14 !important; /* Neon blue color */
};
.border-bottom {
  border-bottom: 1px solid #00ffff;
}
</style>
