<template>
  <div class="modern-container">
    <!-- Header Section -->
    <div class="report-header">
      <div class="title-section">
        <i class="fas fa-hand-holding-usd"></i>
        <h2>Danh sách khách thuê đặt cọc</h2>
      </div>

      <!-- Filter Section -->
      <div class="filter-section">
        <div class="filter-group">
          <div class="filter-item">
            <label class="filter-label">
              <i class="fas fa-home"></i> Nhà
            </label>
            <select class="modern-select" v-model="selectedHouse" :disabled="isLoading">
              <option value="">Tất cả nhà</option>
              <option v-for="house in houses" :key="house.id" :value="house.name">
                {{ house.name }}
              </option>
            </select>
          </div>

          <div class="filter-item">
            <label class="filter-label">
              <i class="fas fa-door-open"></i> Phòng
            </label>
            <select class="modern-select" v-model="selectedRoom" :disabled="isLoading">
              <option value="">Tất cả phòng</option>
              <option v-for="room in filteredRooms" :key="room.roomNumber" :value="room.roomNumber">
                Phòng {{ room.roomNumber }}
              </option>
            </select>
          </div>

          <button class="search-button" @click="fetchReport" :disabled="isLoading">
            <!-- <i class="fas" :class="isLoading ? 'fa-spinner fa-spin' : 'fa-search'"></i> -->
            {{ isLoading ? 'Đang tải...' : 'Tìm kiếm' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="content-section">
      <!-- Loading Skeleton -->
      <div v-if="isLoading" class="skeleton-table">
        <div class="skeleton-header">
          <div v-for="i in 7" :key="i" class="skeleton-cell"></div>
        </div>
        <div class="skeleton-body">
          <div v-for="i in 3" :key="i" class="skeleton-row">
            <div v-for="j in 7" :key="j" class="skeleton-cell"></div>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div v-else class="table-container">
        <table class="modern-table">
          <thead>
            <tr>
              <th>Khách thuê</th>
              <th>Thông tin liên hệ</th>
              <th>Vị trí phòng</th>
              <th>Ngày đặt cọc</th>
              <th>Số tiền đặt cọc</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(customer, index) in filteredCustomers" :key="index">
              <td>
                <div class="customer-info">
                  <span class="customer-name">{{ customer.customerName }}</span>
                </div>
              </td>
              <td>
                <div class="contact-info">
                  <div><i class="fas fa-map-marker-alt"></i> {{ customer.address }}</div>
                  <div><i class="fas fa-phone"></i> {{ customer.phone }}</div>
                </div>
              </td>
              <td>
                <div class="room-info">
                  <div class="house-name">{{ customer.houseName }}</div>
                  <div class="room-number">Phòng {{ customer.roomNumber }}</div>
                </div>
              </td>
              <td>{{ customer.bookingDate }}</td>
              <td>
                <div class="deposit-amount">{{ formatCurrency(customer.deposit) }}</div>
              </td>
            </tr>
            <tr v-if="filteredCustomers.length == 0">
              <td colspan="5" class="empty-message">
                <i class="fas fa-inbox"></i>
                <span>Không có dữ liệu</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import crudApi from '@/apis/crudApi';

export default {
  name: 'ReportCustomerDeposit',

  data() {
    return {
      selectedHouse: "",
      selectedRoom: "",
      houses: [],
      rooms: [],
      customers: [],
      isLoading: false,
    };
  },

  computed: {
    filteredRooms() {
      if (!this.selectedHouse) return this.rooms;
      return this.rooms.filter(room => {
        const house = this.houses.find(h => h.id == room.houseId);
        return house && house.name == this.selectedHouse;
      });
    },

    filteredCustomers() {
      return this.customers.filter((customer) => {
        // Chỉ lấy những booking thuộc nhà và phòng của landlord
        const house = this.houses.find(h => h.id == customer.houseId.id);
        const room = this.rooms.find(r => r.id == customer.roomId.id);

        if (!house || !room) return false;

        const matchHouse = !this.selectedHouse || customer.houseName == this.selectedHouse;
        const matchRoom = !this.selectedRoom || customer.roomNumber == this.selectedRoom;

        return matchHouse && matchRoom;
      });
    },
  },

  methods: {
    async fetchData() {
      try {
        this.isLoading = true;

        // Lấy thông tin currentUser từ localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser?.id) {
          throw new Error('Không tìm thấy thông tin người dùng!');
        }

        // Fetch houses và rooms
        const housesRes = await crudApi.read("api::home.home", {landlordId: {id: currentUser.id}});
        const allHouses = housesRes.data;
        this.houses = allHouses;
        const landlordHouseIds = this.houses.map(house => house.id);

        const roomsRes = await crudApi.read("api::room.room", {houseId: {id: landlordHouseIds}});
        const allRooms = roomsRes.data;
        this.rooms = allRooms;

        await this.fetchReport();
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Không thể tải dữ liệu. Vui lòng thử lại sau!'
        });
      } finally {
        this.isLoading = false;
      }
    },

    async fetchReport() {
      try {
        this.isLoading = true;

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser?.id) {
          throw new Error('Không tìm thấy thông tin người dùng!');
        }

        // Fetch bookings
        const landlordRoomIds = this.rooms.map(room => room.id);
        const bookingsResponse = await crudApi.read("api::landlord-booking.landlord-booking", {roomId: {id: landlordRoomIds}});
        if (bookingsResponse.error) {
          throw new Error('Failed to fetch bookings');
        }
        const allBookings = bookingsResponse.data.map(i => ({ ...i, status: i.customStatus }));

        // Lấy danh sách houseIds của landlord

        // Lọc và transform bookings data
        this.customers = allBookings
          .map(booking => {
            const room = this.rooms.find(r => r.id == booking.roomId?.id);
            const house = this.houses.find(h => h.id == booking.houseId?.id);

            return {
              customerName: booking.customerName,
              address: house ? `${house.address}, ${house.ward}, ${house.district}, ${house.city}` : 'Không có',
              phone: booking.phone || 'Không có',
              houseName: house?.name || 'N/A',
              roomNumber: room?.roomNumber || 'N/A',
              bookingDate: this.formatDate(booking.bookingDate),
              deposit: booking.deposit || 0,
              houseId: booking.houseId,
              roomId: booking.roomId
            };
          });
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu báo cáo:", error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Không thể tải dữ liệu báo cáo. Vui lòng thử lại sau!'
        });
      } finally {
        this.isLoading = false;
      }
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
      } catch {
        return dateString;
      }
    },

    formatCurrency(value) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);
    },
  },

  async mounted() {
    await this.fetchData();
  },
};
</script>

