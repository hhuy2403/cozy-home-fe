<template>
  <div class="create-service">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0" v-if="isEditMode">Sửa Dịch Vụ</h3>
      <h3 class="mb-0" v-else>Thêm Dịch Vụ</h3>
      <div>
        <router-link to="/landlord/service-index">
          <button type="button" class="btn btn-warning me-2">
            <i class="fa fa-undo"></i> Quay về
          </button>
        </router-link>
        <button type="submit" class="btn btn-success" @click="validateAndSave">
          <i class="fa fa-check"></i> Lưu
        </button>
      </div>
    </div>

    <form @submit.prevent="validateAndSave">
      <div class="row mb-3">
        <div class="col-md-6">
          <label for="serviceName" class="form-label">Tên Dịch Vụ <span>&nbsp;*</span></label>
          <input type="text" v-model="service.name" id="serviceName" class="form-control form-control-sm"
            :class="{ 'is-invalid': errors.name }" placeholder="Nhập tên dịch vụ" required />
          <div class="invalid-feedback" v-if="errors.name">{{ errors.name }}</div>
        </div>

        <div class="col-md-6">
          <label for="serviceType" class="form-label">Loại Dịch Vụ <span>&nbsp;*</span></label>
          <select v-model="service.type" id="serviceType" class="form-select form-select-sm"
            :class="{ 'is-invalid': errors.type }">
            <option value="">Chọn loại dịch vụ</option>
            <option value="ĐIỆN">Điện</option>
            <option value="NƯỚC">Nước</option>
            <option value="KHÁC">Khác</option>
          </select>
          <div class="invalid-feedback" v-if="errors.type">{{ errors.type }}</div>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-md-6">
          <label for="price" class="form-label">Đơn Giá <span>&nbsp;*</span></label>
          <div class="input-group">
            <input type="number" v-model="service.price" id="price" class="form-control form-control-sm"
              :class="{ 'is-invalid': errors.price }" min="0" placeholder="Nhập đơn giá" required />
            <span class="input-group-text">VNĐ</span>
          </div>
          <div class="invalid-feedback" v-if="errors.price">{{ errors.price }}</div>
        </div>

        <div class="col-md-6">
          <label class="form-label">Trạng thái</label>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" v-model="service.isActive" id="isActive" />
            <label class="form-check-label" for="isActive">Đang dùng</label>
          </div>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-md-12">
          <label for="note" class="form-label">Ghi Chú</label>
          <textarea v-model="service.note" id="note" class="form-control form-control-sm"
            placeholder="Nhập ghi chú nếu có"></textarea>
        </div>
      </div>

      <div class="mb-4">
        <span class="text-danger">(*): Thông tin bắt buộc</span>
      </div>
    </form>
  </div>
</template>

<script>
import crudApi from '@/apis/crudApi';
import Swal from 'sweetalert2';

