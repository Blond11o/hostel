const RoomPage = {
  props: ['room'],
  emits: ['back', 'book'],
  data() {
    return {
      selectedCheckIn: null,
      selectedCheckOut: null,
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear()
    };
  },

  computed: {
    daysInMonth() {
      const days = [];
      const total = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

      for (let i = 1; i <= total; i++) {
        days.push(new Date(this.currentYear, this.currentMonth, i));
      }
      return days;
    },

    isBookingReady() {
      return this.selectedCheckIn && this.selectedCheckOut && this.isRangeAvailable;
    },

    isRangeAvailable() {
      return this.$root.isDateRangeAvailable(
        this.room,
        this.selectedCheckIn,
        this.selectedCheckOut
      );
    },

    nights() {
      if (!this.selectedCheckIn || !this.selectedCheckOut) return 0;
      return (this.selectedCheckOut - this.selectedCheckIn) / (1000 * 60 * 60 * 24);
    },

    totalPrice() {
      return this.nights * this.room.price;
    }
  },

  methods: {
    isDateBooked(date) {
      return this.room.bookings.some(b => {
        const start = new Date(b.checkIn);
        const end = new Date(b.checkOut);
        return date >= start && date < end;
      });
    },

    selectDate(date) {
      if (this.isDateBooked(date)) return;

      if (!this.selectedCheckIn || this.selectedCheckOut) {
        this.selectedCheckIn = date;
        this.selectedCheckOut = null;
      } else if (date > this.selectedCheckIn) {
        this.selectedCheckOut = date;
      }
    },

    isSelected(date) {
      if (!this.selectedCheckIn) return false;
      if (this.selectedCheckIn && !this.selectedCheckOut)
        return date.getTime() === this.selectedCheckIn.getTime();

      return date > this.selectedCheckIn && date < this.selectedCheckOut;
    },

    formatDate(date) {
      return date.toLocaleDateString('ru-RU');
    }
  },

  template: `
    <section class="room-page">

      <button @click="$emit('back')">← Назад</button>

      <h2>{{ room.name }}</h2>
      <img :src="room.image" />

      <h3>Выберите даты</h3>

      <div class="calendar">
        <div
          v-for="day in daysInMonth"
          :key="day"
          class="calendar-day"
          :class="{
            booked: isDateBooked(day),
            selected: isSelected(day)
          }"
          @click="selectDate(day)"
        >
          {{ day.getDate() }}
        </div>
      </div>

      <div class="booking-info" v-if="selectedCheckIn">
        <p>Заезд: {{ formatDate(selectedCheckIn) }}</p>
        <p v-if="selectedCheckOut">Выезд: {{ formatDate(selectedCheckOut) }}</p>
        <p v-if="nights > 0">Ночей: {{ nights }}</p>
        <p v-if="nights > 0">Цена: {{ totalPrice }} ₽</p>
      </div>

      <p v-if="selectedCheckIn && selectedCheckOut && !isRangeAvailable" class="error">
        ❌ В выбранном диапазоне есть занятые даты
      </p>

      <button
        v-if="isBookingReady"
        @click="$emit('book', {
          room,
          checkIn: selectedCheckIn,
          checkOut: selectedCheckOut
        })"
      >
        Забронировать
      </button>

    </section>
  `
};
