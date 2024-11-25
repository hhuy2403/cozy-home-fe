<template>
  <div class="create-room">
    <!-- Header Section -->
    <div class="header-section">
      <h3>Thêm Phòng Mới</h3>
      <div class="action-buttons">
        <router-link to="/landlord/room-index">
          <button type="button" class="btn btn-outline-secondary btn-sm">
            <i class="fa fa-undo me-1"></i>Quay về
          </button>
        </router-link>
        <button type="submit" class="btn btn-primary btn-sm ms-2" @click="validateAndSaveRoom">
          <i class="fa fa-save me-1"></i>Lưu
        </button>
      </div>
    </div>

    <form @submit.prevent="validateAndSaveRoom" class="form-container">
      <!-- Basic Information Card -->
      <div class="form-card">
        <h6 class="form-card-title">Thông tin cơ bản</h6>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Phòng số <span class="required">*</span></label>
            <input type="text" v-model="room.roomNumber" class="form-control"
              :class="{ 'is-invalid': errors.roomNumber }" placeholder="Nhập số phòng" />
            <div class="invalid-feedback" v-if="errors.roomNumber">{{ errors.roomNumber }}</div>
          </div>
          <div class="col-md-6">
            <label class="form-label">Nhà <span class="required">*</span></label>
            <select v-model="room.houseId" class="form-select" :class="{ 'is-invalid': errors.houseId }">
              <option value="" disabled selected>Chọn nhà</option>
              <option v-for="house in houses" :key="house.id" :value="house.id">
                {{ house.name }}
              </option>
            </select>
            <div class="invalid-feedback" v-if="errors.houseId">{{ errors.houseId }}</div>
          </div>
        </div>
      </div>

      <!-- Room Details Card -->
      <div class="form-card">
        <h6 class="form-card-title">Chi tiết phòng</h6>
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Đơn giá <span class="required">*</span></label>
            <div class="input-group">
              <input type="number" v-model="room.price" class="form-control" :class="{ 'is-invalid': errors.price }"
                placeholder="0" />
              <span class="input-group-text">VNĐ</span>
            </div>
            <div class="invalid-feedback" v-if="errors.price">{{ errors.price }}</div>
          </div>
          <div class="col-md-4">
            <label class="form-label">Kích thước <span class="required">*</span></label>
            <div class="input-group">
              <input type="number" v-model="room.length" class="form-control" :class="{ 'is-invalid': errors.length }"
                placeholder="Dài" />
              <input type="number" v-model="room.width" class="form-control" :class="{ 'is-invalid': errors.width }"
                placeholder="Rộng" />
              <span class="input-group-text">m</span>
            </div>
          </div>
          <div class="col-md-4">
            <label class="form-label">Số người tối đa <span class="required">*</span></label>
            <input type="number" v-model="room.maxPeople" class="form-control"
              :class="{ 'is-invalid': errors.maxPeople }" placeholder="0" />
            <div class="invalid-feedback" v-if="errors.maxPeople">{{ errors.maxPeople }}</div>
          </div>
        </div>
      </div>

      <!-- Additional Information Card -->
      <div class="form-card">
        <h6 class="form-card-title">Thông tin bổ sung</h6>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Cho thuê</label>
            <div class="rental-options">
              <div class="form-check form-check-inline">
                <input type="checkbox" id="male" v-model="room.rentableToMale" class="form-check-input" />
                <label class="form-check-label" for="male">Nam</label>
              </div>
              <div class="form-check form-check-inline">
                <input type="checkbox" id="female" v-model="room.rentableToFemale" class="form-check-input" />
                <label class="form-check-label" for="female">Nữ</label>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <label class="form-label">Hình ảnh</label>
            <div class="input-group">
              <input type="file" @change="onFileChange" class="form-control" />
            </div>
          </div>
          <div class="col-12">
            <label class="form-label">Mô tả thêm</label>
            <textarea v-model="room.description" class="form-control" rows="3"
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

const IMGUR_CLIENT_ID = 'fe2b60d3737c8d2';

