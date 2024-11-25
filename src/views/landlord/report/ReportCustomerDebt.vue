<template>
  <div class="modern-container">
    <!-- Header Section -->
    <div class="report-header">
      <div class="title-section">
        <i class="fas fa-file-invoice-dollar"></i>
        <h2>Danh sách khách nợ tiền phòng</h2>
      </div>

      <!-- Filter Section -->
      <div class="filter-section">
        <div class="filter-group">
          <div class="filter-item">
            <label class="filter-label">
              <i class="fas fa-home"></i> Nhà
            </label>
            <select class="modern-select" v-model="selectedHouse">
              <option value="">Tất cả nhà</option>
              <option v-for="house in houses" :key="house.id" :value="house.name">
                {{ house.name }}
              </option>
            </select>
          </div>

          <div class="filter-item">
            <label class="filter-label">
              <i class="fas fa-door-open"></i> Phòng
            </label>
            <select class="modern-select" v-model="selectedRoom">
              <option value="">Tất cả phòng</option>
              <option v-for="room in filteredRooms" :key="room.id" :value="room.roomNumber">
                Phòng {{ room.roomNumber }}
              </option>
            </select>
          </div>

          <button class="btn-search" @click="fetchReport" :disabled="isLoading">
            <!-- <i class="fas" :class="isLoading ? 'fa-spinner fa-spin' : 'fa-search'"></i> -->
            {{ isLoading ? 'Đang tải...' : 'Tìm kiếm' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="content-section">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
      </div>

      <!-- Data Table -->
      <div v-else class="table-container">
        <div class="table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th>Khách thuê</th>
                <th>Thông tin liên hệ</th>
                <th>Thông tin phòng</th>
                <th>Thời gian thuê</th>
                <th>Trạng thái</th>
                <th>Thông tin thanh toán</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(customer, index) in filteredCustomers" :key="index">
                <td>
                  <div class="customer-info">
                    <span class="customer-name">{{ customer.fullName }}</span>
                  </div>
                </td>
                <td>
                  <div class="contact-info">
                    <div><i class="fas fa-map-marker-alt"></i> {{ customer.address }}</div>
                    <div><i class="fas fa-phone"></i> {{ customer.phoneNumber }}</div>
                  </div>
                </td>
                <td>
                  <div class="room-info">
                    <div>Nhà: {{ customer.houseName }}</div>
                    <div>Phòng: {{ customer.roomNumber }}</div>
                  </div>
                </td>
                <td>
                  <div class="date-info">
                    <div>Từ: {{ formatDate(customer.startDate) }}</div>
                    <div>Đến: {{ formatDate(customer.endDate) }}</div>
                  </div>
                </td>
                <td>
                  <span :class="['status-badge', getStatusClass(customer.status)]">
                    {{ customer.status }}
                  </span>
                </td>
                <td>
                  <div class="payment-info">
                    <div class="amount-row">
                      <span>Tổng phí:</span>
                      <span>{{ formatCurrency(customer.totalFees) }}</span>
                    </div>
                    <div class="amount-row">
                      <span>Đã trả:</span>
                      <span>{{ formatCurrency(customer.paid) }}</span>
                    </div>
                    <div class="amount-row remaining">
                      <span>Còn lại:</span>
                      <span>{{ formatCurrency(customer.remaining) }}</span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
            <!-- Summary Footer -->
            <tfoot v-if="filteredCustomers.length > 0">
              <tr>
                <td colspan="5" class="text-end">Tổng cộng:</td>
                <td>
                  <div class="total-summary">
                    <div class="amount-row">
                      <span>Tổng phí:</span>
                      <span>{{ formatCurrency(totalAmount) }}</span>
                    </div>
                    <div class="amount-row">
                      <span>Đã trả:</span>
                      <span>{{ formatCurrency(totalPaid) }}</span>
                    </div>
                    <div class="amount-row remaining">
                      <span>Còn lại:</span>
                      <span>{{ formatCurrency(totalRemaining) }}</span>
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import crudApi from '@/apis/crudApi';

export default {
  name: 'ReportCustomerDebt',

  data() {
    return {
      selectedHouse: "",
      selectedRoom: "",
      houses: [],
      rooms: [],
      customers: [],
      bills: [],
      isLoading: false,
      error: null
    };
  },

  computed: {
    filteredRooms() {
      if (!this.selectedHouse) return this.rooms;
      return this.rooms.filter(room => {
        const house = this.houses.find(h => h.id == room.houseId.id);
        return house && house.name == this.selectedHouse;
      });
    },

    filteredCustomers() {
      let filtered = this.customers.map(customer => {
        // Tìm hóa đơn còn nợ của khách hàng
        const customerBills = this.bills.filter(bill =>
          bill.customerId.id == customer.id && bill.remainingAmount > 0
        );

        // Nếu không có hóa đơn nợ, bỏ qua khách hàng này
        if (customerBills.length == 0) return null;

        // Tính tổng các khoản
        const totalAmount = customerBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
        const paidAmount = customerBills.reduce((sum, bill) => sum + bill.paidAmount, 0);
        const remainingAmount = customerBills.reduce((sum, bill) => sum + bill.remainingAmount, 0);

        // Tìm thông tin nhà và phòng
        const house = this.houses.find(h => h.id == customer.houseId);
        const room = this.rooms.find(r => r.id == customer.roomId);

        // Lấy thông tin hợp đồng
        const contract = customer.contracts?.[0] || {};

        return {
          fullName: customer.fullName,
          address: customer.address || "Không có",
          phoneNumber: customer.phoneNumber1 || "Không có",
          houseName: house?.name || "N/A",
          roomNumber: room?.roomNumber || "N/A",
          startDate: customer.startDate || "N/A",
          endDate: contract.contractEndDate || "N/A",
          status: room?.isRented ? "Đang thuê" : "Đã kết thúc",
          customStatus: room?.isRented ? "Đang thuê" : "Đã kết thúc",
          totalFees: totalAmount,
          paid: paidAmount,
          remaining: remainingAmount
        };
      }).filter(customer =>
        customer !== null && // Loại bỏ các khách hàng không có nợ
        (!this.selectedHouse || customer.houseName == this.selectedHouse) &&
        (!this.selectedRoom || customer.roomNumber == this.selectedRoom)
      );
      return filtered;
    },

    // Tính tổng các cột
    totalAmount() {
      return this.filteredCustomers.reduce((sum, customer) => sum + customer.totalFees, 0);
    },

    totalPaid() {
      return this.filteredCustomers.reduce((sum, customer) => sum + customer.paid, 0);
    },

    totalRemaining() {
      return this.filteredCustomers.reduce((sum, customer) => sum + customer.remaining, 0);
    }
  },

  methods: {
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(date);
      } catch (error) {
        console.error('Error formatting date:', error);
        return 'N/A';
      }
    },
    async fetchAllData() {
      try {
        this.isLoading = true;
        this.error = null;

        // Lấy thông tin currentUser từ localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser?.id) {
          throw new Error('Không tìm thấy thông tin người dùng!');
        }


        const housesRes = await crudApi.read("api::home.home", {landlordId: {id: currentUser.id}});
        const allHouses = housesRes.data;
        this.houses = allHouses;
        const landlordHouseIds = this.houses.map(house => house.id);

        const roomsRes = await crudApi.read("api::room.room", {houseId: {id: landlordHouseIds}});
        const allRooms = roomsRes.data;
        this.rooms = allRooms;
        const landlordRoomIds = this.rooms.map(room => room.id);
        
        const customersRes = await crudApi.read("api::customer.customer", {rooms: {id: landlordRoomIds}});
        const allCustomers = customersRes.data;
        this.customers = allCustomers;
        
        // Lọc bills theo customers của landlord
        const billsRes = await crudApi.read("api::bill.bill", {room: {id: landlordRoomIds}});
        const allBills = billsRes.data.map(i => ({ ...i, status: i.customStatus }));

        this.bills = allBills.filter(bill => {
          const customer = this.customers.find(c => c.billID.find(x=>x.id == bill.id));
          return customer && bill.remainingAmount > 0; // Chỉ lấy bills còn nợ
        });

      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        this.error = "Không thể tải dữ liệu. Vui lòng thử lại sau!";
      } finally {
        this.isLoading = false;
      }
    },

    async fetchReport() {
      await this.fetchAllData();
    },

    formatCurrency(value) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value || 0);
    },

    getStatusClass(status) {
      return {
        'text-success': status == 'Đang thuê',
        'text-danger': status == 'Đã kết thúc'
      };
    }
  },

  async mounted() {
    await this.fetchAllData();
  }
};
</script>

