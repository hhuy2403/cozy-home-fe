<template>
  <div class="admin-settings container-fluid">
    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner-grow text-primary" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
        <div class="loading-text mt-2">Đang xử lý...</div>
      </div>
    </div>

    <h1 class="dashboard-title my-4">
      <i class="fas fa-cog"></i> Cấu Hình Hệ Thống
    </h1>

    <!-- Error Alert -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ error }}
      <button type="button" class="btn-close" @click="error = null"></button>
    </div>

    <!-- Settings Tabs -->
    <div class="settings-container">
      <ul class="nav nav-tabs settings-tabs mb-4">
        <li class="nav-item" v-for="tab in tabs" :key="tab.id">
          <button class="nav-link" :class="{ active: activeTab == tab.id }" @click="activeTab = tab.id">
            <i :class="tab.icon"></i> {{ tab.name }}
          </button>
        </li>
      </ul>

      <!-- Settings Content -->
      <div class="tab-content settings-content p-4">
        <!-- System Settings -->
        <div v-show="activeTab == 'system'" class="tab-pane fade show active">
          <h3 class="section-title mb-4">Thông Tin Hệ Thống</h3>
          <form @submit.prevent="saveConfig">
            <div class="row g-4">
              <div class="col-md-6">
                <div class="form-group">
                  <label for="systemName" class="form-label required">Tên hệ thống</label>
                  <input type="text" id="systemName" v-model="config.systemName" class="form-control"
                    :class="{ 'is-invalid': errors.systemName }" placeholder="Nhập tên hệ thống">
                  <div class="invalid-feedback">{{ errors.systemName }}</div>
                </div>
              </div>

              <div class="col-md-6">
                <div class="form-group">
                  <label for="contactEmail" class="form-label required">Email liên hệ</label>
                  <input type="email" id="contactEmail" v-model="config.contactEmail" class="form-control"
                    :class="{ 'is-invalid': errors.contactEmail }" placeholder="contact@example.com">
                  <div class="invalid-feedback">{{ errors.contactEmail }}</div>
                </div>
              </div>

              <div class="col-md-6">
                <div class="form-group">
                  <label for="supportPhone" class="form-label required">Số điện thoại hỗ trợ</label>
                  <input type="tel" id="supportPhone" v-model="config.supportPhone" class="form-control"
                    :class="{ 'is-invalid': errors.supportPhone }" placeholder="0123456789">
                  <div class="invalid-feedback">{{ errors.supportPhone }}</div>
                </div>
              </div>

              <div class="col-md-6">
                <div class="form-group">
                  <label for="address" class="form-label">Địa chỉ</label>
                  <input type="text" id="address" v-model="config.address" class="form-control"
                    placeholder="Nhập địa chỉ">
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Policy Settings -->
        <div v-show="activeTab == 'policy'" class="tab-pane fade show active">
          <h3 class="section-title mb-4">Chính Sách & Điều Khoản</h3>
          <div class="row g-4">
            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label">Chính sách đặt cọc</label>
                <div class="editor-container">
                  <textarea v-model="config.depositPolicy" class="form-control" rows="6"></textarea>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label">Chính sách hoàn tiền</label>
                <div class="editor-container">
                  <textarea v-model="config.refundPolicy" class="form-control" rows="6"></textarea>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label">Điều khoản sử dụng</label>
                <div class="editor-container">
                  <textarea v-model="config.termsOfService" class="form-control" rows="6"></textarea>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-group">
                <label class="form-label">Chính sách bảo mật</label>
                <div class="editor-container">
                  <textarea v-model="config.privacyPolicy" class="form-control" rows="6"></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SEO Settings -->
        <div v-show="activeTab == 'seo'" class="tab-pane fade show active">
          <h3 class="section-title mb-4">Cấu Hình SEO</h3>
          <div class="row g-4">
            <div class="col-12">
              <div class="form-group">
                <label for="metaTitle" class="form-label">Meta Title</label>
                <input type="text" id="metaTitle" v-model="config.metaTitle" class="form-control"
                  placeholder="Nhập meta title">
              </div>
            </div>

            <div class="col-12">
              <div class="form-group">
                <label for="metaKeywords" class="form-label">Meta Keywords</label>
                <input type="text" id="metaKeywords" v-model="config.metaKeywords" class="form-control"
                  placeholder="Nhập meta keywords">
              </div>
            </div>

            <div class="col-12">
              <div class="form-group">
                <label for="metaDescription" class="form-label">Meta Description</label>
                <textarea id="metaDescription" v-model="config.metaDescription" class="form-control" rows="3"
                  placeholder="Nhập meta description"></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="settings-actions mt-4 p-4 border-top">
        <div class="d-flex justify-content-end gap-3">
          <button type="button" class="btn btn-secondary" @click="resetConfig">
            <i class="fas fa-undo me-2"></i>Khôi phục mặc định
          </button>
          <button type="submit" class="btn btn-primary" @click="saveConfig" :disabled="!isFormValid || loading">
            <i class="fas fa-save me-2"></i>Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import axios from 'axios'
