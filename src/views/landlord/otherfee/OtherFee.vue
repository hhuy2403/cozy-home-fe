<template>
  <div class="other-fee container mt-4">
    <!-- Header Section -->
    <div class="row mb-4 align-items-center">
      <div class="col-md-6">
        <h2>Danh sách phát sinh</h2>
      </div>
      <div class="col-md-6 text-end">
        <!-- Action Buttons -->
        <button class="btn btn-warning me-2" @click="viewData">
          <i class="fas fa-search"></i> Xem
        </button>
        <button class="btn btn-success me-2" @click="addFee">
          <i class="fas fa-plus"></i> Thêm
        </button>
        <button class="btn btn-danger me-2" @click="deleteSelected">
          <i class="fas fa-trash"></i> Xóa
        </button>
        <button class="btn btn-info" @click="exportToExcel">
          <i class="fa fa-file-excel"></i> Xuất excel
        </button>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="row mb-3">
      <div class="col-md-3">
        <label for="selectedMonth">Tháng/năm</label>
        <input type="month" id="selectedMonth" v-model="selectedMonth" class="form-control" />
      </div>
      <div class="col-md-3">
        <label for="selectedHouse">Nhà</label>
        <select id="selectedHouse" v-model="selectedHouse" class="form-select">
          <option value="">Tất cả</option>
          <option v-for="house in houses" :key="house.name" :value="house.name">
            {{ house.name }}
          </option>
        </select>
      </div>
      <div class="col-md-6">
        <label for="searchQuery">Tìm:</label>
        <input type="text" id="searchQuery" v-model="searchQuery" class="form-control"
          placeholder="Tìm kiếm theo nhà, phòng, diễn giải, hoặc số tiền..." />
      </div>
    </div>

    <!-- Note Section -->
    <div class="alert alert-info">
      Lưu ý: Phát sinh là các số tiền ngoại lệ (các khoản tiền không cố định) mà khách phải trả (nhập số dương) hoặc
      được trừ bớt đi (nhập số âm).
    </div>

    <!-- Warning for No Results -->
    <div v-if="filteredFees.length == 0" class="alert alert-warning">
      <strong>Không tìm thấy dòng nào phù hợp với từ khóa tìm kiếm.</strong>
    </div>

    <!-- Table Section -->
    <div class="table-responsive" v-if="filteredFees.length > 0">
      <table class="table table-bordered table-striped">
        <thead class="table-dark">
          <tr>
            <th><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
            <th>Nhà</th>
            <th>Phòng</th>
            <th>Diễn giải</th>
            <th>Số tiền (VND)</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(fee, index) in filteredFees" :key="index">
            <td><input type="checkbox" v-model="selectedFees" :value="fee" /></td>
            <td>{{ fee.house }}</td>
            <td>{{ fee.roomNumber }}</td>
            <td>{{ fee.description }}</td>
            <td>{{ formatCurrency(fee.amount) }}</td>
            <td>
              <button class="btn btn-sm btn-primary" @click="editFee(fee)">
                <i class="fas fa-edit"></i> Sửa
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Form (Hiển thị khi đang chỉnh sửa) -->
    <div v-if="isEditing" class="edit-form mt-4">
      <h3>Chỉnh sửa phát sinh</h3>
      <form @submit.prevent="updateFee">
        <div class="row mb-3">
          <div class="col-md-4">
            <label for="editDescription">Diễn giải</label>
            <input type="text" id="editDescription" v-model="editingFee.description" class="form-control" required />
          </div>
          <div class="col-md-4">
            <label for="editAmount">Số tiền</label>
            <input type="number" id="editAmount" v-model="editingFee.amount" class="form-control" required />
          </div>
          <div class="col-md-4 d-flex align-items-end">
            <button type="submit" class="btn btn-success me-2">Lưu</button>
            <button type="button" class="btn btn-secondary" @click="cancelEdit">Hủy</button>
          </div>
        </div>
      </form>
    </div>


    <!-- Pagination (if needed) -->
    <div class="row mt-3">
      <div class="col">
        <ul class="pagination justify-content-center">
          <!-- Pagination controls go here if required -->
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import crudApi from '@/apis/crudApi';

