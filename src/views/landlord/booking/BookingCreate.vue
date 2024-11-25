<template>
  <div class="booking-form">
    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <span>Đang xử lý...</span>
    </div>

    <!-- Header -->
    <div class="form-header">
      <div class="header-title">
        <i class="fas fa-calendar-plus"></i>
        <h1>Đặt phòng mới</h1>
      </div>
      <div class="header-actions">
        <button class="action-btn btn-sm back-btn" @click="goBack">
          <i class="fas fa-arrow-left"></i>
          <span>Quay về</span>
        </button> &nbsp;
        <button class="action-btn btn-sm save-btn" @click="saveBooking">
          <i class="fas fa-save"></i>
          <span>Lưu đặt phòng</span>
        </button>
      </div>
    </div>

    <!-- Form Content -->
    <form @submit.prevent="saveBooking" class="form-content">
      <div class="form-grid">
        <!-- Room Selection -->
        <div class="form-section">
          <h2 class="section-title">Thông tin phòng</h2>
          <div class="input-group">
            <label>Nhà</label>
            <select v-model="booking.house" @change="updateRooms">
              <option value="all">Chọn nhà</option>
              <option v-for="house in houses" :key="house.id" :value="house.name">
                {{ house.name }}
              </option>
            </select>
          </div>
          <div class="input-group required">
            <label>Phòng</label>
            <select v-model="booking.room" :disabled="booking.house == 'all'">
              <option value="">Chọn phòng</option>
              <option v-for="room in filteredRooms" :key="room.roomNumber" :value="room.roomNumber">
                {{ room.roomNumber }}
              </option>
            </select>
          </div>
        </div>

        <!-- Customer Information -->
        <div class="form-section">
          <h2 class="section-title">Thông tin khách</h2>
          <div class="input-group required">
            <label>Họ tên khách</label>
            <input type="text" v-model="booking.customerName" placeholder="Nhập họ tên">
          </div>
          <div class="input-group required">
            <label>Số điện thoại</label>
            <input type="tel" v-model="booking.phone" placeholder="Nhập số điện thoại">
          </div>
        </div>

        <!-- Booking Details -->
        <div class="form-section">
          <h2 class="section-title">Chi tiết đặt phòng</h2>
          <div class="input-group required">
            <label>Ngày đặt</label>
            <input type="date" v-model="booking.bookingDate">
          </div>
          <div class="input-group required">
            <label>Ngày nhận phòng</label>
            <input type="date" v-model="booking.expectedArrival">
          </div>
          <div class="input-group required">
            <label>Tiền cọc (VNĐ)</label>
            <input type="number" v-model="booking.deposit" placeholder="Nhập số tiền">
          </div>
        </div>

        <!-- Notes -->
        <div class="form-section full-width">
          <h2 class="section-title">Ghi chú</h2>
          <div class="input-group">
            <textarea v-model="booking.notes" rows="3" placeholder="Nhập ghi chú (nếu có)"></textarea>
          </div>
        </div>
      </div>

      <div class="required-note">
        <span class="required-star">*</span> Thông tin bắt buộc
      </div>
    </form>
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import crudApi from '@/apis/crudApi';