import Swal from 'sweetalert2'
import crudApi from '@/apis/crudApi';

export default {
  name: 'AdminSettings',

  data() {
    return {
      loading: false,
      error: null,
      activeTab: 'system',
      tabs: [
        { id: 'system', name: 'Hệ thống', icon: 'fas fa-cogs' },
        { id: 'policy', name: 'Chính sách', icon: 'fas fa-file-alt' },
        { id: 'seo', name: 'SEO', icon: 'fas fa-search' }
      ],
      config: {
        id: 1,
        systemName: '',
        contactEmail: '',
        supportPhone: '',
        address: '',
        depositPolicy: '',
        refundPolicy: '',
        termsOfService: '',
        privacyPolicy: '',
        metaTitle: '',
        metaKeywords: '',
        metaDescription: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      defaultConfig: {
        systemName: 'Hệ thống mặc định',
        contactEmail: 'contact@example.com',
        supportPhone: '0987654321',
        address: 'Địa chỉ mặc định',
        depositPolicy: 'Chính sách đặt cọc mặc định',
        refundPolicy: 'Chính sách hoàn tiền mặc định',
        termsOfService: 'Điều khoản sử dụng mặc định',
        privacyPolicy: 'Chính sách bảo mật mặc định',
        metaTitle: 'Meta Title mặc định',
        metaKeywords: 'keywords, default, system',
        metaDescription: 'Mô tả meta mặc định cho hệ thống'
      },
      errors: {
        systemName: '',
        contactEmail: '',
        supportPhone: ''
      },
      debounceTimer: null
    }
  },

  computed: {
    isFormValid() {
      return this.config.systemName &&
        this.config.contactEmail &&
        this.config.supportPhone &&
        !this.errors.systemName &&
        !this.errors.contactEmail &&
        !this.errors.supportPhone
    }
  },

  methods: {
    debounceInput(callback, wait = 500) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = setTimeout(() => {
        callback()
      }, wait)
    },

    showLoading(message = 'Đang xử lý...') {
      Swal.fire({
        title: message,
        html: '<div class="custom-loader"></div>',
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: {
          popup: 'custom-loading-popup'
        },
        didOpen: () => {
          Swal.showLoading()
        }
      })
    },

    hideLoading() {
      Swal.close()
    },

    showSuccess(message, timer = 1500) {
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: message,
        timer: timer,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      })
    },

    showSuccessNotification(message) {
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: message,
        showConfirmButton: true,
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#3085d6',
        timer: 2000,
        timerProgressBar: true,
        toast: true,
        position: 'top-end',
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      })
    },

    showError(message) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: message,
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#dc3545'
      })
    },

    async confirmAction(title, text, type = 'warning') {
      const result = await Swal.fire({
        title: title,
        text: text,
        icon: type,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Hủy',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: false
      })
      return result.isConfirmed
    },

    async fetchConfig() {
      try {
        this.showLoading('Đang tải cấu hình...');
        const response = await crudApi.read("api::setting.setting", { id: 1 });
        if (response.data) {
          this.config = { ...this.config, ...response.data };
        }
      } catch (err) {
        let errorMessage = 'Không thể tải cấu hình. Vui lòng thử lại sau.';

        if (err.response) {
          switch (err.response.status) {
            case 404:
              console.warn("Resource not found. Creating default configuration...");
              await this.createDefaultConfig();
              return;
            case 403:
              errorMessage = 'Bạn không có quyền truy cập cấu hình này.';
              break;
            case 500:
              errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
              break;
          }
        } else if (err.request) {
          errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
        }

        this.error = errorMessage;
        this.showError(this.error);
        console.error('Error fetching config:', err);
      } finally {
        this.hideLoading();
      }
    },

    async createDefaultConfig() {
      try {
        const response = await crudApi.create("api::setting.setting", {
          ...this.defaultConfig,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        this.config = { ...this.config, ...response.data };
        this.showSuccess("Đã tạo cấu hình mặc định!");
      } catch (err) {
        this.error = "Không thể tạo cấu hình mặc định.";
        this.showError(this.error);
      }
    },

    validateForm() {
      this.errors = {
        systemName: '',
        contactEmail: '',
        supportPhone: ''
      }

      let isValid = true

      // Validate system name
      if (!this.config.systemName?.trim()) {
        this.errors.systemName = 'Tên hệ thống không được để trống'
        isValid = false
      } else if (this.config.systemName.length > 100) {
        this.errors.systemName = 'Tên hệ thống không được vượt quá 100 ký tự'
        isValid = false
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!this.config.contactEmail?.trim()) {
        this.errors.contactEmail = 'Email liên hệ không được để trống'
        isValid = false
      } else if (!emailRegex.test(this.config.contactEmail)) {
        this.errors.contactEmail = 'Email không hợp lệ'
        isValid = false
      } else if (this.config.contactEmail.length > 255) {
        this.errors.contactEmail = 'Email không được vượt quá 255 ký tự'
        isValid = false
      }

      // Validate phone
      const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})\b/
      if (!this.config.supportPhone?.trim()) {
        this.errors.supportPhone = 'Số điện thoại không được để trống'
        isValid = false
      } else if (!phoneRegex.test(this.config.supportPhone)) {
        this.errors.supportPhone = 'Số điện thoại không hợp lệ (phải là số điện thoại Việt Nam)'
        isValid = false
      }

      if (!isValid) {
        this.showError('Vui lòng kiểm tra lại thông tin nhập')
      }

      return isValid
    },

    async saveConfig() {
      if (!this.validateForm()) return;

      try {
        this.showLoading('Đang lưu cấu hình...');
        const updatedConfig = {
          ...this.config,
          updatedAt: new Date().toISOString()
        };
        const response = await crudApi.update("api::setting.setting", { id: this.config.id }, updatedConfig);
        this.config = { ...this.config, ...response.data };

        // Hiển thị thông báo thành công
        this.showSuccessNotification('Lưu cấu hình thành công!');

        // Thêm hiệu ứng highlight cho các trường đã thay đổi
        this.highlightUpdatedFields();
      } catch (err) {
        if (err.response?.status == 404) {
          console.warn("Resource not found. Creating new configuration...");
          await this.createDefaultConfig();
        } else {
          this.error = "Không thể lưu cấu hình. Vui lòng thử lại sau.";
          this.showError(this.error);
        }
      } finally {
        this.hideLoading();
      }
    },

    highlightUpdatedFields() {
      const fields = ['systemName', 'contactEmail', 'supportPhone', 'address'];
      fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
          element.classList.add('highlight-success');
          setTimeout(() => {
            element.classList.remove('highlight-success');
          }, 2000);
        }
      });
    },

    async resetConfig() {
      const confirmed = await this.confirmAction(
        'Xác nhận khôi phục',
        'Bạn có chắc chắn muốn khôi phục cấu hình mặc định?',
        'warning'
      );

      if (!confirmed) return;

      try {
        this.showLoading('Đang khôi phục cấu hình mặc định...');
        const resetConfig = {
          ...this.config,
          ...this.defaultConfig,
          updatedAt: new Date().toISOString()
        };

        const response = await crudApi.update("api::setting.setting", { id: this.config.id }, resetConfig);
        this.config = { ...this.config, ...response.data };

        // Hiển thị thông báo thành công
        this.showSuccessNotification('Khôi phục cấu hình mặc định thành công!');

        // Highlight tất cả các trường đã reset
        this.highlightUpdatedFields();
      } catch (err) {
        this.error = 'Không thể khôi phục cấu hình. Vui lòng thử lại sau.';
        this.showError(this.error);
        console.error('Error resetting config:', err);
      } finally {
        this.hideLoading();
      }
    },

    clearError() {
      this.error = null
    },

    handleTabChange(tabId) {
      this.activeTab = tabId
    }
  },

  created() {
    this.fetchConfig()
  },

  beforeUnmount() {
    this.clearError()
    clearTimeout(this.debounceTimer)
    if (this.abortController) {
      this.abortController.abort()
    }
  }
}
</script>

