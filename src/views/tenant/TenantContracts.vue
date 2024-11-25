<template>
  <div class="tenant-contract container mt-4">
    <div class="page-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h2><i class="fas fa-file-contract me-2"></i>Thông tin hợp đồng thuê nhà</h2>
          <p class="text-muted mb-0">Chi tiết hợp đồng và điều khoản thuê nhà của bạn</p>
        </div>
        <div class="contract-status">
          <span class="badge" :class="getContractStatusClass">
            <i class="fas" :class="getContractStatusIcon"></i>
            {{ getContractStatusText }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <div v-else-if="contractData">
      <!-- Contract Progress -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="contract-progress">
            <div class="progress-info d-flex justify-content-between mb-2">
              <span>Tiến độ hợp đồng</span>
              <span>{{ getContractProgress }}%</span>
            </div>
            <div class="progress" style="height: 10px;">
              <div class="progress-bar" :class="getProgressBarClass" :style="{ width: getContractProgress + '%' }"
                role="progressbar"></div>
            </div>
            <div class="d-flex justify-content-between mt-2">
              <small>{{ formatDate(contractData.startDate) }}</small>
              <small>{{ formatDate(contractData.endDate) }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Thông tin chung -->
      <div class="contract-details card mb-4">
        <div class="card-body">
          <h5 class="card-title">
            <i class="fas fa-info-circle me-2"></i>Thông tin chung
          </h5>
          <div class="row">
            <div class="col-md-6">
              <div class="info-section">
                <h6 class="text-primary">
                  <i class="fas fa-user-tie me-2"></i>Bên cho thuê
                </h6>
                <div class="info-list">
                  <div class="info-item">
                    <span class="info-label">Họ tên:</span>
                    <span class="info-value">{{ contractData.landlordName }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Địa chỉ:</span>
                    <span class="info-value">{{ contractData.landlordAddress }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Điện thoại:</span>
                    <span class="info-value">{{ contractData.landlordPhone }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="info-section">
                <h6 class="text-primary">
                  <i class="fas fa-user me-2"></i>Bên thuê
                </h6>
                <div class="info-list">
                  <div class="info-item">
                    <span class="info-label">Họ tên:</span>
                    <span class="info-value">{{ contractData.tenantName }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">CMND/CCCD:</span>
                    <span class="info-value">{{ contractData.tenantIdentityCard }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Điện thoại:</span>
                    <span class="info-value">{{ contractData.tenantPhone }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Địa chỉ:</span>
                    <span class="info-value">{{ contractData.tenantAddress }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chi tiết hợp đồng -->
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">
                <i class="fas fa-home me-2"></i>Thông tin nhà trọ
              </h5>
              <div class="info-list">
                <div class="info-item">
                  <span class="info-label">Nhà:</span>
                  <span class="info-value">{{ houseData?.name }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Địa chỉ:</span>
                  <span class="info-value">{{ formatAddress(houseData) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Phòng số:</span>
                  <span class="info-value">{{ contractData.roomNumber }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">
                <i class="fas fa-file-invoice-dollar me-2"></i>Chi phí & Thời hạn
              </h5>
              <div class="info-list">
                <div class="info-item">
                  <span class="info-label">Tiền thuê:</span>
                  <span class="info-value text-success">
                    {{ formatCurrency(contractData.rentalCost) }}/tháng
                  </span>
                </div>
                <div class="info-item">
                  <span class="info-label">Tiền cọc:</span>
                  <span class="info-value text-primary">
                    {{ formatCurrency(contractData.deposit) }}
                  </span>
                </div>
                <div class="info-item">
                  <span class="info-label">Thời hạn:</span>
                  <span class="info-value">
                    {{ formatDate(contractData.startDate) }} -
                    {{ formatDate(contractData.endDate) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Điều khoản hợp đồng -->
      <div class="contract-terms card mb-4">
        <div class="card-body">
          <h5 class="card-title">
            <i class="fas fa-gavel me-2"></i>Điều khoản hợp đồng
          </h5>
          <div class="terms-content">
            {{ contractData.terms }}
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="text-center mb-4">
        <button class="btn btn-primary btn-lg" @click="downloadContract">
          <i class="fas fa-download me-2"></i>Tải hợp đồng PDF
        </button>
      </div>
    </div>

    <div v-else class="alert alert-warning">
      <i class="fas fa-exclamation-triangle me-2"></i>
      Không tìm thấy thông tin hợp đồng của bạn.
    </div>
  </div>
</template>

<script>
import jsPDF from 'jspdf';
import crudApi from "@/apis/crudApi";

export default {
  name: 'TenantContract',

  data() {
    return {
      loading: true,
      contractData: null,
      houseData: null,
    };
  },

  async mounted() {
    await this.loadContractData();
  },

  computed: {
    getContractProgress() {
      if (!this.contractData) return 0;
      const start = new Date(this.contractData.startDate);
      const end = new Date(this.contractData.endDate);
      const now = new Date();
      const total = end - start;
      const current = now - start;
      return Math.min(Math.max(Math.round((current / total) * 100), 0), 100);
    },

    getContractStatusClass() {
      const progress = this.getContractProgress;
      if (progress >= 90) return 'bg-danger';
      if (progress >= 75) return 'bg-warning';
      return 'bg-success';
    },

    getContractStatusIcon() {
      const progress = this.getContractProgress;
      if (progress >= 90) return 'fa-exclamation-circle';
      if (progress >= 75) return 'fa-clock';
      return 'fa-check-circle';
    },

    getContractStatusText() {
      const progress = this.getContractProgress;
      if (progress >= 90) return 'Sắp hết hạn';
      if (progress >= 75) return 'Đang hiệu lực';
      return 'Còn hạn dài';
    },

    getProgressBarClass() {
      const progress = this.getContractProgress;
      if (progress >= 90) return 'bg-danger';
      if (progress >= 75) return 'bg-warning';
      return 'bg-success';
    }
  },

  methods: {
    async loadContractData() {
      try {
        this.loading = true;
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        // Lấy thông tin khách hàng
        const customersResponse = await crudApi.read("api::customer.customer");
        const customers = customersResponse.data;
        const customerData = customers.find(c => c.email == currentUser.email);

        if (customerData) {
          // Lấy thông tin hợp đồng
          const contractsResponse = await crudApi.read("api::contract.contract");
          const contracts = contractsResponse.data;
          const contract = contracts.find(c =>
            c.tenantName == customerData.fullName &&
            c.roomNumber == customerData.roomNumber
          );

          if (contract) {
            this.contractData = contract;

            // Lấy thông tin nhà từ hợp đồng
            const homesResponse = await crudApi.read("api::home.home", {id: contract.houseId.id});
            const homes = homesResponse.data;
            this.houseData = homes[0];
          }
        }
      } catch (error) {
        console.error('Error loading contract data:', error);
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

    formatDate(dateString) {
      if (!dateString) return 'Không xác định';
      return new Date(dateString).toLocaleDateString('vi-VN');
    },

    formatAddress(house) {
      if (!house) return '';
      const parts = [
        house.address,
        house.ward,
        house.district,
        house.city
      ].filter(Boolean);
      return parts.join(', ');
    },

    downloadContract() {
      if (!this.contractData) return;

      const doc = new jsPDF();

      // Set font size for title
      doc.setFontSize(18);
      doc.text("HỢP ĐỒNG THUÊ NHÀ", 105, 20, { align: 'center' });

      // Bên cho thuê
      doc.setFontSize(12);
      doc.text("BÊN CHO THUÊ (BÊN A):", 10, 40);
      doc.text(`Họ tên: ${this.contractData.landlordName}`, 20, 50);
      doc.text(`Địa chỉ: ${this.contractData.landlordAddress}`, 20, 60);
      doc.text(`Điện thoại: ${this.contractData.landlordPhone}`, 20, 70);

      // Bên thuê
      doc.text("BÊN THUÊ (BÊN B):", 10, 90);
      doc.text(`Họ tên: ${this.contractData.tenantName}`, 20, 100);
      doc.text(`CMND/CCCD: ${this.contractData.tenantIdentityCard}`, 20, 110);
      doc.text(`Địa chỉ: ${this.contractData.tenantAddress}`, 20, 120);
      doc.text(`Điện thoại: ${this.contractData.tenantPhone}`, 20, 130);

      // Thông tin hợp đồng
      doc.text("NỘI DUNG HỢP ĐỒNG:", 10, 150);
      doc.text(`Phòng số: ${this.contractData.roomNumber}`, 20, 160);
      doc.text(`Địa chỉ: ${this.formatAddress(this.houseData)}`, 20, 170);
      doc.text(`Giá thuê: ${this.formatCurrency(this.contractData.rentalCost)}/tháng`, 20, 180);
      doc.text(`Tiền đặt cọc: ${this.formatCurrency(this.contractData.deposit)}`, 20, 190);
      doc.text(`Thời hạn: ${this.formatDate(this.contractData.startDate)} - ${this.formatDate(this.contractData.endDate)}`, 20, 200);

      // Điều khoản
      doc.text("ĐIỀU KHOẢN:", 10, 220);
      doc.setFontSize(10);
      doc.text(this.contractData.terms, 20, 230, { maxWidth: 170 });

      // Save the PDF
      doc.save(`Hop_dong_thue_nha_${this.contractData.roomNumber}.pdf`);
    }
  }
};
</script>

<style scoped>
.tenant-contract {
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

.card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-5px);
}

.card-title {
  color: #2a3f54;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.info-section {
  margin-bottom: 20px;
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

.terms-content {
  white-space: pre-line;
  line-height: 1.6;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #eee;
}

.badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
}

.progress {
  border-radius: 10px;
  background-color: #e9ecef;
}

.progress-bar {
  border-radius: 10px;
  transition: width 0.6s ease;
}

.btn-primary {
  padding: 12px 30px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 123, 255, 0.3);
}

@media (max-width: 768px) {
  .tenant-contract {
    padding: 15px;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-label {
    min-width: auto;
    margin-bottom: 5px;
  }

  .btn-primary {
    width: 100%;
  }
}
</style>
