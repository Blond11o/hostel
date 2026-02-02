const { createApp } = Vue;

// Компонент списка номеров (без календаря)
const RoomList = {
    template: `
        <section class="room-list-section">
            <div class="section-header">
                <h2><i class="fas fa-bed"></i> Наши номера</h2>
                <p>Выберите идеальный номер для вашего отдыха</p>
            </div>
            
            <div v-if="appliedDates" class="date-info-banner">
                <div class="date-banner-content">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Выбранные даты: {{ formatDate(checkInDate) }} — {{ formatDate(checkOutDate) }} 
                    ({{ nightsCount }} ночей)</span>
                    <button @click="clearDateFilter" class="btn-clear-dates">
                        <i class="fas fa-times"></i> Сбросить
                    </button>
                </div>
            </div>
            
            <div class="rooms-grid">
                <div v-for="room in filteredRooms" :key="room.id" 
                     class="room-card" @click="selectRoom(room)">
                    <div class="room-image">
                        <img :src="room.image" :alt="room.name">
                        <span class="room-price">{{ formatPrice(room.price) }} ₽ / ночь</span>
                        <span v-if="!isRoomAvailable(room) && appliedDates" class="room-status booked">
                            Занято
                        </span>
                    </div>
                    <div class="room-info">
                        <h3>{{ room.name }}</h3>
                        <p class="room-description">{{ room.description }}</p>
                        
                        <div class="room-meta">
                            <div class="meta-item">
                                <i class="fas fa-user-friends"></i>
                                <span>До {{ room.capacity }} чел.</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-ruler-combined"></i>
                                <span>{{ room.size }} м²</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-bed"></i>
                                <span>{{ room.beds }}</span>
                            </div>
                        </div>
                        
                        <div v-if="appliedDates && isRoomAvailable(room)" class="availability-badge">
                            <i class="fas fa-check-circle"></i>
                            <span>Доступно на выбранные даты</span>
                        </div>
                        
                        <button class="btn-view-details" @click.stop="selectRoom(room)">
                            <i class="fas fa-eye"></i> Подробнее
                        </button>
                    </div>
                </div>
            </div>
            
            <div v-if="filteredRooms.length === 0" class="no-rooms">
                <i class="fas fa-bed fa-3x"></i>
                <h3>Нет доступных номеров на выбранные даты</h3>
                <p>Попробуйте изменить даты проживания</p>
                <button @click="clearDateFilter" class="btn-clear">Сбросить фильтры</button>
            </div>
        </section>
    `,
    props: ['rooms', 'checkInDate', 'checkOutDate'],
    computed: {
        appliedDates() {
            return this.checkInDate && this.checkOutDate;
        },
        nightsCount() {
            if (!this.checkInDate || !this.checkOutDate) return 0;
            const diffTime = Math.abs(this.checkOutDate - this.checkInDate);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        },
        filteredRooms() {
            if (!this.appliedDates) {
                return this.rooms;
            }
            
            return this.rooms.filter(room => {
                return this.isRoomAvailable(room);
            });
        }
    },
    methods: {
        selectRoom(room) {
            this.$emit('select-room', room);
        },
        formatPrice(price) {
            return price.toLocaleString('ru-RU');
        },
        formatDate(date) {
            if (!date) return '';
            return date.toLocaleDateString('ru-RU');
        },
        clearDateFilter() {
            this.$emit('clear-dates');
        },
        isRoomAvailable(room) {
            if (!room.bookings || room.bookings.length === 0) return true;
            if (!this.checkInDate || !this.checkOutDate) return true;
            
            const checkIn = new Date(this.checkInDate);
            const checkOut = new Date(this.checkOutDate);
            
            return !room.bookings.some(booking => {
                const bookingCheckIn = new Date(booking.checkIn);
                const bookingCheckOut = new Date(booking.checkOut);
                
                return (checkIn >= bookingCheckIn && checkIn < bookingCheckOut) ||
                       (checkOut > bookingCheckIn && checkOut <= bookingCheckOut) ||
                       (checkIn <= bookingCheckIn && checkOut >= bookingCheckOut);
            });
        }
    }
};

