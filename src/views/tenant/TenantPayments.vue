<template>
  <div class="tenant-payment container">
    <!-- Header Section -->
    <div class="row mb-4 align-items-start">
      <div class="col-md-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="/">Trang chủ</a></li>
            <li class="breadcrumb-item active">Thanh toán hóa đơn</li>
          </ol>
        </nav>
        <h2 class="d-flex align-items-center">
          Thanh toán hóa đơn
          <span
            v-if="currentBill"
            :class="['badge ms-3', getBadgeClass(currentBill.remainingAmount)]"
          >
            {{ getPaymentStatus(currentBill.remainingAmount) }}
          </span>
        </h2>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="loading" class="loading-container">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
      <p class="mt-2">Đang tải dữ liệu...</p>
    </div>

    <div v-else>
      <!-- Filter Section -->
      <div class="row mb-4">
        <div class="col-md-4">
          <label for="selectedMonth" class="form-label fw-bold"
            >Chọn tháng</label
          >
          <div class="input-group">
            <span class="input-group-text"
              ><i class="fas fa-calendar"></i
            ></span>
            <input
              type="month"
              id="selectedMonth"
              v-model="selectedMonth"
              class="form-control"
              :max="currentMonth"
            />
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="row">
        <!-- Invoice Summary -->
        <div class="col-md-8">
          <div class="card mb-4">
            <div
              class="card-header bg-primary text-white d-flex justify-content-between align-items-center"
            >
              <h5 class="card-title mb-0">Chi tiết hóa đơn</h5>
              <!-- <button v-if="currentBill" class="btn btn-light btn-sm" @click="downloadInvoice">
                <i class="fas fa-download me-2"></i>Tải hóa đơn
              </button> -->
            </div>
            <div class="card-body">
              <div class="bill-info" v-if="currentBill">
                <!-- Bill Header Info -->
                <div class="row mb-4">
                  <div class="col-md-6">
                    <div class="info-item">
                      <i class="fas fa-home me-2"></i>
                      <strong>Nhà:</strong> {{ currentBill.houseName }}
                    </div>
                    <div class="info-item">
                      <i class="fas fa-door-open me-2"></i>
                      <strong>Phòng:</strong> {{ currentBill.roomNumber }}
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="info-item">
                      <i class="fas fa-user me-2"></i>
                      <strong>Khách thuê:</strong>
                      {{ currentBill.customerName }}
                    </div>
                    <div class="info-item">
                      <i class="fas fa-calendar-alt me-2"></i>
                      <strong>Tháng:</strong>
                      {{ formatMonth(currentBill.month) }}
                    </div>
                  </div>
                </div>

                <!-- Bill Details Table -->
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead class="table-light">
                      <tr>
                        <th>Khoản mục</th>
                        <th>Chi tiết</th>
                        <th class="text-end">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      <!-- Rental Cost -->
                      <tr>
                        <td><i class="fas fa-home me-2"></i>Tiền thuê phòng</td>
                        <td>-</td>
                        <td class="text-end">
                          {{
                            formatCurrency(
                              currentBill.billDetails.rentalCost.amount
                            )
                          }}
                        </td>
                      </tr>

                      <!-- Electric Bill -->
                      <tr>
                        <td><i class="fas fa-bolt me-2"></i>Tiền điện</td>
                        <td>
                          {{ currentBill.billDetails.electric.usage }} kWh
                          <small class="text-muted">
                            ({{
                              formatCurrency(
                                currentBill.billDetails.electric.unitPrice
                              )
                            }}/kWh)
                          </small>
                        </td>
                        <td class="text-end">
                          {{
                            formatCurrency(
                              currentBill.billDetails.electric.amount
                            )
                          }}
                        </td>
                      </tr>

                      <!-- Water Bill -->
                      <tr>
                        <td><i class="fas fa-tint me-2"></i>Tiền nước</td>
                        <td>
                          {{ currentBill.billDetails.water.usage }} m³
                          <small class="text-muted">
                            ({{
                              formatCurrency(
                                currentBill.billDetails.water.unitPrice
                              )
                            }}/m³)
                          </small>
                        </td>
                        <td class="text-end">
                          {{
                            formatCurrency(currentBill.billDetails.water.amount)
                          }}
                        </td>
                      </tr>

                      <!-- Services -->
                      <tr
                        v-for="service in currentBill.billDetails.services"
                        :key="service.name"
                        class="service-row"
                      >
                        <td>
                          <i class="fas fa-concierge-bell me-2"></i
                          >{{ service.name }}
                        </td>
                        <td>
                          {{ service.quantity }} x
                          {{ formatCurrency(service.unitPrice) }}
                        </td>
                        <td class="text-end">
                          {{ formatCurrency(service.amount) }}
                        </td>
                      </tr>

                      <!-- Other Fees -->
                      <tr
                        v-for="(fee, index) in currentBill.billDetails
                          .otherFees"
                        :key="index"
                        class="fee-row"
                      >
                        <td colspan="2">
                          <i class="fas fa-plus-circle me-2"></i
                          >{{ fee.description }}
                        </td>
                        <td class="text-end">
                          {{ formatCurrency(fee.amount) }}
                        </td>
                      </tr>
                    </tbody>
                    <tfoot class="table-light">
                      <tr class="fw-bold">
                        <td colspan="2">Tổng cộng</td>
                        <td class="text-end">
                          {{ formatCurrency(currentBill.totalAmount) }}
                        </td>
                      </tr>
                      <tr class="text-success">
                        <td colspan="2">Đã thanh toán</td>
                        <td class="text-end">
                          {{ formatCurrency(currentBill.paidAmount) }}
                        </td>
                      </tr>
                      <tr class="text-danger fw-bold">
                        <td colspan="2">Còn lại</td>
                        <td class="text-end">
                          {{ formatCurrency(currentBill.remainingAmount) }}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <!-- No Bill Alert -->
              <div v-else class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                Không có hóa đơn cho tháng này
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Methods -->
        <div class="col-md-4">
          <div
            class="card mb-4"
            v-if="landlordInfo && landlordInfo.paymentSettings"
          >
            <div class="card-header bg-primary text-white">
              <h5 class="card-title mb-0">Phương thức thanh toán</h5>
            </div>
            <div class="card-body">
              <!-- Payment Method Selector -->
              <div class="mb-4">
                <label class="form-label fw-bold"
                  >Chọn phương thức thanh toán</label
                >
                <select
                  v-model="selectedPaymentMethod"
                  class="form-select"
                  @change="handlePaymentMethodChange"
                >
                  <option value="">-- Chọn phương thức --</option>
                  <option value="bank" v-if="hasBankInfo">
                    Chuyển khoản ngân hàng
                  </option>
                  <option value="momo" v-if="hasMomoInfo">Ví Momo</option>
                </select>
              </div>

              <!-- Bank Transfer Details -->
              <div
                class="payment-details"
                v-if="selectedPaymentMethod === 'bank' && hasBankInfo"
              >
                <div class="payment-method-card">
                  <div class="payment-header">
                    <i class="fas fa-university me-2"></i>
                    <h6 class="mb-0">Thông tin chuyển khoản</h6>
                  </div>
                  <div class="payment-content">
                    <div class="info-row">
                      <span class="info-label">
                        <i class="fas fa-building me-2"></i>Ngân hàng:
                      </span>
                      <span class="info-value">
                        {{ landlordInfo.paymentSettings.bankInfo.bankName }}
                      </span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">
                        <i class="fas fa-credit-card me-2"></i>Số tài khoản:
                      </span>
                      <span
                        class="info-value copy-enabled"
                        @click="
                          copyToClipboard(
                            landlordInfo.paymentSettings.bankInfo.accountNumber
                          )
                        "
                      >
                        {{
                          landlordInfo.paymentSettings.bankInfo.accountNumber
                        }}
                        <i class="fas fa-copy ms-2"></i>
                      </span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">
                        <i class="fas fa-user me-2"></i>Chủ tài khoản:
                      </span>
                      <span class="info-value">
                        {{
                          landlordInfo.paymentSettings.bankInfo.accountHolder
                        }}
                      </span>
                    </div>
                    <div
                      class="qr-container"
                      v-if="landlordInfo.paymentSettings.bankInfo.qrCode"
                    >
                      <img
                        :src="landlordInfo.paymentSettings.bankInfo.qrCode"
                        alt="QR Code"
                        class="qr-code"
                      />
                      <button
                        class="btn btn-outline-primary btn-sm mt-2"
                        @click="downloadQR('bank')"
                      >
                        <i class="fas fa-download me-2"></i>Tải QR
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Momo Details -->
              <div
                class="payment-details"
                v-if="selectedPaymentMethod === 'momo' && hasMomoInfo"
              >
                <div class="payment-method-card">
                  <div class="payment-header">
                    <i class="fas fa-wallet me-2"></i>
                    <h6 class="mb-0">Thông tin Momo</h6>
                  </div>
                  <div class="payment-content">
                    <div class="info-row">
                      <span class="info-label">
                        <i class="fas fa-phone me-2"></i>Số điện thoại:
                      </span>
                      <span
                        class="info-value copy-enabled"
                        @click="
                          copyToClipboard(
                            landlordInfo.paymentSettings.momoInfo.phoneNumber
                          )
                        "
                      >
                        {{ landlordInfo.paymentSettings.momoInfo.phoneNumber }}
                        <i class="fas fa-copy ms-2"></i>
                      </span>
                    </div>
                    <div
                      class="qr-container"
                      v-if="landlordInfo.paymentSettings.momoInfo.qrCode"
                    >
                      <img
                        :src="landlordInfo.paymentSettings.momoInfo.qrCode"
                        alt="Momo QR"
                        class="qr-code"
                      />
                      <button
                        class="btn btn-outline-primary btn-sm mt-2"
                        @click="downloadQR('momo')"
                      >
                        <i class="fas fa-download me-2"></i>Tải QR
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Payment Instructions -->
              <div
                class="alert alert-info mt-3"
                v-if="selectedPaymentMethod && currentBill"
              >
                <i class="fas fa-info-circle me-2"></i>
                <strong>Nội dung chuyển khoản:</strong>
                <div class="mt-2 payment-content">
                  <span
                    class="copy-enabled"
                    @click="copyToClipboard(transferContent)"
                  >
                    {{ transferContent }}
                    <i class="fas fa-copy ms-2"></i>
                  </span>
                </div>
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
import '@/styles/tenant/tenant-payment.css';

