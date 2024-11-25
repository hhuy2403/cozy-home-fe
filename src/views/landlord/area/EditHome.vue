<template>
  <div class="edit-home">
    <!-- Header Section -->
    <div class="header-section">
      <h3>Chỉnh sửa thông tin nhà</h3>
      <div class="action-buttons">
        <router-link to="/landlord/room-index">
          <button type="button" class="btn btn-outline-secondary btn-sm">
            <i class="fa fa-undo me-1"></i>Quay về
          </button>
        </router-link>
        <button type="submit" class="btn btn-primary btn-sm ms-2" @click="validateAndSave">
          <i class="fa fa-save me-1"></i>Lưu thay đổi
        </button>
      </div>
    </div>

    <form @submit.prevent="validateAndSave" class="form-container">
      <!-- Basic Information Card -->
      <div class="form-card">
        <h6 class="form-card-title">Thông tin cơ bản</h6>
        <div class="row g-3">
          <div class="col-md-12">
            <label class="form-label">Tên nhà <span class="required">*</span></label>
            <input type="text" v-model="home.name" class="form-control" :class="{ 'is-invalid': errors.name }"
              placeholder="Nhập tên nhà" />
            <div class="invalid-feedback" v-if="errors.name">{{ errors.name }}</div>
          </div>
        </div>
      </div>

      <!-- Location Information Card -->
      <div class="form-card">
        <h6 class="form-card-title">Thông tin địa chỉ</h6>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Tỉnh/Thành phố <span class="required">*</span></label>
            <input type="text" v-model="home.city" class="form-control" :class="{ 'is-invalid': errors.city }"
              placeholder="Nhập tỉnh/thành phố" />
            <div class="invalid-feedback" v-if="errors.city">{{ errors.city }}</div>
          </div>
          <div class="col-md-6">
            <label class="form-label">Quận/Huyện <span class="required">*</span></label>
            <input type="text" v-model="home.district" class="form-control" :class="{ 'is-invalid': errors.district }"
              placeholder="Nhập quận/huyện" />
            <div class="invalid-feedback" v-if="errors.district">{{ errors.district }}</div>
          </div>
          <div class="col-md-6">
            <label class="form-label">Phường/Xã <span class="required">*</span></label>
            <input type="text" v-model="home.ward" class="form-control" :class="{ 'is-invalid': errors.ward }"
              placeholder="Nhập phường/xã" />
            <div class="invalid-feedback" v-if="errors.ward">{{ errors.ward }}</div>
          </div>
          <div class="col-md-6">
            <label class="form-label">Địa chỉ cụ thể <span class="required">*</span></label>
            <input type="text" v-model="home.address" class="form-control" :class="{ 'is-invalid': errors.address }"
              placeholder="Nhập số nhà, tên đường..." />
            <div class="invalid-feedback" v-if="errors.address">{{ errors.address }}</div>
          </div>
        </div>
      </div>

      <div class="form-note">
        <span class="required">*</span> Thông tin bắt buộc
      </div>
    </form>
  </div>
</template>
<script>
import crudApi from '@/apis/crudApi';
import Swal from 'sweetalert2';

export default {
  name: "EditHome",
  data() {
    return {
      home: {
        id: "",
        name: "",
        city: "",
        district: "",
        ward: "",
        address: "",
      },
      errors: {},
    };
  },
  mounted() {
    this.loadHomeData();
  },
  methods: {
    async loadHomeData() {
      const homeId = this.$route.query.houseId; // Sử dụng houseId từ query params

      try {
        const response = await crudApi.read("api::home.home", {id: homeId});
        if (response.error) throw new Error('Home not found');

        this.home = response.data?.[0];
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Không thể tải dữ liệu nhà.',
          confirmButtonText: 'OK',
        }).then(() => {
          this.$router.push('/landlord/room-index');
        });
      }
    },

    async validateAndSave() {
      this.errors = {};

      if (!this.home.name) this.errors.name = "Vui lòng nhập tên nhà";
      if (!this.home.city) this.errors.city = "Vui lòng nhập Tỉnh/Thành phố";
      if (!this.home.district) this.errors.district = "Vui lòng nhập Quận/Huyện";
      if (!this.home.ward) this.errors.ward = "Vui lòng nhập Phường/Xã";
      if (!this.home.address) this.errors.address = "Vui lòng nhập địa chỉ";

      const checkDuplicateName = await crudApi.read("api::home.home", {
          name: {
            $contains: this.home.name.toLocaleLowerCase(),
          }
        });
        const homes = checkDuplicateName.data;

        // Check if any existing home has the same name as the one being added
        const duplicateHome = homes.find(home => home.name.toLowerCase() == this.home.name.toLowerCase());
        if(duplicateHome){
          this.errors.name = 'Tên nhà đã tồn tại. Vui lòng chọn tên khác.'
          return;
        }

      if (Object.keys(this.errors).length == 0) {       
        this.saveHome();
      }
    },

    async saveHome() {
      try {
        const response = await crudApi.update("api::home.home", {id: this.home.id}, this.home);

        if (!response.error) {
          Swal.fire({
            icon: 'success',
            title: 'Cập nhật thành công!',
            text: 'Nhà đã được cập nhật thành công!',
            timer: 2000,
            showConfirmButton: false,
          }).then(() => {
            this.$router.push('/landlord/room-index');
          });
        } else {
          this.errors.general = 'Lỗi khi cập nhật nhà. Vui lòng thử lại.';
        }
      } catch (error) {
        this.errors.general = 'Không thể kết nối với máy chủ. Vui lòng thử lại sau.';
      }
    },
  },
};
</script>

<style scoped>
.edit-home {
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
  border-bottom: 1px solid #e5e7eb;
}

.header-section h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.form-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-card-title {
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.form-control {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-control:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.required {
  color: #ef4444;
  margin-left: 2px;
}

.form-note {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 1rem;
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