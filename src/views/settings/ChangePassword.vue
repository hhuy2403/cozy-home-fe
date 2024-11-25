<template>
  <div class="container mt-5">
    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang xử lý...</span>
      </div>
    </div>

    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h2 class="m-0">Thay đổi mật khẩu</h2>
        <div>
          <button type="button" class="btn btn-sm btn-success me-2" @click="handleSubmit" :disabled="isLoading">
            <i class="fas fa-save me-1"></i> Lưu thay đổi
          </button>
          <button type="button" class="btn btn-sm btn-secondary" @click="openForgotPasswordModal" :disabled="isLoading">
            <i class="fas fa-unlock-alt me-1"></i> Quên mật khẩu
          </button>
        </div>
      </div>

      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <!-- Current Password -->
          <div class="mb-4">
            <label for="currentPassword" class="form-label fw-bold">
              Mật khẩu hiện tại *
            </label>
            <div class="input-group">
              <input :type="showCurrentPassword ? 'text' : 'password'" class="form-control" id="currentPassword"
                v-model="currentPassword" required :class="{ 'is-invalid': currentPasswordError }"
                placeholder="Nhập mật khẩu hiện tại" autocomplete="current-password" />
              <button type="button" class="toggle-password" @click="showCurrentPassword = !showCurrentPassword"
                :title="showCurrentPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'">
                <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div class="invalid-feedback" v-if="currentPasswordError">
              <i class="fas fa-exclamation-circle me-1"></i>
              {{ currentPasswordError }}
            </div>
          </div>

          <!-- New Password -->
          <div class="mb-4">
            <label for="newPassword" class="form-label fw-bold">
              Mật khẩu mới *
            </label>
            <div class="input-group">
              <input :type="showNewPassword ? 'text' : 'password'" class="form-control" id="newPassword"
                v-model="newPassword" required :class="{ 'is-invalid': newPasswordError }" @input="validateNewPassword"
                placeholder="Nhập mật khẩu mới" autocomplete="new-password" />
              <button type="button" class="toggle-password" @click="showNewPassword = !showNewPassword"
                :title="showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'">
                <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div class="invalid-feedback" v-if="newPasswordError">
              <i class="fas fa-exclamation-circle me-1"></i>
              {{ newPasswordError }}
            </div>

            <!-- Password Requirements -->
            <div class="password-strength mt-2">
              <p class="text-muted mb-2">Yêu cầu mật khẩu:</p>
              <div class="password-strength-item" :class="{ 'text-success': hasMinLength, 'text-danger': !hasMinLength }">
                <i :class="hasMinLength ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                <span>Tối thiểu 8 ký tự</span>
              </div>
              <div class="password-strength-item" :class="{ 'text-success': hasUpperCase, 'text-danger': !hasUpperCase }">
                <i :class="hasUpperCase ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                <span>Ít nhất 1 chữ viết hoa</span>
              </div>
              <div class="password-strength-item" :class="{ 'text-success': hasNumber, 'text-danger': !hasNumber }">
                <i :class="hasNumber ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                <span>Ít nhất 1 chữ số</span>
              </div>
              <div class="password-strength-item"
                :class="{ 'text-success': hasSpecialChar, 'text-danger': !hasSpecialChar }">
                <i :class="hasSpecialChar ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                <span>Ít nhất 1 ký tự đặc biệt (!@#$%^&*)</span>
              </div>
            </div>
          </div>

          <!-- Confirm Password -->
          <div class="mb-4">
            <label for="confirmPassword" class="form-label fw-bold">
              Xác nhận mật khẩu mới *
            </label>
            <div class="input-group">
              <input :type="showConfirmPassword ? 'text' : 'password'" class="form-control" id="confirmPassword"
                v-model="confirmPassword" required :class="{ 'is-invalid': confirmPasswordError }"
                placeholder="Nhập lại mật khẩu mới" autocomplete="new-password" />
              <button type="button" class="toggle-password" @click="showConfirmPassword = !showConfirmPassword"
                :title="showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'">
                <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div class="invalid-feedback" v-if="confirmPasswordError">
              <i class="fas fa-exclamation-circle me-1"></i>
              {{ confirmPasswordError }}
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Forgot Password Modal -->
    <div v-if="isForgotPasswordModalOpen" class="modal-overlay" @click.self="closeForgotPasswordModal">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Quên mật khẩu</h5>
          <button type="button" class="btn-close" @click="closeForgotPasswordModal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>Vui lòng nhập email để lấy lại mật khẩu:</p>
          <div class="form-group">
            <input type="email" class="form-control" v-model="forgotPasswordEmail" placeholder="Nhập email của bạn"
              :class="{ 'is-invalid': forgotPasswordError }" :disabled="isLoading" />
            <div class="invalid-feedback" v-if="forgotPasswordError">
              <i class="fas fa-exclamation-circle me-1"></i>
              {{ forgotPasswordError }}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="handleForgotPassword" :disabled="isLoading">
            <i class="fas fa-paper-plane me-1"></i> Gửi yêu cầu
          </button>
          <button class="btn btn-secondary" @click="closeForgotPasswordModal" :disabled="isLoading">
            <i class="fas fa-times me-1"></i> Đóng
          </button>
        </div>
      </div>
    </div>

    <!-- Reset Password Modal -->
    <div v-if="isResetPasswordModalOpen" class="modal-overlay" @click.self="closeResetPasswordModal">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Đặt lại mật khẩu</h5>
          <button type="button" class="btn-close" @click="closeResetPasswordModal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-4">
            <label class="form-label fw-bold">
              Mật khẩu mới <span class="text-danger">*</span>
            </label>
            <div class="input-group">
              <input :type="showResetPassword ? 'text' : 'password'" class="form-control" v-model="resetPassword"
                required :class="{ 'is-invalid': resetPasswordError }" @input="validateResetPassword"
                placeholder="Nhập mật khẩu mới" />
              <button type="button" class="toggle-password" @click="showResetPassword = !showResetPassword">
                <i :class="showResetPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div class="invalid-feedback" v-if="resetPasswordError">
              <i class="fas fa-exclamation-circle me-1"></i>
              {{ resetPasswordError }}
            </div>

            <!-- Password Requirements -->
            <div class="password-strength mt-2">
              <p class="text-muted mb-2">Yêu cầu mật khẩu:</p>
              <div class="password-strength-item"
                :class="{ 'text-success': resetHasMinLength, 'text-danger': !resetHasMinLength }">
                <i :class="resetHasMinLength ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                <span>Tối thiểu 8 ký tự</span>
              </div>
              <div class="password-strength-item"
                :class="{ 'text-success': resetHasUpperCase, 'text-danger': !resetHasUpperCase }">
                <i :class="resetHasUpperCase ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                <span>Ít nhất 1 chữ viết hoa</span>
              </div>
              <div class="password-strength-item"
                :class="{ 'text-success': resetHasNumber, 'text-danger': !resetHasNumber }">
                <i :class="resetHasNumber ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                <span>Ít nhất 1 chữ số</span>
              </div>
              <div class="password-strength-item"
                :class="{ 'text-success': resetHasSpecialChar, 'text-danger': !resetHasSpecialChar }">
                <i :class="resetHasSpecialChar ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                <span>Ít nhất 1 ký tự đặc biệt (!@#$%^&*)</span>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label fw-bold">
              Xác nhận mật khẩu mới <span class="text-danger">*</span>
            </label>
            <div class="input-group">
              <input :type="showResetConfirmPassword ? 'text' : 'password'" class="form-control"
                v-model="resetConfirmPassword" required :class="{ 'is-invalid': resetConfirmPasswordError }"
                placeholder="Nhập lại mật khẩu mới" />
              <button type="button" class="toggle-password"
                @click="showResetConfirmPassword = !showResetConfirmPassword">
                <i :class="showResetConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div class="invalid-feedback" v-if="resetConfirmPasswordError">
              <i class="fas fa-exclamation-circle me-1"></i>
              {{ resetConfirmPasswordError }}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="handleResetPassword" :disabled="isLoading">
            <i class="fas fa-save me-1"></i> Lưu mật khẩu
          </button>
          <button class="btn btn-secondary" @click="closeResetPasswordModal" :disabled="isLoading">
            <i class="fas fa-times me-1"></i> Đóng
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import authApi from '@/apis/authApi';