export default {
  data() {
    return {
      booking: {
        house: 'all',
        room: '',
        customerName: '',
        bookingDate: new Date().toISOString().split('T')[0], // Set today as default
        phone: '',
        deposit: 0,
        expectedArrival: '',
        notes: '',
        status: 'pending', // pending, confirmed, cancelled
        createdAt: new Date().toISOString()
      },
      houses: [],
      rooms: [],
      isLoading: false
    };
  },
  computed: {
    filteredRooms() {
      if (this.booking.house == 'all') return [];
      return this.rooms.filter(room => {
        return !room.isRented &&
          !room.hasBooking &&
          room.houseId.id == this.houses.find(h => h.name == this.booking.house)?.id;
      });
    }
  },
  async mounted() {
    await this.fetchHouses();
    await this.fetchRooms();
  },
  methods: {
    async fetchHouses() {
      try {
        // Lấy thông tin chủ trọ từ localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser?.id || currentUser.role !== 'landlord') {
          throw new Error('Không tìm thấy thông tin chủ trọ!');
        }

        const response = await crudApi.read("api::home.home", {landlordId: {id: currentUser.id}});

        if (response.error) {
          throw new Error('Không thể tải danh sách nhà');
        }

        const data = response.data;
        this.houses = data.map(home => ({
          id: home.id,
          name: home.name,
          landlordId: home.landlordId
        }));

      } catch (error) {
        console.error('Error fetching houses:', error);
        Swal.fire('Lỗi', error.message || 'Không thể tải danh sách nhà', 'error');
        this.$router.push('/landlord/booking-index');
      }
    },

    async fetchRooms() {
      try {
        // Lấy thông tin chủ trọ từ localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser?.id || currentUser.role !== 'landlord') {
          throw new Error('Không tìm thấy thông tin chủ trọ!');
        }

        const landlordHouseIds = this.houses.map(house => house.id);
        const response = await crudApi.read("api::room.room", {
            houseId: {
              $in: landlordHouseIds
            }
          });

        if (response.error) {
          throw new Error('Không thể tải danh sách phòng');
        }

        const data = response.data;

        // Lọc phòng theo houses của landlord
        this.rooms = data
          .map(room => ({
            id: room.id,
            roomNumber: room.roomNumber,
            houseId: room.houseId,
            isRented: room.isRented,
            hasBooking: room.hasBooking
          }));

      } catch (error) {
        console.error('Error fetching rooms:', error);
        Swal.fire('Lỗi', error.message || 'Không thể tải danh sách phòng', 'error');
        this.$router.push('/landlord/booking-index');
      }
    },

    updateRooms() {
      this.booking.room = '';
    },

    validateForm() {
      const validations = [
        { condition: this.booking.room == '', message: 'Vui lòng chọn phòng' },
        { condition: !this.booking.customerName.trim(), message: 'Vui lòng nhập họ tên khách' },
        { condition: !this.booking.bookingDate, message: 'Vui lòng chọn ngày đặt' },
        { condition: !this.booking.phone.trim(), message: 'Vui lòng nhập số điện thoại' },
        { condition: !this.booking.deposit, message: 'Vui lòng nhập tiền cọc' },
        { condition: this.booking.deposit < 0, message: 'Tiền cọc phải là số dương' },
        { condition: !this.booking.expectedArrival, message: 'Vui lòng chọn ngày dự kiến nhận phòng' },
        {
          condition: new Date(this.booking.expectedArrival) < new Date(this.booking.bookingDate),
          message: 'Ngày nhận phòng phải sau ngày đặt cọc'
        }
      ];

      for (const validation of validations) {
        if (validation.condition) {
          Swal.fire('Lỗi', validation.message, 'error');
          return false;
        }
      }
      return true;
    },

    async saveBooking() {
      if (!this.validateForm()) return;

      try {
        this.isLoading = true;

        // 1. Kiểm tra quyền truy cập
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser?.id || currentUser.role !== 'landlord') {
          throw new Error('Không có quyền thực hiện thao tác này!');
        }

        // 2. Lấy thông tin nhà và phòng được chọn
        const selectedHouse = this.houses.find(h => h.name == this.booking.house);
        if (!selectedHouse) {
          throw new Error('Không tìm thấy thông tin nhà!');
        }

        // 3. Kiểm tra nhà có thuộc chủ trọ không
        if (selectedHouse.landlordId.id !== currentUser.id) {
          throw new Error('Không có quyền đặt cọc phòng này!');
        }

        const selectedRoom = this.rooms.find(r =>
          r.roomNumber == this.booking.room &&
          r.houseId.id == selectedHouse.id
        );
        if (!selectedRoom) {
          throw new Error('Không tìm thấy thông tin phòng!');
        }

        // 4. Kiểm tra trạng thái phòng
        const roomResponse = await crudApi.read("api::room.room", { id: selectedRoom.id });
        if (roomResponse.error) {
          throw new Error('Không thể kiểm tra trạng thái phòng!');
        }
        const roomData = roomResponse.data[0];

        if (roomData.hasBooking || roomData.isRented) {
          throw new Error('Phòng này đã được đặt cọc hoặc đã có người thuê!');
        }

        // 5. Chuẩn bị dữ liệu booking
        const bookingData = {
          landlordId: currentUser.id,
          houseId: selectedHouse.id,
          houseName: selectedHouse.name,
          roomId: selectedRoom.id,
          roomNumber: selectedRoom.roomNumber,
          customerName: this.booking.customerName.trim(),
          phone: this.booking.phone.trim(),
          bookingDate: this.booking.bookingDate,
          expectedArrival: this.booking.expectedArrival,
          deposit: Number(this.booking.deposit),
          notes: this.booking.notes.trim() || '',
          status: 'pending',
          customStatus: 'pending',
          createdAt: new Date().toISOString(),
        };

        // 6. Lưu booking
        const bookingResponse = await crudApi.create("api::landlord-booking.landlord-booking", bookingData);

        if (bookingResponse.error) {
          throw new Error('Không thể lưu thông tin đặt cọc!');
        }

        // 7. Lấy ID booking vừa tạo
        const createdBooking = bookingResponse.data;

        // 8. Cập nhật trạng thái phòng
        const updatedRoomData = {
          ...roomData,
          hasBooking: true,
          currentBooking: createdBooking.id,
          lastUpdated: new Date().toISOString(),
          landlordBokingId: createdBooking.id,
        };

        const updateRoomResponse = await crudApi.update("api::room.room", {id: selectedRoom.id}, updatedRoomData);

        if (updateRoomResponse.eror) {
          // Rollback - xóa booking nếu cập nhật phòng thất bại
          await crudApi.delete("api::landlord-booking.landlord-booking", {id: createdBooking.id});
          throw new Error('Không thể cập nhật trạng thái phòng!');
        }

        // 9. Hiển thị thông báo thành công
        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Đặt cọc đã được lưu.',
          confirmButtonText: 'OK'
        });

        // 10. Chuyển hướng về trang danh sách đặt cọc
        this.$router.push('/landlord/booking-index');

      } catch (error) {
        console.error('Error saving booking:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: error.message || 'Không thể lưu đặt cọc. Vui lòng thử lại!',
          confirmButtonText: 'Đóng'
        });
      } finally {
        this.isLoading = false;
      }
    },

    goBack() {
      this.$router.go(-1);
    }
  }
};
</script>

<style scoped>
.booking-form {
  max-width: 1200px;
  margin: 3rem auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Header Styles */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-title i {
  font-size: 1.75rem;
  color: #3b82f6;
}

.header-title h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

/* Form Grid Layout */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* Form Sections */
.form-section {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 0.75rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 1.25rem;
}

/* Input Groups */
.input-group {
  margin-bottom: 1rem;
}

.input-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.input-group input,
.input-group select,
.input-group textarea {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: #ffffff;
  transition: all 0.2s;
}

.input-group input:focus,
.input-group select:focus,
.input-group textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

/* Action Buttons */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.2rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn {
  background: #3b82f6;
  color: white;
  border: none;
}

.save-btn:hover {
  background: #2563eb;
}

.back-btn {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.back-btn:hover {
  background: #e2e8f0;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Required Fields */
.required-note {
  color: #64748b;
  font-size: 0.875rem;
}

.required-star {
  color: #ef4444;
}

/* Responsive Design */
@media (max-width: 768px) {
  .booking-form {
    margin: 1rem;
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .header-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>