<template>
  <div class="create-room-fast">
    <!-- Header Section -->
    <div class="header-section">
      <h3>Thêm Phòng Nhanh</h3>
      <div class="action-buttons">
        <router-link to="/landlord/room-index">
          <button type="button" class="btn btn-outline-secondary btn-sm">
            <i class="fa fa-undo me-1"></i>Quay về
          </button>
        </router-link>
        <button type="submit" class="btn btn-primary btn-sm ms-2" @click="validateAndSave">
          <i class="fa fa-save me-1"></i>Lưu
        </button>
      </div>
    </div>

    <form @submit.prevent="validateAndSave" class="form-container">
      <!-- Room Range Selection Card -->
      <div class="form-card">
        <h6 class="form-card-title">Phạm vi phòng</h6>
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Từ phòng <span class="required">*</span></label>
            <input type="number" v-model="startRoomNumber" class="form-control"
              :class="{ 'is-invalid': errors.startRoomNumber }" placeholder="Số phòng bắt đầu" />
            <div class="invalid-feedback" v-if="errors.startRoomNumber">
              {{ errors.startRoomNumber }}
            </div>
          </div>
          <div class="col-md-4">
            <label class="form-label">Đến phòng <span class="required">*</span></label>
            <input type="number" v-model="endRoomNumber" class="form-control"
              :class="{ 'is-invalid': errors.endRoomNumber }" placeholder="Số phòng kết thúc" />
            <div class="invalid-feedback" v-if="errors.endRoomNumber">
              {{ errors.endRoomNumber }}
            </div>
          </div>
          <div class="col-md-4">
            <label class="form-label">Nhà <span class="required">*</span></label>
            <select v-model="house" class="form-select" :class="{ 'is-invalid': errors.house }">
              <option value="" disabled>Chọn nhà</option>
              <option v-for="house in houses" :key="house.id" :value="house.id">{{ house.name }}</option>
            </select>
            <div class="invalid-feedback" v-if="errors.house">{{ errors.house }}</div>
          </div>
        </div>
      </div>

      <!-- Room Specifications Card -->
      <div class="form-card">
        <h6 class="form-card-title">Thông số phòng</h6>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Kích thước <span class="required">*</span></label>
            <div class="input-group">
              <input type="number" v-model="length" class="form-control" :class="{ 'is-invalid': errors.length }"
                placeholder="Dài" />
              <input type="number" v-model="width" class="form-control" :class="{ 'is-invalid': errors.width }"
                placeholder="Rộng" />
              <span class="input-group-text">m</span>
            </div>
            <div class="invalid-feedback" v-if="errors.length || errors.width">
              Vui lòng nhập kích thước hợp lệ
            </div>
          </div>
          <div class="col-md-3">
            <label class="form-label">Đơn giá <span class="required">*</span></label>
            <div class="input-group">
              <input type="number" v-model="price" class="form-control" :class="{ 'is-invalid': errors.price }"
                placeholder="0" />
              <span class="input-group-text">VNĐ</span>
            </div>
            <div class="invalid-feedback" v-if="errors.price">{{ errors.price }}</div>
          </div>
          <div class="col-md-3">
            <label class="form-label">Số người tối đa <span class="required">*</span></label>
            <input type="number" v-model="maxPeople" class="form-control" :class="{ 'is-invalid': errors.maxPeople }"
              placeholder="0" />
            <div class="invalid-feedback" v-if="errors.maxPeople">{{ errors.maxPeople }}</div>
          </div>
        </div>
      </div>

      <!-- Additional Options Card -->
      <div class="form-card">
        <h6 class="form-card-title">Thông tin bổ sung</h6>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Cho thuê</label>
            <div class="rental-options">
              <div class="form-check form-switch">
                <input type="checkbox" id="male" v-model="rentableToMale" class="form-check-input" />
                <label class="form-check-label" for="male">Nam</label>
              </div>
              <div class="form-check form-switch">
                <input type="checkbox" id="female" v-model="rentableToFemale" class="form-check-input" />
                <label class="form-check-label" for="female">Nữ</label>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <label class="form-label">Mô tả thêm</label>
            <textarea v-model="description" class="form-control" rows="2"
              placeholder="Nhập mô tả chi tiết về phòng..."></textarea>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import crudApi from '@/apis/crudApi';
import Swal from 'sweetalert2';

