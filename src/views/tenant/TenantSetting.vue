<template>
  <div class="tenant-settings container mt-4">
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <div v-else>
      <div class="settings-header mb-4">
        <h2><i class="fas fa-user-cog me-2"></i>Cài đặt tài khoản</h2>
        <p class="text-muted">Quản lý thông tin cá nhân của bạn</p>
      </div>

      <div v-if="tenant" class="settings-content">
        <div class="card">
          <div class="card-body">
            <form @submit.prevent="updateSettings" class="settings-form">
              <!-- Avatar Section -->
              <div class="text-center mb-4">
                <div class="avatar-wrapper">
                  <img :src="tenant.avatar || 'https://via.placeholder.com/150'" alt="Avatar"
                    class="rounded-circle avatar-img">
                  <div class="avatar-overlay">
                    <i class="fas fa-camera"></i>
                  </div>
                </div>
                <input type="file" ref="avatarInput" accept="image/*" class="d-none" @change="handleAvatarChange">
              </div>

              <div class="row">
                <!-- Email -->
                <div class="col-md-6 mb-3">
                  <div class="form-group">
                    <label for="email" class="form-label">
                      <i class="fas fa-envelope me-2"></i>Email
                    </label>
                    <input type="email" id="email" v-model="tenant.email" class="form-control" readonly />
                  </div>
                </div>

                <!-- Full Name -->
                <div class="col-md-6 mb-3">
                  <div class="form-group">
                    <label for="fullName" class="form-label">
                      <i class="fas fa-user me-2"></i>Họ và tên
                    </label>
                    <input type="text" id="fullName" v-model="tenant.fullName" class="form-control"
                      :class="{ 'is-invalid': errors.fullName }" />
                    <div class="invalid-feedback">{{ errors.fullName }}</div>
                  </div>
                </div>

                <!-- Phone Number -->
                <div class="col-md-6 mb-3">
                  <div class="form-group">
                    <label for="phoneNumber" class="form-label">
                      <i class="fas fa-phone me-2"></i>Số điện thoại
                    </label>
                    <input type="text" id="phoneNumber" v-model="tenant.phoneNumber" class="form-control"
                      :class="{ 'is-invalid': errors.phoneNumber }" />
                    <div class="invalid-feedback">{{ errors.phoneNumber }}</div>
                  </div>
                </div>

                <!-- Address -->
                <div class="col-md-6 mb-3">
                  <div class="form-group">
                    <label for="address" class="form-label">
                      <i class="fas fa-map-marker-alt me-2"></i>Địa chỉ
                    </label>
                    <input type="text" id="address" v-model="tenant.address" class="form-control" />
                  </div>
                </div>
              </div>

              <!-- Change Password Section -->
              <div class="password-section mt-4">
                <h5 class="mb-3">
                  <i class="fas fa-lock me-2"></i>Đổi mật khẩu
                </h5>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <div class="form-group">
                      <label for="currentPassword" class="form-label">Mật khẩu hiện tại</label>
                      <div class="input-group">
                        <input :type="showPassword ? 'text' : 'password'" id="currentPassword" v-model="currentPassword"
                          class="form-control" :class="{ 'is-invalid': errors.currentPassword }" />
                        <button type="button" class="btn btn-outline-secondary" @click="togglePassword">
                          <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                        </button>
                        <div class="invalid-feedback">{{ errors.currentPassword }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <div class="form-group">
                      <label for="newPassword" class="form-label">Mật khẩu mới</label>
                      <div class="input-group">
                        <input :type="showNewPassword ? 'text' : 'password'" id="newPassword" v-model="newPassword"
                          class="form-control" :class="{ 'is-invalid': errors.newPassword }" />
                        <button type="button" class="btn btn-outline-secondary" @click="toggleNewPassword">
                          <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                        </button>
                        <div class="invalid-feedback">{{ errors.newPassword }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Save Button -->
              <div class="text-end mt-4">
                <button type="button" class="btn btn-outline-secondary me-2" @click="resetForm">
                  <i class="fas fa-undo me-2"></i>Hủy thay đổi
                </button>
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <i class="fas fa-save me-2"></i>Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- No Tenant Data Found -->
      <div v-else class="alert alert-warning mt-4">
        <i class="fas fa-exclamation-triangle me-2"></i>
        Không tìm thấy dữ liệu tài khoản của bạn.
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import authApi from '@/apis/authApi';
import crudApi from '@/apis/crudApi';
import baseApi from '@/apis/baseApi';


export default {
  data() {
    return {
      tenant: null,
      currentPassword: '',
      newPassword: '',
      showPassword: false,
      showNewPassword: false,
      loading: false,
      errors: {
        fullName: '',
        phoneNumber: '',
        currentPassword: '',
        newPassword: ''
      }
    };
  },

  mounted() {
    this.loadTenantData();
  },

  methods: {
    async loadTenantData() {
      try {
        this.loading = true;
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        // Fetch user data using plugin::users-permissions.user
        const response = await crudApi.read('plugin::users-permissions.user', {
          email: currentUser.email
        });

        if (response.data && response.data.length > 0) {
          this.tenant = response.data[0];
          this.tenant.fullName = this.tenant.username;
          this.tenant.phoneNumber = this.tenant.phone;
        }
      } catch (error) {
        console.error('Error loading tenant data:', error);
        Swal.fire('Lỗi', 'Không thể tải thông tin tài khoản', 'error');
      } finally {
        this.loading = false;
      }
    },


    validateForm() {
      let isValid = true;
      this.errors = {
        fullName: '',
        phoneNumber: '',
        currentPassword: '',
        newPassword: ''
      };

      if (!this.tenant.fullName) {
        this.errors.fullName = 'Vui lòng nhập họ tên';
        isValid = false;
      }

      if (!this.tenant.phoneNumber) {
        this.errors.phoneNumber = 'Vui lòng nhập số điện thoại';
        isValid = false;
      } else if (!/^\d{10}$/.test(this.tenant.phoneNumber)) {
        this.errors.phoneNumber = 'Số điện thoại không hợp lệ';
        isValid = false;
      }

      if (this.newPassword && !this.currentPassword) {
        this.errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
        isValid = false;
      }

      if (this.newPassword && this.newPassword.length < 6) {
        this.errors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
        isValid = false;
      }

      return isValid;
    },

    async updateSettings() {
      if (!this.validateForm()) return;

      try {
        this.loading = true;

        const updateData = {
          fullName: this.tenant.fullName,
          username: this.tenant.fullName,
          phone: this.tenant.phoneNumber,
          phoneNumber: this.tenant.phoneNumber,
          address: this.tenant.address
        };

        if (this.newPassword) {
          // Update password if changed
          const passwordResponse = await authApi.changePassword({
            currentPassword: this.currentPassword,
            newPassword: this.newPassword
          });

          if (passwordResponse.error) {
            throw new Error(passwordResponse.error);
          }
        }

        // Update user profile
        const response = await crudApi.update(
          'plugin::users-permissions.user',
          { id: this.tenant.id },
          updateData
        );

        if (response.error) {
          throw new Error(response.error);
        }

        await Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Thông tin tài khoản của bạn đã được cập nhật!',
          confirmButtonText: 'Đóng'
        });

        // Update local storage
        localStorage.setItem('currentUser', JSON.stringify({
          ...JSON.parse(localStorage.getItem('currentUser')),
          ...updateData
        }));

        this.resetForm();
      } catch (error) {
        console.error('Error updating settings:', error);
        Swal.fire('Lỗi', error.message || 'Không thể cập nhật thông tin tài khoản', 'error');
      } finally {
        this.loading = false;
      }
    },


    resetForm() {
      this.currentPassword = '';
      this.newPassword = '';
      this.loadTenantData();
    },

    togglePassword() {
      this.showPassword = !this.showPassword;
    },

    toggleNewPassword() {
      this.showNewPassword = !this.showNewPassword;
    },

    async handleAvatarChange(event) {
      const file = event.target.files[0];
      if (file) {
        try {
          const formData = new FormData();
          formData.append('files', file);

          // Upload avatar using appropriate API endpoint
          const uploadResponse = await baseApi.post('/api/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

          if (uploadResponse.error) {
            throw new Error(uploadResponse.error);
          }

          // Update user with new avatar URL
          const avatarUrl = uploadResponse[0].url;
          await crudApi.update(
            'plugin::users-permissions.user',
            { id: this.tenant.id },
            { avatar: avatarUrl }
          );

          this.tenant.avatar = avatarUrl;
        } catch (error) {
          console.error('Error uploading avatar:', error);
          Swal.fire('Lỗi', 'Không thể cập nhật ảnh đại diện', 'error');
        }
      }
    }

    }
  };
</script>

<style scoped>
.tenant-settings {
  margin-top: 5em !important;
  min-height: 100vh;
  padding: 20px;
  background-color: #f8f9fa;
}

.settings-header h2 {
  color: #2a3f54;
  font-size: 30px;
  font-weight: 500;
  margin-bottom: 10px;
}

.card {
  border: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.avatar-wrapper {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto;
  cursor: pointer;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-overlay i {
  color: white;
  font-size: 24px;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.form-label {
  font-weight: 500;
  color: #2c3e50;
}

.form-control {
  border-radius: 8px;
  border: 1px solid #ced4da;
  padding: 10px 15px;
}

.form-control:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.input-group-text {
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

.password-section {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.alert {
  border-radius: 8px;
  padding: 15px;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

@media (max-width: 768px) {
  .tenant-settings {
    padding: 10px;
  }

  .settings-header h2 {
    font-size: 24px;
  }

  .avatar-wrapper {
    width: 120px;
    height: 120px;
  }
}
</style>