export default {
  name: 'CreateService',
  data() {
    return {
      service: {
        name: '',
        type: '',
        price: 0,
        isActive: true,
        note: '',
        landlordId: ''
      },
      errors: {},
      isEditMode: false,
      serviceId: null
    };
  },
  async mounted() {
    await this.checkAccess();

    const serviceId = this.$route.query.serviceId;
    if (serviceId) {
      this.isEditMode = true;
      this.serviceId = serviceId;
      await this.loadService(serviceId);
    }
  },
  methods: {
    async checkAccess() {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser?.id || currentUser.role !== 'landlord') {
        await Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Bạn không có quyền truy cập trang này!'
        });
        this.$router.push('/login');
        return false;
      }
      this.service.landlordId = currentUser.id;
      return true;
    },

    async loadService(id) {
      try {
        const response = await crudApi.read("api::service.service", {id: id});
        if (!response.error) {
          const service = response.data[0];  

          // Kiểm tra quyền sở hữu
          const currentUser = JSON.parse(localStorage.getItem('currentUser'));
          if (service.landlordId.id !== currentUser.id) {
            await Swal.fire({
              icon: 'error',
              title: 'Lỗi!',
              text: 'Bạn không có quyền chỉnh sửa dịch vụ này!'
            });
            this.$router.push('/landlord/service-index');
            return;
          }

          this.service = service;
        } else {
          await Swal.fire("Lỗi!", "Không thể tải dữ liệu dịch vụ.", "error");
        }
      } catch (error) {
        console.error('Error loading service:', error);
        await Swal.fire("Lỗi!", "Không thể kết nối tới máy chủ.", "error");
      }
    },

    validateAndSave() {
      this.errors = {};

      if (!this.service.name) this.errors.name = "Vui lòng nhập tên dịch vụ";
      if (!this.service.type) this.errors.type = "Vui lòng chọn loại dịch vụ";
      if (this.service.price <= 0) this.errors.price = "Vui lòng nhập đơn giá hợp lệ";

      if (Object.keys(this.errors).length == 0) {
        this.saveService();
      }
    },

    async saveService() {
      try {
        if (!this.service.landlordId) {
          throw new Error('Missing landlordId');
        }

        const response = this.isEditMode
                          ? await crudApi.update("api::service.service", {id: this.serviceId} , this.service)
                          : await crudApi.create("api::service.service", this.service);

        if (!response.error) {
          await Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: `Dịch vụ đã được ${this.isEditMode ? 'cập nhật' : 'thêm'} thành công!`,
          });
          this.$router.push('/landlord/service-index');
        } else {
          throw new Error('Failed to save service');
        }
      } catch (error) {
        console.error('Error saving service:', error);
        await Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: error.message == 'Missing landlordId'
            ? "Vui lòng đăng nhập lại."
            : "Không thể lưu dữ liệu dịch vụ."
        });
      }
    }
  }
};
</script>

<style scoped>
/* Modern Container */
.create-service {
  background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(149, 157, 165, 0.1);
  padding: 2rem;
  margin-top: 3rem !important;
}

h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

/* Form Styling */
.form-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #344767;
  margin-bottom: 0.5rem;
}

.form-label span {
  color: #dc3545;
}

.form-control,
.form-select {
  border: 1.5px solid #e9ecef;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: #1a73e8;
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
}

/* Input Group */
.input-group-text {
  background: #f8faff;
  border: 1.5px solid #e9ecef;
  border-left: none;
  color: #344767;
  font-size: 0.9rem;
}

/* Switch Toggle */
.form-switch .form-check-input {
  width: 2.5em;
  height: 1.25em;
  cursor: pointer;
}

.form-check-input:checked {
  background-color: #1a73e8;
  border-color: #1a73e8;
}

/* Buttons */
.btn {
  padding: 0.5rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-warning {
  background: #fff4e6;
  color: #ff9800;
  border: 1.5px solid #ff9800;
}

.btn-warning:hover {
  background: #ff9800;
  color: white;
}

.btn-success {
  background: #1a73e8;
  border: none;
}

.btn-success:hover {
  background: #1557b0;
  transform: translateY(-1px);
}

/* Validation Styles */
.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
  font-size: 0.8rem;
  color: #dc3545;
  margin-top: 0.25rem;
}

/* Required Field Note */
.text-danger {
  font-size: 0.8rem;
  font-style: italic;
}

/* Textarea */
textarea.form-control {
  min-height: 100px;
  resize: vertical;
}

/* Responsive Design */
@media (max-width: 768px) {
  .create-service {
    padding: 1.5rem;
    margin-top: 1rem;
  }

  h3 {
    font-size: 1.5rem;
  }

  .btn {
    padding: 0.4rem 1rem;
    font-size: 0.85rem;
  }
}

/* Hover Effects */
.form-control:hover,
.form-select:hover {
  border-color: #1a73e8;
}

/* Animation */
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

.create-service {
  animation: fadeIn 0.3s ease-out;
}
</style>
