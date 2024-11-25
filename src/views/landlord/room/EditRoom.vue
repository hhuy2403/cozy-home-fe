<template>
  <div class="edit-room">
    <!-- Header Section -->
    <div class="header-section">
      <h3>Chỉnh sửa phòng</h3>
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
            <select v-model="room.houseId" class="form-select" :class="{ 'is-invalid': errors.house }">
              <option value="" disabled>Chọn nhà</option>
              <option v-for="house in houses" :key="house.id" :value="house.id">{{ house.name }}</option>
            </select>
            <div class="invalid-feedback" v-if="errors.house">
              Vui lòng chọn nhà
            </div>
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
              <input type="number" v-model="room.length" class="form-control" :class="{ 'is-invalid': errors.length }"
                placeholder="Dài" />
              <input type="number" v-model="room.width" class="form-control" :class="{ 'is-invalid': errors.width }"
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
              <input type="number" v-model="room.price" class="form-control" :class="{ 'is-invalid': errors.price }"
                placeholder="0" />
              <span class="input-group-text">VNĐ</span>
            </div>
            <div class="invalid-feedback" v-if="errors.price">
              Vui lòng nhập đơn giá
            </div>
          </div>
          <div class="col-md-3">
            <label class="form-label">Số người tối đa <span class="required">*</span></label>
            <input type="number" v-model="room.maxPeople" class="form-control"
              :class="{ 'is-invalid': errors.maxPeople }" placeholder="0" />
            <div class="invalid-feedback" v-if="errors.maxPeople">
              Vui lòng nhập số người
            </div>
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
              <div class="form-check form-switch">
                <input type="checkbox" v-model="room.rentableToMale" class="form-check-input" id="male" />
                <label class="form-check-label" for="male">Nam</label>
              </div>
              <div class="form-check form-switch">
                <input type="checkbox" v-model="room.rentableToFemale" class="form-check-input" id="female" />
                <label class="form-check-label" for="female">Nữ</label>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <label class="form-label">Mô tả</label>
            <textarea v-model="room.description" class="form-control" rows="2" placeholder="Nhập mô tả"></textarea>
          </div>
        </div>
      </div>

      <!-- Image Upload Card -->
      <div class="form-card">
        <h6 class="form-card-title">Hình ảnh</h6>
        <div class="row">
          <div class="col-12">
            <div class="upload-container">
              <input type="file" @change="onFileChange" class="form-control" accept="image/*" />
              <small class="text-muted mt-2">
                Hỗ trợ: JPG, PNG, GIF (Tối đa 5MB)
              </small>
            </div>
            <div class="preview-container mt-3" v-if="room.imageUrl">
              <img :src="getImageUrl(room.imageUrl)" class="preview-image" alt="Room preview"
                @error="handleImageError" />
            </div>
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
  name: "EditRoom",
  data() {
    return {
      room: {
        roomNumber: "",
        houseId: "",
        price: 0,
        length: 0,
        width: 0,
        maxPeople: 0,
        rentableToMale: false,
        rentableToFemale: false,
        description: "",
        imageUrl: ""
      },
      houses: [],
      rooms: [],
      errors: {},
      selectedImage: null
    };
  },
  async mounted() {
    await this.loadHouses();
    await this.loadRooms();
    await this.loadRoomData();
},
  methods: {
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
        console.error("Không thể tải danh sách phòng:", error);
      }
    },
    getImageUrl(imageUrl) {
      // Kiểm tra nếu imageUrl là URL hợp lệ
      if (imageUrl?.startsWith('http')) {
        return imageUrl;
      }
      // Nếu không phải URL hợp lệ, trả về ảnh mặc định
      return 'https://via.placeholder.com/300x200?text=No+Image';
    },

    handleImageError(e) {
      // Khi ảnh lỗi, thay thế bằng ảnh mặc định
      e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
    },

    async loadHouses() {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

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
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Không thể tải danh sách nhà."
        });
      }
    },

    async loadRoomData() {
      const roomId = this.$route.query.roomId || this.$route.params.id; // Kiểm tra từ query hoặc params
      if (!roomId) {
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Không tìm thấy ID phòng."
        }).then(() => {
          this.$router.push('/landlord/room-index');
        });
        return;
      }

      try {
        const res = await crudApi.read('api::room.room', {
          id: {
            $eq: roomId
          }});
          if (res.error) {
            throw new Error("Không thể tải thông tin phòng.");
          }
          const room = res?.data?.[0];
          const  houseId = this.rooms.find(r => r.id == roomId)?.houseId;
          this.room = { ...room, houseId, };
          console.log(this.room);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Không thể tải thông tin phòng."
        }).then(() => {
          this.$router.push('/landlord/room-index');
        });
      }
    },

    validateAndSave() {
      this.errors = {};

      // Validate required fields
      if (!this.room.roomNumber) {
        this.errors.roomNumber = "Vui lòng nhập số phòng";
      } else if (this.isRoomNumberDuplicate()) {
        this.errors.roomNumber = "Số phòng đã tồn tại trong nhà này";
      }

      if (!this.room.houseId) this.errors.house = "Vui lòng chọn nhà";
      if (!this.room.price || this.room.price <= 0) this.errors.price = "Vui lòng nhập đơn giá hợp lệ";
      if (!this.room.length || this.room.length <= 0) this.errors.length = "Vui lòng nhập chiều dài hợp lệ";
      if (!this.room.width || this.room.width <= 0) this.errors.width = "Vui lòng nhập chiều rộng hợp lệ";
      if (!this.room.maxPeople || this.room.maxPeople <= 0) this.errors.maxPeople = "Vui lòng nhập số người hợp lệ";

      if (Object.keys(this.errors).length == 0) {
        if (this.selectedImage) {
          this.uploadImageToImgur();
        } else {
          this.saveRoom();
        }
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Cảnh báo!',
          text: 'Vui lòng kiểm tra thông tin.',
        });
      }
    },

    isRoomNumberDuplicate() {
      const currentRoomId = this.$route.query.roomId || this.$route.params.id;
      console.log(currentRoomId, this.room.roomNumber, this.room.houseId, this.rooms);
      const isDuplicate =  this.rooms.some(
        (r) =>
          r.roomNumber == this.room.roomNumber &&
          r.houseId == this.room.houseId &&
          r.id != currentRoomId // Bỏ qua phòng hiện tại đang edit
      );
      return isDuplicate;
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
      const roomId = this.$route.query.roomId || this.$route.params.id;
      try {
        // Show loading
        Swal.fire({
          title: 'Đang xử lý...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Validate imageUrl
        if (this.room.imageUrl && !this.room.imageUrl.startsWith('http')) {
          this.room.imageUrl = '';
        }

        // 1. Cập nhật thông tin phòng
        const roomResponse = await crudApi.update("api::room.room", {id: roomId}, {
              ...this.room,
              updatedAt: new Date().toISOString()
            });

        if (roomResponse.error) {
          throw new Error("Không thể cập nhật phòng.");
        }

        // 2. Kiểm tra trạng thái thuê của phòng
        if (this.room.isRented && this.room.customer) {
          // Hiển thị confirm dialog
          const confirmResult = await Swal.fire({
            icon: 'question',
            title: 'Cập nhật giá thuê',
            text: 'Phòng này đang có người thuê. Bạn có muốn cập nhật giá thuê cho khách hiện tại không?',
            showCancelButton: true,
            confirmButtonText: 'Có',
            cancelButtonText: 'Không'
          });

          if (confirmResult.isConfirmed) {
            // Cập nhật giá thuê cho khách hiện tại
            const customerUpdateResponse = await crudApi.update("api::customer.customer", {id: this.room.customer.id}, {
              ...this.room.customer,
              rentalCost: this.room.price,
              lastUpdated: new Date().toISOString()
            });

            if (customerUpdateResponse.error) {
              throw new Error("Không thể cập nhật giá thuê cho khách.");
            }
          }
        }

        // Show success message
        await Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: "Phòng đã được cập nhật thành công!",
          confirmButtonText: 'OK'
        });

        // Navigate back
        this.$router.push("/landlord/room-index");

      } catch (error) {
        console.error('Save room error:', error);

        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: error.message || "Không thể cập nhật thông tin phòng.",
          confirmButtonText: 'Đóng'
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
.edit-room {
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
  color: #2d3748;
  margin: 0;
}

.form-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-card-title {
  color: #2d3748;
  font-size: 1rem;
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
  transition: all 0.2s;
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

.rental-options {
  display: flex;
  gap: 2rem;
}

.form-switch {
  padding-left: 2.5rem;
}

.form-check-input {
  cursor: pointer;
}

.upload-container {
  border: 2px dashed #e2e8f0;
  padding: 1.5rem;
  border-radius: 6px;
  text-align: center;
}

.preview-container {
  text-align: center;
}

.preview-image {
  max-width: 300px;
  max-height: 200px;
  border-radius: 6px;
  object-fit: cover;
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