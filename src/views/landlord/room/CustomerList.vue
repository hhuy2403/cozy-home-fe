<template>
  <div class="customer-list container-fluid p-4">
    <!-- Header Section -->
    <div class="header-section mb-4">
      <div class="row align-items-center g-3">
        <div class="col-md-4">
          <h2 class="page-title mb-0">
            <i class="fas fa-users me-2"></i>Danh Sách Khách Thuê
          </h2>
        </div>

        <div class="col-md-8">
          <div class="d-flex gap-2 flex-wrap justify-content-md-end">
            <!-- Search Box -->
            <div class="search-box">
              <i class="fas fa-search search-icon"></i>
              <input type="text" v-model="searchQuery" class="form-control search-input" placeholder="Tìm kiếm..." />
            </div>

            <!-- Filter Dropdown -->
            <select v-model="filterPaymentCycle" class="form-select filter-select">
              <option value="">Tất cả kỳ thanh toán</option>
              <option value="Kỳ 30">Kỳ 30</option>
              <option value="Kỳ 15">Kỳ 15</option>
            </select>

            <!-- Action Buttons -->
            <button class="btn btn-outline-secondary" @click="goBack" title="Quay về">
              <i class="fas fa-arrow-left"></i>
            </button>
            <button class="btn btn-primary" @click="saveCustomers" title="Lưu thay đổi">
              <i class="fas fa-save"></i>
            </button>
            <button class="btn btn-success" @click="exportToExcel" title="Xuất Excel">
              <i class="fas fa-file-excel"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="stats-card">
          <div class="stats-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stats-info">
            <h3>{{ filteredCustomers.length }}</h3>
            <p>Khách thuê</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="stats-card">
          <div class="stats-icon">
            <i class="fas fa-home"></i>
          </div>
          <div class="stats-info">
            <h3>{{ totalRooms }}</h3>
            <p>Phòng đã thuê</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="stats-card">
          <div class="stats-icon">
            <i class="fas fa-money-bill-wave"></i>
          </div>
          <div class="stats-info">
            <h3>{{ formatCurrency(totalDeposit) }}</h3>
            <p>Tổng tiền cọc</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="table-container">
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Phòng</th>
              <th>Khu vực</th>
              <th>Họ tên</th>
              <th>Số điện thoại</th>
              <th>Ngày bắt đầu</th>
              <th>Tiền phòng</th>
              <th>Đặt cọc</th>
              <th>Kỳ thanh toán</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="customer in filteredCustomers" :key="customer.id">
              <td class="room-number">{{ customer.roomNumber }}</td>
              <td>{{ customer.house }}</td>
              <td class="customer-name">{{ customer.fullName }}</td>
              <td>
                <div class="input-group input-group-sm">
                  <input type="text" v-model="customer.phoneNumber" class="form-control" />
                </div>
              </td>
              <td>{{ formatDate(customer.startDate) }}</td>
              <td>{{ formatCurrency(customer.rentalCost) }}</td>
              <td>
                <div class="input-group input-group-sm">
                  <input type="number" v-model="customer.deposit" class="form-control" />
                </div>
              </td>
              <td>{{ customer.paymentCycle }}</td>
              <td>
                <button class="btn btn-sm btn-danger" @click="confirmDeleteCustomer(customer)">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
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
      searchQuery: "",
      filterPaymentCycle: "",
      customers: [],
      errors: [],
      isLoading: false,
      isSaving: false
    };
  },

  async mounted() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser?.id || currentUser.role !== 'landlord') {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Bạn không có quyền truy cập trang này!'
      }).then(() => {
        this.$router.push('/login');
      });
      return;
    }
    await this.loadCustomers();
  },

  computed: {
    filteredCustomers() {
      let results = this.customers;

      if (this.searchQuery.trim()) {
        const searchTerm = this.searchQuery.toLowerCase().trim();
        results = results.filter(customer => {
          return (
            // Tìm theo số phòng
            customer.roomNumber?.toString().toLowerCase().includes(searchTerm) ||
            // Tìm theo tên nhà
            customer.house?.toLowerCase().includes(searchTerm) ||
            // Tìm theo tên khách
            customer.fullName?.toLowerCase().includes(searchTerm) ||
            // Tìm theo số điện thoại
            customer.phoneNumber?.toString().includes(searchTerm)
          );
        });
      }

      // Lọc theo kỳ thanh toán nếu có
      if (this.filterPaymentCycle) {
        results = results.filter(customer =>
          customer.paymentCycle == this.filterPaymentCycle
        );
      }

      return results;
    },
    hasChanges() {
      return this.customers.some(customer => customer.isModified);
    },

    totalCustomers() {
      return this.customers.length;
    },

    totalRooms() {
      return this.customers.filter(customer => customer.roomNumber).length;
    },

    totalDeposit() {
      return this.customers.reduce((sum, customer) => sum + (customer.deposit || 0), 0);
    }

  },

  // Thêm watcher để theo dõi thay đổi của searchQuery
  watch: {
    searchQuery: {
      handler(newVal) {
        // Trim whitespace từ input search
        this.searchQuery = newVal.trim();
      }
    }
  },

  methods: {
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    },

    formatCurrency(value) {
      if (!value) return '0';
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(value);
    },

    validatePhoneNumber(phone) {
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
      return phoneRegex.test(phone);
    },

    async loadCustomers() {
      try {
        this.isLoading = true;

        // Lấy thông tin user đang đăng nhập
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser?.id || currentUser.role !== 'landlord') {
          throw new Error('Invalid user or not a landlord');
        }

        Swal.fire({
          title: 'Đang tải dữ liệu...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        // 1. Fetch homes của landlord hiện tại
        const homesResponse = await crudApi.read('api::home.home', {
            landlordId: {
              id: {
                $eq: currentUser.id
              }
            }
        });

        const allHomes = homesResponse.data;

        // Lọc nhà theo landlordId
        const landlordHomes = allHomes;
        // const landlordHomeIds = landlordHomes.map(home => home.id);
        const housesMap = new Map(landlordHomes.map(home => [home.id, home.name]));

        let customers = [];
        for(let house of allHomes) {
          for(let room of house.roomId) {
            const res = await crudApi.read('api::room.room', {
              id: {
                $eq: room.id
              }
            });

            for(let customer of res?.data?.[0]?.customers){
              customer.house = housesMap.get(house.id);
              customer.phoneNumber = customer.phoneNumber1;
              customer.roomNumber = room.roomNumber;
              customers.push(customer);
            }
          }
        }

        this.customers = customers;

        // // 2. Fetch tất cả customers
        // const customersResponse = await fetch("https://6725a513c39fedae05b5670b.mockapi.io/api/v1/customers");
        // const allCustomers = await customersResponse.json();

        // // 3. Lọc và map customers theo homes của landlord
        // this.customers = allCustomers
        //   .filter(customer => landlordHomeIds.includes(customer.houseId))
        //   .map(customer => ({
        //     ...customer,
        //     house: housesMap.get(customer.houseId) || 'Chưa xác định',
        //     phoneNumber: customer.phoneNumber1
        //   }));

        Swal.close();
      } catch (error) {
        console.error('Error loading customers:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: error.message == 'Invalid user or not a landlord'
            ? 'Bạn không có quyền truy cập!'
            : 'Không thể tải dữ liệu khách thuê.'
        });
        if (error.message == 'Invalid user or not a landlord') {
          this.$router.push('/login');
        }
      } finally {
        this.isLoading = false;
      }
    },

    async saveCustomers() {
      try {
        this.isSaving = true;
        Swal.fire({
          title: 'Đang lưu...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        const updatePromises = this.customers.map(customer => {
          const updateData = {
            ...customer,
            phoneNumber1: customer.phoneNumber // Map ngược lại phoneNumber thành phoneNumber1
          };
          delete updateData.house; // Xóa trường house vì đây là trường mapped
          delete updateData.phoneNumber; // Xóa trường phoneNumber mapped

          return crudApi.update("api::customer.customer", {id: customer.id}, updateData);
        });

        await Promise.all(updatePromises);

        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Dữ liệu đã được lưu!',
          timer: 1500
        });

      } catch (error) {
        console.error('Error saving customers:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Không thể lưu dữ liệu. Vui lòng thử lại!'
        });
      } finally {
        this.isSaving = false;
      }
    },

    async deleteCustomer(customer) {
      try {
        Swal.fire({
          title: 'Đang xóa...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        // Delete customer
        const deleteResponse = await crudApi.delete("api::.customer.customer", {id: customer.id});

        if (deleteResponse.error) throw new Error('Failed to delete customer');

        // Update room status
        const roomResponse = await crudApi.update("api::room.room", {id: customer.roomId}, {
          isRented: false,
          isPaid: false
        });

        if (roomResponse.error) throw new Error('Failed to update room status');

        // Update local state
        this.customers = this.customers.filter(c => c.id !== customer.id);

        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Khách thuê đã được xóa.',
          timer: 1500
        });

      } catch (error) {
        console.error('Error deleting customer:', error);
        Swal.fire('Lỗi!', 'Không thể xóa khách thuê.', 'error');
      }
    },

    goBack() {
      this.$router.push('/landlord/room-index');
    },

    exportToExcel() {
      try {
        const exportData = this.filteredCustomers.map(customer => ({
          'Phòng số': customer.roomNumber,
          'Khu vực': customer.house,
          'Họ tên': customer.fullName,
          'Số điện thoại': customer.phoneNumber,
          'Email': customer.email || '',
          'Ngày bắt đầu': this.formatDate(customer.startDate),
          'Tiền phòng': this.formatCurrency(customer.rentalCost),
          'Đặt cọc': this.formatCurrency(customer.deposit),
          'Kỳ thanh toán': customer.paymentCycle
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Khách thuê');

        // Set column widths
        const wscols = [
          { wch: 10 }, // Phòng số
          { wch: 15 }, // Khu vực
          { wch: 25 }, // Họ tên
          { wch: 15 }, // Số điện thoại
          { wch: 25 }, // Email
          { wch: 15 }, // Ngày bắt đầu
          { wch: 15 }, // Tiền phòng
          { wch: 15 }, // Đặt cọc
          { wch: 12 }  // Kỳ thanh toán
        ];
        worksheet['!cols'] = wscols;

        XLSX.writeFile(workbook, `Danh_sach_khach_thue_${this.formatDate(new Date())}.xlsx`);
      } catch (error) {
        console.error('Error exporting to Excel:', error);
        Swal.fire('Lỗi!', 'Không thể xuất file Excel.', 'error');
      }
    },

    async confirmDeleteCustomer(customer) {
      const result = await Swal.fire({
        title: `Xóa khách thuê: ${customer.fullName}?`,
        text: "Bạn sẽ không thể khôi phục lại dữ liệu!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
      });

      if (result.isConfirmed) {
        await this.deleteCustomer(customer);
      }
    }
  }
};
</script>

<style scoped>
.customer-list {
  margin-top: 3rem !important;
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.page-title {
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
}

/* Search Box Styling */
.search-box {
  position: relative;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.search-input {
  padding-left: 35px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #4CAF50;
  box-shadow: 0 0 0 0.2rem rgba(76, 175, 80, 0.25);
}

/* Filter Select Styling */
.filter-select {
  min-width: 150px;
  border-radius: 8px;
}

/* Stats Cards */
.stats-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
}

.stats-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stats-card:nth-child(1) .stats-icon {
  background: linear-gradient(135deg, #4CAF50, #45a049);
}

.stats-card:nth-child(2) .stats-icon {
  background: linear-gradient(135deg, #2196F3, #1976D2);
}

.stats-card:nth-child(3) .stats-icon {
  background: linear-gradient(135deg, #FF9800, #F57C00);
}

.stats-info h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
}

.stats-info p {
  margin: 0;
  color: #6c757d;
  font-size: 0.875rem;
}

/* Table Styling */
.table-container {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.table {
  margin-bottom: 0;
}

.table thead th {
  background: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  color: #495057;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  padding: 1rem;
}

.table tbody td {
  padding: 1rem;
  vertical-align: middle;
}

.room-number {
  font-weight: 600;
  color: #2196F3;
}

.customer-name {
  font-weight: 500;
}

/* Button Styling */
.btn {
  border-radius: 8px;
  padding: 0.5rem 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-sm {
  padding: 0.25rem 0.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-section .row {
    text-align: center;
  }

  .d-flex {
    justify-content: center !important;
  }

  .search-box {
    width: 100%;
  }

  .stats-card {
    margin-bottom: 1rem;
  }
}
</style>
