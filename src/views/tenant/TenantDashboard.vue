<template>
  <div class="tenant-dashboard container">
    <div class="dashboard-header mb-4">
      <h2><i class="fas fa-home me-2"></i>Tổng quan</h2>
      <p class="text-muted">Xin chào, {{ customerName }}</p>
    </div>

    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <div v-else class="dashboard-content">
      <!-- Quick Stats Cards -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="stat-card card">
            <div class="card-body">
              <div class="stat-icon bg-primary">
                <i class="fas fa-door-open"></i>
              </div>
              <h6 class="stat-title">Phòng của bạn</h6>
              <h3 class="stat-value">{{ roomData?.roomNumber || 'N/A' }}</h3>
              <p class="stat-desc">{{ roomData?.houseName || 'N/A' }}</p>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="stat-card card">
            <div class="card-body">
              <div class="stat-icon bg-success">
                <i class="fas fa-money-bill-wave"></i>
              </div>
              <h6 class="stat-title">Tiền thuê hàng tháng</h6>
              <h3 class="stat-value">
                {{ formatCurrency(roomData?.customer?.rentalCost) }}
              </h3>
              <p class="stat-desc">
                Kỳ thanh toán: {{ roomData?.customer?.paymentCycle }}
              </p>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="stat-card card">
            <div class="card-body">
              <div class="stat-icon bg-warning">
                <i class="fas fa-file-contract"></i>
              </div>
              <h6 class="stat-title">Hợp đồng còn lại</h6>
              <h3 class="stat-value">{{ remainingDays }} ngày</h3>
              <p class="stat-desc">
                Hết hạn: {{ formatDate(contractEndDate) }}
              </p>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="stat-card card">
            <div class="card-body">
              <div class="stat-icon bg-info">
                <i class="fas fa-bell"></i>
              </div>
              <h6 class="stat-title">Thông báo mới</h6>
              <h3 class="stat-value">{{ unreadNotifications }}</h3>
              <p class="stat-desc">Tổng: {{ totalNotifications }} thông báo</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Payment History -->
      <div class="row mb-4">
        <div class="col-md-8">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="card-title">Lịch sử thanh toán gần đây</h5>
                <router-link
                  to="/tenant/payment-history"
                  class="btn btn-outline-primary btn-sm"
                >
                  Xem tất cả
                </router-link>
              </div>
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Tháng</th>
                      <th>Tổng tiền</th>
                      <th>Đã trả</th>
                      <th>Còn lại</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="payment in recentPayments" :key="payment.monthYear">
                      <td>{{ formatMonthYear(payment.monthYear) }}</td>
                      <td>{{ formatCurrency(payment.totalAmount) }}</td>
                      <td>{{ formatCurrency(payment.paidAmount) }}</td>
                      <td>{{ formatCurrency(payment.remainingAmount) }}</td>
                      <td>
                        <span class="badge" :class="getPaymentStatusClass(payment)">
                          {{ getPaymentStatusText(payment) }}
                        </span>
                      </td>
                    </tr>
                    <tr v-if="recentPayments.length == 0">
                      <td colspan="5" class="text-center">
                        Không có dữ liệu thanh toán
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Notifications -->
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="card-title">Thông báo mới nhất</h5>
                <router-link
                  to="/tenant/notification"
                  class="btn btn-outline-primary btn-sm"
                >
                  Xem tất cả
                </router-link>
              </div>
              <div class="notifications-list">
                <div
                  v-for="notification in recentNotifications"
                  :key="notification.date"
                  class="notification-item"
                  :class="{ unread: !notification.read }"
                >
                  <h6>{{ notification.title }}</h6>
                  <p class="text-muted">{{ notification.message }}</p>
                  <small>{{ formatDate(notification.date) }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Services Summary -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Dịch vụ đăng ký</h5>
          <div class="row">
            <div
              v-for="service in roomData?.customer?.services"
              :key="service.id"
              class="col-md-3"
            >
              <div class="service-item">
                <i class="fas fa-check-circle text-success me-2"></i>
                <span>{{ service.name }}</span>
                <span class="text-muted">
                  ({{ formatCurrency(service.price) }}/tháng)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import crudApi from '@/apis/crudApi';
import '@/styles/tenant/tenant-dashboard.css';
export default {
  name: 'TenantDashboard',

  data() {
    return {
      loading: true,
      customerName: '',
      roomData: null,
      paymentHistory: [],
      notifications: [],
    };
  },

  computed: {
    recentPayments() {
      return this.paymentHistory.slice(0, 5);
    },

    recentNotifications() {
      return this.notifications.slice(0, 3);
    },

    unreadNotifications() {
      return this.notifications.filter((n) => !n.read).length;
    },

    totalNotifications() {
      return this.notifications.length;
    },

    contractEndDate() {
      if (this.roomData?.customer?.contracts?.length) {
        const currentContract =
          this.roomData.customer.contracts[
            this.roomData.customer.contracts.length - 1
          ];
        return currentContract.contractEndDate;
      }
      return null;
    },

    remainingDays() {
      if (this.contractEndDate) {
        const today = new Date();
        const endDate = new Date(this.contractEndDate);
        const diffTime = endDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      return 0;
    },
  },

  async created() {
    try {
      await Promise.all([
        this.loadRoomData(),
        this.loadPaymentHistory(),
        this.loadNotifications(),
      ]);
    } catch (error) {
      console.error('Error initializing dashboard:', error);
    } finally {
      this.loading = false;
    }
  },

  methods: {
    async loadRoomData() {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.customerName = currentUser.fullName;

        const customersResponse = await crudApi.read('api::customer.customer');
        const customers = customersResponse.data;
        const customerData = customers.find(
          (c) => c.email == currentUser.email
        );

        if (customerData) {
          const homesResponse = await crudApi.read('api::home.home');
          const homes = homesResponse.data;
          const home = homes.find((h) => h.id == customerData.houseId);

          if (home) {
            this.roomData = {
              roomNumber: customerData.roomNumber,
              houseName: home.name,
              houseAddress: `${home.address}, ${home.ward}, ${home.district}, ${home.city}`,
              customer: customerData,
            };
          }
        }
      } catch (error) {
        console.error('Error loading room data:', error);
      }
    },

    async loadPaymentHistory() {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const response = await crudApi.read('api::bill.bill');
        const bills = response.data;

        this.paymentHistory = bills
          .filter((bill) => bill.customerEmail == currentUser.email)
          .map((bill) => {
            console.log('Bill month:', bill.month); // Thêm dòng này để debug
            return {
              monthYear: bill.month,
              totalAmount: bill.totalAmount,
              paidAmount: bill.paidAmount,
              remainingAmount: bill.remainingAmount,
            };
          });
      } catch (error) {
        console.error('Error loading payment history:', error);
      }
    },

    async loadNotifications() {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const allNotifications =
          JSON.parse(localStorage.getItem('notifications')) || [];

        this.notifications = allNotifications
          .filter((n) => n.targetEmail == currentUser.email)
          .sort((a, b) => new Date(b.date) - new Date(a.date));
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    },

    formatCurrency(value) {
      if (!value) return '0 ₫';
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(value);
    },

    formatDate(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('vi-VN');
    },

    formatMonthYear(monthYear) {
      if (!monthYear) return '';
      const [year, month] = monthYear.split('-');
      return `Tháng ${month}/${year}`;
    },

    getPaymentStatusClass(payment) {
      if (!payment.remainingAmount) return 'bg-success';
      if (!payment.paidAmount) return 'bg-danger';
      return 'bg-warning';
    },

    getPaymentStatusText(payment) {
      if (!payment.remainingAmount) return 'Đã thanh toán';
      if (!payment.paidAmount) return 'Chưa thanh toán';
      return 'Thanh toán một phần';
    },
  },
};
</script>