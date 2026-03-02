const { createApp, ref, reactive, computed } = Vue;

const app = createApp({
    setup() {
        // Данные номеров
        const rooms = ref([
            { 
                id: 1, 
                name: 'Стандарт', 
                price: 1500, 
                guests: 2, 
                area: 18,
                description: 'Уютный номер с современным дизайном. Идеальный выбор для одного или двух гостей.',
                amenities: ['wi-fi', 'tv', 'air-conditioning', 'shower'],
                images: ['../images/stan.jpg'],
                available: true,
                bookings: [
                    { checkIn: '2026-03-05', checkOut: '2026-03-08' },
                    { checkIn: '2026-03-15', checkOut: '2026-03-18' }
                ]
            },
            { 
                id: 2, 
                name: 'Комфорт', 
                price: 2500, 
                guests: 2, 
                area: 25,
                description: 'Просторный номер с дополнительными удобствами и прекрасным видом.',
                amenities: ['wi-fi', 'tv', 'air-conditioning', 'shower', 'mini-bar'],
                images: ['../images/kom.jpg'],
                available: true,
                bookings: [
                    { checkIn: '2026-03-10', checkOut: '2026-03-14' }
                ]
            },
            { 
                id: 3, 
                name: 'Люкс', 
                price: 3500, 
                guests: 3, 
                area: 35,
                description: 'Роскошный номер с отдельной спальней и гостиной зоной для незабываемого отдыха.',
                amenities: ['wi-fi', 'tv', 'air-conditioning', 'jacuzzi', 'mini-bar', 'safe'],
                images: ['../images/luks.jpg'],
                available: true,
                bookings: []
            },
            { 
                id: 4, 
                name: 'Семейный', 
                price: 4000, 
                guests: 4, 
                area: 40,
                description: 'Двухкомнатный номер для комфортного размещения семьи с детьми.',
                amenities: ['wi-fi', 'tv', 'air-conditioning', 'shower', 'kitchenette'],
                images: ['../images/fam.jpg'],
                available: true,
                bookings: [
                    { checkIn: '2026-03-20', checkOut: '2026-03-25' },
                    { checkIn: '2026-04-01', checkOut: '2026-04-05' }
                ]
            }
            
        ]);

        // Состояние приложения
        const currentView = ref('room-list');
        const selectedRoom = ref(null);
        const showBookingForm = ref(false);
        const mobileMenuOpen = ref(false);
        
        // Данные для поиска
        const quickCheckIn = ref('');
        const quickCheckOut = ref('');
        const quickGuests = ref('2 гостя');
        
        // Данные для бронирования
        const checkInDate = ref('');
        const checkOutDate = ref('');
        const bookingName = ref('');
        const bookingPhone = ref('');
        const bookingEmail = ref('');
        
        // Уведомления
        const notification = reactive({
            show: false,
            message: '',
            type: 'success'
        });

        // Календарь
        const currentMonth = ref(new Date());
        const selectedDate = ref(null);
        const calendarView = ref('month');

        // Методы для календаря
        const getDaysInMonth = (date) => {
            const year = date.getFullYear();
            const month = date.getMonth();
            const days = [];
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            
            let firstDayIndex = firstDay.getDay() - 1;
            if (firstDayIndex < 0) firstDayIndex = 6;
            
            for (let i = 0; i < firstDayIndex; i++) {
                days.push(null);
            }
            
            for (let d = 1; d <= lastDay.getDate(); d++) {
                days.push(new Date(year, month, d));
            }
            
            return days;
        };

        const isDateBooked = (date, room) => {
            if (!room || !date) return false;
            const dateStr = date.toISOString().split('T')[0];
            
            return room.bookings.some(booking => {
                return dateStr >= booking.checkIn && dateStr < booking.checkOut;
            });
        };

        const prevMonth = () => {
            currentMonth.value = new Date(currentMonth.value.setMonth(currentMonth.value.getMonth() - 1));
        };

        const nextMonth = () => {
            currentMonth.value = new Date(currentMonth.value.setMonth(currentMonth.value.getMonth() + 1));
        };

        const selectDate = (date) => {
            if (!date) return;
            selectedDate.value = date;
            
            if (!checkInDate.value) {
                checkInDate.value = date.toISOString().split('T')[0];
            } else if (!checkOutDate.value && date > new Date(checkInDate.value)) {
                checkOutDate.value = date.toISOString().split('T')[0];
            } else {
                checkInDate.value = date.toISOString().split('T')[0];
                checkOutDate.value = '';
            }
        };

        const formatDate = (date) => {
            if (!date) return '';
            const d = new Date(date);
            return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
        };

        // Фильтрация номеров
        const filteredRooms = computed(() => {
            let filtered = rooms.value;
            
            if (quickGuests.value) {
                const guests = parseInt(quickGuests.value);
                filtered = filtered.filter(room => room.guests >= guests);
            }
            
            if (quickCheckIn.value && quickCheckOut.value) {
                filtered = filtered.filter(room => {
                    const checkIn = new Date(quickCheckIn.value);
                    const checkOut = new Date(quickCheckOut.value);
                    
                    return !room.bookings.some(booking => {
                        const bookingStart = new Date(booking.checkIn);
                        const bookingEnd = new Date(booking.checkOut);
                        
                        return (checkIn < bookingEnd && checkOut > bookingStart);
                    });
                });
            }
            
            return filtered;
        });

        // Методы
        const selectRoom = (room) => {
            selectedRoom.value = room;
            currentView.value = 'room-page';
            
            checkInDate.value = quickCheckIn.value || '';
            checkOutDate.value = quickCheckOut.value || '';
        };

        const applyQuickSearch = () => {
            if (quickCheckIn.value && quickCheckOut.value) {
                showNotification('Поиск выполнен: ' + filteredRooms.value.length + ' номеров доступно', 'success');
            } else {
                showNotification('Пожалуйста, выберите даты заезда и выезда', 'warning');
            }
        };

        const submitBooking = () => {
            if (!bookingName.value || !bookingPhone.value) {
                showNotification('Пожалуйста, заполните все поля', 'error');
                return;
            }
            
            if (!checkInDate.value || !checkOutDate.value) {
                showNotification('Пожалуйста, выберите даты проживания', 'error');
                return;
            }
            
            const booking = {
                checkIn: checkInDate.value,
                checkOut: checkOutDate.value
            };
            
            selectedRoom.value.bookings.push(booking);
            
            showNotification('Номер успешно забронирован!', 'success');
            showBookingForm.value = false;
            
            bookingName.value = '';
            bookingPhone.value = '';
            bookingEmail.value = '';
            
            setTimeout(() => {
                currentView.value = 'room-list';
            }, 2000);
        };

        const showNotification = (message, type = 'success') => {
            notification.message = message;
            notification.type = type;
            notification.show = true;
            
            setTimeout(() => {
                notification.show = false;
            }, 3000);
        };

        const formatPrice = (price) => {
            return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
        };

        return {
            rooms,
            currentView,
            selectedRoom,
            showBookingForm,
            mobileMenuOpen,
            quickCheckIn,
            quickCheckOut,
            quickGuests,
            checkInDate,
            checkOutDate,
            bookingName,
            bookingPhone,
            bookingEmail,
            notification,
            filteredRooms,
            currentMonth,
            selectedDate,
            calendarView,
            getDaysInMonth,
            isDateBooked,
            prevMonth,
            nextMonth,
            selectDate,
            formatDate,
            selectRoom,
            applyQuickSearch,
            submitBooking,
            showNotification,
            formatPrice
        };
    }
});