export default {
  name: 'ChangePassword',

  data() {
    return {
      // Change Password Data
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      currentPasswordError: '',
      newPasswordError: '',
      confirmPasswordError: '',
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      hasMinLength: false,
      hasUpperCase: false,
      hasNumber: false,
      hasSpecialChar: false,

      // Forgot Password Data
      isForgotPasswordModalOpen: false,
      forgotPasswordEmail: '',
      forgotPasswordError: '',

      // Reset Password Data
      isResetPasswordModalOpen: false,
      resetPassword: '',
      resetConfirmPassword: '',
      resetPasswordError: '',
      resetConfirmPasswordError: '',
      showResetPassword: false,
      showResetConfirmPassword: false,
      resetHasMinLength: false,
      resetHasUpperCase: false,
      resetHasNumber: false,
      resetHasSpecialChar: false,
      resetToken: '',
      userId: '',

      isLoading: false,
    };
  },

  methods: {
    // Validate Methods
    validateNewPassword() {
      const password = this.newPassword;
      this.hasMinLength = password.length >= 8;
      this.hasUpperCase = /[A-Z]/.test(password);
      this.hasNumber = /[0-9]/.test(password);
      this.hasSpecialChar = /[!@#$%^&*]/.test(password);

      if (!password) {
        this.newPasswordError = 'Vui lòng nhập mật khẩu mới';
      } else if (!this.hasMinLength) {
        this.newPasswordError = 'Mật khẩu cần có ít nhất 8 ký tự';
      } else if (!this.hasUpperCase) {
        this.newPasswordError = 'Mật khẩu cần có ít nhất 1 chữ viết hoa';
      } else if (!this.hasNumber) {
        this.newPasswordError = 'Mật khẩu cần có ít nhất 1 chữ số';
      } else if (!this.hasSpecialChar) {
        this.newPasswordError = 'Mật khẩu cần có ít nhất 1 ký tự đặc biệt (!@#$%^&*)';
      } else {
        this.newPasswordError = '';
      }
    },

    validateResetPassword() {
      const password = this.resetPassword;
      this.resetHasMinLength = password.length >= 8;
      this.resetHasUpperCase = /[A-Z]/.test(password);
      this.resetHasNumber = /[0-9]/.test(password);
      this.resetHasSpecialChar = /[!@#$%^&*]/.test(password);

      if (!password) {
        this.resetPasswordError = 'Vui lòng nhập mật khẩu mới';
      } else if (!this.resetHasMinLength) {
        this.resetPasswordError = 'Mật khẩu cần có ít nhất 8 ký tự';
      } else if (!this.resetHasUpperCase) {
        this.resetPasswordError = 'Mật khẩu cần có ít nhất 1 chữ viết hoa';
      } else if (!this.resetHasNumber) {
        this.resetPasswordError = 'Mật khẩu cần có ít nhất 1 chữ số';
      } else if (!this.resetHasSpecialChar) {
        this.resetPasswordError = 'Mật khẩu cần có ít nhất 1 ký tự đặc biệt (!@#$%^&*)';
      } else {
        this.resetPasswordError = '';
      }
    },

    validateForm() {
      let isValid = true;

      if (!this.currentPassword) {
        this.currentPasswordError = 'Vui lòng nhập mật khẩu hiện tại';
        isValid = false;
      }

      this.validateNewPassword();
      if (this.newPasswordError) {
        isValid = false;
      }

      if (!this.confirmPassword) {
        this.confirmPasswordError = 'Vui lòng xác nhận mật khẩu mới';
        isValid = false;
      } else if (this.newPassword !== this.confirmPassword) {
        this.confirmPasswordError = 'Mật khẩu xác nhận không khớp';
        isValid = false;
      }

      return isValid;
    },

    validateResetForm() {
      let isValid = true;

      this.validateResetPassword();
      if (this.resetPasswordError) {
        isValid = false;
      }

      if (!this.resetConfirmPassword) {
        this.resetConfirmPasswordError = 'Vui lòng xác nhận mật khẩu mới';
        isValid = false;
      } else if (this.resetPassword !== this.resetConfirmPassword) {
        this.resetConfirmPasswordError = 'Mật khẩu xác nhận không khớp';
        isValid = false;
      }

      return isValid;
    },

    // Handle Methods
    async handleSubmit() {
      try {
        if (!this.validateForm()) return;

        this.isLoading = true;
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        // const userResponse = await fetch(
        //   `https://6725a513c39fedae05b5670b.mockapi.io/api/v1/users/${currentUser.id}`
        // );

        // if (!userResponse.ok) {
        //   throw new Error('Không thể kết nối đến server. Vui lòng thử lại sau!');
        // }

        // const userData = await userResponse.json();
        // const decodedPassword = atob(userData.password);

        // if (this.currentPassword !== decodedPassword) {
        //   this.currentPasswordError = 'Mật khẩu hiện tại không chính xác';
        //   return;
        // }

        // if (this.newPassword == this.currentPassword) {
        //   this.newPasswordError = 'Mật khẩu mới không được trùng với mật khẩu hiện tại';
        //   return;
        // }

        // const encodedNewPassword = btoa(this.newPassword);
        // const updateResponse = await fetch(
        //   `https://6725a513c39fedae05b5670b.mockapi.io/api/v1/users/${currentUser.id}`,
        //   {
        //     method: 'PUT',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //       ...userData,
        //       password: encodedNewPassword
        //     })
        //   }
        // );

        const updateResponse = await authApi.changePassword({
          "currentPassword": this.currentPassword,
          "password": this.newPassword,
          "passwordConfirmation": this.newPassword
        });

        if (updateResponse.error) {
          throw new Error('Không thể cập nhật mật khẩu. Vui lòng thử lại!');
        }

        currentUser.password = this.newPassword;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Mật khẩu của bạn đã được thay đổi.',
          confirmButtonText: 'Đóng',
          timer: 2000,
          timerProgressBar: true
        });

        this.clearForm();

      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: error.message || 'Có lỗi xảy ra. Vui lòng thử lại sau!',
          confirmButtonText: 'Đóng'
        });
      } finally {
        this.isLoading = false;
      }
    },

    async handleForgotPassword() {
      try {
        if (!this.forgotPasswordEmail) {
          this.forgotPasswordError = 'Vui lòng nhập email';
          return;
        }

        this.isLoading = true;
        this.forgotPasswordError = '';

        // Lấy thông tin currentUser từ localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        // Kiểm tra xem email có khớp với email của currentUser không
        if (!currentUser || this.forgotPasswordEmail !== currentUser.email) {
          this.forgotPasswordError = 'Email không khớp với tài khoản đang đăng nhập';
          return;
        }

        // Lấy thông tin user từ API
        const response = await fetch('https://6725a513c39fedae05b5670b.mockapi.io/api/v1/users');
        const users = await response.json();
        const user = users.find(u => u.email == this.forgotPasswordEmail);

        if (!user) {
          this.forgotPasswordError = 'Email không tồn tại trong hệ thống';
          return;
        }

        this.userId = user.id;
        this.resetToken = Math.random().toString(36).substring(2, 15);

        // Cập nhật resetToken cho user
        await fetch(
          `https://6725a513c39fedae05b5670b.mockapi.io/api/v1/users/${user.id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...user,
              resetToken: this.resetToken
            })
          }
        );

        // Hiển thị thông báo thành công
        await Swal.fire({
          icon: 'success',
          title: 'Xác nhận email thành công!',
          text: 'Vui lòng đặt lại mật khẩu mới.',
          confirmButtonText: 'Đồng ý',
          timer: 2000,
          timerProgressBar: true
        });

        this.closeForgotPasswordModal();
        this.openResetPasswordModal();

      } catch (error) {
        console.error('Error:', error);
        this.forgotPasswordError = 'Có lỗi xảy ra. Vui lòng thử lại sau!';
      } finally {
        this.isLoading = false;
      }
    },

    async handleResetPassword() {
      try {
        if (!this.validateResetForm()) return;

        this.isLoading = true;

        const updateResponse = await fetch(
          `https://6725a513c39fedae05b5670b.mockapi.io/api/v1/users/${this.userId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              password: btoa(this.resetPassword),
              resetToken: ''
            })
          }
        );

        if (!updateResponse.ok) {
          throw new Error('Không thể cập nhật mật khẩu. Vui lòng thử lại!');
        }

        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Mật khẩu đã được đặt lại thành công.',
          confirmButtonText: 'Đóng',
          timer: 2000,
          timerProgressBar: true
        });

        this.closeResetPasswordModal();

      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: error.message || 'Có lỗi xảy ra. Vui lòng thử lại sau!',
          confirmButtonText: 'Đóng'
        });
      } finally {
        this.isLoading = false;
      }
    },

    // Modal Methods
    openForgotPasswordModal() {
      this.isForgotPasswordModalOpen = true;
      this.forgotPasswordEmail = '';
      this.forgotPasswordError = '';
    },

    closeForgotPasswordModal() {
      this.isForgotPasswordModalOpen = false;
      this.forgotPasswordEmail = '';
      this.forgotPasswordError = '';
    },

    openResetPasswordModal() {
      this.isResetPasswordModalOpen = true;
      this.resetPassword = '';
      this.resetConfirmPassword = '';
      this.resetPasswordError = '';
      this.resetConfirmPasswordError = '';
    },

    closeResetPasswordModal() {
      this.isResetPasswordModalOpen = false;
      this.resetPassword = '';
      this.resetConfirmPassword = '';
      this.resetPasswordError = '';
      this.resetConfirmPasswordError = '';
      this.resetToken = '';
      this.userId = '';
    },

    // Utility Methods
    clearForm() {
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
      this.currentPasswordError = '';
      this.newPasswordError = '';
      this.confirmPasswordError = '';
      this.showCurrentPassword = false;
      this.showNewPassword = false;
      this.showConfirmPassword = false;
      this.hasMinLength = false;
      this.hasUpperCase = false;
      this.hasNumber = false;
      this.hasSpecialChar = false;
    }
  }
};
</script>

