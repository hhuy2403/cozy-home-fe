<template>
  <div class="modern-container">
    <!-- Header Section -->
    <div class="report-header">
      <div class="title-section">
        <i class="fas fa-users me-2"></i>
        <h2>Danh sách khách thuê phòng</h2>
      </div>
      <button class="btn-modern" @click="fetchReport">
        <i class="fas fa-sync-alt me-2"></i> Cập nhật
      </button>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="row g-3">
        <div class="col-lg-2 col-md-4">
          <div class="filter-item">
            <label class="filter-label">Từ ngày</label>
            <div class="input-group">
              <span class="input-group-text">
                <i class="fas fa-calendar-alt"></i>
              </span>
              <input type="month" class="form-control" v-model="startDate" placeholder="Chọn ngày bắt đầu">
            </div>
          </div>
        </div>

        <div class="col-lg-2 col-md-4">
          <div class="filter-item">
            <label class="filter-label">Đến ngày</label>
            <div class="input-group">
              <span class="input-group-text">
                <i class="fas fa-calendar-alt"></i>
              </span>
              <input type="month" class="form-control" v-model="endDate" placeholder="Chọn ngày kết thúc">
            </div>
          </div>
        </div>

        <div class="col-lg-2 col-md-4">
          <div class="filter-item">
            <label class="filter-label">Nhà</label>
            <div class="input-group">
              <span class="input-group-text">
                <i class="fas fa-home"></i>
              </span>
              <select class="form-select" v-model="selectedHouse">
                <option value="">Tất cả nhà</option>
                <option v-for="house in houses" :key="house.id" :value="house.name">
                  {{ house.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="col-lg-2 col-md-4">
          <div class="filter-item">
            <label class="filter-label">Phòng</label>
            <div class="input-group">
              <span class="input-group-text">
                <i class="fas fa-door-open"></i>
              </span>
              <select class="form-select" v-model="selectedRoom">
                <option value="">Tất cả phòng</option>
                <option v-for="room in filteredRooms" :key="room.id" :value="room.roomNumber">
                  Phòng {{ room.roomNumber }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="col-lg-2 col-md-4">
          <div class="filter-item">
            <label class="filter-label">Trạng thái</label>
            <div class="input-group">
              <span class="input-group-text">
                <i class="fas fa-tag"></i>
              </span>
              <select class="form-select" v-model="status">
                <option value="">Tất cả</option>
                <option value="active">Đang thuê</option>
                <option value="expired">Hết hạn</option>
              </select>
            </div>
          </div>
        </div>

        <div class="col-lg-2 col-md-4">
          <div class="filter-item">
            <label class="filter-label">&nbsp;</label>
            <button class="btn btn-primary w-100" @click="fetchReport">
              <i class="fas fa-search me-2"></i>
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Content Section -->
    <div class="content-section">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-circle error-icon"></i>
        <p>{{ error }}</p>
      </div>

      <!-- Data Table -->
      <div v-else class="modern-table-wrapper">
        <table class="modern-table">
          <thead>
            <tr>
              <th>Khách thuê</th>
              <th>Thông tin liên hệ</th>
              <th>Phòng thuê</th>
              <th>Thời gian</th>
              <th>Tài chính</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(customer, index) in filteredCustomers" :key="index">
              <td>
                <div class="customer-info">
                  <span class="customer-name">{{ customer.fullName }}</span>
                  <small class="customer-id">{{ customer.identityCard }}</small>
                </div>
              </td>
              <td>
                <div class="contact-info">
                  <div><i class="fas fa-phone me-1"></i>{{ customer.phoneNumber1 }}</div>
                  <div><i class="fas fa-map-marker-alt me-1"></i>{{ customer.address }}</div>
                </div>
              </td>
              <td>
                <div class="room-info">
                  <div class="house-name">{{ customer.houseName }}</div>
                  <div class="room-number">Phòng {{ customer.roomNumber }}</div>
                </div>
              </td>
              <td>
                <div class="date-info">
                  <div>Từ: {{ formatDate(customer.startDate) }}</div>
                  <div>Đến: {{ formatDate(customer.endDate) }}</div>
                </div>
              </td>
              <td>
                <div class="financial-info">
                  <div class="price">Giá thuê: {{ formatCurrency(customer.price) }}</div>
                  <div class="deposit">Đặt cọc: {{ formatCurrency(customer.deposit) }}</div>
                  <div class="balance" :class="customer.remainingAmount > 0 ? 'text-danger' : 'text-success'">
                    Còn lại: {{ formatCurrency(customer.remainingAmount) }}
                  </div>
                </div>
              </td>
              <td>
                <span class="status-badge" :class="getStatusClass(customer.status)">
                  {{ customer.status }}
                </span>
              </td>
            </tr>
            <tr v-if="filteredCustomers.length == 0">
              <td colspan="6" class="text-center py-4">
                <div class="empty-state">
                  <i class="fas fa-search mb-2"></i>
                  <p>Không tìm thấy dữ liệu phù hợp</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import crudApi from '@/apis/crudApi';

export default {
  name: 'CustomerReport',

  data() {
    return {
      startDate: "",
      endDate: "",
      selectedHouse: "",
      selectedRoom: "",
      status: "",
      houses: [],
      rooms: [],
      customers: [],
      bills: [],
      isLoading: false,
      error: null
    };
  },

  computed: {
    filteredRooms() {
      if (!this.selectedHouse) return this.rooms;
      return this.rooms.filter(room => {
        const house = this.houses.find(h => h.id == room.houseId);
        return house && house.name == this.selectedHouse;
      });
    },

    filteredCustomers() {
      return this.customers.filter(customer => {
        // Kiểm tra ngày
        let matchDate = true;
        if (this.startDate || this.endDate) {
          const customerStartDate = new Date(customer.startDate);
          const filterStartDate = this.startDate ? new Date(this.startDate) : null;
          const filterEndDate = this.endDate ? new Date(this.endDate) : null;

          matchDate = (!filterStartDate || customerStartDate >= filterStartDate) &&
            (!filterEndDate || customerStartDate <= filterEndDate);
        }

        // Kiểm tra nhà
        const matchHouse = !this.selectedHouse || customer.houseName == this.selectedHouse;

        // Kiểm tra phòng
        const matchRoom = !this.selectedRoom || customer.roomNumber == this.selectedRoom;

        // Kiểm tra trạng thái
        const matchStatus = !this.status ||
          (this.status == 'active' && customer.status == 'Đang thuê') ||
          (this.status == 'expired' && customer.status == 'Hết hạn');

        return matchDate && matchHouse && matchRoom && matchStatus;
      });
    }
  },

  methods: {
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    },

    formatCurrency(value) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value || 0);
    },

    getStatusClass(status) {
      return {
        'badge bg-success': status == 'Đang thuê',
        'badge bg-danger': status == 'Hết hạn'
      };
    },

    async fetchAllData() {
      this.isLoading = true;
      this.error = null;

      try {
        // Lấy thông tin currentUser từ localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser?.id) {
          throw new Error('Không tìm thấy thông tin người dùng!');
        }

        // Fetch all data in parallel

        const housesRes = await crudApi.read("api::home.home", {landlordId: {id: currentUser.id}});
        const allHouses = housesRes.data;
        this.houses = allHouses;
        const landlordHouseIds = this.houses.map(house => house.id);

        const roomsRes = await crudApi.read("api::room.room", {houseId: {id: landlordHouseIds}});
        const allRooms = roomsRes.data;
        this.rooms = allRooms;
        const landlordRoomIds = this.rooms.map(room => room.id);

        const billsRes = await crudApi.read("api::bill.bill", {room: {id: landlordRoomIds}});
        const allBills = billsRes.data.map(i => ({ ...i, status: i.customStatus }));
        this.bills = allBills;


        const customersRes = await crudApi.read("api::customer.customer", {rooms: {id: landlordRoomIds}});
        const allCustomers = customersRes.data;
        const filteredCustomers = allCustomers;

        this.customers = filteredCustomers.map(customer => {
          const room = this.rooms.find(r => r.customers.find(c=>c.id==customer.id));
          const house = this.houses.find(h => h.roomId.find(r=>r.id == room?.id));
          const customerBills = this.bills.filter(b => b.customerId.id==customer.id);

          const totalAmount = customerBills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
          const paidAmount = customerBills.reduce((sum, bill) => sum + (bill.paidAmount || 0), 0);

          const contract = customer.contracts?.[0] || {};
          const isActive = new Date(contract.contractEndDate) > new Date();

          return {
            fullName: customer.fullName || '',
            identityCard: customer.identityCard || '',
            address: customer.address || '',
            phoneNumber1: customer.phoneNumber1 || '',
            houseName: house?.name || '',
            roomNumber: room?.roomNumber || '',
            startDate: contract.contractDate || '',
            endDate: contract.contractEndDate || '',
            contractEndDate: contract.contractEndDate || '',
            status: isActive ? 'Đang thuê' : 'Hết hạn',
            customStatus: isActive ? 'Đang thuê' : 'Hết hạn',
            price: room?.price || 0,
            deposit: customer.deposit || 0,
            totalAmount,
            paid: paidAmount,
            remainingAmount: totalAmount - paidAmount,
            referrer: customer.referral || '',
            birthDate: customer.birthDate || ''
          };
        });

      } catch (error) {
        console.error('Error fetching data:', error);
        this.error = 'Không thể tải dữ liệu. Vui lòng thử lại sau!';
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: this.error
        });
      } finally {
        this.isLoading = false;
      }
    },

    async fetchReport() {
      await this.fetchAllData();
    }
  },

  async mounted() {
    await this.fetchAllData();
  }
};
</script>