export default {
  name: "CreateRoomFast",
  data() {
    return {
      startRoomNumber: null,
      endRoomNumber: null,
      house: "",
      price: 0,
      length: 0,
      width: 0,
      maxPeople: 0,
      rentableToMale: false,
      rentableToFemale: false,
      description: "",
      houses: [],
      rooms: [], // Danh sách các phòng để kiểm tra trùng lặp
      errors: {}
    };
  },
  async mounted() {
    await this.loadHouses();
    await this.loadRooms();
    const houseName = this.$route.query.houseName;
    if (houseName) {
      const house = this.houses.find(h => h.name == houseName);
      if (house) {
        this.house = house.id;
      }
    }
  },
  methods: {
    async loadHouses() {
      try {
        // Lấy thông tin user đang đăng nhập
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (!currentUser?.id || currentUser.role !== 'landlord') {
          throw new Error('Invalid user or not a landlord');
        }

        // Fetch tất cả nhà
        const houses = await crudApi.read('api::home.home', {
            landlordId: {
              id: {
                $eq: currentUser.id
              }
            }
        });

        const allHouses = houses.data;

        // Lọc nhà theo landlordId
        this.houses = allHouses;

        // Nếu có query parameter houseName, tìm và set house tương ứng
        const houseName = this.$route.query.houseName;
        if (houseName) {
          const house = this.houses.find(h => h.name == houseName);
          if (house) {
            this.house = house.id;
          }
        }

      } catch (error) {
        console.error('Error loading houses:', error);
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Không thể tải danh sách nhà."
        });
      }
    },
    async loadRooms() {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (!currentUser?.id) {
          throw new Error('User not found');
        }

        let rooms = [];
        for(let house of this.houses){
          for(let room of house.roomId){
            rooms.push({...room, houseId: house.id});
          }
        }
        this.rooms = rooms;

      } catch (error) {
        console.error('Error loading rooms:', error);
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Không thể tải danh sách phòng."
        });
      }
    },

    validateAndSave() {
      this.errors = {};
      if (!this.startRoomNumber || !this.endRoomNumber || this.startRoomNumber > this.endRoomNumber) {
        this.errors.startRoomNumber = "Số phòng bắt đầu phải nhỏ hơn hoặc bằng số phòng kết thúc.";
        return;
      }

      if (!this.house) {
        this.errors.house = "Vui lòng chọn nhà.";
      }
      if (!this.price || this.price <= 0) {
        this.errors.price = "Vui lòng nhập đơn giá hợp lệ.";
      }
      if (!this.length || this.length <= 0) {
        this.errors.length = "Vui lòng nhập chiều dài hợp lệ.";
      }
      if (!this.width || this.width <= 0) {
        this.errors.width = "Vui lòng nhập chiều rộng hợp lệ.";
      }
      if (!this.maxPeople || this.maxPeople <= 0) {
        this.errors.maxPeople = "Vui lòng nhập số người hợp lệ.";
      }

      // Kiểm tra trùng lặp số phòng
      for (let roomNumber = this.startRoomNumber; roomNumber <= this.endRoomNumber; roomNumber++) {
        if (this.isRoomNumberDuplicate(roomNumber)) {
          this.errors.roomNumber = `Phòng số ${roomNumber} đã tồn tại trong nhà được chọn.`;
          Swal.fire({
            icon: "error",
            title: "Lỗi!",
            text: `Phòng số ${roomNumber} đã tồn tại trong nhà được chọn.`,
          });
          return;
        }
      }

      if (Object.keys(this.errors).length == 0) {
        this.saveRooms();
      }
    },

    isRoomNumberDuplicate(roomNumber) {
      return this.rooms.some(
        (room) => room.roomNumber == roomNumber.toString() && room.houseId == this.house
      );
    },

    async saveRooms() {
      // Lấy thông tin chủ trọ đang đăng nhập
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser?.id) {
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Không tìm thấy thông tin chủ trọ!"
        });
        return;
      }

      for (let roomNumber = this.startRoomNumber; roomNumber <= this.endRoomNumber; roomNumber++) {
        const room = {
          roomNumber: roomNumber.toString(),
          houseId: this.house,
          price: this.price,
          length: this.length,
          width: this.width,
          maxPeople: this.maxPeople,
          rentableToMale: this.rentableToMale,
          rentableToFemale: this.rentableToFemale,
          description: this.description,
          // Thêm các trường mới
          landlordId: currentUser.id,
          isRented: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        try {
          const response = await crudApi.create("api::room.room", room);
          if (response.error) {
            throw new Error(`Không thể lưu phòng số ${roomNumber}`);
          }
        } catch (error) {
          console.error('Error saving room:', error);
          Swal.fire({
            icon: "error",
            title: "Lỗi!",
            text: `Không thể lưu phòng số ${roomNumber}. ${error.message}`
          });
          return;
        }
      }

      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Các phòng đã được lưu thành công!"
      }).then(() => {
        this.$router.push("/landlord/room-index");
      });
    },
  }
};
</script>

<style scoped>
.create-room-fast {
  max-width: 1200px;
  margin: 3rem auto;
  padding: 0 1rem;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.header-section h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.form-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-card-title {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #eee;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.form-control,
.form-select {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
}

.form-control:focus,
.form-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.input-group-text {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 0.875rem;
}

.required {
  color: #ef4444;
  margin-left: 2px;
}

.invalid-feedback {
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.rental-options {
  display: flex;
  gap: 2rem;
}

.form-check-input {
  cursor: pointer;
}

.form-check-label {
  font-size: 0.875rem;
  color: #4a5568;
  cursor: pointer;
}

.btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.btn-primary:hover {
  background-color: #2563eb;
  border-color: #2563eb;
}

.btn-outline-secondary {
  color: #64748b;
  border-color: #e2e8f0;
}

.btn-outline-secondary:hover {
  background-color: #f1f5f9;
  color: #1e293b;
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .action-buttons {
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 0.5rem;
  }

  .form-card {
    padding: 1rem;
  }
}
</style>