// Основное приложение Vue
createApp({
    components: {
        'room-list': RoomList,
        'room-page': {
            template: `<div>Страница номера</div>`
        },
        'booking-form': {
            template: `<div>Форма бронирования</div>`
        }
    },
    data() {
        return {
            currentView: 'room-list',
            selectedRoom: null,
            showBookingForm: false,
            mobileMenuOpen: false,
            checkInDate: null,
            checkOutDate: null,
            notification: {
                show: false,
                message: '',
                type: 'success'
            },
            quickCheckIn: this.getTomorrowDate(),
            quickCheckOut: this.getDateInNDays(2),
            quickGuests: '2 гостя',
            rooms: [
                {
                    id: 1,
                    name: "4х местный номер",
                    description: "Уютный номер для комфортного отдыха",
                    fullDescription: "Просторный и светлый номер с современным ремонтом. Идеально подходит для деловых поездок или короткого отдыха. В номере: Кровать, рабочая зона.",
                    price: 700,
                    size: 25,
                    capacity: 4,
                    beds: "1 кровать",
                    hasBalcony: false,
                    view: "Во внутренний двор",
                    rating: 4.3,
                    reviews: 42,
                    amenities: ["Кондиционер", "Wi-Fi","Чайник", "Фен"],
                    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                    gallery: [
                        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                    ],
                    bookings: [
                        { checkIn: '2024-03-10', checkOut: '2024-03-15' },
                        { checkIn: '2024-03-20', checkOut: '2024-03-25' }
                    ]
                },
                {
                    id: 2,
                    name: "6ти местный номер",
                    description: "Уютный номер для комфортного отдыха",
                    fullDescription: "Просторный номер с собственным балконом, откуда открывается прекрасный вид на город. Номер идеально подходит для романтического отдыха или отдыха с семьей. В номере: двуспальная кровать, диван, мини-бар и просторная ванная комната с ванной.",
                    price: 800,
                    size: 35,
                    capacity: 6,
                    beds: "1 кровать",
                    hasBalcony: true,
                    view: "На город",
                    rating: 4.7,
                    reviews: 28,
                    amenities: ["Кондиционер", "Телевизор", "Wi-Fi", "Мини-бар", "Сейф", "Кофемашина", "Фен", "Халаты"],
                    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                    gallery: [
                        "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                        "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                    ],
                    bookings: [
                        { checkIn: '2024-03-05', checkOut: '2024-03-12' }
                    ]
                },
                {
                    id: 3,
                    name: "11ти местный номер",
                    description: "Уютный номер для комфортного отдыха",
                    fullDescription: "Просторный двухкомнатный люкс, идеально подходящий для семейного отдыха. В номере есть отдельная спальня с двуспальной кроватью и гостиная с двумя односпальными кроватями. Просторная ванная комната с джакуззи.",
                    price: 900,
                    size: 50,
                    capacity: 11,
                    beds: "1 кровать",
                    hasBalcony: true,
                    view: "На парк",
                    rating: 4.9,
                    reviews: 15,
                    amenities: ["Кондиционер", "2 Телевизора", "Wi-Fi", "Мини-кухня", "Джакуззи", "Сейф", "Кофемашина", "Фен", "Халаты", "Тапочки"],
                    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                    gallery: [
                        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                        "https://images.unsplash.com/photo-1564078516393-cf04bd966897?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
                        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                    ],
                    bookings: []
                }
            ]
        };
    },
    computed: {
        filteredRooms() {
            return this.rooms;
        }
    },
    methods: {
        selectRoom(room) {
            this.selectedRoom = room;
            this.currentView = 'room-page';
        },
        applyQuickSearch() {
            // Применяем даты из быстрого поиска
            if (this.quickCheckIn && this.quickCheckOut) {
                this.checkInDate = new Date(this.quickCheckIn);
                this.checkOutDate = new Date(this.quickCheckOut);
                this.showNotification(`Поиск по датам: ${this.formatDate(this.checkInDate)} - ${this.formatDate(this.checkOutDate)}`, 'success');
            }
        },
        clearDates() {
            this.checkInDate = null;
            this.checkOutDate = null;
        },
        showNotification(message, type = 'success') {
            this.notification.message = message;
            this.notification.type = type;
            this.notification.show = true;
            
            setTimeout(() => {
                this.notification.show = false;
            }, 5000);
        },
        getTomorrowDate() {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow.toISOString().split('T')[0];
        },
        getDateInNDays(days) {
            const date = new Date();
            date.setDate(date.getDate() + days);
            return date.toISOString().split('T')[0];
        },
        formatDate(date) {
            if (!date) return '';
            return date.toLocaleDateString('ru-RU');
        }
    }
}).mount('#app');