// Компонент списка номеров
app.component('room-list', {
    props: ['rooms'],
    template: `
        <div class="rooms-section">
            <h2 class="section-title">Наши номера</h2>
            
            <div class="rooms-grid">
                <div v-for="room in rooms" :key="room.id" class="room-card">
                    <div class="room-image">
                        <img :src="room.images[0]" :alt="room.name">
                        <span class="room-price-badge">{{ formatPrice(room.price) }}/ночь</span>
                    </div>
                    
                    <div class="room-card-content">
                        <div class="room-card-header">
                            <h3 class="room-name">{{ room.name }}</h3>
                            <div class="room-rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star-half-alt"></i>
                            </div>
                        </div>
                        
                        <p class="room-description">{{ room.description }}</p>
                        
                        <div class="room-features">
                            <span class="room-feature">
                                <i class="fas fa-user-friends"></i> {{ room.guests }} гостя
                            </span>
                            <span class="room-feature">
                                <i class="fas fa-vector-square"></i> {{ room.area }} м²
                            </span>
                        </div>
                        
                        <div class="room-amenities">
                            <span v-if="room.amenities.includes('wi-fi')" class="amenity-tip" title="Wi-Fi">
                                <i class="fas fa-wifi"></i>
                            </span>
                            <span v-if="room.amenities.includes('tv')" class="amenity-tip" title="Телевизор">
                                <i class="fas fa-tv"></i>
                            </span>
                            <span v-if="room.amenities.includes('air-conditioning')" class="amenity-tip" title="Кондиционер">
                                <i class="fas fa-wind"></i>
                            </span>
                            <span v-if="room.amenities.includes('shower')" class="amenity-tip" title="Душ">
                                <i class="fas fa-shower"></i>
                            </span>
                            <span v-if="room.amenities.includes('jacuzzi')" class="amenity-tip" title="Джакузи">
                                <i class="fas fa-hot-tub"></i>
                            </span>
                            <span v-if="room.amenities.includes('mini-bar')" class="amenity-tip" title="Мини-бар">
                                <i class="fas fa-glass-cheers"></i>
                            </span>
                            <span v-if="room.amenities.includes('kitchenette')" class="amenity-tip" title="Мини-кухня">
                                <i class="fas fa-utensils"></i>
                            </span>
                        </div>
                        
                        <button class="btn btn-primary btn-block" @click="$emit('select-room', room)">
                            <i class="fas fa-calendar-check"></i> Выбрать даты
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
    methods: {
        formatPrice(price) {
            return new Intl.NumberFormat('ru-RU').format(price);
        }
    }
});

// Компонент страницы номера
app.component('room-page', {
    props: ['room', 'checkInDate', 'checkOutDate'],
    template: `
        <div class="room-page">
            <button class="btn-back" @click="$emit('back')">
                <i class="fas fa-arrow-left"></i> Назад к списку
            </button>
            
            <div class="room-detail">
                <div class="room-gallery">
                    <img :src="room.images[0]" :alt="room.name" class="room-main-image">
                </div>
                
                <div class="room-info">
                    <h2 class="room-title">{{ room.name }}</h2>
                    <span class="room-price-large">{{ formatPrice(room.price) }} ₽ <small>/ ночь</small></span>
                    
                    <p class="room-full-description">{{ room.description }}</p>
                    
                    <div class="room-specs">
                        <div class="spec-item">
                            <i class="fas fa-user-friends"></i>
                            <span><strong>Макс. гостей:</strong> {{ room.guests }}</span>
                        </div>
                        <div class="spec-item">
                            <i class="fas fa-vector-square"></i>
                            <span><strong>Площадь:</strong> {{ room.area }} м²</span>
                        </div>
                    </div>
                    
                    <h3 class="section-subtitle">Удобства</h3>
                    <div class="amenities-list">
                        <span v-if="room.amenities.includes('wi-fi')" class="amenity-item">
                            <i class="fas fa-wifi"></i> Wi-Fi
                        </span>
                        <span v-if="room.amenities.includes('tv')" class="amenity-item">
                            <i class="fas fa-tv"></i> Телевизор
                        </span>
                        <span v-if="room.amenities.includes('air-conditioning')" class="amenity-item">
                            <i class="fas fa-wind"></i> Кондиционер
                        </span>
                        <span v-if="room.amenities.includes('shower')" class="amenity-item">
                            <i class="fas fa-shower"></i> Душ
                        </span>
                        <span v-if="room.amenities.includes('jacuzzi')" class="amenity-item">
                            <i class="fas fa-hot-tub"></i> Джакузи
                        </span>
                        <span v-if="room.amenities.includes('mini-bar')" class="amenity-item">
                            <i class="fas fa-glass-cheers"></i> Мини-бар
                        </span>
                        <span v-if="room.amenities.includes('safe')" class="amenity-item">
                            <i class="fas fa-lock"></i> Сейф
                        </span>
                        <span v-if="room.amenities.includes('kitchenette')" class="amenity-item">
                            <i class="fas fa-utensils"></i> Мини-кухня
                        </span>
                    </div>
                    
                    <h3 class="section-subtitle">Календарь занятости</h3>
                    <calendar-view 
                        :room="room"
                        :check-in-date="checkInDate"
                        :check-out-date="checkOutDate"
                        @select-date="selectDate">
                    </calendar-view>
                    
                    <button class="btn btn-primary btn-large" @click="$emit('book')">
                        <i class="fas fa-calendar-check"></i> Забронировать сейчас
                    </button>
                </div>
            </div>
        </div>
    `,
    methods: {
        formatPrice(price) {
            return new Intl.NumberFormat('ru-RU').format(price);
        }
    }
});

// Компонент календаря
app.component('calendar-view', {
    props: ['room', 'checkInDate', 'checkOutDate'],
    template: `
        <div class="calendar-container">
            <div class="calendar-header">
                <button @click="prevMonth" class="calendar-nav">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <h3>{{ monthYear }}</h3>
                <button @click="nextMonth" class="calendar-nav">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            
            <div class="calendar-weekdays">
                <span>Пн</span>
                <span>Вт</span>
                <span>Ср</span>
                <span>Чт</span>
                <span>Пт</span>
                <span>Сб</span>
                <span>Вс</span>
            </div>
            
            <div class="calendar-grid">
                <div v-for="day in days" :key="day" class="calendar-day">
                    <template v-if="day">
                        <div 
                            class="day-content"
                            :class="dayClasses(day)"
                            @click="selectDay(day)">
                            {{ day.getDate() }}
                        </div>
                        <div v-if="isDateBooked(day, room)" class="booked-indicator">
                            <i class="fas fa-ban"></i>
                        </div>
                    </template>
                </div>
            </div>
            
            <div class="calendar-legend">
                <div class="legend-item">
                    <span class="legend-color available"></span>
                    <span>Доступно</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color booked"></span>
                    <span>Занято</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color selected"></span>
                    <span>Выбрано</span>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            currentMonth: new Date()
        };
    },
    computed: {
        monthYear() {
            return this.currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
        },
        days() {
            const year = this.currentMonth.getFullYear();
            const month = this.currentMonth.getMonth();
            const days = [];
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            
            let firstDayIndex = firstDay.getDay() - 1;
            if (firstDayIndex < 0) firstDayIndex = 6;
            
            for (let i = 0; i < firstDayIndex; i++) {
                days.push(null);
            }
            
            for (let d = 1; d <= lastDay.getDate(); d++) {
                days.push(new Date(year, month, d));
            }
            
            return days;
        }
    },
    methods: {
        prevMonth() {
            this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() - 1));
        },
        nextMonth() {
            this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() + 1));
        },
        isDateBooked(date, room) {
            if (!room || !date) return false;
            const dateStr = date.toISOString().split('T')[0];
            
            return room.bookings.some(booking => {
                return dateStr >= booking.checkIn && dateStr < booking.checkOut;
            });
        },
        isDateInRange(date) {
            if (!date || !this.checkInDate) return false;
            const dateStr = date.toISOString().split('T')[0];
            
            if (this.checkInDate && this.checkOutDate) {
                return dateStr >= this.checkInDate && dateStr <= this.checkOutDate;
            }
            return dateStr === this.checkInDate;
        },
        dayClasses(date) {
            if (!date) return {};
            
            return {
                'booked': this.isDateBooked(date, this.room),
                'selected': this.isDateInRange(date),
                'available': !this.isDateBooked(date, this.room),
                'past': date < new Date().setHours(0,0,0,0)
            };
        },
        selectDay(date) {
            if (!date || this.isDateBooked(date, this.room) || date < new Date().setHours(0,0,0,0)) return;
            this.$emit('select-date', date);
        }
    }
});