export default {
  name: "CreateRoom",
  data() {
    return {
      room: {
        roomNumber: "",
        houseId: "", // ID của nhà để liên kết phòng
        price: 0,
        length: 0,
        width: 0,
        maxPeople: 0,
        rentableToMale: false,
        rentableToFemale: false,
        description: "",
        imageUrl: "" // Lưu URL ảnh từ Imgur
      },
      houses: [],
      rooms: [], // Danh sách phòng để kiểm tra trùng tên
      errors: {},
      selectedImage: null
    };
  },
  async mounted() {
    if (!await this.checkAccess()) return;

    await this.loadHouses();
    await this.loadRooms();

    const houseName = this.$route.query.houseName;
    if (houseName) {
      const house = this.houses.find(h => h.name == houseName);
      if (house) {
        this.room.houseId = house.id;
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
        const response = await crudApi.read('api::home.home', {
            landlordId: {
              id: {
                $eq: currentUser.id
              }
            }
        });

        if (response.error) {
          throw new Error("Không thể tải danh sách nhà.");
        }

        const allHouses = response.data;

        // Lọc nhà theo landlordId
        this.houses = allHouses;

        // Nếu có query parameter houseName, tìm và set house tương ứng
        const houseName = this.$route.query.houseName;
        if (houseName) {
          const house = this.houses.find(h => h.name == houseName);
          if (house) {
            this.room.houseId = house.id;
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

    async checkAccess() {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser?.id || currentUser.role !== 'landlord') {
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Bạn không có quyền truy cập trang này!"
        }).then(() => {
          this.$router.push('/login');
        });
        return false;
      }
      return true;
    },

    validateAndSaveRoom() {
      this.errors = {};
      this.validateRoom();

      if (Object.keys(this.errors).length == 0) {
        if (this.selectedImage) {
          this.uploadImageToImgur();
        } else {
          this.saveRoom();
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Vui lòng kiểm tra thông tin."
        });
      }
    },

    validateRoom() {
      if (!this.room.roomNumber) {
        this.errors.roomNumber = "Vui lòng nhập số phòng.";
      } else if (this.isRoomNumberDuplicate()) {
        this.errors.roomNumber = "Số phòng đã tồn tại trong nhà này.";
      }

      if (!this.room.houseId) this.errors.houseId = "Vui lòng chọn nhà.";
      if (!this.room.price || this.room.price <= 0) this.errors.price = "Đơn giá không hợp lệ.";
      if (!this.room.length || this.room.length <= 0) this.errors.length = "Chiều dài không hợp lệ.";
      if (!this.room.width || this.room.width <= 0) this.errors.width = "Chiều rộng không hợp lệ.";
      if (!this.room.maxPeople || this.room.maxPeople <= 0) this.errors.maxPeople = "Số lượng người không hợp lệ.";
    },

    isRoomNumberDuplicate() {
      return this.rooms.some(
        (r) => r.roomNumber == this.room.roomNumber && r.houseId == this.room.houseId
      );
    },

    async uploadImageToImgur() {
      try {
        const formData = new FormData();
        formData.append("image", this.selectedImage);

        const response = await fetch("https://api.imgur.com/3/image", {
          method: "POST",
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
          },
          body: formData
        });

        const result = await response.json();
        if (result.success) {
          this.room.imageUrl = result.data.link;
          this.saveRoom();
        } else {
          throw new Error("Tải ảnh lên Imgur thất bại.");
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Không thể tải ảnh lên Imgur."
        });
      }
    },

    async saveRoom() {
      try {
        // Lấy thông tin chủ trọ đang đăng nhập
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser?.id) {
          throw new Error('Không tìm thấy thông tin chủ trọ!');
        }

        // Tạo object phòng với landlordId
        const roomData = {
          ...this.room,
          landlordId: currentUser.id,
          isRented: false, // Thêm trạng thái phòng mặc định
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const response = await crudApi.create("api::room.room", roomData);

        if (!response.error) {
          Swal.fire({
            icon: "success",
            title: "Thành công!",
            text: "Phòng đã được lưu thành công!"
          }).then(() => {
            this.$router.push("/landlord/room-index");
          });
        } else {
          throw new Error("Không thể lưu phòng.");
        }
      } catch (error) {
        console.error('Error saving room:', error);
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: error.message || "Không thể lưu phòng."
        });
      }
    },

    onFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedImage = file;
      }
    }
  }
};
</script>

<style scoped>
.create-room {
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
  gap: 1rem;
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
