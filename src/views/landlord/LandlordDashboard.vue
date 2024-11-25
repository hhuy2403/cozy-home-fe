<template>
  <div class="landlord-dashboard">
    <!-- Overview Cards -->
    <div class="row g-4 mb-4">
      <div class="col-md-3">
        <div class="stat-card bg-gradient-primary">
          <div class="stat-card-body">
            <div class="stat-card-icon">
              <i class="fas fa-building"></i>
            </div>
            <div class="stat-card-info">
              <h3>{{ totalRooms }}</h3>
              <p>Tổng số phòng</p>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="stat-card bg-gradient-success">
          <div class="stat-card-body">
            <div class="stat-card-icon">
              <i class="fas fa-key"></i>
            </div>
            <div class="stat-card-info">
              <h3>{{ rentedRooms }}</h3>
              <p>Phòng đã thuê</p>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="stat-card bg-gradient-warning">
          <div class="stat-card-body">
            <div class="stat-card-icon">
              <i class="fas fa-door-open"></i>
            </div>
            <div class="stat-card-info">
              <h3>{{ availableRooms }}</h3>
              <p>Phòng trống</p>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="stat-card bg-gradient-info">
          <div class="stat-card-body">
            <div class="stat-card-icon">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="stat-card-info">
              <h3>{{ totalBookings }}</h3>
              <p>Đặt phòng</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Revenue Summary -->
    <div class="row g-4 mb-4">
      <div class="col-md-6">
        <div class="modern-card">
          <div class="modern-card-header">
            <h5>
              <i class="fas fa-chart-line me-2"></i>
              Tổng quan doanh thu tháng {{ currentMonth }}
            </h5>
          </div>
          <div class="modern-card-body">
            <div class="revenue-summary">
              <div class="revenue-item total">
                <div class="revenue-info">
                  <span class="label">Tổng doanh thu</span>
                  <span class="amount">{{ formatCurrency(totalRevenue) }}</span>
                </div>
                <div class="revenue-icon">
                  <i class="fas fa-money-bill-wave"></i>
                </div>
              </div>

              <div class="revenue-item collected">
                <div class="revenue-info">
                  <span class="label">Đã thu</span>
                  <span class="amount">{{ formatCurrency(collectedRevenue) }}</span>
                </div>
                <div class="revenue-icon">
                  <i class="fas fa-check-circle"></i>
                </div>
              </div>

              <div class="revenue-item uncollected">
                <div class="revenue-info">
                  <span class="label">Chưa thu</span>
                  <span class="amount">{{ formatCurrency(uncollectedRevenue) }}</span>
                </div>
                <div class="revenue-icon">
                  <i class="fas fa-exclamation-circle"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="modern-card">
          <div class="modern-card-header">
            <h5>
              <i class="fas fa-exclamation-triangle me-2"></i>
              Phòng cần chú ý
            </h5>
          </div>
          <div class="modern-card-body">
            <div class="table-responsive custom-table">
              <table class="table">
                <thead>
                  <tr>
                    <th>Phòng</th>
                    <th>Khách thuê</th>
                    <th>Trạng thái</th>
                    <th>Số tiền</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="bill in unpaidBills" :key="bill.id">
                    <td>
                      <span class="room-number">{{ bill.roomNumber }}</span>
                    </td>
                    <td>
                      <div class="tenant-info">
                        <span class="tenant-name">{{ bill.customerName }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="status-badge unpaid">Chưa thanh toán</span>
                    </td>
                    <td>
                      <span class="amount">{{ formatCurrency(bill.remainingAmount) }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activities -->
    <div class="row g-4">
      <div class="col-md-6">
        <div class="modern-card">
          <div class="modern-card-header">
            <h5>
              <i class="fas fa-bookmark me-2"></i>
              Đặt phòng gần đây
            </h5>
          </div>
          <div class="modern-card-body">
            <div class="table-responsive custom-table">
              <table class="table">
                <thead>
                  <tr>
                    <th>Phòng</th>
                    <th>Khách hàng</th>
                    <th>Ngày đến</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="booking in recentBookings" :key="booking.id">
                    <td>
                      <span class="room-number">{{ booking.roomNumber }}</span>
                    </td>
                    <td>
                      <div class="tenant-info">
                        <span class="tenant-name">{{ booking.customerName }}</span>
                      </div>
                    </td>
                    <td>{{ formatDate(booking.expectedArrival) }}</td>
                    <td>
                      <span class="status-badge" :class="getBookingStatusClass(booking.status)">
                        {{ getBookingStatusText(booking.status) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="modern-card">
          <div class="modern-card-header">
            <h5>
              <i class="fas fa-file-contract me-2"></i>
              Hợp đồng sắp hết hạn
            </h5>
          </div>
          <div class="modern-card-body">
            <div class="table-responsive custom-table">
              <table class="table">
                <thead>
                  <tr>
                    <th>Phòng</th>
                    <th>Khách thuê</th>
                    <th>Ngày hết hạn</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="contract in expiringContracts" :key="contract.id">
                    <td>
                      <span class="room-number">{{ contract.roomNumber }}</span>
                    </td>
                    <td>
                      <div class="tenant-info">
                        <span class="tenant-name">{{ contract.tenantName }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="expiry-date">{{ formatDate(contract.endDate) }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import crudApi from '@/apis/crudApi';

export default {
  name: 'LandlordDashboard',
  data() {
    return {
      rooms: [],
      bills: [],
      bookings: [],
      contracts: [],
      currentMonth: new Date().toLocaleString('vi-VN', { month: 'long', year: 'numeric' })
    }
  },

  computed: {
    totalRooms() {
      return this.rooms.length
    },

    rentedRooms() {
      return this.rooms.filter(room => room.isRented).length
    },

    availableRooms() {
      return this.rooms.filter(room => !room.isRented).length
    },

    totalBookings() {
      return this.bookings.length
    },

    totalRevenue() {
      return this.bills.reduce((sum, bill) => sum + bill.totalAmount, 0)
    },

    collectedRevenue() {
      return this.bills.reduce((sum, bill) => sum + bill.paidAmount, 0)
    },

    uncollectedRevenue() {
      return this.bills.reduce((sum, bill) => sum + bill.remainingAmount, 0)
    },

    unpaidBills() {
      return this.bills.filter(bill => bill.status == 'unpaid')
    },

    recentBookings() {
      return [...this.bookings].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      ).slice(0, 5)
    },

    expiringContracts() {
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

      return this.contracts.filter(contract => {
        const endDate = new Date(contract.endDate)
        return endDate <= thirtyDaysFromNow && contract.status == 'active'
      }).sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
    }
  },

  methods: {
    async fetchData() {
      try {
        // Lấy thông tin chủ trọ
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser?.id || currentUser.role !== 'landlord') {
          throw new Error('Không tìm thấy thông tin chủ trọ!');
        }

        const homeRes = await crudApi.read("api::home.home", {landlordId: {id: currentUser.id}});
        const listHomeId = homeRes.data.map(item => item.id);

        const roomRes = await crudApi.read("api::room.room", {houseId: {id: listHomeId}});
        const listRoomId = roomRes.data.map(item => item.id);

        // Lọc theo landlordId và tháng hiện tại
        const currentDate = new Date();
        const currentMonthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        const billRes = await crudApi.read("api::bill.bill", {room: {id: listRoomId}, month: currentMonthYear});
        
        const bookingsRes = await crudApi.read("api::landlord-booking.landlord-booking", {roomId: {id: listRoomId}});

        const contractsRes = await crudApi.read("api::contract.contract", {houseId: {id: listHomeId}});


        this.rooms = roomRes.data;
        this.bills = billRes.data;
        this.bookings = bookingsRes.data;
        this.contracts = contractsRes.data;

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: error.message || 'Không thể tải dữ liệu. Vui lòng thử lại!',
          confirmButtonText: 'Đóng'
        });
      }
    },

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
      return true;
    },

    handleNoData() {
      this.rooms = [];
      this.bills = [];
      this.bookings = [];
      this.contracts = [];
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(value)
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('vi-VN')
    },

    getBookingStatusClass(status) {
      return {
        'pending': 'bg-warning',
        'confirmed': 'bg-success',
        'cancelled': 'bg-danger'
      }[status] || 'bg-secondary'
    },

    getBookingStatusText(status) {
      return {
        'pending': 'Đang chờ',
        'confirmed': 'Đã xác nhận',
        'cancelled': 'Đã hủy'
      }[status] || status
    }
  },

  async mounted() {
    try {
      if (await this.checkAccess()) {
        await this.fetchData();
      }
    } catch (error) {
      console.error('Error in mounted:', error);
      this.handleNoData();
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Không thể tải dữ liệu. Vui lòng thử lại sau!'
      });
    }
  }
}
</script>

