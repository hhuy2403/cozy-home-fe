<template>
  <div class="calculator-money container mt-4">
    <!-- Header Section -->
    <div class="page-header">
      <div class="row align-items-center">
        <div class="col-md-6">
          <h1 class="header-title">
            <i class="fas fa-calculator me-2"></i>
            Tính tiền phòng
          </h1>
        </div>
        <div class="col-md-6">
          <div class="header-actions">
            <button class="action-btn btn-sm btn-calculate" @click="openCalculateModal" type="button"
              ref="calculateButton">
              <i class="fas fa-calculator" aria-hidden="true"></i>
              <span>Tính tiền</span>
            </button>
            <button class="action-btn btn-sm btn-export" @click="exportToExcel" title="Xuất Excel">
              <i class="fas fa-file-excel"></i>
              <span>Excel</span>
            </button>
            <button class="action-btn btn-sm btn-print" @click="printBills" title="In hóa đơn">
              <i class="fas fa-print"></i>
              <span>In</span>
            </button>
            <button class="action-btn btn-sm btn-collect" @click="collectPayments" title="Thu tiền">
              <i class="fas fa-money-bill"></i>
              <span>Thu tiền</span>
            </button>
            <button class="action-btn btn-sm btn-delete" @click="deleteBills" title="Xóa hóa đơn">
              <i class="fas fa-trash"></i>
              <span>Xóa</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-container">
        <div class="row g-3">
          <div class="col-md-3">
            <div class="form-floating">
              <input type="month" class="form-control" id="monthFilter" v-model="selectedMonth">
              <label for="monthFilter">Tháng/Năm</label>
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-floating">
              <select class="form-select" id="houseFilter" v-model="selectedHouse">
                <option value="">Tất cả</option>
                <option v-for="house in houses" :key="house.id" :value="house.id">
                  {{ house.name }}
                </option>
              </select>
              <label for="houseFilter">Nhà</label>
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-floating">
              <select class="form-select" id="statusFilter" v-model="paymentStatus">
                <option value="">Tất cả</option>
                <option value="unpaid">Chưa thanh toán</option>
                <option value="paid">Đã thanh toán</option>
                <option value="partial">Thanh toán một phần</option>
              </select>
              <label for="statusFilter">Trạng thái</label>
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-floating">
              <input type="text" class="form-control" id="searchFilter" v-model="searchQuery" placeholder="Tìm kiếm...">
              <label for="searchFilter">Tìm kiếm</label>
            </div>
          </div>
        </div>
      </div>

      <div class="alert custom-alert mt-4">
        <div class="alert-icon">
          <i class="fas fa-info-circle"></i>
        </div>
        <div class="alert-content">
          <h4 class="alert-heading">Lưu ý quan trọng</h4>
          <ul class="alert-list">
            <li>Bạn phải thực hiện việc "Thêm khách" ở chức năng "Phòng" và gán các dịch vụ cho khách
              thuê trước khi tính tiền.</li>
            <li>Nếu có bất kỳ thay đổi liên quan đến tiền nhà tháng đang tính (ví dụ: thay đổi cs điện, nước, đơn giá
              phòng,
              ngày vào, giá dịch vụ, ...) thì bạn phải tính tiền lại cho tháng đó.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Bills Table -->
    <div class="table-responsive custom-table">
      <table class="table">
        <thead>
          <tr>
            <th class="checkbox-column">
              <div class="custom-checkbox">
                <input type="checkbox" id="selectAll" v-model="selectAll" @change="toggleSelectAll">
                <label for="selectAll"></label>
              </div>
            </th>
            <th>Nhà</th>
            <th>Phòng</th>
            <th>Khách thuê</th>
            <th>Tổng tiền</th>
            <th>Đã trả</th>
            <th>Còn lại</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="bill in filteredBills" :key="bill.id" :class="{ 'selected-row': selectedBills.includes(bill) }">
            <td class="checkbox-column">
              <div class="custom-checkbox">
                <input type="checkbox" :id="'bill-' + bill.id" v-model="selectedBills" :value="bill">
                <label :for="'bill-' + bill.id"></label>
              </div>
            </td>
            <td>{{ bill.houseName }}</td>
            <td>{{ bill.roomNumber }}</td>
            <td>{{ bill.customerName }}</td>
            <td class="amount-column">{{ formatCurrency(bill.totalAmount) }}</td>
            <td class="amount-column">{{ formatCurrency(bill.paidAmount) }}</td>
            <td class="amount-column">{{ formatCurrency(bill.remainingAmount) }}</td>
            <td>
              <span :class="['status-badge', getStatusBadgeClass(bill)]">
                {{ getStatusText(bill) }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="btn-icon btn-view" @click="viewBillDetail(bill)" title="Xem chi tiết">
                  <i class="fas fa-eye"></i>
                </button>&nbsp;
                <button class="btn-icon btn-payment" @click="recordPayment(bill)" title="Thu tiền">
                  <i class="fas fa-money-bill"></i>
                </button>&nbsp;
                <button class="btn-icon btn-delete" @click="deleteBill(bill)" title="Xóa">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Calculate Modal -->
    <div class="modal fade" id="calculateModal" tabindex="-1" aria-labelledby="calculateModalLabel">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="calculateModalLabel">Tính tiền phòng</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" ref="closeButton">
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group mb-3">
              <label>Tháng</label>
              <input type="month" class="form-control" v-model="calculationMonth">
            </div>
            <div class="form-group mb-3">
              <label>Nhà</label>
              <select class="form-select" v-model="calculationHouse">
                <option value="">Tất cả</option>
                <option v-for="house in houses" :key="house.id" :value="house.id">
                  {{ house.name }}
                </option>
              </select>
            </div>
            <div class="form-group mb-3">
              <label>Phòng</label>
              <select class="form-select" v-model="calculationRoom">
                <option value="">Tất cả</option>
                <option v-for="room in filteredRooms" :key="room.id" :value="room.id">
                  {{ room.roomNumber }}
                </option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
            <button type="button" class="btn btn-primary" @click="calculateBills">
              Tính tiền
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bill Detail Modal -->
    <div class="modal fade" id="billDetailModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Chi tiết hóa đơn</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedBillDetail">
            <!-- Bill Header -->
            <div class="bill-header mb-4">
              <h4 class="text-center">HÓA ĐƠN TIỀN PHÒNG</h4>
              <p><strong>Nhà:</strong> {{ selectedBillDetail.houseName }}</p>
              <p><strong>Phòng:</strong> {{ selectedBillDetail.roomNumber }}</p>
              <p><strong>Khách thuê:</strong> {{ selectedBillDetail.customerName }}</p>
              <p><strong>Tháng:</strong> {{ formatMonth(selectedBillDetail.month) }}</p>
            </div>

            <!-- Bill Details Table -->
            <table class="table table-bordered">
              <thead>
                <tr>
                  <th>Khoản mục</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <!-- Tiền phòng -->
                <tr>
                  <td>{{ selectedBillDetail.billDetails.rentalCost.description }}</td>
                  <td>1 tháng</td>
                  <td>{{ formatCurrency(selectedBillDetail.billDetails.rentalCost.amount) }}</td>
                  <td>{{ formatCurrency(selectedBillDetail.billDetails.rentalCost.amount) }}</td>
                </tr>

                <!-- Tiền điện -->
                <tr>
                  <td>{{ selectedBillDetail.billDetails.electric.description }}</td>
                  <td>{{ selectedBillDetail.billDetails.electric.usage }} kWh</td>
                  <td>{{ selectedBillDetail.billDetails.electric.unitPrice }}</td>
                  <td>{{ formatCurrency(selectedBillDetail.billDetails.electric.amount) }}</td>
                </tr>

                <!-- Tiền nước -->
                <tr>
                  <td>{{ selectedBillDetail.billDetails.water.description }}</td>
                  <td>{{ selectedBillDetail.billDetails.water.usage }} m³</td>
                  <td>{{ selectedBillDetail.billDetails.water.unitPrice }}</td>
                  <td>{{ formatCurrency(selectedBillDetail.billDetails.water.amount) }}</td>
                </tr>

                <!-- Các dịch vụ khác -->
                <tr v-for="service in selectedBillDetail.billDetails.services" :key="service.name">
                  <td>{{ service.name }}</td>
                  <td>{{ service.quantity }}</td>
                  <td>{{ formatCurrency(service.unitPrice) }}</td>
                  <td>{{ formatCurrency(service.amount) }}</td>
                </tr>

                <!-- Phí phát sinh -->
                <tr v-for="fee in selectedBillDetail.billDetails.otherFees" :key="fee.description">
                  <td>{{ fee.description }}</td>
                  <td>1</td>
                  <td>{{ formatCurrency(fee.amount) }}</td>
                  <td>{{ formatCurrency(fee.amount) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="table-info">
                  <td colspan="3" class="text-end"><strong>Tổng cộng:</strong></td>
                  <td><strong>{{ formatCurrency(selectedBillDetail.totalAmount) }}</strong></td>
                </tr>
                <tr class="table-success">
                  <td colspan="3" class="text-end"><strong>Đã thanh toán:</strong></td>
                  <td><strong>{{ formatCurrency(selectedBillDetail.paidAmount) }}</strong></td>
                </tr>
                <tr class="table-warning">
                  <td colspan="3" class="text-end"><strong>Còn lại:</strong></td>
                  <td><strong>{{ formatCurrency(selectedBillDetail.remainingAmount) }}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-info me-2" @click="printBillDetail">
              <i class="fas fa-print"></i> In
            </button>
            <button type="button" class="btn btn-primary me-2" @click="exportBillToPDF">
              <i class="fas fa-file-pdf"></i> PDF
            </button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import crudApi from '@/apis/crudApi';

export default {
  name: 'CalculatorMoney',
  data() {
    return {
      // Filters
      selectedMonth: new Date().toISOString().slice(0, 7),
      selectedHouse: '',
      paymentStatus: '',
      searchQuery: '',

      // Data
      houses: [],
      rooms: [],
      customers: [],
      electricData: [],
      waterData: [],
      otherFees: [],
      bills: [],
      currentUser: null,

      // Selection
      selectAll: false,
      selectedBills: [],
      selectedBillDetail: null,

      // Calculation Modal
      calculationMonth: new Date().toISOString().slice(0, 7),
      calculationHouse: '',
      calculationRoom: '',

      // Utility Rates
      electricRates: [],
      waterRates: [],

      // Modals
      calculateModal: null,
      billDetailModal: null,
    };
  },

  computed: {
    filteredBills() {
      if (!Array.isArray(this.bills)) return [];

      return this.bills.filter(bill => {
        if (!bill) return false;

        const matchesMonth = !this.selectedMonth || bill.month == this.selectedMonth;
        const matchesHouse = !this.selectedHouse || bill.houseId == this.selectedHouse;
        const matchesSearch = !this.searchQuery ||
          (bill.customerName && bill.customerName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
          (bill.roomNumber && bill.roomNumber.includes(this.searchQuery));
        const matchesStatus = !this.paymentStatus || bill.status == this.paymentStatus;

        return matchesMonth && matchesHouse && matchesSearch && matchesStatus;
      });
    },

    filteredRooms() {
      return this.rooms.filter(room =>
        !this.calculationHouse || room.houseId.id == this.calculationHouse
      );
    }
  },

  methods: {
    async checkAccess() {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!this.currentUser?.id || this.currentUser.role !== 'landlord') {
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
    async deleteBill(bill) {
      try {
        const result = await Swal.fire({
          title: 'Xác nhận xóa',
          html: `
          Bạn có chắc chắn muốn xóa hóa đơn này?<br>
          <strong>Nhà:</strong> ${bill.houseName}<br>
          <strong>Phòng:</strong> ${bill.roomNumber}<br>
          <strong>Khách thuê:</strong> ${bill.customerName}<br>
          <strong>Tháng:</strong> ${this.formatMonth(bill.month)}
        `,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Xóa',
          cancelButtonText: 'Hủy',
          confirmButtonColor: '#dc3545'
        });

        if (result.isConfirmed) {
          
          // Kiểm tra nếu hóa đơn đã thanh toán
          if (bill.paidAmount > 0) {
            const confirmDelete = await Swal.fire({
              title: 'Cảnh báo',
              html: `Hóa đơn này đã thanh toán ${this.formatCurrency(bill.paidAmount)}.<br>Bạn vẫn muốn xóa?`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Xóa',
              cancelButtonText: 'Hủy',
              confirmButtonColor: '#dc3545'
            });

            if (!confirmDelete.isConfirmed) {
              return;
            }
          }

          // Thực hiện xóa
          await crudApi.delete("api::bill.bill", {id: bill.id});

          // Cập nhật dữ liệu local
          await this.loadBills();

          // Thông báo thành công
          Swal.fire({
            title: 'Thành công',
            text: 'Đã xóa hóa đơn!',
            icon: 'success',
            confirmButtonText: 'Đóng'
          });
        }
      } catch (error) {
        console.error('Error deleting bill:', error);
        Swal.fire({
          title: 'Lỗi',
          text: 'Không thể xóa hóa đơn. Vui lòng thử lại!',
          icon: 'error',
          confirmButtonText: 'Đóng'
        });
      }
    },

    async deleteBills() {
      try {
        if (this.selectedBills.length == 0) {
          Swal.fire('Thông báo', 'Vui lòng chọn hóa đơn cần xóa!', 'warning');
          return;
        }

        const result = await Swal.fire({
          title: 'Xác nhận xóa',
          html: `Bạn có chắc chắn muốn xóa ${this.selectedBills.length} hóa đơn đã chọn?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Xóa',
          cancelButtonText: 'Hủy',
          confirmButtonColor: '#dc3545'
        });

        if (result.isConfirmed) {
          // Hiển thị loading
          Swal.fire({
            title: 'Đang xử lý...',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          // Kiểm tra các hóa đơn đã thanh toán
          const paidBills = this.selectedBills.filter(bill => bill.paidAmount > 0);
          if (paidBills.length > 0) {
            const confirmDelete = await Swal.fire({
              title: 'Cảnh báo',
              html: `Có ${paidBills.length} hóa đơn đã thanh toán.<br>Bạn vẫn muốn xóa?`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Xóa',
              cancelButtonText: 'Hủy',
              confirmButtonColor: '#dc3545'
            });

            if (!confirmDelete.isConfirmed) {
              return;
            }
          }

          // Thực hiện xóa
          // const deletePromises = this.selectedBills.map(bill =>
          //   fetch(`https://6725a513c39fedae05b5670b.mockapi.io/api/v1/bills/${bill.id}`, {
          //     method: 'DELETE'
          //   })
          // );

          // await Promise.all(deletePromises);
          const listBillId = this.selectedBills.map(bill => bill.id);
          await crudApi.delete("api::bill.bill", {id: listBillId});

          // Cập nhật dữ liệu local
          await this.loadBills();
          this.selectedBills = [];
          this.selectAll = false;

          // Thông báo thành công
          Swal.fire({
            title: 'Thành công',
            text: 'Đã xóa các hóa đơn đã chọn!',
            icon: 'success',
            confirmButtonText: 'Đóng'
          });
        }
      } catch (error) {
        console.error('Error deleting bills:', error);
        Swal.fire({
          title: 'Lỗi',
          text: 'Có lỗi xảy ra khi xóa hóa đơn. Vui lòng thử lại!',
          icon: 'error',
          confirmButtonText: 'Đóng'
        });
      }
    },

    async collectPayments() {
      try {
        if (this.selectedBills.length == 0) {
          Swal.fire('Thông báo', 'Vui lòng chọn hóa đơn cần thu tiền!', 'warning');
          return;
        }

        // Tính tổng tiền còn lại của các hóa đơn được chọn
        const totalRemaining = this.selectedBills.reduce((sum, bill) => sum + bill.remainingAmount, 0);

        // Hiển thị form thu tiền
        const { value: result } = await Swal.fire({
          title: 'Thu tiền hóa đơn',
          html: `
        <div class="mb-3">
          <p>Số hóa đơn: <strong>${this.selectedBills.length}</strong></p>
          <p>Tổng tiền còn lại: <strong>${this.formatCurrency(totalRemaining)}</strong></p>
        </div>
        <div class="mb-3">
          <label class="form-label">Số tiền thu:</label>
          <input type="number" id="payment-amount" class="form-control" value="${totalRemaining}">
        </div>
        <div class="mb-3">
          <label class="form-label">Ghi chú:</label>
          <textarea id="payment-note" class="form-control" rows="2"></textarea>
        </div>
      `,
          showCancelButton: true,
          confirmButtonText: 'Thu tiền',
          cancelButtonText: 'Hủy',
          preConfirm: () => {
            const amount = document.getElementById('payment-amount').value;
            const note = document.getElementById('payment-note').value;
            if (!amount || amount <= 0) {
              Swal.showValidationMessage('Vui lòng nhập số tiền hợp lệ!');
              return false;
            }
            if (parseFloat(amount) > totalRemaining) {
              Swal.showValidationMessage('Số tiền không được lớn hơn tổng tiền còn lại!');
              return false;
            }
            return { amount: parseFloat(amount), note };
          }
        });

        if (result) {
          // Hiển thị loading
          Swal.fire({
            title: 'Đang xử lý...',
            html: 'Vui lòng chờ trong giây lát',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          // Phân bổ số tiền cho từng hóa đơn
          const { amount, note } = result;
          let remainingAmount = amount;
          const updates = [];

          for (const bill of this.selectedBills) {
            const paymentAmount = Math.min(remainingAmount, bill.remainingAmount);
            if (paymentAmount <= 0) break;

            const newPaidAmount = bill.paidAmount + paymentAmount;
            const newRemainingAmount = bill.totalAmount - newPaidAmount;
            const newStatus = newRemainingAmount == 0 ? 'paid' : 'partial';

            // Cập nhật lịch sử thanh toán
            const paymentHistory = {
              ...bill.paymentHistory,
              transactions: [
                ...(bill.paymentHistory?.transactions || []),
                {
                  amount: paymentAmount,
                  date: new Date().toISOString(),
                  type: 'payment',
                  note: note || 'Thu tiền hàng loạt'
                }
              ]
            };

            // Thêm vào danh sách cập nhật
            updates.push(
              crudApi.update("api::bill.bill", {id: bill.id}, {
                data: {
                  paidAmount: newPaidAmount,
                  remainingAmount: newRemainingAmount,
                  status: newStatus,
                  customStatus: newStatus,
                  paymentHistory,
                  lastUpdated: new Date().toISOString()
                }
              })
            );

            remainingAmount -= paymentAmount;
          }

          // Thực hiện tất cả các cập nhật
          await Promise.all(updates);

          // Cập nhật dữ liệu local
          await this.loadBills();
          this.selectedBills = [];
          this.selectAll = false;

          // Thông báo thành công
          Swal.fire({
            title: 'Thành công',
            text: 'Đã ghi nhận thanh toán cho các hóa đơn!',
            icon: 'success',
            confirmButtonText: 'Đóng'
          });

        }
      } catch (error) {
        console.error('Error collecting payments:', error);
        Swal.fire({
          title: 'Lỗi',
          text: 'Có lỗi xảy ra khi thu tiền. Vui lòng thử lại!',
          icon: 'error',
          confirmButtonText: 'Đóng'
        });
      }
    },

    printBills() {
      if (this.selectedBills.length == 0) {
        Swal.fire('Thông báo', 'Vui lòng chọn hóa đơn cần in!', 'warning');
        return;
      }

      // In từng hóa đơn được chọn
      this.selectedBills.forEach(bill => {
        this.generatePDF(bill, true); // true = direct print
      });
    },

    printBillDetail() {
      if (!this.selectedBillDetail) return;
      this.generatePDF(this.selectedBillDetail, true);
    },

    generatePDF(bill, directPrint = false) {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      let yPos = 20;

      // Header
      doc.setFontSize(18);
      doc.text('HÓA ĐƠN TIỀN PHÒNG', pageWidth / 2, yPos, { align: 'center' });

      // Thông tin cơ bản
      doc.setFontSize(12);
      yPos += 20;
      doc.text(`Nhà: ${bill.houseName}`, 20, yPos);
      yPos += 10;
      doc.text(`Phòng: ${bill.roomNumber}`, 20, yPos);
      yPos += 10;
      doc.text(`Khách thuê: ${bill.customerName}`, 20, yPos);
      yPos += 10;
      doc.text(`Tháng: ${this.formatMonth(bill.month)}`, 20, yPos);
      yPos += 20;

      // Chi tiết hóa đơn
      const tableData = [
        ['Khoản mục', 'Số lượng', 'Đơn giá', 'Thành tiền']
      ];

      // Tiền phòng
      tableData.push([
        bill.billDetails.rentalCost.description,
        '1 tháng',
        this.formatCurrency(bill.billDetails.rentalCost.amount),
        this.formatCurrency(bill.billDetails.rentalCost.amount)
      ]);

      // Tiền điện
      tableData.push([
        bill.billDetails.electric.description,
        `${bill.billDetails.electric.usage} kWh`,
        bill.billDetails.electric.unitPrice,
        this.formatCurrency(bill.billDetails.electric.amount)
      ]);

      // Tiền nước
      tableData.push([
        bill.billDetails.water.description,
        `${bill.billDetails.water.usage} m³`,
        bill.billDetails.water.unitPrice,
        this.formatCurrency(bill.billDetails.water.amount)
      ]);

      // Các dịch vụ khác
      bill.billDetails.services.forEach(service => {
        tableData.push([
          service.name,
          service.quantity.toString(),
          this.formatCurrency(service.unitPrice),
          this.formatCurrency(service.amount)
        ]);
      });

      // Phí phát sinh
      bill.billDetails.otherFees.forEach(fee => {
        tableData.push([
          fee.description,
          '1',
          this.formatCurrency(fee.amount),
          this.formatCurrency(fee.amount)
        ]);
      });

      // Thêm tổng cộng
      tableData.push([
        { content: 'Tổng cộng:', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
        { content: this.formatCurrency(bill.totalAmount), styles: { fontStyle: 'bold' } }
      ]);

      // Thêm đã thanh toán
      tableData.push([
        { content: 'Đã thanh toán:', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
        { content: this.formatCurrency(bill.paidAmount), styles: { fontStyle: 'bold' } }
      ]);

      // Thêm còn lại
      tableData.push([
        { content: 'Còn lại:', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
        { content: this.formatCurrency(bill.remainingAmount), styles: { fontStyle: 'bold' } }
      ]);

      // Tạo bảng
      doc.autoTable({
        startY: yPos,
        head: [tableData[0]],
        body: tableData.slice(1),
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 5
        },
        headStyles: {
          fillColor: [52, 58, 64],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 40, halign: 'center' },
          2: { cellWidth: 40, halign: 'right' },
          3: { cellWidth: 40, halign: 'right' }
        }
      });

      // Thêm chữ ký
      const finalY = doc.previousAutoTable.finalY + 30;
      doc.text('Người thu tiền', 40, finalY, { align: 'center' });
      doc.text('Người thanh toán', pageWidth - 40, finalY, { align: 'center' });

      // Thêm ngày tháng
      doc.setFontSize(10);
      doc.text(
        `Ngày in: ${new Date().toLocaleDateString('vi-VN')}`,
        pageWidth - 20,
        doc.internal.pageSize.height - 10,
        { align: 'right' }
      );

      if (directPrint) {
        doc.autoPrint();
        doc.output('dataurlnewwindow');
      } else {
        doc.save(`Hoa_don_${bill.roomNumber}_${bill.month}.pdf`);
      }
    },

    async loadData() {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser?.id) {
          throw new Error('Không tìm thấy thông tin người dùng!');
        }

        // Load houses for current landlord
        const houseResponse = await crudApi.read("api::home.home", {landlordId: {id: this.currentUser.id} });
        if (houseResponse.error) throw new Error('Không thể tải dữ liệu nhà.');
        this.houses = houseResponse.data;
        const houseIds = this.houses.map(house => house.id);


        // Load and filter rooms
        const roomResponse = await crudApi.read("api::room.room", {houseId: {id: houseIds} });
        if (roomResponse.error) throw new Error('Không thể tải dữ liệu phòng.');
        
        // Lọc rooms theo houses của landlord
        const allRooms = roomResponse.data;
        const listRoomId = allRooms.map(room => room.id);
        this.rooms = allRooms;

        // Load and filter customers
        const customersResponse = await crudApi.read("api::customer.customer", {rooms: {id: listRoomId} });
        if (customersResponse.error) throw new Error('Không thể tải dữ liệu khách hàng.');
        const allCustomers = customersResponse.data;
        this.customers = allCustomers;

        // Khởi tạo giá mặc định cho utility rates nếu không load được từ API
        this.electricRates = [
          { range: 50, price: 1678 },
          { range: 50, price: 1734 },
          { range: 100, price: 2014 },
          { range: 100, price: 2536 },
          { range: 100, price: 2834 },
          { range: Infinity, price: 2927 }
        ];

        this.waterRates = [
          { range: 10, price: 5973 },
          { range: 10, price: 7052 },
          { range: 10, price: 8669 },
          { range: Infinity, price: 15929 }
        ];

        // Load and filter electric data
        const electricResponse = await crudApi.read("api::electric-data.electric-data", {roomId: {id: listRoomId} });
        if (electricResponse.error) throw new Error('Không thể tải dữ liệu điện.');
        
        const allElectricData = electricResponse.data;
        this.electricData = allElectricData;

        // Load and filter water data
        const waterResponse = await crudApi.read("api::water-data.water-data", {roomId: {id: listRoomId} });
        if (waterResponse.error) throw new Error('Không thể tải dữ liệu nước.');
        
        const allWaterData = waterResponse.data;
        this.waterData = allWaterData;

        // Load and filter other fees
        const feesResponse = await crudApi.read("api::other-fee.other-fee", {houseId: {id: houseIds} });
        if (feesResponse.error) throw new Error('Không thể tải dữ liệu phí khác.');
        const allFees = feesResponse.data;
        this.otherFees = allFees;

        // Load and filter bills
        await this.loadBills();

      } catch (error) {
        console.error('Error loading data:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi tải dữ liệu',
          text: 'Không thể tải dữ liệu. Vui lòng thử lại sau!'
        });
      }
    },

    async loadBills() {
      try {
        // Lấy currentUser từ localStorage và kiểm tra
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser?.id) {
          throw new Error('Không tìm thấy thông tin người dùng!');
        }

        // Lấy tất cả hóa đơn từ API
        const houseIds = this.houses.map(house => house.id);
        const response = await crudApi.read("api::bill.bill", {homeId: {id: houseIds} });
        if(response.error) throw new Error('Không thể tải dữ liệu hóa đơn.');

        const allBills = response.data;

        this.bills = allBills.map(i => ({ ...i, status: i.customStatus }));

      } catch (error) {
        console.error('Error loading bills:', error);
        this.bills = [];
        Swal.fire({
          icon: 'error',
          title: 'Lỗi tải hóa đơn',
          text: 'Không thể tải dữ liệu hóa đơn. Vui lòng thử lại sau!'
        });
        throw error;
      }
    },

    calculateElectricCost(usage) {
      let totalCost = 0;
      let remainingUsage = usage;

      for (const rate of this.electricRates) {
        if (remainingUsage <= 0) break;

        const usageInRange = Math.min(remainingUsage, rate.range);
        totalCost += usageInRange * rate.price;
        remainingUsage -= usageInRange;
      }

      return totalCost;
    },

    calculateWaterCost(usage) {
      let totalCost = 0;
      let remainingUsage = usage;

      for (const rate of this.waterRates) {
        if (remainingUsage <= 0) break;

        const usageInRange = Math.min(remainingUsage, rate.range);
        totalCost += usageInRange * rate.price;
        remainingUsage -= usageInRange;
      }

      return totalCost;
    },

    async calculateBills() {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const selectedRooms = this.rooms.filter(room => {
          if (this.calculationHouse && room.houseId.id !== this.calculationHouse) return false;
          if (this.calculationRoom && room.id !== this.calculationRoom) return false;
          return room.isRented;
        });

        if (selectedRooms.length == 0) {
          Swal.fire('Thông báo', 'Không có phòng nào được chọn!', 'warning');
          return;
        }

        Swal.fire({
          title: 'Đang tính tiền...',
          html: 'Vui lòng chờ trong giây lát',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Lấy danh sách bills hiện tại
        const listRoomId = selectedRooms.map(room => room.id);
        const response = await crudApi.read("api::bill.bill", {room: {id: listRoomId} });
        
        const existingBills = response.data.map(i => ({ ...i, status: i.customStatus }));

        for (const room of selectedRooms) {
          const customer = this.customers.find(c => c.rooms.find(i=>i.id == room.id));
          console.log("customer", customer, this.customers, room.id);
          
          if (!customer) continue;

          const electric = this.electricData.find(e =>
            e.roomId.id == room.id && e.monthYear == this.calculationMonth
          );

          const water = this.waterData.find(w =>
            w.roomId.id == room.id && w.monthYear == this.calculationMonth
          );

          const otherFees = this.otherFees.filter(f =>
            f.houseId.id == room.houseId.id && 
            f.roomNumber == room.roomNumber && 
            f.monthYear == this.calculationMonth
          );

          // Calculate costs
          const electricCost = this.calculateElectricCost(electric?.electricUsage || 0);
          const waterCost = this.calculateWaterCost(water?.waterUsage || 0);
          customer.services = (customer.services || []);
          
          const servicesCost = customer.services
            .filter(service => service.name !== 'Điện' && service.name !== 'Nước')
            .reduce((total, service) => total + (service.price * (service.quantity || 1)), 0);

            console.log("qua day chua nhi");
            
          const otherFeesCost = otherFees.reduce((total, fee) => total + fee.amount, 0);

          const totalAmount = room.price + electricCost + waterCost + servicesCost + otherFeesCost;

          const billData = {
            landlordId: currentUser.id,
            month: this.calculationMonth,
            homeId: room.houseId.id,
            houseId: room.houseId.id,
            houseName: this.houses.find(h => h.id == room.houseId.id)?.name,
            roomId: room.id,
            room: room.id,
            roomNumber: room.roomNumber,
            customerId: customer.id,
            customerName: customer.fullName,
            customerPhone: customer.phoneNumber,
            customerEmail: customer.email,
            billDetails: {
              rentalCost: {
                amount: room.price,
                description: 'Tiền thuê phòng'
              },
              electric: {
                usage: electric?.electricUsage || 0,
                unitPrice: 'Giá bậc thang',
                amount: electricCost,
                description: 'Tiền điện'
              },
              water: {
                usage: water?.waterUsage || 0,
                unitPrice: 'Giá bậc thang',
                amount: waterCost,
                description: 'Tiền nước'
              },
              services: customer.services
                .filter(service => service.name !== 'Điện' && service.name !== 'Nước')
                .map(service => ({
                  name: service.name,
                  quantity: service.quantity || 1,
                  unitPrice: service.price,
                  amount: service.price * (service.quantity || 1)
                })),
              otherFees: otherFees.map(fee => ({
                description: fee.description,
                amount: fee.amount
              }))
            },
            totalAmount,
            paidAmount: 0,
            remainingAmount: totalAmount,
            status: 'unpaid',
            customStatus: 'unpaid',
            paymentHistory: {
              transactions: []
            },
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          };

          // Kiểm tra bill đã tồn tại
          const existingBill = existingBills.find(
            bill => bill.room.id == room.id && bill.month == this.calculationMonth
          );

          try {
            if (existingBill) {
              // Update existing bill
              await crudApi.update(`api::bill.bill`, {id: existingBill.id}, {
                  ...billData,
                  id: existingBill.id,
                  paidAmount: existingBill.paidAmount,
                  remainingAmount: totalAmount - existingBill.paidAmount,
                  status: existingBill.paidAmount == 0 ? 'unpaid' :
                    existingBill.paidAmount == totalAmount ? 'paid' : 'partial',
                  customStatus: existingBill.paidAmount == 0 ? 'unpaid' :
                    existingBill.paidAmount == totalAmount ? 'paid' : 'partial',
                  paymentHistory: existingBill.paymentHistory,
                  createdAt: existingBill.createdAt
                });
            } else {
              // Create new bill
              await crudApi.create(`api::bill.bill`, billData);
            }
          } catch (error) {
            console.error(`Error processing bill for room ${room.roomNumber}:`, error);
            throw error;
          }
        }

        await this.loadBills();
        this.calculateModal.hide();

        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Đã tính và lưu hóa đơn thành công!'
        });

      } catch (error) {
        console.error('Error calculating bills:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Có lỗi xảy ra khi tính tiền. Vui lòng thử lại!'
        });
      }
    },

    // UI Methods
    openCalculateModal() {
      this.calculateModal.show();
      // Lưu element đang focus trước khi mở modal
      this.previousActiveElement = document.activeElement;
    },

    closeCalculateModal() {
      this.calculateModal.hide();
      // Trả focus về element trước đó
      if (this.previousActiveElement) {
        this.previousActiveElement.focus();
      }
    },

    viewBillDetail(bill) {
      this.selectedBillDetail = {
        ...bill,
        rentalCost: bill.billDetails.rentalCost.amount,
        electricUsage: bill.billDetails.electric.usage,
        electricCost: bill.billDetails.electric.amount,
        waterUsage: bill.billDetails.water.usage,
        waterCost: bill.billDetails.water.amount,
        services: bill.billDetails.services,
        otherFees: bill.billDetails.otherFees
      };
      this.billDetailModal.show();
    },

    async recordPayment(bill) {
      const { value: amount } = await Swal.fire({
        title: 'Nhập số tiền thanh toán',
        input: 'number',
        inputLabel: 'Số tiền (VND)',
        inputValue: bill.remainingAmount,
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) return 'Vui lòng nhập số tiền!';
          if (value <= 0) return 'Số tiền phải lớn hơn 0!';
          if (value > bill.remainingAmount) return 'Số tiền không được lớn hơn số tiền còn lại!';
        }
      });

      if (amount) {
        try {
          const newPaidAmount = bill.paidAmount + parseFloat(amount);
          const newRemainingAmount = bill.totalAmount - newPaidAmount;
          const newStatus = newPaidAmount == bill.totalAmount ? 'paid' : 'partial';

          // Update payment history
          const paymentHistory = {
            ...bill.paymentHistory,
            transactions: [
              ...(bill.paymentHistory?.transactions || []),
              {
                amount: parseFloat(amount),
                date: new Date().toISOString(),
                type: 'payment'
              }
            ]
          };

          // Update bill in API
          await crudApi.update("api::bill.bill", {id: bill.id}, {
              ...bill,
              paidAmount: newPaidAmount,
              remainingAmount: newRemainingAmount,
              status: newStatus,
              customStatus: newStatus,
              paymentHistory,
              lastUpdated: new Date().toISOString()
            });

          // Update local state
          const billIndex = this.bills.findIndex(b => b.id == bill.id);
          if (billIndex >= 0) {
            this.bills[billIndex] = {
              ...bill,
              paidAmount: newPaidAmount,
              remainingAmount: newRemainingAmount,
              status: newStatus,
              customStatus: newStatus,
              paymentHistory
            };
          }
          await this.loadBills();
          Swal.fire('Thành công', 'Đã ghi nhận thanh toán!', 'success');
        } catch (error) {
          console.error('Error recording payment:', error);
          Swal.fire('Lỗi', 'Không thể ghi nhận thanh toán. Vui lòng thử lại!', 'error');
        }
      }
    },

    handleModalHidden() {
      if (this.previousActiveElement) {
        this.previousActiveElement.focus();
      }
    },

    // Utility Methods
    formatCurrency(value) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(value);
    },

    formatMonth(monthStr) {
      const [year, month] = monthStr.split('-');
      return `Tháng ${month}/${year}`;
    },

    getBillStatus(bill) {
      if (bill.paidAmount == 0) return 'unpaid';
      if (bill.paidAmount == bill.totalAmount) return 'paid';
      return 'partial';
    },

    getStatusText(bill) {
      const status = this.getBillStatus(bill);
      switch (status) {
        case 'paid': return 'Đã thanh toán';
        case 'partial': return 'Thanh toán một phần';
        default: return 'Chưa thanh toán';
      }
    },

    getStatusBadgeClass(bill) {
      const status = this.getBillStatus(bill);
      return {
        'badge bg-success': status == 'paid',
        'badge bg-warning': status == 'partial',
        'badge bg-danger': status == 'unpaid'
      };
    },

    // Export Methods
    exportToExcel() {
      const data = this.filteredBills.map(bill => ({
        'Nhà': bill.houseName,
        'Phòng': bill.roomNumber,
        'Khách thuê': bill.customerName,
        'Tháng': this.formatMonth(bill.month),
        'Tổng tiền': bill.totalAmount,
        'Đã trả': bill.paidAmount,
        'Còn lại': bill.remainingAmount,
        'Trạng thái': this.getStatusText(bill)
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Bills');
      XLSX.writeFile(wb, `Hoa_don_${this.selectedMonth}.xlsx`);
    },

    exportBillToPDF() {
      if (!this.selectedBillDetail) return;
      this.generatePDF(this.selectedBillDetail, false);
    },
  },

  async mounted() {
    if (await this.checkAccess()) {
      this.calculateModal = new Modal(document.getElementById('calculateModal'));
      this.billDetailModal = new Modal(document.getElementById('billDetailModal'));

      const modalElement = document.getElementById('calculateModal');
      if (modalElement) {
        modalElement.addEventListener('hidden.bs.modal', this.handleModalHidden);
      }

      await this.loadData();
    }
  },

  beforeUnmount() {
    // Cleanup modals và event listeners
    const modalElement = document.getElementById('calculateModal');
    if (modalElement) {
      modalElement.removeEventListener('hidden.bs.modal', this.handleModalHidden);
    }

    if (this.calculateModal) {
      this.calculateModal.dispose();
    }
    if (this.billDetailModal) {
      this.billDetailModal.dispose();
    }
  }
};
</script>

<style scoped>
/* Base Container */
.calculator-money {
  margin-top: 3rem !important;
  padding: 1rem;
  background: #f1f5f9;
  min-height: calc(100vh - 2rem);
}

/* Header Section */
.page-header {
  background: linear-gradient(120deg, #0ea5e9 0%, #38bdf8 100%);
  border-radius: 0.75rem;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.header-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  letter-spacing: -0.025em;
}

/* Action Buttons */
.header-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.5rem 0.875rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 500;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: white;
  transition: all 0.2s;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.btn-calculate {
  background: #10b981;
}

.btn-export {
  background: #0ea5e9;
}

.btn-print {
  background: #f59e0b;
}

.btn-collect {
  background: #8b5cf6;
}

.btn-delete {
  background: #ef4444;
}

.action-btn:hover {
  filter: brightness(110%);
  transform: translateY(-1px);
}

/* Filter Section */
.filter-section {
  background: white;
  border-radius: 0.75rem;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.form-control,
.form-select {
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 0.75rem;
  height: 2.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-control:focus,
.form-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* Alert Styles */
.custom-alert {
  background: #f0f9ff;
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  border-left: 4px solid #0ea5e9;
  margin-top: 1rem;
}

.alert-heading {
  font-size: 1rem;
  color: #0c4a6e;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.alert-list {
  margin: 0;
  padding-left: 1.25rem;
  font-size: 0.875rem;
  color: #334155;
  line-height: 1.5;
}

/* Table Styles */
.table-responsive {
  background: white;
  border-radius: 0.75rem;
  padding: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.table {
  margin: 0;
  font-size: 0.875rem;
  width: 100%;
}

.table th {
  background: #f8fafc;
  padding: 0.75rem;
  font-weight: 600;
  color: #475569;
  white-space: nowrap;
}

.table td {
  padding: 0.75rem;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
}

/* Status Badges */
.status-badge {
  padding: 0.25rem 0.625rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.bg-success {
  background: #dcfce7 !important;
  color: #166534 !important;
}

.bg-warning {
  background: #fef3c7 !important;
  color: #92400e !important;
}

.bg-danger {
  background: #fee2e2 !important;
  color: #991b1b !important;
}

/* Table Actions */
.btn-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  transition: all 0.2s;
  color: white;
}

.btn-view {
  background: #0ea5e9;
}

.btn-payment {
  background: #10b981;
}

.btn-delete {
  background: #ef4444;
}

.btn-icon:hover {
  filter: brightness(110%);
  transform: translateY(-1px);
}

/* Modal Styles */
.modal-content {
  border-radius: 0.75rem;
  border: none;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1rem 1.25rem;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
  border-radius: 0.75rem 0.75rem 0 0;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #0f172a;
}

.modal-body {
  padding: 1.25rem;
}

.modal-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid #f1f5f9;
  border-radius: 0 0 0.75rem 0.75rem;
}

.btn-icon {
  border: none;
}

/* Responsive Design */
@media (max-width: 768px) {
  .action-btn span {
    display: none;
  }

  .action-btn {
    padding: 0.5rem;
    width: 2.25rem;
    height: 2.25rem;
    justify-content: center;
  }

  .table th,
  .table td {
    padding: 0.625rem;
  }

  .status-badge {
    padding: 0.25rem 0.5rem;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.calculator-money {
  animation: fadeIn 0.3s ease-out;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 0.5rem;
  height: 0.5rem;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 0.25rem;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>