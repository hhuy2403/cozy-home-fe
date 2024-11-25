<template>
  <div class="otherfee-create">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <h2 class="header-title">
          <i class="fas fa-plus-circle me-2"></i>Thêm phát sinh
        </h2>
        <div class="header-actions">
          <button class="btn-action btn-back" @click="goBack">
            <i class="fas fa-arrow-left"></i>
            <span>Quay về</span>
          </button>
          <button class="btn-action btn-save" @click="saveFee">
            <i class="fas fa-save"></i>
            <span>Lưu</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Form Section -->
    <div class="form-container">
      <form @submit.prevent="saveFee" class="fee-form">
        <div class="form-grid">
          <!-- House Selection -->
          <div class="form-group">
            <label for="house">Nhà <span class="required">*</span></label>
            <select id="house" v-model="selectedHouse" @change="updateRooms" required>
              <option value="">Chọn nhà</option>
              <option v-for="house in houses" :key="house.id" :value="house.id">
                {{ house.name }}
              </option>
            </select>
          </div>

          <!-- Room Selection -->
          <div class="form-group">
            <label for="room">Phòng <span class="required">*</span></label>
            <select id="room" v-model="selectedRoom" :disabled="!selectedHouse" required>
              <option value="">Chọn phòng</option>
              <option v-for="room in filteredRooms" :key="room.id" :value="room.roomNumber">
                {{ room.roomNumber }}
              </option>
            </select>
          </div>

          <!-- Month/Year Selection -->
          <div class="form-group">
            <label for="monthYear">Tháng/năm <span class="required">*</span></label>
            <input type="month" id="monthYear" v-model="selectedMonthYear" required />
          </div>

          <!-- Amount Input -->
          <div class="form-group">
            <label for="amount">Số tiền <span class="required">*</span></label>
            <div class="amount-input">
              <input type="number" id="amount" v-model="amount" min="0" required />
              <span class="currency">VND</span>
            </div>
          </div>
        </div>

        <!-- Description Section -->
        <div class="form-group">
          <label for="description">Nội dung <span class="required">*</span></label>
          <textarea id="description" v-model="description" required></textarea>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import crudApi from '@/apis/crudApi';


export default {
  data() {
    return {
      currentUser: null,
      selectedHouse: "",
      selectedRoom: "",
      selectedMonthYear: new Date().toISOString().substring(0, 7),
      amount: 0,
      description: "",
      houses: [],
      rooms: [],
      error: null,
    };
  },
  computed: {
    filteredRooms() {
      return this.rooms.filter(room => room.houseId.id == this.selectedHouse);
    },
  },
  async mounted() {
    // Kiểm tra quyền truy cập trước khi load data
    if (await this.checkAccess()) {
      this.loadDataFromAPI();
    }
  },
  methods: {
    async checkAccess() {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!this.currentUser?.id || this.currentUser.role !== 'landlord') {
        await Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Bạn không có quyền truy cập trang này!'
        });
        this.$router.push('/login');
        return false;
      }
      return true;
    },
    async loadDataFromAPI() {
      try {
        Swal.fire({
          title: 'Đang tải...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Lấy danh sách nhà theo landlordId
        const houseResponse = await crudApi.read("api::home.home", {landlordId: {id: this.currentUser.id} });
        if (houseResponse.error) throw new Error('Không thể tải dữ liệu nhà.');
        this.houses = houseResponse.data;
        const houseIds = this.houses.map(house => house.id);

        // Lấy danh sách phòng và lọc theo houses của landlord
        const roomResponse = await crudApi.read("api::room.room", {houseId: {id: houseIds} });
        if (roomResponse.error) throw new Error('Không thể tải dữ liệu phòng.');
        
        // Lọc rooms theo houses của landlord
        const allRooms = roomResponse.data;
        this.rooms = allRooms;

        Swal.close();
      } catch (error) {
        console.error('Error loading data:', error);
        Swal.fire('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại sau.', 'error');
      }
    },

    validateForm() {
      if (!this.selectedHouse || !this.selectedRoom || !this.selectedMonthYear) {
        Swal.fire({
          icon: 'error',
          title: 'Thiếu thông tin!',
          text: 'Vui lòng chọn đầy đủ nhà, phòng và tháng/năm.',
        });
        return false;
      }

      if (this.amount <= 0) {
        Swal.fire({
          icon: 'error',
          title: 'Số tiền không hợp lệ!',
          text: 'Số tiền phải lớn hơn 0.',
        });
        return false;
      }

      if (!this.description.trim()) {
        Swal.fire({
          icon: 'error',
          title: 'Thiếu nội dung!',
          text: 'Vui lòng nhập nội dung phí phát sinh.',
        });
        return false;
      }

      return true;
    },


    updateRooms() {
      this.selectedRoom = ""; // Reset room selection
    },
    goBack() {
      this.$router.push('/landlord/other-fee');
    },
    async saveFee() {
      if (!this.validateForm()) return;

      const currentTime = new Date().toISOString();
      const feeData = {
        landlordId: this.currentUser.id, // Thêm landlordId
        houseId: this.selectedHouse,
        roomNumber: this.selectedRoom,
        monthYear: this.selectedMonthYear,
        amount: Number(this.amount),
        description: this.description.trim(),
        createdAt: currentTime,
        updatedAt: currentTime,
        isPaid: false // Thêm trạng thái thanh toán
      };

      try {
        Swal.fire({
          title: 'Đang lưu...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const response = await crudApi.create("api::other-fee.other-fee", feeData);
        if (response.error) throw new Error('Không thể lưu phí phát sinh.');

        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Phí phát sinh đã được lưu thành công!',
          timer: 1500,
          showConfirmButton: false
        });

        this.goBack();
      } catch (error) {
        console.error('Error saving other fee:', error);
        Swal.fire('Lỗi', 'Không thể lưu phí phát sinh. Vui lòng thử lại sau.', 'error');
      }
    },
  },
};
</script>

<style scoped>
.otherfee-create {
  max-width: 1200px;
  margin: 3rem auto;
  padding: 0 1rem;
}

/* Header Styles */
.page-header {
  background: linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(33, 147, 176, 0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

/* Button Styles */
.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-back {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-save {
  background: #4CAF50;
  color: white;
}

.btn-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

/* Form Styles */
.form-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.required {
  color: #DC2626;
}

select,
input,
textarea {
  width: 100%;
  padding: 0.625rem;
  border: 1.5px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

select:focus,
input:focus,
textarea:focus {
  border-color: #2193b0;
  box-shadow: 0 0 0 3px rgba(33, 147, 176, 0.1);
  outline: none;
}

.amount-input {
  position: relative;
}

.currency {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6B7280;
  font-size: 0.9rem;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .header-actions {
    width: 100%;
    justify-content: center;
  }

  .btn-action span {
    display: none;
  }

  .btn-action {
    padding: 0.5rem;
  }

  .form-container {
    padding: 1rem;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.otherfee-create {
  animation: fadeIn 0.3s ease-out;
}
</style>
