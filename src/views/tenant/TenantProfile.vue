<template>
  <div class="profile-container">
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <div v-else>
      <!-- Header Section -->
      <div class="profile-header mb-4">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2><i class="fas fa-user-circle me-2"></i>Hồ sơ của tôi</h2>
            <p class="text-muted">Quản lý thông tin cá nhân của bạn</p>
          </div>
          <div class="action-buttons">
            <button v-if="isEditing" class="btn btn-outline-secondary me-2" @click="cancelEdit">
              <i class="fas fa-times me-1"></i>Hủy
            </button>
            <button v-if="isEditing" class="btn btn-success" @click="saveProfile" :disabled="!isFormValid || isSaving">
              <i class="fas fa-check me-1"></i>{{ isSaving ? 'Đang lưu...' : 'Lưu' }}
            </button>
            <button v-else class="btn btn-primary" @click="toggleEditMode">
              <i class="fas fa-edit me-1"></i>Chỉnh sửa
            </button>
          </div>
        </div>
      </div>

      <form @submit.prevent="saveProfile">
        <!-- Avatar Section -->
        <div class="text-center mb-4">
          <div class="avatar-wrapper">
            <img :src="profile.image || defaultAvatar" class="profile-avatar" alt="Avatar" @error="handleImageError" />
            <div v-if="isEditing" class="avatar-overlay" @click="triggerFileInput">
              <i class="fas fa-camera"></i>
              <span>Thay đổi ảnh</span>
            </div>
          </div>
          <input type="file" ref="fileInput" class="d-none" accept="image/*" @change="onFileChange" />
        </div>

        <!-- Personal Information -->
        <div class="section">
          <h5><i class="fas fa-info-circle me-2"></i>Thông tin cá nhân</h5>
          <div class="row g-3">
            <div class="col-md-6">
              <div class="form-group">
                <label for="fullName" class="form-label required">Họ và tên</label>
                <input type="text" v-model.trim="profile.fullName" id="fullName" class="form-control"
                  :class="{ 'is-invalid': errors.fullName }" :readonly="!isEditing" />
                <div class="invalid-feedback">{{ errors.fullName }}</div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-group">
                <label for="identityCard" class="form-label required">CMND/CCCD</label>
                <input type="text" v-model.trim="profile.identityCard" id="identityCard" class="form-control"
                  :class="{ 'is-invalid': errors.identityCard }" :readonly="!isEditing" />
                <div class="invalid-feedback">{{ errors.identityCard }}</div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label required">Giới tính</label>
                <div class="gender-options">
                  <div class="form-check form-check-inline">
                    <input type="radio" v-model="profile.gender" id="male" value="Nam" class="form-check-input"
                      :disabled="!isEditing" />
                    <label for="male" class="form-check-label">Nam</label>
                  </div>
                  <div class="form-check form-check-inline">
                    <input type="radio" v-model="profile.gender" id="female" value="Nữ" class="form-check-input"
                      :disabled="!isEditing" />
                    <label for="female" class="form-check-label">Nữ</label>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-group">
                <label for="phoneNumber" class="form-label required">Điện thoại</label>
                <input type="tel" v-model.trim="profile.phoneNumber" id="phoneNumber" class="form-control"
                  :class="{ 'is-invalid': errors.phoneNumber }" :readonly="!isEditing" />
                <div class="invalid-feedback">{{ errors.phoneNumber }}</div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-group">
                <label for="email" class="form-label required">Email</label>
                <input type="email" v-model.trim="profile.email" id="email" class="form-control" readonly />
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-group">
                <label for="birthDate" class="form-label required">Ngày sinh</label>
                <input type="date" v-model="profile.birthDate" id="birthDate" class="form-control"
                  :class="{ 'is-invalid': errors.birthDate }" :readonly="!isEditing" />
                <div class="invalid-feedback">{{ errors.birthDate }}</div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-group">
                <label for="address" class="form-label required">Địa chỉ thường trú</label>
                <input type="text" v-model.trim="profile.address" id="address" class="form-control"
                  :class="{ 'is-invalid': errors.address }" :readonly="!isEditing" />
                <div class="invalid-feedback">{{ errors.address }}</div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-group">
                <label for="licensePlate" class="form-label">Biển số xe</label>
                <input type="text" v-model.trim="profile.licensePlate" id="licensePlate" class="form-control"
                  :readonly="!isEditing" />
              </div>
            </div>
          </div>
        </div>

        <!-- Rental Information -->
        <div class="section">
          <h5><i class="fas fa-home me-2"></i>Thông tin thuê phòng</h5>
          <div class="row g-3">
            <div class="col-md-6">
              <div class="form-group">
                <label for="houseName" class="form-label">Tên nhà trọ</label>
                <input type="text" v-model="profile.houseName" id="houseName" class="form-control" readonly />
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-group">
                <label for="houseAddress" class="form-label">Địa chỉ nhà trọ</label>
                <input type="text" v-model="profile.houseAddress" id="houseAddress" class="form-control" readonly />
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-group">
                <label for="roomNumber" class="form-label">Số phòng</label>
                <input type="text" v-model="profile.roomNumber" id="roomNumber" class="form-control" readonly />
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-group">
                <label for="rentalCost" class="form-label">Tiền thuê phòng</label>
                <div class="input-group">
                  <input type="text" v-model="formattedRentalCost" id="rentalCost" class="form-control" readonly />
                  <span class="input-group-text">VNĐ</span>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-group">
                <label for="startDate" class="form-label">Ngày bắt đầu thuê</label>
                <input type="date" v-model="profile.startDate" id="startDate" class="form-control" readonly />
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-group">
                <label for="contractEndDate" class="form-label">Ngày kết thúc hợp đồng</label>
                <input type="date" v-model="profile.contractEndDate" id="contractEndDate" class="form-control"
                  readonly />
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-group">
                <label for="paymentCycle" class="form-label">Kỳ thanh toán</label>
                <select v-model="profile.paymentCycle" id="paymentCycle" class="form-select" :disabled="!isEditing">
                  <option value="Kỳ 30">Kỳ 30</option>
                  <option value="Kỳ 15">Kỳ 15</option>
                </select>
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-group">
                <label for="deposit" class="form-label">Tiền đặt cọc</label>
                <div class="input-group">
                  <input type="text" v-model="formattedDeposit" id="deposit" class="form-control" readonly />
                  <span class="input-group-text">VNĐ</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Information -->
        <div class="section">
          <h5><i class="fas fa-plus-circle me-2"></i>Thông tin bổ sung</h5>
          <div class="row g-3">
            <div class="col-md-12">
              <div class="form-group">
                <label for="notes" class="form-label">Ghi chú khác</label>
                <textarea v-model="profile.notes" id="notes" class="form-control" rows="4"
                  :readonly="!isEditing"></textarea>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>

    <!-- Unsaved Changes Modal -->
    <div class="modal fade" id="unsavedChangesModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn hủy không?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Không</button>
            <button type="button" class="btn btn-primary" @click="confirmCancel">Có</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import { Modal } from 'bootstrap';
