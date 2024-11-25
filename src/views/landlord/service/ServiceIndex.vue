<template>
  <div class="service-index">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Danh sách dịch vụ</h2>
      <div>
        <button class="btn btn-success me-2" @click="goToCreateService">
          <i class="fa fa-plus"></i> Thêm dịch vụ
        </button>
        <button class="btn btn-danger" @click="deleteSelectedServices">
          <i class="fa fa-trash"></i> Xóa
        </button>
      </div>
    </div>

    <div class="alert alert-info">
      <strong>Lưu ý:</strong> <br>
      - Các dịch vụ phải được gán cho từng khách thuê phòng để khi tính tiền sẽ có tiền dịch vụ đó. <br>
      - Để cấu hình đơn giá điện nước tính theo bậc thang bạn vẫn phải tạo 2 dịch vụ là điện, nước; sau đó vào menu
      "Thiết
      lập" => Tab "Đơn giá điện nước bậc thang" để thiết lập đơn giá.
    </div>

    <div class="table-responsive">
      <table class="table table-hover table-bordered">
        <thead class="table-light">
          <tr>
            <th scope="col">
              <input type="checkbox" @change="toggleSelectAll" />
            </th>
            <th scope="col">Tên</th>
            <th scope="col">Loại dịch vụ</th>
            <th scope="col">Đơn giá (VNĐ)</th>
            <th scope="col">Đang dùng</th>
            <th scope="col">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="service in services" :key="service.id">
            <td>
              <input type="checkbox" v-model="service.selected" />
            </td>
            <td>{{ service.name }}</td>
            <td>{{ service.type }}</td>
            <td>{{ formatCurrency(service.price) }}</td>
            <td>
              <input type="checkbox" v-model="service.isActive" disabled />
            </td>
            <td>
              <button class="btn btn-sm btn-primary me-2" @click="editService(service.id)">
                <i class="fa fa-edit"></i> Sửa
              </button>
              <button class="btn btn-sm btn-danger" @click="deleteService(service.id)">
                <i class="fa fa-trash"></i> Xóa
              </button>
            </td>
          </tr>
          <tr v-if="services.length == 0">
            <td colspan="6" class="text-center">Không có dịch vụ nào được tạo</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import crudApi from '@/apis/crudApi';
import Swal from 'sweetalert2';

export default {
  name: 'ServiceIndex',
  data() {
    return {
      services: [],
      currentUser: null
    };
  },
  async mounted() {
    await this.checkAccess();
    await this.fetchServices();
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
    async fetchServices() {
      try {
        // Lấy tất cả dịch vụ
        const response = await crudApi.read("api::service.service", {
          landlordId: {id: this.currentUser.id}
        })
        
        if (response.error) throw new Error('Failed to fetch services');

        const allServices = response.data;

        // Lọc dịch vụ theo landlordId
        this.services = allServices;

      } catch (error) {
        console.error('Error fetching services:', error);
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Không thể tải dữ liệu dịch vụ."
        });
      }
    },

    goToCreateService() {
      this.$router.push('/landlord/create-service');
    },
    editService(serviceId) {
      this.$router.push({ path: '/landlord/create-service', query: { serviceId } });
    },
    async deleteService(serviceId) {
      try {
        // Kiểm tra quyền xóa
        const service = this.services.find(s => s.id == serviceId);
        if (service.landlordId.id !== this.currentUser.id) {
          throw new Error('Unauthorized');
        }

        const result = await Swal.fire({
          title: 'Bạn có chắc chắn muốn xóa dịch vụ này?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Xóa',
          cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
          const response = await crudApi.delete("api::service.service", {id: serviceId});
          if (response.error) throw new Error('Failed to delete service');

          this.services = this.services.filter(service => service.id !== serviceId);
          await Swal.fire('Đã xóa!', 'Dịch vụ đã được xóa.', 'success');
        }
      } catch (error) {
        console.error('Error deleting service:', error);
        await Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: error.message == 'Unauthorized'
            ? "Bạn không có quyền xóa dịch vụ này."
            : "Không thể xóa dịch vụ."
        });
      }
    },
    async deleteSelectedServices() {
      const selectedServices = this.services.filter(service => service.selected);

      if (selectedServices.length == 0) {
        await Swal.fire('Thông báo', 'Vui lòng chọn ít nhất một dịch vụ để xóa.', 'info');
        return;
      }

      // Kiểm tra quyền xóa
      if (selectedServices.some(service => service.landlordId.id !== this.currentUser.id)) {
        await Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Bạn không có quyền xóa một số dịch vụ đã chọn."
        });
        return;
      }

      const result = await Swal.fire({
        title: 'Bạn có chắc chắn muốn xóa các dịch vụ đã chọn?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
      });

      if (result.isConfirmed) {
        try {
          for (const service of selectedServices) {
            const response = await crudApi.delete("api::service.service", {id: service.id});
            if (response.error) throw new Error('Failed to delete service');
          }

          this.services = this.services.filter(service => !service.selected);
          await Swal.fire('Đã xóa!', 'Các dịch vụ đã được xóa.', 'success');
        } catch (error) {
          console.error('Error deleting services:', error);
          await Swal.fire("Lỗi!", "Không thể xóa các dịch vụ đã chọn.", "error");
        }
      }
    },
    toggleSelectAll(event) {
      const isChecked = event.target.checked;
      this.services.forEach(service => {
        service.selected = isChecked;
      });
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    },
  },
};
</script>

<style scoped>
/* Modern Container */
.service-index {
  background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
  margin-top: 3rem !important;
}

/* Modern Typography */
h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

/* Modern Buttons */
.btn {
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-success {
  background: linear-gradient(45deg, #28a745, #20c997);
  border: none;
}

.btn-danger {
  background: linear-gradient(45deg, #dc3545, #ff4d6b);
  border: none;
}

.btn-primary {
  background: linear-gradient(45deg, #1a73e8, #4285f4);
  border: none;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Modern Table */
.table {
  border-radius: 12px;
  overflow: hidden;
  border: none;
  margin-bottom: 0;
}

.table th {
  background: #f8faff;
  color: #344767;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 1rem;
  border: none;
}

.table td {
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  border-color: #f0f3f9;
  vertical-align: middle;
}

/* Custom Checkbox */
input[type="checkbox"] {
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 4px;
  border: 2px solid #cbd5e1;
  cursor: pointer;
  transition: all 0.2s ease;
}

input[type="checkbox"]:checked {
  background-color: #1a73e8;
  border-color: #1a73e8;
}

/* Alert Styling */
.alert-info {
  background: rgba(26, 115, 232, 0.1);
  border: none;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  color: #1a73e8;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  line-height: 1.6;
}

.alert-info strong {
  color: #1557b0;
}

/* Table Hover Effect */
.table-hover tbody tr:hover {
  background-color: rgba(26, 115, 232, 0.04);
}

/* Empty State */
.text-center {
  padding: 2rem;
  color: #64748b;
  font-style: italic;
}

/* Responsive Design */
@media (max-width: 768px) {
  .service-index {
    padding: 1rem;
    margin-top: 1rem;
  }

  h2 {
    font-size: 1.5rem;
  }

  .btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }

  .table th,
  .table td {
    padding: 0.5rem;
    font-size: 0.85rem;
  }
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

.service-index {
  animation: fadeIn 0.3s ease-out;
}

/* Scrollbar Styling */
.table-responsive::-webkit-scrollbar {
  height: 6px;
}

.table-responsive::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.table-responsive::-webkit-scrollbar-thumb {
  background: #94a3b8;
  border-radius: 3px;
}

.table-responsive::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>