<style scoped>
/* Base Container */
.container {
  margin-top: 3em !important;
  padding: 30px;
  background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.8));
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
}

/* Card Styles */
.card {
  background: rgba(255,255,255,0.9);
  border: none;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.12);
}

.card-header {
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border-bottom: 1px solid rgba(0,0,0,0.08);
  padding: 1.75rem;
}

.card-body {
  padding: 2rem;
  background: rgba(255,255,255,0.8);
}

/* Form Elements */
.form-label {
  color: #344767;
  font-weight: 600;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.input-group {
  position: relative;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.input-group:focus-within {
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.form-control {
  border: 2px solid #e9ecef;
  border-radius: 10px;
  padding: 12px 16px;
  height: 50px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255,255,255,0.9);
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 4px rgba(13,110,253,0.15);
  background: #fff;
}

.form-control.is-invalid {
  border-color: #dc3545;
  background-image: none;
}

.toggle-password {
  position: absolute;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  right: 1px;
  top: 1px;
  border: none;
  background: transparent;
  z-index: 4;
  color: #6c757d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.toggle-password:hover {
  background: rgba(13,110,253,0.1);
  color: #0d6efd;
}

/* Password Strength Indicator */
.password-strength {
  background: rgba(248,249,250,0.8);
  border-radius: 12px;
  padding: 1.25rem;
  margin-top: 1.25rem;
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.password-strength-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.password-strength-item:last-child {
  margin-bottom: 0;
}

.password-strength-item i {
  width: 20px;
  font-size: 1.1rem;
}

.password-strength-item.text-success {
  background: rgba(25,135,84,0.1);
}

.password-strength-item.text-danger {
  background: rgba(220,53,69,0.1);
}

/* Error Messages */
.invalid-feedback {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #dc3545;
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: rgba(220,53,69,0.1);
  border-radius: 6px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9));
  border-radius: 16px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.2);
  width: 450px;
  max-width: 95%;
  animation: slideIn 0.3s ease;
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-body {
  padding: 2rem;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(0,0,0,0.08);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Button Styles */
.btn {
  height: 40px;
  padding: 0 17px;
  border-radius: 10px;
  letter-spacing: 0.5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.btn-success {
  background: linear-gradient(135deg, #198754, #157347);
  border: none;
  color: #fff;
  box-shadow: 0 4px 12px rgba(25,135,84,0.2);
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(25,135,84,0.3);
  background: linear-gradient(135deg, #157347, #146c43);
}

.btn-primary {
  background: linear-gradient(135deg, #0d6efd, #0b5ed7);
  border: none;
  color: #fff;
  box-shadow: 0 4px 12px rgba(13,110,253,0.2);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(13,110,253,0.3);
  background: linear-gradient(135deg, #0b5ed7, #0a58ca);
}

.btn-secondary {
  background: linear-gradient(135deg, #6c757d, #5c636a);
  border: none;
  color: #fff;
  box-shadow: 0 4px 12px rgba(108,117,125,0.2);
}

.btn-secondary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(108,117,125,0.3);
  background: linear-gradient(135deg, #5c636a, #4f5458);
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.spinner-border {
  width: 3.5rem;
  height: 3.5rem;
  border-width: 0.25rem;
  animation: spin 1s linear infinite;
  background: conic-gradient(from 0deg, #0d6efd, #ffffff);
  border-radius: 50%;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive Styles */
@media (max-width: 768px) {
  .container {
    padding: 15px;
  }

  .card-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1.25rem;
  }

  .card-header .btn {
    width: 100%;
  }

  .card-body {
    padding: 1.25rem;
  }

  .modal-content {
    margin: 1rem;
    width: calc(100% - 2rem);
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1.25rem;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer .btn {
    width: 100%;
  }

  .form-control {
    height: 45px;
  }

  .btn {
    height: 45px;
  }
}

/* Accessibility Improvements */
.form-control:focus,
.btn:focus,
.toggle-password:focus {
  outline: none;
  box-shadow: 0 0 0 4px rgba(13,110,253,0.25);
}

.btn-close {
  padding: 1rem;
  margin: -0.5rem -0.5rem -0.5rem auto;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background-color: rgba(0,0,0,0.1);
  border-radius: 50%;
}

.btn-close:focus {
  box-shadow: 0 0 0 4px rgba(13,110,253,0.25);
}

/* Additional Utility Classes */
.text-danger {
  color: #dc3545 !important;
}

.text-success {
  color: #198754 !important;
}

.text-muted {
  color: #6c757d !important;
}

/* Form Group Spacing */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-child {
  margin-bottom: 0;
}
</style>