<style scoped>
.admin-settings {
  margin-top: 80px;
  padding: 1.5rem;
  background-color: #f8f9fa;
  min-height: calc(100vh - 80px);
}

.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.dashboard-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dashboard-title i {
  color: #3498db;
}

/* Settings Container */
.settings-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Settings Tabs */
.settings-tabs {
  padding: 1rem 1rem 0;
  border-bottom: 1px solid #dee2e6;
}

.nav-tabs .nav-link {
  color: #6c757d;
  border: none;
  padding: 0.75rem 1.25rem;
  margin-right: 0.5rem;
  border-radius: 6px 6px 0 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.nav-tabs .nav-link i {
  font-size: 1rem;
}

.nav-tabs .nav-link:hover {
  color: #3498db;
  background: rgba(52, 152, 219, 0.1);
}

.nav-tabs .nav-link.active {
  color: #3498db;
  border-bottom: 2px solid #3498db;
  background: rgba(52, 152, 219, 0.1);
}

/* Settings Content */
.settings-content {
  background: white;
  border-radius: 0 0 8px 8px;
}

.section-title {
  font-size: 1.25rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #dee2e6;
}

/* Form Styles */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  color: #2c3e50;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-control {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 0.625rem 1rem;
  transition: all 0.2s ease;
}

