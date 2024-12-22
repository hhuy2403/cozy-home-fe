<template>
  <div class="admin-dashboard container-fluid">
    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <h1 class="dashboard-title my-4">
      <i class="fas fa-tachometer-alt"></i> Tổng Quan Hệ Thống
    </h1>

    <!-- Error Alert -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ error }}
      <button type="button" class="btn-close" @click="error = null"></button>
    </div>

    <!-- Stats Overview -->
    <div class="stats-overview row g-4 mb-5">
      <!-- Users Stats -->
      <div class="col-12 col-md-6 col-lg-3">
        <div class="stat-card">
          <div class="stat-icon users">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <h3>Người Dùng</h3>
            <div class="stat-value">{{ stats.totalUsers }}</div>
            <div class="stat-details">
              <span class="text-success">
                <i class="fas fa-user-shield"></i> {{ stats.adminCount }} Admin
              </span>
              <span class="text-primary">
                <i class="fas fa-house-user"></i> {{ stats.landlordCount }} Chủ nhà
              </span>
              <span class="text-info">
                <i class="fas fa-user"></i> {{ stats.tenantCount }} Người thuê
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Financial Stats -->
      <div class="col-12 col-md-6 col-lg-3">
        <div class="stat-card">
          <div class="stat-icon finance">
            <i class="fas fa-money-bill-wave"></i>
          </div>
          <div class="stat-content">
            <h3>Tài Chính</h3>
            <div class="stat-value">{{ formatCurrency(stats.totalDebt) }}</div>
            <div class="stat-details">
              <span class="text-success">
                <i class="fas fa-check-circle"></i> {{ formatCurrency(stats.totalPaid) }}
              </span>
              <span class="text-danger">
                <i class="fas fa-clock"></i> {{ formatCurrency(stats.totalUnpaid) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Contracts Stats -->
      <div class="col-12 col-md-6 col-lg-3">
        <div class="stat-card">
          <div class="stat-icon contracts">
            <i class="fas fa-file-contract"></i>
          </div>
          <div class="stat-content">
            <h3>Hợp Đồng</h3>
            <div class="stat-value">{{ stats.totalContracts }}</div>
            <div class="stat-details">
              <span class="text-success">
                <i class="fas fa-check"></i> {{ stats.activeContracts }} Đang hiệu lực
              </span>
              <span class="text-danger">
                <i class="fas fa-times"></i> {{ stats.expiredContracts }} Hết hạn
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Notifications Stats -->
      <div class="col-12 col-md-6 col-lg-3">
        <div class="stat-card">
          <div class="stat-icon notifications">
            <i class="fas fa-bell"></i>
          </div>
          <div class="stat-content">
            <h3>Thông Báo</h3>
            <div class="stat-value">{{ stats.totalNotifications }}</div>
            <div class="stat-details">
              <span class="text-success">
                <i class="fas fa-paper-plane"></i> {{ stats.sentNotifications }} Đã gửi
              </span>
              <span class="text-warning">
                <i class="fas fa-clock"></i> {{ stats.scheduledNotifications }} Lên lịch
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activities -->
    <div class="recent-activities mb-5">
      <h2 class="section-title mb-4">
        <i class="fas fa-history"></i> Hoạt Động Gần Đây
      </h2>
      <div class="row g-4">
        <!-- Recent Users -->
        <div class="col-12 col-lg-6">
          <div class="card">
            <div class="card-header">
              <h3>Người Dùng Mới</h3>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Tên</th>
                      <th>Email</th>
                      <th>Vai trò</th>
                      <th>Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in recentUsers" :key="user.id">
                      <td>{{ user.name }}</td>
                      <td>{{ user.email }}</td>
                      <td>
                        <span :class="getRoleBadgeClass(user.role)">
                          {{ user.role }}
                        </span>
                      </td>
                      <td>{{ formatDate(user.createdAt) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Notifications -->
        <div class="col-12 col-lg-6">
          <div class="card">
            <div class="card-header">
              <h3>Thông Báo Gần Đây</h3>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Tiêu đề</th>
                      <th>Loại</th>
                      <th>Trạng thái</th>
                      <th>Ngày gửi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="notification in recentNotifications" :key="notification.id">
                      <td>{{ notification.title }}</td>
                      <td>
                        <span :class="getNotificationTypeBadgeClass(notification.type)">
                          {{ notification.type }}
                        </span>
                      </td>
                      <td>
                        <span :class="getStatusBadgeClass(notification.status)">
                          {{ notification.status }}
                        </span>
                      </td>
                      <td>{{ formatDate(notification.sentAt || notification.createdAt) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import axios from 'axios'
import Swal from 'sweetalert2'
import crudApi from '@/apis/crudApi.js'

export default {
  name: 'AdminDashboard',

  data() {
    return {
      loading: false,
      error: null,
      stats: {
        totalUsers: 0,
        adminCount: 0,
        landlordCount: 0,
        tenantCount: 0,
        totalDebt: 0,
        totalPaid: 0,
        totalUnpaid: 0,
        totalContracts: 0,
        activeContracts: 0,
        expiredContracts: 0,
        totalNotifications: 0,
        sentNotifications: 0,
        scheduledNotifications: 0
      },
      recentUsers: [],
      recentNotifications: []
    }
  },

  methods: {
    showLoading() {
      this.loading = true
    },

    hideLoading() {
      this.loading = false
    },

    showError(message) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: message,
        confirmButtonText: 'Đóng'
      })
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

    getRoleBadgeClass(role) {
      const classes = {
        admin: 'badge bg-danger',
        landlord: 'badge bg-primary',
        tenant: 'badge bg-info'
      }
      return classes[role] || 'badge bg-secondary'
    },

    getNotificationTypeBadgeClass(type) {
      const classes = {
        system: 'badge bg-primary',
        promotion: 'badge bg-success',
        update: 'badge bg-info',
        alert: 'badge bg-warning'
      }
      return classes[type] || 'badge bg-secondary'
    },

    getStatusBadgeClass(status) {
      const classes = {
        sent: 'badge bg-success',
        scheduled: 'badge bg-warning',
        draft: 'badge bg-secondary'
      }
      return classes[status] || 'badge bg-secondary'
    },

    async fetchDashboardData() {
      try {
        this.showLoading()
        const [users, debts, contracts, notifications] = await Promise.all([
          crudApi.read("plugin::users-permissions.user"),
          crudApi.read("api::debt.debt"),
          crudApi.read("api::contract.contract"),
          crudApi.read("api::notification.notification"),
        ])

        // Process users data
        this.stats.totalUsers = users.data.length
        this.stats.adminCount = users.data.filter(u => u.role == 'admin').length
        this.stats.landlordCount = users.data.filter(u => u.role == 'landlord').length
        this.stats.tenantCount = users.data.filter(u => u.role == 'tenant').length
        this.recentUsers = users.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        ).slice(0, 5)

        // Process financial data
        this.stats.totalDebt = debts.data.reduce((sum, debt) => sum + debt.amount, 0)
        this.stats.totalPaid = debts.data
          .filter(debt => debt.status == 'Đã Thanh Toán')
          .reduce((sum, debt) => sum + debt.amount, 0)
        this.stats.totalUnpaid = debts.data
          .filter(debt => debt.status == 'Chưa Thanh Toán')
          .reduce((sum, debt) => sum + debt.amount, 0)

        // Process contracts data
        const now = new Date()
        this.stats.totalContracts = contracts.data.length
        this.stats.activeContracts = contracts.data.filter(c => 
          new Date(c.endDate) >= now
        ).length
        this.stats.expiredContracts = contracts.data.filter(c => 
          new Date(c.endDate) < now
        ).length

        // Process notifications data
        this.stats.totalNotifications = notifications.data.length
        this.stats.sentNotifications = notifications.data.filter(n => 
          n.status == 'sent'
        ).length
        this.stats.scheduledNotifications = notifications.data.filter(n => 
          n.status == 'scheduled'
        ).length
        this.recentNotifications = notifications.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        ).slice(0, 5)

      } catch (err) {
        this.error = 'Không thể tải dữ liệu. Vui lòng thử lại sau.'
        this.showError(this.error)
        console.error('Error fetching dashboard data:', err)
      } finally {
        this.hideLoading()
      }
    }
  },

  created() {
    this.fetchDashboardData()
  }
}
</script>

<style scoped>
.admin-dashboard {
  margin-top: 80px;
  padding: 1.5rem;
  background-color: #f8f9fa;
  min-height: calc(100vh - 80px);
}

.dashboard-title {
  color: #2c3e50;
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.dashboard-title i {
  color: #3498db;
}

/* Stats Cards */
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 1rem;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon.users { background: rgba(52, 152, 219, 0.1); color: #3498db; }
.stat-icon.finance { background: rgba(46, 204, 113, 0.1); color: #2ecc71; }
.stat-icon.contracts { background: rgba(155, 89, 182, 0.1); color: #9b59b2; }
.stat-icon.notifications { background: rgba(241, 196, 15, 0.1); color: #f1c40f; }

.stat-content {
  flex: 1;
}

.stat-content h3 {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.stat-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.75rem;
}

/* Recent Activities Section */
.section-title {
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.card-header {
  background: white;
  border-bottom: 1px solid #eee;
  padding: 1rem 1.5rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #2c3e50;
}

.card-body {
  padding: 1.5rem;
}

/* Table Styles */
.table {
  margin-bottom: 0;
}

.table th {
  font-weight: 600;
  color: #2c3e50;
  border-bottom-width: 1px;
}

.table td {
  vertical-align: middle;
}

.badge {
  padding: 0.35em 0.65em;
  font-size: 0.75em;
  font-weight: 500;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

/* Responsive Design */
@media (max-width: 768px) {
  .admin-dashboard {
    padding: 1rem;
  }

  .dashboard-title {
    font-size: 1.5rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .card-header,
  .card-body {
    padding: 1rem;
  }
}
</style>