import crudApi from '@/apis/crudApi';

export default {
  data() {
    return {
      loading: true,
      isSaving: false,
      isEditing: false,
      hasChanges: false,
      defaultAvatar: '/default-avatar.png',
      profile: {
        id: null,
        fullName: '',
        identityCard: '',
        phoneNumber: '',
        email: '',
        birthDate: '',
        address: '',
        gender: 'Nam',
        licensePlate: '',
        roomNumber: '',
        rentalCost: '',
        deposit: '',
        startDate: '',
        contractEndDate: '',
        paymentCycle: 'Kỳ 30',
        notes: '',
        image: null,
        houseName: '',
        houseAddress: '',
      },
      originalProfile: null,
      errors: {
        fullName: '',
        identityCard: '',
        phoneNumber: '',
        birthDate: '',
        address: '',
      },
      unsavedChangesModal: null,
    };
  },

  computed: {
    isFormValid() {
      return !Object.values(this.errors).some(error => error) &&
        this.profile.fullName &&
        this.profile.identityCard &&
        this.profile.phoneNumber &&
        this.profile.birthDate &&
        this.profile.address;
    },

    formattedRentalCost() {
      return this.formatCurrency(this.profile.rentalCost);
    },

    formattedDeposit() {
      return this.formatCurrency(this.profile.deposit);
    }
  },

  watch: {
    profile: {
      handler(newVal) {
        if (this.originalProfile) {
          this.hasChanges = JSON.stringify(newVal) !== JSON.stringify(this.originalProfile);
        }
        this.validateForm();
      },
      deep: true
    }
  },

  async mounted() {
    try {
      await this.loadProfile();
      this.unsavedChangesModal = new Modal(document.getElementById('unsavedChangesModal'));
    } catch (error) {
      console.error('Error initializing profile:', error);
      Swal.fire('Lỗi', 'Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.', 'error');
    } finally {
      this.loading = false;
    }
  },

  methods: {
    async loadProfile() {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        // Fetch customer data
        const customersResponse = await crudApi.read('api::customer.customer', {
          email: currentUser.email
          // populate: ['house'] // Thêm populate để lấy thông tin nhà
        });

        if (customersResponse.data && customersResponse.data.length > 0) {
          const customerData = customersResponse.data[0];
          const hourseRes = await crudApi.read('api::home.home', {
            id: customerData.houseId});
          const houseData = hourseRes.data[0];

          this.profile = {
            id: customerData.id,
            fullName: customerData.fullName,
            identityCard: customerData.identityCard,
            phoneNumber: customerData.phoneNumber1,
            email: customerData.email,
            birthDate: customerData.birthDate,
            address: customerData.address,
            gender: customerData.gender || 'Nam',
            licensePlate: customerData.licensePlate,
            roomNumber: customerData.roomNumber,
            rentalCost: customerData.rentalCost,
            deposit: customerData.deposit,
            startDate: customerData.startDate,
            contractEndDate: customerData.contracts?.[0]?.contractEndDate,
            paymentCycle: customerData.paymentCycle || 'Kỳ 30',
            notes: customerData.notes,
            image: customerData.image || this.defaultAvatar,
            houseName: houseData?.name,
            houseAddress: houseData ? `${houseData.address}, ${houseData.ward}, ${houseData.district}, ${houseData.city}` : ''
          };

          this.originalProfile = { ...this.profile };
        } 
      } catch (error) {
        console.error('Error loading profile:', error);
        throw error;
      }
    },


    validateForm() {
      // Reset errors
      Object.keys(this.errors).forEach(key => this.errors[key] = '');

      // Validate fullName
      if (!this.profile.fullName) {
        this.errors.fullName = 'Vui lòng nhập họ và tên';
      }

      // Validate identityCard
      if (!this.profile.identityCard) {
        this.errors.identityCard = 'Vui lòng nhập CMND/CCCD';
      } else if (!/^\d{9,12}$/.test(this.profile.identityCard)) {
        this.errors.identityCard = 'CMND/CCCD không hợp lệ';
      }

      // Validate phoneNumber
      if (!this.profile.phoneNumber) {
        this.errors.phoneNumber = 'Vui lòng nhập số điện thoại';
      } else if (!/^(0|\+84)\d{9,10}$/.test(this.profile.phoneNumber)) {
        this.errors.phoneNumber = 'Số điện thoại không hợp lệ';
      }

      // Validate birthDate
      if (!this.profile.birthDate) {
        this.errors.birthDate = 'Vui lòng chọn ngày sinh';
      } else {
        const birthDate = new Date(this.profile.birthDate);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18) {
          this.errors.birthDate = 'Bạn phải đủ 18 tuổi';
        }
      }

      // Validate address
      if (!this.profile.address) {
        this.errors.address = 'Vui lòng nhập địa chỉ';
      }
    },

    async saveProfile() {
      if (!this.isFormValid) return;

      try {
        this.isSaving = true;

        const updateData = {
            fullName: this.profile.fullName,
            identityCard: this.profile.identityCard,
            phoneNumber1: this.profile.phoneNumber,
            birthDate: this.profile.birthDate,
            address: this.profile.address,
            gender: this.profile.gender,
            licensePlate: this.profile.licensePlate,
            notes: this.profile.notes,
            image: this.profile.image,
            paymentCycle: this.profile.paymentCycle
        };

        const response = await crudApi.update('api::customer.customer', {id: this.profile.id}, updateData);

        if (response.error) {
          throw new Error(response.error);
        }

        this.originalProfile = { ...this.profile };
        this.hasChanges = false;

        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Hồ sơ đã được cập nhật!',
          timer: 1500,
          showConfirmButton: false
        });

        this.isEditing = false;
      } catch (error) {
        console.error('Error saving profile:', error);
        Swal.fire('Lỗi', 'Không thể lưu hồ sơ. Vui lòng thử lại sau.', 'error');
      } finally {
        this.isSaving = false;
      }
    },

    async handleImageUpload(file) {
      try {
        const formData = new FormData();
        formData.append('files', file);

        const response = await crudApi.upload(formData);

        if (response.data && response.data[0]) {
          return response.data[0].url;
        }
        return null;
      } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
      }
    },

    async onFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          Swal.fire('Lỗi', 'Kích thước ảnh không được vượt quá 5MB', 'error');
          return;
        }

        try {
          const imageUrl = await this.handleImageUpload(file);
          if (imageUrl) {
            this.profile.image = imageUrl;
          }
        } catch (error) {
          Swal.fire('Lỗi', 'Không thể tải lên ảnh. Vui lòng thử lại sau.', 'error');
        }
      }
    },

    toggleEditMode() {
      if (!this.isEditing) {
        this.isEditing = true;
        this.originalProfile = { ...this.profile };
      }
    },

    cancelEdit() {
      if (this.hasChanges) {
        this.unsavedChangesModal.show();
      } else {
        this.confirmCancel();
      }
    },

    confirmCancel() {
      this.profile = { ...this.originalProfile };
      this.isEditing = false;
      this.hasChanges = false;
      this.unsavedChangesModal.hide();
    },

    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    handleImageError(e) {
      e.target.src = this.defaultAvatar;
    },

    formatCurrency(value) {
      if (!value) return '0';
      return new Intl.NumberFormat('vi-VN').format(value);
    }
  },

  beforeUnmount() {
    if (this.unsavedChangesModal) {
      this.unsavedChangesModal.dispose();
    }
  }
};
</script>

<style scoped>
.profile-container {
  margin-top: 5em !important;
  padding: 20px;
  background-color: #f8f9fa;
}

.profile-header {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section {
  margin-top: 20px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.section:hover {
  transform: translateY(-2px);
}

.profile-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-overlay:hover {
  opacity: 1;
}

.form-group {
  margin-bottom: 1rem;
}

.form-control,
.form-select {
  border-radius: 8px;
  border: 1px solid #ced4da;
  padding: 10px 15px;
}

.form-control:focus,
.form-select:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.required::after {
  content: '*';
  color: red;
  margin-left: 4px;
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn:hover {
  transform: translateY(-1px);
}

.gender-options {
  display: flex;
  gap: 20px;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 10px;
  }

  .action-buttons {
    margin-top: 10px;
  }

  .profile-avatar {
    width: 120px;
    height: 120px;
  }

  .section {
    padding: 15px;
  }

  .gender-options {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