.form-control:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.25);
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Editor Container */
.editor-container {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  overflow: hidden;
}

.editor-container textarea {
  border: none;
  resize: vertical;
}

/* Action Buttons */
.settings-actions {
  background: #f8f9fa;
  border-radius: 0 0 8px 8px;
}

.btn {
  padding: 0.625rem 1.25rem;
  font-weight: 500;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #3498db;
  border-color: #3498db;
}

.btn-primary:hover {
  background-color: #2980b9;
  border-color: #2980b9;
}

.btn-secondary {
  background-color: #fff;
  border-color: #6c757d;
  color: #6c757d;
}

.btn-secondary:hover {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* Required Field */
.required::after {
  content: " *";
  color: #dc3545;
}

.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
}

.loading-text {
  color: white;
  font-size: 1.1rem;
  font-weight: 500;
}

.spinner-grow {
  width: 3rem;
  height: 3rem;
}

/* Thêm vào phần <style> */
@keyframes highlightSuccess {
  0% {
    background-color: transparent;
  }
  30% {
    background-color: rgba(40, 167, 69, 0.1);
  }
  100% {
    background-color: transparent;
  }
}

.highlight-success {
  animation: highlightSuccess 2s ease;
}

/* Custom style cho SweetAlert */
.swal2-popup.swal2-toast {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
}

.swal2-popup.swal2-toast .swal2-title {
  margin: 0;
  font-size: 1rem;
}

.swal2-popup.swal2-toast .swal2-icon {
  margin: 0 0.5rem 0 0;
  width: 1.5rem;
  height: 1.5rem;
}

.swal2-popup.swal2-toast .swal2-icon .swal2-icon-content {
  font-size: 1rem;
}

.swal2-popup.swal2-toast .swal2-timer-progress-bar {
  height: 0.15rem;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .admin-settings {
    padding: 1rem;
  }

  .settings-tabs {
    overflow-x: auto;
    white-space: nowrap;
    padding: 0.5rem;
  }

  .nav-tabs .nav-link {
    padding: 0.5rem 1rem;
  }

  .settings-content {
    padding: 1rem !important;
  }

  .settings-actions {
    padding: 1rem !important;
  }

  .btn {
    width: 100%;
    justify-content: center;
    margin-bottom: 0.5rem;
  }

  .d-flex {
    flex-direction: column;
  }

  .gap-3 {
    gap: 0.5rem !important;
  }
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tab-pane {
  animation: fadeIn 0.3s ease-in-out;
}

/* Utility Classes */
.shadow-sm {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
}

.transition {
  transition: all 0.2s ease;
}
</style>