<style scoped>
.modern-container {
  margin-top: 3rem !important;
  padding: 2rem;
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.title-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.btn-modern {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.btn-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

.filter-section {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-weight: 500;
  color: #344767;
  font-size: 0.875rem;
}

.input-group {
  border-radius: 6px;
  overflow: hidden;
}

.input-group-text {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-right: none;
  color: #6c757d;
}

.form-control,
.form-select {
  border: 1px solid #dee2e6;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.form-control:focus,
.form-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
}

.btn-primary {
  background: linear-gradient(to right, #3b82f6, #2563eb);
  border: none;
  padding: 0.5rem 1rem;
  font-weight: 500;
  height: 38px;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: linear-gradient(to right, #2563eb, #1d4ed8);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
}

@media (max-width: 768px) {
  .filter-section {
    padding: 1rem;
  }

  .filter-item {
    margin-bottom: 0.5rem;
  }
}

.modern-input input,
.modern-input select {
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  width: 100%;
  transition: all 0.3s ease;
}

.modern-input label {
  position: absolute;
  left: 2.5rem;
  top: 0.75rem;
  color: #6c757d;
  transition: all 0.3s ease;
  pointer-events: none;
}

.modern-table-wrapper {
  overflow-x: auto;
  border-radius: 0.75rem;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
}

.modern-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.modern-table th {
  background: #f8f9fa;
  padding: 1rem;
  font-weight: 600;
  color: #2c3e50;
  text-align: left;
}

.modern-table td {
  padding: 1rem;
  border-top: 1px solid #dee2e6;
}

.customer-info,
.contact-info,
.room-info,
.date-info,
.financial-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.customer-name {
  font-weight: 500;
  color: #2c3e50;
}

.customer-id {
  color: #6c757d;
  font-size: 0.875rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.expired {
  background: #f8d7da;
  color: #721c24;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #6c757d;
}

.empty-state i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

/* Responsive Design */
@media (max-width: 992px) {
  .modern-container {
    padding: 1rem;
  }

  .report-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .title-section {
    justify-content: center;
  }
}
</style>