<style scoped>
.landlord-dashboard {
  margin-top: 3rem !important;
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* Stat Cards */
.stat-card {
  border-radius: 1rem;
  padding: 1.5rem;
  height: 100%;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card-body {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat-card-icon {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 1rem;
  font-size: 1.5rem;
  color: white;
}

.stat-card-info {
  color: white;
}

.stat-card-info h3 {
  font-size: 2rem;
  margin: 0;
  font-weight: 600;
}

.stat-card-info p {
  margin: 0;
  opacity: 0.9;
}

/* Modern Cards */
.modern-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.05);
  height: 100%;
}

.modern-card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modern-card-header h5 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2a3f54;
}

.modern-card-body {
  padding: 1.5rem;
}

/* Revenue Summary */
.revenue-summary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.revenue-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 0.75rem;
  background: #f8f9fa;
  transition: transform 0.3s ease;
}

.revenue-item:hover {
  transform: translateX(5px);
}

.revenue-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.revenue-info .label {
  color: #6c757d;
  font-size: 0.9rem;
}

.revenue-info .amount {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2a3f54;
}

.revenue-icon {
  font-size: 1.5rem;
  opacity: 0.5;
}

/* Custom Table */
.custom-table {
  margin: -0.5rem -1.5rem;
}

.table {
  margin: 0;
}

.table th {
  font-weight: 600;
  color: #2a3f54;
  border-bottom-width: 1px;
}

.table td {
  vertical-align: middle;
  padding: 1rem 1.5rem;
}

.room-number {
  font-weight: 600;
  color: #2a3f54;
}

.tenant-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.85rem;
  font-weight: 500;
}

/* Gradient Backgrounds */
.bg-gradient-primary {
  background: linear-gradient(45deg, #4e73df, #224abe);
}

.bg-gradient-success {
  background: linear-gradient(45deg, #1cc88a, #13855c);
}

.bg-gradient-warning {
  background: linear-gradient(45deg, #f6c23e, #dda20a);
}

.bg-gradient-info {
  background: linear-gradient(45deg, #36b9cc, #258391);
}

/* Status Badges */
.status-badge.bg-warning {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.bg-success {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.bg-danger {
  background-color: #f8d7da;
  color: #721c24;
}

.status-badge.unpaid {
  background-color: #f8d7da;
  color: #721c24;
}

/* Responsive Design */
@media (max-width: 768px) {
  .landlord-dashboard {
    padding: 1rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .modern-card-header,
  .modern-card-body {
    padding: 1rem;
  }
}
</style>