export default {
  name: 'TenantPayments',

  data() {
    return {
      loading: true,
      selectedMonth: new Date().toISOString().substring(0, 7),
      currentBill: null,
      landlordInfo: null,
      bills: [],
      selectedPaymentMethod: '',
    };
  },

  computed: {
    currentMonth() {
      return new Date().toISOString().substring(0, 7);
    },

    hasBankInfo() {
      return this.landlordInfo?.paymentSettings?.bankInfo?.accountNumber;
    },

    hasMomoInfo() {
      return this.landlordInfo?.paymentSettings?.momoInfo?.phoneNumber;
    },

    transferContent() {
      if (!this.currentBill) return '';
      return `TIEN_PHONG_${
        this.currentBill.roomNumber
      }_${this.formatMonthForTransfer(this.currentBill.month)}`;
    },
  },

  async mounted() {
    await this.loadData();
  },

  watch: {
    selectedMonth: {
      handler: 'updateBillDisplay',
      immediate: true,
    },
  },

  methods: {
    async loadData() {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
          this.$message.error('Vui lòng đăng nhập để xem hóa đơn');
          return;
        }

        const response = await crudApi.read('api::bill.bill', {
          customerEmail: currentUser.email,
        });
        this.bills = response.data;

        if (this.bills.length > 0) {
          const landlordResponse = await crudApi.read(
            'api::landlord-info.landlord-info',
            {
              userId: { id: this.bills[0].landlordId },
            }
          );
          this.landlordInfo = landlordResponse.data[0];
        }

        this.updateBillDisplay();
      } catch (error) {
        console.error('Error loading data:', error);
        this.$message.error('Có lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        this.loading = false;
      }
    },

    updateBillDisplay() {
      this.currentBill = this.bills.find(
        (bill) => bill.month === this.selectedMonth
      );
      this.selectedPaymentMethod = '';
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(value);
    },

    formatMonth(monthStr) {
      const [year, month] = monthStr.split('-');
      return `Tháng ${month}/${year}`;
    },

    formatMonthForTransfer(monthStr) {
      const [year, month] = monthStr.split('-');
      return `T${month}${year}`;
    },

    getBadgeClass(remainingAmount) {
      return remainingAmount > 0 ? 'bg-warning' : 'bg-success';
    },

    getPaymentStatus(remainingAmount) {
      return remainingAmount > 0 ? 'Chưa thanh toán' : 'Đã thanh toán';
    },

    handlePaymentMethodChange() {
      // Reset any related states if needed
    },

    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        this.$message.success('Đã sao chép vào clipboard!');
      } catch (err) {
        this.$message.error('Không thể sao chép. Vui lòng thử lại.');
      }
    },

    downloadQR(type) {
      try {
        const qrUrl =
          type === 'bank'
            ? this.landlordInfo.paymentSettings.bankInfo.qrCode
            : this.landlordInfo.paymentSettings.momoInfo.qrCode;

        const link = document.createElement('a');
        link.href = qrUrl;
        link.download = `qr-code-${type}-${this.currentBill.roomNumber}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.$message.success('Đã tải QR code thành công!');
      } catch (error) {
        this.$message.error('Có lỗi khi tải QR code. Vui lòng thử lại.');
      }
    },

    // async downloadInvoice() {
    //   try {
    //     // Implement invoice download logic here
    //     this.$message.info('Tính năng đang được phát triển');
    //   } catch (error) {
    //     this.$message.error('Có lỗi khi tải hóa đơn. Vui lòng thử lại.');
    //   }
    // }
  },
};
</script>