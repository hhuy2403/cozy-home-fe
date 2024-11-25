<template>
  <div class="admin-finance-management container-fluid">
    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <h1 class="dashboard-title my-4">
      <i class="fas fa-chart-line"></i> Quản Lý Tài Chính
    </h1>

    <!-- Error Alert -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ error }}
      <button type="button" class="btn-close" @click="error = null"></button>
    </div>

    <!-- Dashboard Summary Cards -->
    <div class="dashboard-summary row g-4 mb-4">
      <div class="col-12 col-md-6 col-lg-3">
        <div class="summary-card">
          <div class="card-body">
            <h5 class="card-title">Tổng Công Nợ</h5>
            <h3 class="card-value">{{ formatCurrency(totalDebtAmount) }}</h3>
            <div class="card-icon">
              <i class="fas fa-money-bill-wave"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-6 col-lg-3">
        <div class="summary-card">
          <div class="card-body">
            <h5 class="card-title">Đã Thanh Toán</h5>
            <h3 class="card-value">{{ formatCurrency(totalPaidAmount) }}</h3>
            <div class="card-icon">
              <i class="fas fa-check-circle"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-6 col-lg-3">
        <div class="summary-card ">
          <div class="card-body">
            <h5 class="card-title">Chưa Thanh Toán</h5>
            <h3 class="card-value">{{ formatCurrency(totalUnpaidAmount) }}</h3>
            <div class="card-icon">
              <i class="fas fa-clock"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-6 col-lg-3">
        <div class="summary-card">
          <div class="card-body">
            <h5 class="card-title">Tổng Số Hóa Đơn</h5>
            <h3 class="card-value">{{ totalBills }}</h3>
            <div class="card-icon">
              <i class="fas fa-file-invoice"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quản Lý Công Nợ -->
    <div class="debt-management mb-5">
      <div class="section-header d-flex justify-content-between align-items-center mb-4">
        <h2><i class="fas fa-hand-holding-usd"></i> Quản Lý Công Nợ</h2>
        <button @click="showCreateDebtForm = true" class="btn btn-primary">
          <i class="fas fa-plus me-1"></i> Thêm Công Nợ Mới
        </button>
      </div>

      <!-- Filter & Search Bar -->
      <div class="filter-search-bar mb-4">
        <div class="row g-3">
          <div class="col-12 col-md-4">
            <div class="search-box">
              <input v-model="searchQuery" type="text" class="form-control" placeholder="Tìm kiếm theo email...">
            </div>
          </div>
          <div class="col-12 col-md-4">
            <select v-model="statusFilter" class="form-select">
              <option value="">Tất cả trạng thái</option>
              <option value="Đã Thanh Toán">Đã Thanh Toán</option>
              <option value="Chưa Thanh Toán">Chưa Thanh Toán</option>
            </select>
          </div>
          <div class="col-12 col-md-4">
            <select v-model="sortBy" class="form-select">
              <option value="date">Sắp xếp theo ngày</option>
              <option value="amount">Sắp xếp theo số tiền</option>
              <option value="email">Sắp xếp theo email</option>
            </select>
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>STT</th>
              <th>Email</th>
              <th>Số Tiền (VND)</th>
              <th>Ngày Nợ</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredAndSortedDebts.length == 0">
              <td colspan="6" class="text-center">Không có công nợ nào</td>
            </tr>
            <tr v-else v-for="(debt, index) in filteredAndSortedDebts" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ debt.email }}</td>
              <td>{{ formatCurrency(debt.amount) }}</td>
              <td>{{ formatDate(debt.date) }}</td>
              <td>
                <span :class="['status-badge', debt.status == 'Đã Thanh Toán' ? 'paid' : 'unpaid']">
                  <i :class="['fas', debt.status == 'Đã Thanh Toán' ? 'fa-check-circle' : 'fa-clock']"></i>
                  {{ debt.status }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button @click="editDebt(index)" class="btn btn-icon" title="Chỉnh sửa">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="deleteDebt(index)" class="btn btn-icon danger" title="Xóa">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Quản Lý Hóa Đơn -->
    <div class="bill-management">
      <div class="section-header d-flex justify-content-between align-items-center mb-4">
        <h2><i class="fas fa-file-invoice-dollar"></i> Quản Lý Hóa Đơn</h2>
        <button @click="showCreateBillForm = true" class="btn btn-primary">
          <i class="fas fa-plus me-1"></i> Tạo Hóa Đơn Mới
        </button>
      </div>

      <!-- Filter & Search Bar -->
      <div class="filter-search-bar mb-4">
        <div class="row g-3">
          <div class="col-12 col-md-4">
            <div class="search-box">
              <input v-model="billSearchQuery" type="text" class="form-control" placeholder="Tìm kiếm theo email...">
            </div>
          </div>
          <div class="col-12 col-md-4">
            <select v-model="billStatusFilter" class="form-select">
              <option value="">Tất cả trạng thái</option>
              <option value="Đã Thanh Toán">Đã Thanh Toán</option>
              <option value="Chưa Thanh Toán">Chưa Thanh Toán</option>
            </select>
          </div>
          <div class="col-12 col-md-4">
            <select v-model="billSortBy" class="form-select">
              <option value="dueDate">Sắp xếp theo hạn thanh toán</option>
              <option value="amount">Sắp xếp theo số tiền</option>
              <option value="email">Sắp xếp theo email</option>
            </select>
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>STT</th>
              <th>Email</th>
              <th>Số Tiền (VND)</th>
              <th>Hạn Thanh Toán</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredBills.length == 0">
              <td colspan="6" class="text-center">Không có hóa đơn nào</td>
            </tr>
            <tr v-else v-for="(bill, index) in filteredBills" :key="bill.id">
              <td>{{ index + 1 }}</td>
              <td>{{ bill.email }}</td>
              <td>{{ formatCurrency(bill.amount) }}</td>
              <td>{{ formatDate(bill.dueDate) }}</td>
              <td>
                <span :class="['status-badge', bill.status == 'Đã Thanh Toán' ? 'paid' : 'unpaid']">
                  <i :class="['fas', bill.status == 'Đã Thanh Toán' ? 'fa-check-circle' : 'fa-clock']"></i>
                  {{ bill.status }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button v-if="bill.status !== 'Đã Thanh Toán'" @click="markAsPaid(bill.id)" class="btn btn-icon "
                    title="Thanh toán">
                    <i class="fas fa-check"></i>
                  </button>
                  <button @click="deleteBill(bill.id)" class="btn btn-icon danger" title="Xóa">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal Tạo Hóa Đơn -->
      <div v-if="showCreateBillForm" class="modal fade show d-block">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-file-invoice"></i> Tạo Hóa Đơn Mới
              </h5>
              <button type="button" class="btn-close" @click="showCreateBillForm = false"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="createBill">
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input v-model="newBill.email" type="email" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Số Tiền (VND)</label>
                  <input v-model.number="newBill.amount" type="number" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Hạn Thanh Toán</label>
                  <input v-model="newBill.dueDate" type="date" class="form-control" required>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="showCreateBillForm = false">
                    <i class="fas fa-times me-1"></i> Hủy
                  </button>
                  <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save me-1"></i> Tạo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Modals -->
    <div class="modals">
      <!-- Modal Thêm Công Nợ -->
      <div v-if="showCreateDebtForm" class="modal fade show d-block">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-plus-circle"></i> Thêm Công Nợ Mới
              </h5>
              <button type="button" class="btn-close" @click="showCreateDebtForm = false"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="createDebt">
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input v-model="newDebt.email" type="email" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Số Tiền (VND)</label>
                  <input v-model.number="newDebt.amount" type="number" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Ngày Nợ</label>
                  <input v-model="newDebt.date" type="date" class="form-control" required>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="showCreateDebtForm = false">
                    <i class="fas fa-times me-1"></i> Hủy
                  </button>
                  <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save me-1"></i> Thêm
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Sửa Công Nợ -->
      <div v-if="showEditDebtForm" class="modal fade show d-block">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-edit"></i> Sửa Công Nợ
              </h5>
              <button type="button" class="btn-close" @click="showEditDebtForm = false"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="updateDebt">
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input v-model="editingDebt.email" type="email" class="form-control" readonly>
                </div>
                <div class="mb-3">
                  <label class="form-label">Số Tiền (VND)</label>
                  <input v-model.number="editingDebt.amount" type="number" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Ngày Nợ</label>
                  <input v-model="editingDebt.date" type="date" class="form-control" required>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="showEditDebtForm = false">
                    <i class="fas fa-times me-1"></i> Hủy
                  </button>
                  <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save me-1"></i> Cập Nhật
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Tạo Hóa Đơn -->
      <div v-if="showCreateBillForm" class="modal fade show d-block">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fas fa-file-invoice"></i> Tạo Hóa Đơn Mới
              </h5>
              <button type="button" class="btn-close" @click="showCreateBillForm = false"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="createBill">
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input v-model="newBill.email" type="email" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Số Tiền (VND)</label>
                  <input v-model.number="newBill.amount" type="number" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Hạn Thanh Toán</label>
                  <input v-model="newBill.dueDate" type="date" class="form-control" required>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="showCreateBillForm = false">
                    <i class="fas fa-times me-1"></i> Hủy
                  </button>
                  <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save me-1"></i> Tạo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Backdrop -->
      <div v-if="showCreateDebtForm || showEditDebtForm || showCreateBillForm" class="modal-backdrop fade show"></div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import Swal from 'sweetalert2';
import axios from 'axios';

export default {
  name: 'AdminFinancialManagement',

  setup() {
    const loading = ref(false);
    const error = ref(null);
    const debts = ref([]);
    const unpaidBills = ref([]);
    const showCreateDebtForm = ref(false);
    const showEditDebtForm = ref(false);
    const showCreateBillForm = ref(false);
    const searchQuery = ref('');
    const statusFilter = ref('');
    const sortBy = ref('date');
    const billSearchQuery = ref('');
    const billStatusFilter = ref('');
    const billSortBy = ref('dueDate');
    const bills = ref([]);

    const newDebt = ref({
      email: '',
      amount: 0,
      date: '',
      status: 'Chưa Thanh Toán'
    });

    const editingDebt = ref({
      id: null,
      email: '',
      amount: 0,
      date: '',
      status: ''
    });

    const newBill = ref({
      email: '',
      amount: 0,
      dueDate: '',
      status: 'Chưa Thanh Toán'
    });

    return {
      loading,
      error,
      debts,
      unpaidBills,
      showCreateDebtForm,
      showEditDebtForm,
      showCreateBillForm,
      searchQuery,
      statusFilter,
      sortBy,
      newDebt,
      editingDebt,
      newBill,
      billSearchQuery,
      billStatusFilter,
      billSortBy,
      bills,
    };
  },

  methods: {
    // API Methods
    async fetchDebts() {
      try {
        this.loading = true;
        const response = await axios.get('https://6725a513c39fedae05b5670b.mockapi.io/api/v1/debts');
        this.debts = response.data;
      } catch (err) {
        this.showError('Không thể tải dữ liệu công nợ');
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async deleteBill(id) {
      const result = await Swal.fire({
        title: 'Xác nhận xóa',
        text: 'Bạn có chắc chắn muốn xóa hóa đơn này?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d'
      });

      if (result.isConfirmed) {
        try {
          this.loading = true;
          await axios.delete(`https://6725a513c39fedae05b5670b.mockapi.io/api/v1/billss/${id}`);
          await this.fetchBills();
          this.showSuccessMessage('Xóa hóa đơn thành công');
        } catch (err) {
          this.showError('Không thể xóa hóa đơn');
          console.error(err);
        } finally {
          this.loading = false;
        }
      }
    },

    async fetchBills() {
      try {
        this.loading = true;
        const response = await axios.get('https://6725a513c39fedae05b5670b.mockapi.io/api/v1/billss');
        this.bills = response.data;
      } catch (err) {
        this.showError('Không thể tải dữ liệu hóa đơn');
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async createDebt() {
      if (!this.validateDebt(this.newDebt)) return;

      try {
        this.loading = true;
        // Làm tròn số tiền thành số nguyên
        this.newDebt.amount = Math.round(this.newDebt.amount);
        await axios.post('https://6725a513c39fedae05b5670b.mockapi.io/api/v1/debts', this.newDebt);
        await this.fetchDebts();
        this.showCreateDebtForm = false;
        this.newDebt = this.getEmptyDebt();
        this.showSuccessMessage('Tạo công nợ mới thành công');
      } catch (err) {
        this.showError('Không thể tạo công nợ mới');
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async updateDebt() {
      if (!this.validateDebt(this.editingDebt)) return;

      try {
        this.loading = true;
        // Làm tròn số tiền thành số nguyên
        this.editingDebt.amount = Math.round(this.editingDebt.amount);

        await axios.put(
          `https://6725a513c39fedae05b5670b.mockapi.io/api/v1/debts/${this.editingDebt.id}`,
          {
            email: this.editingDebt.email,
            amount: this.editingDebt.amount,
            date: this.editingDebt.date,
            status: this.editingDebt.status
          }
        );

        await this.fetchDebts();
        this.showEditDebtForm = false;
        this.showSuccessMessage('Cập nhật công nợ thành công');
      } catch (err) {
        this.showError('Không thể cập nhật công nợ');
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async deleteDebt(id) {
      const result = await Swal.fire({
        title: 'Xác nhận xóa',
        text: 'Bạn có chắc chắn muốn xóa công nợ này?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d'
      });

      if (result.isConfirmed) {
        try {
          this.loading = true;
          await axios.delete(`https://6725a513c39fedae05b5670b.mockapi.io/api/v1/debts/${id}`);
          await this.fetchDebts();
          this.showSuccessMessage('Xóa công nợ thành công');
        } catch (err) {
          this.showError('Không thể xóa công nợ');
          console.error(err);
        } finally {
          this.loading = false;
        }
      }
    },

    async createBill() {
      if (!this.validateBill(this.newBill)) return;

      try {
        this.loading = true;

        // Làm tròn số tiền thành số nguyên
        this.newBill.amount = Math.round(this.newBill.amount);

        // Kiểm tra công nợ tồn tại
        const debt = this.debts.find(d => d.email == this.newBill.email);
        if (!debt) {
          this.showError('Không tìm thấy công nợ cho email này');
          return;
        }

        // Kiểm tra số tiền hợp lệ
        if (this.newBill.amount > debt.amount) {
          this.showError('Số tiền hóa đơn không thể lớn hơn số tiền công nợ');
          return;
        }

        const billData = {
          email: this.newBill.email,
          amount: this.newBill.amount,
          dueDate: this.newBill.dueDate,
          status: 'Chưa Thanh Toán',
          createdAt: new Date().toISOString()
        };

        await axios.post('https://6725a513c39fedae05b5670b.mockapi.io/api/v1/billss', billData);
        await this.fetchBills();
        this.showCreateBillForm = false;
        this.newBill = this.getEmptyBill();
        this.showSuccessMessage('Tạo hóa đơn mới thành công');
      } catch (err) {
        this.showError('Không thể tạo hóa đơn mới');
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async markAsPaid(id) {
      const result = await Swal.fire({
        title: 'Xác nhận thanh toán',
        text: 'Đánh dấu hóa đơn này là đã thanh toán?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#198754',
        cancelButtonColor: '#6c757d'
      });

      if (result.isConfirmed) {
        try {
          this.loading = true;
          const bill = this.unpaidBills.find(b => b.id == id);
          bill.status = 'Đã Thanh Toán';
          await axios.put(`https://6725a513c39fedae05b5670b.mockapi.io/api/v1/billss/${id}`, bill);
          await this.updateDebtAmount(bill.email, bill.amount);
          await this.fetchBills();
          this.showSuccessMessage('Đã cập nhật trạng thái thanh toán');
        } catch (err) {
          this.showError('Không thể cập nhật trạng thái thanh toán');
          console.error(err);
        } finally {
          this.loading = false;
        }
      }
    },

    async updateDebtAmount(email, amount) {
      try {
        const debt = this.debts.find(d => d.email == email);
        if (debt) {
          debt.amount -= amount;
          if (debt.amount <= 0) {
            debt.status = 'Đã Thanh Toán';
          }
          await axios.put(`https://6725a513c39fedae05b5670b.mockapi.io/api/v1/debts/${debt.id}`, debt);
        }
      } catch (err) {
        console.error('Error updating debt amount:', err);
      }
    },

    // Helper Methods
    async editDebt(index) {
      try {
        this.loading = true;
        const debt = this.filteredAndSortedDebts[index];
        const response = await axios.get(`https://6725a513c39fedae05b5670b.mockapi.io/api/v1/debts/${debt.id}`);
        this.editingDebt = { ...response.data };
        this.showEditDebtForm = true;
      } catch (err) {
        this.showError('Không thể tải thông tin công nợ');
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('vi-VN');
    },

    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    formatNumber(number) {
      return new Intl.NumberFormat('vi-VN').format(number);
    },

    validateDebt(debt) {
      const errors = [];

      // Validate email
      if (!debt.email) {
        errors.push('Email không được để trống');
      } else if (!this.isValidEmail(debt.email)) {
        errors.push('Email không đúng định dạng');
      }

      // Validate amount
      if (!debt.amount) {
        errors.push('Số tiền không được để trống');
      } else if (debt.amount <= 0) {
        errors.push('Số tiền phải lớn hơn 0');
      } else if (!Number.isInteger(debt.amount)) {
        errors.push('Số tiền phải là số nguyên');
      }

      // Validate date
      if (!debt.date) {
        errors.push('Ngày nợ không được để trống');
      } else {
        const debtDate = new Date(debt.date);
        const today = new Date();
        if (debtDate > today) {
          errors.push('Ngày nợ không thể lớn hơn ngày hiện tại');
        }
      }

      if (errors.length > 0) {
        this.showError(errors.join('\n'));
        return false;
      }
      return true;
    },

    validateBill(bill) {
      const errors = [];

      // Validate email
      if (!bill.email) {
        errors.push('Email không được để trống');
      } else if (!this.isValidEmail(bill.email)) {
        errors.push('Email không đúng định dạng');
      }

      // Validate amount
      if (!bill.amount) {
        errors.push('Số tiền không được để trống');
      } else if (bill.amount <= 0) {
        errors.push('Số tiền phải lớn hơn 0');
      } else if (!Number.isInteger(bill.amount)) {
        errors.push('Số tiền phải là số nguyên');
      }

      // Validate dueDate
      if (!bill.dueDate) {
        errors.push('Hạn thanh toán không được để trống');
      } else {
        const dueDate = new Date(bill.dueDate);
        const today = new Date();
        if (dueDate < today) {
          errors.push('Hạn thanh toán không thể nhỏ hơn ngày hiện tại');
        }
      }

      if (errors.length > 0) {
        this.showError(errors.join('\n'));
        return false;
      }
      return true;
    },

    showSuccessMessage(message) {
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: message,
        position: 'top-end',
        toast: true,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    },

    showError(message) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        html: message.replace(/\n/g, '<br>'),
        position: 'top-end',
        toast: true,
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    },

    getEmptyDebt() {
      return {
        email: '',
        amount: 0,
        date: '',
        status: 'Chưa Thanh Toán'
      };
    },

    getEmptyBill() {
      return {
        email: '',
        amount: 0,
        dueDate: '',
        status: 'Chưa Thanh Toán'
      };
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(value);
    }
  },

  computed: {
    totalDebtAmount() {
      return this.debts.reduce((total, debt) => total + debt.amount, 0);
    },

    totalPaidAmount() {
      return this.debts
        .filter(debt => debt.status == 'Đã Thanh Toán')
        .reduce((total, debt) => total + debt.amount, 0);
    },

    totalUnpaidAmount() {
      return this.debts
        .filter(debt => debt.status == 'Chưa Thanh Toán')
        .reduce((total, debt) => total + debt.amount, 0);
    },

    totalBills() {
      return this.bills.length; // Thay đổi từ unpaidBills sang bills
    },

    filteredAndSortedDebts() {
      let result = [...this.debts];

      if (this.statusFilter) {
        result = result.filter(debt => debt.status == this.statusFilter);
      }

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(debt =>
          debt.email.toLowerCase().includes(query)
        );
      }

      switch (this.sortBy) {
        case 'date':
          result.sort((a, b) => new Date(b.date) - new Date(a.date));
          break;
        case 'amount':
          result.sort((a, b) => b.amount - a.amount);
          break;
        case 'email':
          result.sort((a, b) => a.email.localeCompare(b.email));
          break;
      }

      return result;
    },

    filteredBills() {
      let result = [...this.bills]; // Thay đổi từ unpaidBills sang bills

      // Áp dụng filter trạng thái
      if (this.billStatusFilter) {
        result = result.filter(bill => bill.status == this.billStatusFilter);
      }

      // Áp dụng tìm kiếm
      if (this.billSearchQuery) {
        const query = this.billSearchQuery.toLowerCase();
        result = result.filter(bill =>
          bill.email.toLowerCase().includes(query)
        );
      }

      // Áp dụng sắp xếp
      switch (this.billSortBy) {
        case 'dueDate':
          result.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
          break;
        case 'amount':
          result.sort((a, b) => b.amount - a.amount);
          break;
        case 'email':
          result.sort((a, b) => a.email.localeCompare(b.email));
          break;
      }

      return result;
    },
  },

  async mounted() {
    await Promise.all([
      this.fetchDebts(),
      this.fetchBills()
    ]);
  }
};
</script>

<style scoped>
/* Main Layout */
.admin-finance-management {
  margin-top: 80px;
  padding: 1.5rem;
  background-color: #f8f9fa;
  min-height: calc(100vh - 80px);
}

/* Dashboard Title */
.dashboard-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dashboard-title i {
  color: #3498db;
}

/* Summary Cards */
.summary-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  height: 100%;
  transition: transform 0.2s;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.summary-card .card-body {
  padding: 1.25rem;
  position: relative;
}

.card-title {
  font-size: 0.875rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.card-value {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.card-icon {
  position: absolute;
  right: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.75rem;
  opacity: 0.2;
  color: #2c3e50;
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h2 {
  font-size: 1.25rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background-color: #3498db;
  border-color: #3498db;
}

.btn-secondary {
  background-color: #fff;
  border-color: #6c757d;
  color: #3b3d3e;
}

.btn-icon {
  padding: 0.4rem;
  border-radius: 4px;
  color: #666;
  border: 1px solid #ddd;
}

.btn-icon.danger {
  color: #dc3545;
}

/* Search & Filter Bar */
.filter-search-bar {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.form-control,
.form-select {
  border-radius: 6px;
  border: 1px solid #dee2e6;
  font-size: 0.875rem;
}

/* Tables */
.table-responsive {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
}

.table {
  margin: 0;
  font-size: 0.875rem;
}

.table th {
  background: #f8f9fa;
  font-weight: 600;
  padding: 0.75rem;
  border-bottom: 2px solid #dee2e6;
}

.table td {
  padding: 0.75rem;
  vertical-align: middle;
}

/* Badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.75rem;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.status-badge i {
  font-size: 0.8rem;
}

.status-badge.paid {
  background-color: rgba(40, 199, 111, 0.1);
  color: #28c76f;
  border: 1px solid rgba(40, 199, 111, 0.2);
}

.status-badge.unpaid {
  background-color: rgba(234, 84, 85, 0.1);
  color: #ea5455;
  border: 1px solid rgba(234, 84, 85, 0.2);
}

.status-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.status-badge.paid:hover {
  background-color: rgba(40, 199, 111, 0.15);
}

.status-badge.unpaid:hover {
  background-color: rgba(234, 84, 85, 0.15);
}
/* Buttons */
.btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.action-buttons {
  display: flex;
  gap: 0.375rem;
}

/* Modals */
.modal-content {
  border-radius: 8px;
  border: none;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #dee2e6;
}

.modal-title {
  font-size: 1.125rem;
  margin: 0;
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

/* Responsive */
@media (max-width: 768px) {
  .admin-finance-management {
    padding: 1rem;
  }

  .dashboard-summary {
    margin-bottom: 1rem;
  }

  .card-value {
    font-size: 1.25rem;
  }

  .card-icon {
    font-size: 1.5rem;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .filter-search-bar .row>* {
    margin-bottom: 0.75rem;
  }
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* Utility Classes */
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shadow-sm {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
}

.transition {
  transition: all 0.2s ease;
}
</style>