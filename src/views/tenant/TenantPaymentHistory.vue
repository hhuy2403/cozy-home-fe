<template>
  <div class="payment-history container">
    <div class="header-section mb-4">
      <h2>Lịch sử thanh toán</h2>
      <div class="filter-section">
        <div class="row align-items-center">
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text">
                <i class="fas fa-search"></i>
              </span>
              <input
                type="text"
                class="form-control"
                v-model="searchTerm"
                placeholder="Tìm kiếm..."
              />
            </div>
          </div>
          <div class="col-md-4">
            <select class="form-select" v-model="filterYear">
              <option value="">Tất cả các năm</option>
              <option v-for="year in availableYears" :key="year" :value="year">
                Năm {{ year }}
              </option>
            </select>
          </div>
          <div class="col-md-4 text-end">
            <button class="btn btn-outline-primary" @click="exportToExcel">
              <i class="fas fa-download me-2"></i>Xuất Excel
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <div v-else>
      <!-- Payment Summary Cards -->
      <div class="row mb-4">
        <div class="col-md-4">
          <div class="card summary-card">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-muted">Tổng số tiền</h6>
              <h3 class="card-title text-primary">
                {{ formatCurrency(totalAmount) }}
              </h3>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card summary-card">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-muted">Đã thanh toán</h6>
              <h3 class="card-title text-success">
                {{ formatCurrency(totalPaid) }}
              </h3>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card summary-card">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-muted">Còn nợ</h6>
              <h3 class="card-title text-danger">
                {{ formatCurrency(totalRemaining) }}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment History Table -->
      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th @click="sortBy('monthYear')" class="sortable">
                    Tháng/Năm
                    <i class="fas" :class="getSortIcon('monthYear')"></i>
                  </th>
                  <th @click="sortBy('totalAmount')" class="sortable">
                    Tổng số tiền
                    <i class="fas" :class="getSortIcon('totalAmount')"></i>
                  </th>
                  <th @click="sortBy('paidAmount')" class="sortable">
                    Đã trả
                    <i class="fas" :class="getSortIcon('paidAmount')"></i>
                  </th>
                  <th @click="sortBy('remainingAmount')" class="sortable">
                    Còn lại
                    <i class="fas" :class="getSortIcon('remainingAmount')"></i>
                  </th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="payment in filteredAndSortedHistory"
                  :key="payment.monthYear"
                >
                  <td>{{ formatMonthYear(payment.monthYear) }}</td>
                  <td>{{ formatCurrency(payment.totalAmount) }}</td>
                  <td>{{ formatCurrency(payment.paidAmount) }}</td>
                  <td>{{ formatCurrency(payment.remainingAmount) }}</td>
                  <td>
                    <span class="badge" :class="getStatusClass(payment)">
                      {{ getStatusText(payment) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- No Data Message -->
          <div
            v-if="filteredAndSortedHistory.length == 0"
            class="text-center py-4"
          >
            <i class="fas fa-search fa-3x text-muted mb-3"></i>
            <p class="text-muted">Không tìm thấy dữ liệu phù hợp</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';
import crudApi from '@/apis/crudApi';
import '@/styles/tenant/tenant-payment-history.css';

export default {
  data() {
    return {
      loading: true,
      paymentHistory: [],
      searchTerm: '',
      filterYear: '',
      sortKey: 'monthYear',
      sortOrder: 'desc',
    };
  },

  computed: {
    availableYears() {
      const years = new Set();
      this.paymentHistory.forEach((payment) => {
        const year = payment.monthYear.split('-')[0];
        years.add(year);
      });
      return Array.from(years).sort().reverse();
    },

    filteredAndSortedHistory() {
      let result = [...this.paymentHistory];

      // Filter by search term
      if (this.searchTerm) {
        result = result.filter((payment) =>
          payment.monthYear
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
        );
      }

      // Filter by year
      if (this.filterYear) {
        result = result.filter((payment) =>
          payment.monthYear.startsWith(this.filterYear)
        );
      }

      // Sort
      result.sort((a, b) => {
        let modifier = this.sortOrder == 'desc' ? -1 : 1;
        if (this.sortKey == 'monthYear') {
          return modifier * a[this.sortKey].localeCompare(b[this.sortKey]);
        }
        return modifier * (a[this.sortKey] - b[this.sortKey]);
      });

      return result;
    },

    totalAmount() {
      return this.paymentHistory.reduce(
        (sum, payment) => sum + payment.totalAmount,
        0
      );
    },

    totalPaid() {
      return this.paymentHistory.reduce(
        (sum, payment) => sum + payment.paidAmount,
        0
      );
    },

    totalRemaining() {
      return this.paymentHistory.reduce(
        (sum, payment) => sum + payment.remainingAmount,
        0
      );
    },
  },

  async mounted() {
    await this.loadPaymentHistory();
  },

  methods: {
    async loadPaymentHistory() {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const response = await crudApi.read('api::bill.bill');
        // const response = await fetch('https://6725a513c39fedae05b5670b.mockapi.io/api/v1/bills');
        const bills = response.data;

        this.paymentHistory = bills
          .filter((bill) => bill.customerEmail == currentUser.email)
          .map((bill) => ({
            monthYear: bill.month,
            totalAmount: bill.totalAmount,
            paidAmount: bill.paidAmount,
            remainingAmount: bill.remainingAmount,
          }));
      } catch (error) {
        console.error('Error loading payment history:', error);
      } finally {
        this.loading = false;
      }
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(value);
    },

    formatMonthYear(monthYear) {
      const [year, month] = monthYear.split('-');
      return `Tháng ${month}/${year}`;
    },

    sortBy(key) {
      if (this.sortKey == key) {
        this.sortOrder = this.sortOrder == 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortOrder = 'asc';
      }
    },

    getSortIcon(key) {
      if (this.sortKey == key) {
        return this.sortOrder == 'asc' ? 'fa-sort-up' : 'fa-sort-down';
      }
      return 'fa-sort';
    },

    getStatusClass(payment) {
      if (payment.remainingAmount == 0) return 'bg-success';
      if (payment.paidAmount == 0) return 'bg-danger';
      return 'bg-warning';
    },

    getStatusText(payment) {
      if (payment.remainingAmount == 0) return 'Đã thanh toán';
      if (payment.paidAmount == 0) return 'Chưa thanh toán';
      return 'Thanh toán một phần';
    },

    exportToExcel() {
      const data = this.filteredAndSortedHistory.map((payment) => ({
        'Tháng/Năm': this.formatMonthYear(payment.monthYear),
        'Tổng số tiền': this.formatCurrency(payment.totalAmount),
        'Đã trả': this.formatCurrency(payment.paidAmount),
        'Còn lại': this.formatCurrency(payment.remainingAmount),
        'Trạng thái': this.getStatusText(payment),
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Lịch sử thanh toán');
      XLSX.writeFile(wb, 'lich-su-thanh-toan.xlsx');
    },
  },
};
</script>