export default {
  data() {
    return {
      currentUser: null,
      selectedMonth: new Date().toISOString().substring(0, 7),
      selectedHouse: '',
      searchQuery: '',
      selectAll: false,
      houses: [],
      fees: [],
      selectedFees: [],
      isEditing: false,
      editingFee: null,
    };
  },
  computed: {
    filteredFees() {
      let filtered = this.fees;

      if (this.selectedHouse) {
        filtered = filtered.filter(fee => fee.house == this.selectedHouse);
      }

      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(fee =>
          fee.description.toLowerCase().includes(query) ||
          fee.house.toLowerCase().includes(query) ||
          fee.roomNumber.toString().includes(query) ||
          fee.amount.toString().includes(query)
        );
      }

      if (this.selectedMonth) {
        filtered = filtered.filter(fee => fee.monthYear == this.selectedMonth);
      }

      return filtered;
    },
    // Cập nhật trạng thái `selectAll` khi tất cả mục được chọn
    allSelected: {
      get() {
        return this.filteredFees.length > 0 && this.filteredFees.every(fee => this.selectedFees.includes(fee));
      },
      set(value) {
        if (value) {
          this.selectedFees = [...this.filteredFees];
        } else {
          this.selectedFees = [];
        }
      }
    }
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

    async loadDataFromAPI() {
      try {
        Swal.fire({
          title: 'Đang tải...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Lấy danh sách nhà theo landlordId
        const houseResponse = await crudApi.read("api::home.home", {landlordId: {id: this.currentUser.id} });
        
        if (houseResponse.error) throw new Error('Không thể tải dữ liệu nhà.');
        this.houses = houseResponse.data;

        // Lấy danh sách phí phát sinh
        const feeResponse = await crudApi.read("api::other-fee.other-fee", {landlordId: {id: this.currentUser.id} });
        
        if (feeResponse.error) throw new Error('Không thể tải dữ liệu phí phát sinh.');
        const feeData = feeResponse.data;

        // Lọc và map dữ liệu phí phát sinh theo landlordId
        this.fees = feeData
          .map(fee => {
            const house = this.houses.find(h => h.id == fee.houseId.id);
            return {
              ...fee,
              house: house ? house.name : 'Unknown',
            };
          });

        Swal.close();
      } catch (error) {
        console.error('Error loading data:', error);
        Swal.fire('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại sau.', 'error');
      }
    },

    toggleSelectAll() {
      this.allSelected = !this.allSelected;
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    },

    addFee() {
      this.$router.push('/landlord/other-fee-create');
    },

    async editFee(fee) {
      this.isEditing = true;
      this.editingFee = { ...fee };
    },

    async updateFee() {
      try {
        const updatedFee = {
          ...this.editingFee,
          landlordId: this.currentUser.id,
          updatedAt: new Date().toISOString()
        };

        const response = await crudApi.update("api::other-fee.other-fee", {id: this.editingFee.id}, updatedFee);

        if (response.error) throw new Error('Không thể cập nhật phí phát sinh.');

        const index = this.fees.findIndex(f => f.id == this.editingFee.id);
        if (index !== -1) {
          this.fees[index] = { ...updatedFee };
        }

        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Phí phát sinh đã được cập nhật.',
          timer: 1500,
          showConfirmButton: false
        });

        this.cancelEdit();
      } catch (error) {
        console.error('Error updating fee:', error);
        Swal.fire('Lỗi', 'Không thể cập nhật phí phát sinh. Vui lòng thử lại.', 'error');
      }
    },

    cancelEdit() {
      this.isEditing = false;
      this.editingFee = null;
    },

    async deleteSelected() {
      if (this.selectedFees.length == 0) {
        Swal.fire('Thông báo', 'Vui lòng chọn ít nhất một khoản phí để xóa.', 'info');
        return;
      }

      const result = await Swal.fire({
        title: 'Xác nhận xóa',
        text: `Bạn có chắc muốn xóa ${this.selectedFees.length} khoản phí đã chọn?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
      });

      if (result.isConfirmed) {
        try {
          Swal.fire({
            title: 'Đang xóa...',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          for (const fee of this.selectedFees) {
            await crudApi.delete("api::other-fee.other-fee", {id: fee.id});
          }

          this.fees = this.fees.filter(fee => !this.selectedFees.includes(fee));
          this.selectedFees = [];

          Swal.fire({
            icon: 'success',
            title: 'Đã xóa!',
            text: 'Các khoản phí đã được xóa thành công.',
            timer: 1500,
            showConfirmButton: false
          });
        } catch (error) {
          console.error('Error deleting fees:', error);
          Swal.fire('Lỗi', 'Không thể xóa các khoản phí. Vui lòng thử lại.', 'error');
        }
      }
    },


    exportToExcel() {
      const worksheet = XLSX.utils.json_to_sheet(
        this.filteredFees.map(fee => ({
          "Nhà": fee.house,
          "Phòng": fee.roomNumber,
          "Diễn giải": fee.description,
          "Số tiền (VND)": this.formatCurrency(fee.amount),
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Danh_sach_phat_sinh");
      XLSX.writeFile(workbook, "Danh_sach_phat_sinh.xlsx");
    },
  },

  async mounted() {
    if (await this.checkAccess()) {
      await this.loadDataFromAPI();
    }
  },
};
</script>

<style scoped>
/* Base Container */
.container {
  margin-top: 3rem !important;
}

.other-fee {
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: calc(100vh - 2rem);
}

/* Header Section */
h2 {
  text-align: left;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

/* Action Buttons */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  border: none;
}

.btn i {
  font-size: 0.875rem;
}

.btn-warning {
  background: #fef3c7;
  color: #92400e;
}

.btn-success {
  background: #dcfce7;
  color: #166534;
}

.btn-danger {
  background: #fee2e2;
  color: #991b1b;
}

.btn-info {
  background: #e0f2fe;
  color: #075985;
}

.btn:hover {
  transform: translateY(-1px);
  filter: brightness(95%);
}

/* Filter Section */
.form-control,
.form-select {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  background-color: white;
  transition: all 0.2s;
}

.form-control:focus,
.form-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 0.375rem;
}

/* Alert Styles */
.alert {
  border: none;
  border-radius: 0.75rem;
  padding: 1rem;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.alert-info {
  background: #f0f9ff;
  color: #075985;
  border-left: 4px solid #0ea5e9;
}

.alert-warning {
  background: #fef3c7;
  color: #92400e;
  border-left: 4px solid #f59e0b;
}

/* Table Styles */
.table-responsive {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table {
  margin-bottom: 0;
  font-size: 0.87rem;
}

.table thead th {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  padding: 0.7rem;
  border-bottom: 2px solid #e2e8f0;
}

.table tbody td {
  padding: 0.5rem;
  vertical-align: middle;
  border-bottom: 1px solid #e2e8f0;
}

/* Checkbox Styles */
input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
  border: 2px solid #cbd5e1;
  cursor: pointer;
  transition: all 0.2s;
}

input[type="checkbox"]:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

/* Edit Form */
.edit-form {
  background: white;
  border-radius: 0.75rem;
  padding: 1.2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.edit-form h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 1.25rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .other-fee {
    padding: 1rem;
  }

  .btn span {
    display: none;
  }

  .btn {
    padding: 0.5rem;
  }

  h2 {
    font-size: 1.25rem;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.other-fee {
  animation: fadeIn 0.3s ease-out;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 0.5rem;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 0.25rem;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
