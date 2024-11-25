<template>
  <div class="tenant-payment container mt-4">
    <!-- Header Section -->
    <div class="row mb-4 align-items-start">
      <div class="col-md-6">
        <h2>Thanh toán hóa đơn</h2>
      </div>
    </div>

    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <div v-else>
      <!-- Filter Section -->
      <div class="row mb-3">
        <div class="col-md-4">
          <label for="selectedMonth">Tháng/năm</label>
          <input type="month" id="selectedMonth" v-model="selectedMonth" class="form-control" />
        </div>
      </div>

      <!-- Invoice Summary -->
      <div class="row">
        <div class="col-md-8">
          <div class="card mb-4">
            <div class="card-body">
              <h5 class="card-title">Chi tiết hóa đơn</h5>
              <div class="bill-info" v-if="currentBill">
                <p><strong>Nhà:</strong> {{ currentBill.houseName }}</p>
                <p><strong>Phòng:</strong> {{ currentBill.roomNumber }}</p>
                <p><strong>Khách thuê:</strong> {{ currentBill.customerName }}</p>
                <p><strong>Tháng:</strong> {{ formatMonth(currentBill.month) }}</p>

                <!-- Chi tiết các khoản phí -->
                <div class="table-responsive mt-3">
                  <table class="table table-bordered">
                    <thead class="table-light">
                      <tr>
                        <th>Khoản mục</th>
                        <th>Chi tiết</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      <!-- Tiền thuê -->
                      <tr>
                        <td>Tiền thuê phòng</td>
                        <td>-</td>
                        <td>{{ formatCurrency(currentBill.billDetails.rentalCost.amount) }}</td>
                      </tr>

                      <!-- Tiền điện -->
                      <tr>
                        <td>Tiền điện</td>
                        <td>{{ currentBill.billDetails.electric.usage }} kWh</td>
                        <td>{{ formatCurrency(currentBill.billDetails.electric.amount) }}</td>
                      </tr>

                      <!-- Tiền nước -->
                      <tr>
                        <td>Tiền nước</td>
                        <td>{{ currentBill.billDetails.water.usage }} m³</td>
                        <td>{{ formatCurrency(currentBill.billDetails.water.amount) }}</td>
                      </tr>

                      <!-- Các dịch vụ khác -->
                      <tr v-for="service in currentBill.billDetails.services" :key="service.name">
                        <td>{{ service.name }}</td>
                        <td>{{ service.quantity }} x {{ formatCurrency(service.unitPrice) }}</td>
                        <td>{{ formatCurrency(service.amount) }}</td>
                      </tr>

                      <!-- Phí khác -->
                      <tr v-for="(fee, index) in currentBill.billDetails.otherFees" :key="index">
                        <td colspan="2">{{ fee.description }}</td>
                        <td>{{ formatCurrency(fee.amount) }}</td>
                      </tr>
                    </tbody>
                    <tfoot class="table-light">
                      <tr>
                        <th colspan="2">Tổng cộng</th>
                        <th>{{ formatCurrency(currentBill.totalAmount) }}</th>
                      </tr>
                      <tr>
                        <th colspan="2">Đã thanh toán</th>
                        <th>{{ formatCurrency(currentBill.paidAmount) }}</th>
                      </tr>
                      <tr>
                        <th colspan="2">Còn lại</th>
                        <th>{{ formatCurrency(currentBill.remainingAmount) }}</th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div v-else class="alert alert-info">
                Không có hóa đơn cho tháng này
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Methods -->
        <div class="col-md-4">
          <div class="card mb-4" v-if="landlordInfo && landlordInfo.paymentSettings">
            <div class="card-body">
              <h5 class="card-title">Phương thức thanh toán</h5>

              <!-- Bank Transfer -->
              <div class="payment-method mb-4"
                v-if="landlordInfo.paymentSettings.bankInfo && landlordInfo.paymentSettings.bankInfo.accountNumber">
                <h6>Chuyển khoản ngân hàng</h6>
                <p><strong>Ngân hàng:</strong> {{ landlordInfo.paymentSettings.bankInfo.bankName }}</p>
                <p><strong>Số tài khoản:</strong> {{ landlordInfo.paymentSettings.bankInfo.accountNumber }}</p>
                <p><strong>Chủ tài khoản:</strong> {{ landlordInfo.paymentSettings.bankInfo.accountHolder }}</p>
                <img v-if="landlordInfo.paymentSettings.bankInfo.qrCode"
                  :src="landlordInfo.paymentSettings.bankInfo.qrCode" alt="QR Code" class="img-fluid qr-code" />
              </div>

              <!-- Momo -->
              <div class="payment-method"
                v-if="landlordInfo.paymentSettings.momoInfo && landlordInfo.paymentSettings.momoInfo.phoneNumber">
                <h6>Ví Momo</h6>
                <p><strong>Số điện thoại:</strong> {{ landlordInfo.paymentSettings.momoInfo.phoneNumber }}</p>
                <img v-if="landlordInfo.paymentSettings.momoInfo.qrCode"
                  :src="landlordInfo.paymentSettings.momoInfo.qrCode" alt="Momo QR" class="img-fluid qr-code" />
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

export default {
  data() {
    return {
      loading: true,
      selectedMonth: new Date().toISOString().substring(0, 7),
      currentBill: null,
      landlordInfo: null,
      bills: [],
    };
  },

  async mounted() {
    await this.loadData();
  },

  watch: {
    selectedMonth: {
      handler: 'updateBillDisplay',
      immediate: true
    }
  },

  methods: {
    async loadData() {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        // Fetch bills
        const response = await crudApi.read("api::bill.bill", {customerEmail: currentUser.email});
        // const response = await fetch('https://6725a513c39fedae05b5670b.mockapi.io/api/v1/bills');
        const bills = response.data;
        this.bills = bills;

        // Get landlord info
        if (this.bills.length > 0) {
          const landlordResponse = await crudApi.read("api::landlord-info.landlord-info",
            {userId: {id: this.bills[0].landlordId}}
          );
          // const landlordResponse = await fetch(`https://6725a513c39fedae05b5670b.mockapi.io/api/v1/landlord-info?userId=${this.bills[0].landlordId}`);
          const landlordData = landlordResponse.data;
          // Lấy phần tử đầu tiên từ mảng landlordData
          this.landlordInfo = landlordData[0];
        }

        this.updateBillDisplay();
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        this.loading = false;
      }
    },

    updateBillDisplay() {
      this.currentBill = this.bills.find(bill => bill.month == this.selectedMonth);
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(value);
    },

    formatMonth(monthStr) {
      const [year, month] = monthStr.split('-');
      return `Tháng ${month}/${year}`;
    }
  }
};
</script>

<style scoped>
.tenant-payment {
  min-height: 100vh;
  margin-top: 5em !important;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.card {
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.card-title {
  color: #2a3f54;
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.payment-method {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 15px;
}

.qr-code {
  max-width: 200px;
  margin: 15px auto;
  display: block;
}

.table th {
  background-color: #f8f9fa;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  margin: 2rem auto;
}

@media (max-width: 768px) {
  .tenant-payment {
    padding: 10px;
  }

  .card {
    margin-bottom: 15px;
  }
}
</style>