<style scoped>
.modern-container {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  margin: 3rem auto;
}

.report-header {
  margin-bottom: 2rem;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.title-section i {
  font-size: 2rem;
  color: #3b82f6;
}

.title-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.filter-section {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
}

.filter-group {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.filter-item {
  flex: 1;
}

.filter-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.modern-select {
  width: 100%;
  padding: 0.625rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.modern-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-button {
  padding: 0.625rem 1.5rem;
  background: linear-gradient(to right, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.search-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.search-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Table Styles */
.table-container {
  margin-top: 1.5rem;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table th {
  background: #f9fafb;
  padding: 1rem;
  font-weight: 600;
  color: #4b5563;
  text-align: left;
}

.modern-table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.customer-info,
.contact-info,
.room-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.customer-name {
  font-weight: 500;
  color: #1f2937;
}

.contact-info i {
  width: 16px;
  color: #6b7280;
  margin-right: 0.5rem;
}

.room-info .house-name {
  color: #4b5563;
}

.room-info .room-number {
  font-weight: 500;
  color: #1f2937;
}

.deposit-amount {
  font-weight: 600;
  color: #059669;
}

.empty-message {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.empty-message i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}

/* Skeleton Loading */
.skeleton-table {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.skeleton-cell {
  height: 24px;
  background: #e5e7eb;
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .filter-group {
    flex-direction: column;
  }

  .search-button {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .modern-container {
    padding: 1rem;
    margin: 1rem;
  }

  .title-section {
    flex-direction: column;
    text-align: center;
  }

  .modern-table {
    font-size: 0.875rem;
  }
}
</style>