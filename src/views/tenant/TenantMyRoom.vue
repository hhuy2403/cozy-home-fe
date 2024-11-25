<template>
  <div class="my-room container mt-4">
    <div class="page-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h2><i class="fas fa-home me-2"></i>Thông tin phòng của bạn</h2>
          <p class="text-muted mb-0">Quản lý thông tin chi tiết phòng thuê của bạn</p>
        </div>
        <div class="room-status">
          <span class="badge bg-success">
            <i class="fas fa-check-circle me-1"></i>Đang thuê
          </span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <div v-else-if="roomData" class="room-content">
      <!-- Quick Stats -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="stat-card card">
            <div class="card-body">
              <div class="stat-icon bg-primary">
                <i class="fas fa-door-open"></i>
              </div>
              <h6 class="stat-title">Số phòng</h6>
              <h3 class="stat-value">{{ roomData.roomNumber }}</h3>
              <p class="stat-desc">{{ roomData.houseName }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card card">
            <div class="card-body">
              <div class="stat-icon bg-success">
                <i class="fas fa-money-bill-wave"></i>
              </div>
              <h6 class="stat-title">Tiền thuê/tháng</h6>
              <h3 class="stat-value">{{ formatCurrency(roomData.customer.rentalCost) }}</h3>
              <p class="stat-desc">Kỳ thanh toán: {{ roomData.customer.paymentCycle }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card card">
            <div class="card-body">
              <div class="stat-icon bg-info">
                <i class="fas fa-calendar-alt"></i>
              </div>
              <h6 class="stat-title">Ngày bắt đầu</h6>
              <h3 class="stat-value">{{ formatDateShort(roomData.customer.startDate) }}</h3>
              <p class="stat-desc">{{ getDaysFromStart(roomData.customer.startDate) }} ngày</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="stat-card card">
            <div class="card-body">
              <div class="stat-icon bg-warning">
                <i class="fas fa-shield-alt"></i>
              </div>
              <h6 class="stat-title">Tiền đặt cọc</h6>
              <h3 class="stat-value">{{ formatCurrency(roomData.customer.deposit) }}</h3>
              <p class="stat-desc">Đã thanh toán</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Room and Tenant Details -->
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">
                <i class="fas fa-user me-2"></i>Thông tin người thuê
              </h5>
              <div class="info-list">
                <div class="info-item">
                  <span class="info-label">Họ và tên:</span>
                  <span class="info-value">{{ roomData.customer.fullName }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">CMND/CCCD:</span>
                  <span class="info-value">{{ roomData.customer.identityCard }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Điện thoại:</span>
                  <span class="info-value">{{ roomData.customer.phoneNumber1 }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Email:</span>
                  <span class="info-value">{{ roomData.customer.email }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">
                <i class="fas fa-map-marker-alt me-2"></i>Thông tin nhà trọ
              </h5>
              <div class="info-list">
                <div class="info-item">
                  <span class="info-label">Tên nhà:</span>
                  <span class="info-value">{{ roomData.houseName }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Địa chỉ:</span>
                  <span class="info-value">{{ roomData.houseAddress }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Members -->
      <div class="card mb-4" v-if="roomData.customer.members?.length">
        <div class="card-body">
          <h5 class="card-title">
            <i class="fas fa-users me-2"></i>Thành viên trong phòng
            <span class="badge bg-primary ms-2">{{ roomData.customer.members.length }}</span>
          </h5>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Họ tên</th>
                  <th>CMND/CCCD</th>
                  <th>Điện thoại</th>
                  <th>Địa chỉ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(member, index) in roomData.customer.members" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td>{{ member.fullName }}</td>
                  <td>{{ member.identityCard }}</td>
                  <td>{{ member.phoneNumber }}</td>
                  <td>{{ member.address }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Services -->
      <div class="row mb-4">
        <div class="col-md-8">
          <div class="card h-100" v-if="roomData.customer.services?.length">
            <div class="card-body">
              <h5 class="card-title">
                <i class="fas fa-concierge-bell me-2"></i>Dịch vụ đăng ký
                <span class="badge bg-primary ms-2">{{ roomData.customer.services.length }}</span>
              </h5>
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Tên dịch vụ</th>
                      <th>Đơn giá</th>
                      <th>Số lượng</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(service, index) in roomData.customer.services" :key="service.id">
                      <td>{{ index + 1 }}</td>
                      <td>{{ service.name }}</td>
                      <td>{{ formatCurrency(service.price) }}</td>
                      <td>{{ service.quantity }}</td>
                      <td>{{ formatCurrency(service.price * service.quantity) }}</td>
                    </tr>
                    <tr class="table-info">
                      <td colspan="4" class="text-end"><strong>Tổng cộng:</strong></td>
                      <td><strong>{{ formatCurrency(totalServiceCost) }}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Contract Summary -->
        <div class="col-md-4">
          <div class="card h-100" v-if="currentContract">
            <div class="card-body">
              <h5 class="card-title">
                <i class="fas fa-file-contract me-2"></i>Thông tin hợp đồng
              </h5>
              <div class="contract-info">
                <div class="info-item">
                  <span class="info-label">Số hợp đồng:</span>
                  <span class="info-value">{{ currentContract.contractNumber }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Ngày bắt đầu:</span>
                  <span class="info-value">{{ formatDate(currentContract.contractDate) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Thời hạn:</span>
                  <span class="info-value">{{ currentContract.contractDuration }} tháng</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Ngày kết thúc:</span>
                  <span class="info-value">{{ formatDate(currentContract.contractEndDate) }}</span>
                </div>
                <div class="contract-status mt-3">
                  <div class="progress">
                    <div class="progress-bar" :class="getContractProgressClass"
                      :style="{ width: contractProgress + '%' }" role="progressbar">
                      {{ contractProgress }}%
                    </div>
                  </div>
                  <small class="text-muted">
                    Còn lại {{ getRemainingDays }} ngày
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="alert alert-warning">
      <i class="fas fa-exclamation-triangle me-2"></i>
      Không tìm thấy thông tin phòng của bạn.
    </div>
  </div>
</template>

<script>

import crudApi from '@/apis/crudApi';

export default {
  name: 'TenantMyRoom',

  data() {
    return {
      loading: true,
      roomData: null,
    };
  },

  computed: {
    currentContract() {
      if (this.roomData?.customer?.contracts?.length) {
        return this.roomData.customer.contracts[this.roomData.customer.contracts.length - 1];
      }
      return null;
    },

    totalServiceCost() {
      return this.roomData?.customer?.services?.reduce((total, service) => {
        return total + (service.price * service.quantity);
      }, 0) || 0;
    },

    contractProgress() {
      if (!this.currentContract) return 0;
      const start = new Date(this.currentContract.contractDate);
      const end = new Date(this.currentContract.contractEndDate);
      const today = new Date();
      const total = end - start;
      const elapsed = today - start;
      return Math.round((elapsed / total) * 100);
    },

    getContractProgressClass() {
      const progress = this.contractProgress;
      if (progress > 75) return 'bg-danger';
      if (progress > 50) return 'bg-warning';
      return 'bg-success';
    },

    getRemainingDays() {
      if (!this.currentContract) return 0;
      const end = new Date(this.currentContract.contractEndDate);
      const today = new Date();
      const remaining = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
      return remaining > 0 ? remaining : 0;
    }
  },

  async mounted() {
    await this.loadRoomData();
  },

  methods: {
    async loadRoomData() {
      try {
        this.loading = true;
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        // Fetch customers data
        const customersResponse = await crudApi.read('api::customer.customer');
        // const customersResponse = await fetch('https://6725a513c39fedae05b5670b.mockapi.io/api/v1/customers');
        const customers = customersResponse.data;

        // Find customer by email
        const customerData = customers.find(c => c.email == currentUser.email);

        if (customerData) {
          // Fetch homes data
          const homesResponse = await crudApi.read('api::home.home');
          // const homesResponse = await fetch('https://6725a513c39fedae05b5670b.mockapi.io/api/v1/homes');
          const homes = homesResponse.data;

          // Find home by houseId
          const home = homes.find(h => h.id == customerData.houseId);

          if (home) {
            this.roomData = {
              roomNumber: customerData.roomNumber,
              houseName: home.name,
              houseAddress: `${home.address}, ${home.ward}, ${home.district}, ${home.city}`,
              customer: customerData
            };
          }
        }
      } catch (error) {
        console.error('Error loading room data:', error);
      } finally {
        this.loading = false;
      }
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(value);
    },

    formatDateShort(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit'
    });
  },

  getDaysFromStart(dateString) {
    if (!dateString) return 0;
    const start = new Date(dateString);
    const today = new Date();
    return Math.ceil((today - start) / (1000 * 60 * 60 * 24));
  },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN').format(date);
    }
  }
};
</script>

<style scoped>
.my-room {
  margin-top: 5em !important;
  min-height: 100vh;
  padding: 20px;
  background-color: #f8f9fa;
}

.page-header h2 {
  color: #2a3f54;
  font-size: 28px;
  font-weight: 500;
}

.stat-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.stat-icon i {
  color: white;
  font-size: 24px;
}

.stat-title {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 5px;
}

.stat-desc {
  color: #6c757d;
  font-size: 13px;
  margin: 0;
}

.card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.card-title {
  color: #2a3f54;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.info-label {
  min-width: 120px;
  color: #6c757d;
  font-weight: 500;
}

.info-value {
  color: #2a3f54;
  font-weight: 500;
}

.table {
  margin-bottom: 0;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #2a3f54;
}

.table td {
  vertical-align: middle;
}

.progress {
  height: 10px;
  border-radius: 5px;
  margin-bottom: 5px;
}

.contract-status small {
  display: block;
  text-align: center;
}

.badge {
  padding: 8px 12px;
  border-radius: 20px;
}

@media (max-width: 768px) {
  .my-room {
    padding: 15px;
  }
  
  .stat-card {
    margin-bottom: 15px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .info-label {
    min-width: auto;
    margin-bottom: 5px;
  }
}
</style>