// Компонент формы бронирования
app.component('booking-form', {
    props: ['room', 'checkInDate', 'checkOutDate'],
    template: `
        <div class="booking-form">
            <div class="booking-form-header">
                <h3>Бронирование номера</h3>
                <button class="btn-close" @click="$emit('close')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="booking-room-summary">
                <img :src="room.images[0]" :alt="room.name">
                <div>
                    <h4>{{ room.name }}</h4>
                    <p>{{ formatPrice(room.price) }} ₽ / ночь</p>
                </div>
            </div>
            
            <div class="booking-dates">
                <div class="form-group">
                    <label><i class="fas fa-calendar-alt"></i> Даты проживания</label>
                    <div class="date-range">
                        <input type="date" v-model="localCheckIn" class="form-control" :min="minDate">
                        <span class="date-separator">—</span>
                        <input type="date" v-model="localCheckOut" class="form-control" :min="localCheckIn">
                    </div>
                </div>
            </div>
            
            <div class="booking-guests">
                <div class="form-group">
                    <label><i class="fas fa-user"></i> Имя *</label>
                    <input type="text" v-model="name" class="form-control" placeholder="Введите ваше имя">
                </div>
                
                <div class="form-group">
                    <label><i class="fas fa-phone"></i> Телефон *</label>
                    <input type="tel" v-model="phone" class="form-control" placeholder="+7 (999) 999-99-99">
                </div>
                
                <div class="form-group">
                    <label><i class="fas fa-envelope"></i> Email</label>
                    <input type="email" v-model="email" class="form-control" placeholder="example@mail.ru">
                </div>
            </div>
            
            <div class="booking-total" v-if="nights > 0">
                <span>Итого:</span>
                <strong>{{ formatPrice(room.price * nights) }} ₽</strong>
                <small>({{ nights }} ночей)</small>
            </div>
            
            <div class="booking-actions">
                <button class="btn btn-secondary" @click="$emit('close')">Отмена</button>
                <button class="btn btn-primary" @click="submitForm">Подтвердить бронь</button>
            </div>
        </div>
    `,
    data() {
        return {
            name: '',
            phone: '',
            email: '',
            localCheckIn: this.checkInDate || '',
            localCheckOut: this.checkOutDate || ''
        };
    },
    computed: {
        minDate() {
            const today = new Date();
            return today.toISOString().split('T')[0];
        },
        nights() {
            if (this.localCheckIn && this.localCheckOut) {
                const start = new Date(this.localCheckIn);
                const end = new Date(this.localCheckOut);
                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays;
            }
            return 0;
        }
    },
    methods: {
        formatPrice(price) {
            return new Intl.NumberFormat('ru-RU').format(price);
        },
        submitForm() {
            this.$emit('submit-booking', {
                name: this.name,
                phone: this.phone,
                email: this.email,
                checkIn: this.localCheckIn,
                checkOut: this.localCheckOut
            });
        }
    }
});

app.mount('#app');