<style scoped>
.modern-container {
  margin-top: 3rem !important;
  padding: 2rem;
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
}

.report-header {
  margin-bottom: 2rem;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.title-section i {
  font-size: 1.5rem;
  color: #4f46e5;
}

.title-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.filter-section {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.75rem;
}

.filter-group {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.filter-item {
  flex: 1;
}

.filter-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.filter-label i {
  margin-right: 0.5rem;
  color: #6b7280;
}

.modern-select {
  width: 100%;
  padding: 0.625rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #fff;
  font-size: 0.875rem;
  color: #1f2937;
  transition: all 0.2s;
}

.modern-select:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  outline: none;
}

.btn-search {
  padding: 0.625rem 1.25rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-search:hover:not(:disabled) {
  background: #4338ca;
  transform: translateY(-1px);
}

.btn-search:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Table Styles */
.table-container {
  margin-top: 1.5rem;
  background: #fff;
  border-radius: 0.75rem;
  overflow: hidden;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table th {
  background: #f9fafb;
  padding: 1rem;
  font-weight: 600;
  color: #4b5563;
  text-align: left;
}

.modern-table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.customer-info,
.contact-info,
.room-info,
.date-info,
.payment-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.customer-name {
  font-weight: 500;
  color: #1f2937;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.expired {
  background: #fee2e2;
  color: #991b1b;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.remaining {
  font-weight: 600;
  color: #dc2626;
}

.total-summary {
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .filter-group {
    flex-direction: column;
    gap: 1rem;
  }

  .btn-search {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .modern-container {
    padding: 1rem;
  }

  .title-section {
    flex-direction: column;
    text-align: center;
  }

  .modern-table {
    font-size: 0.875rem;
  }
}
</style>