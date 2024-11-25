<template>
  <div class="modern-container">
    <!-- Header Section -->
    <div class="report-header">
      <div class="title-section">
        <i class="fas fa-file-invoice-dollar"></i>
        <h2>Chi tiết doanh thu</h2>
      </div>

      <!-- Filter Section -->
      <div class="filter-section">
        <div class="filter-group">
          <div class="filter-item">
            <label class="filter-label">
              <i class="fas fa-home"></i> Nhà
            </label>
            <select
              class="modern-select"
              v-model="selectedHouse"
              @change="updateRooms"
            >
              <option value="">Tất cả nhà</option>
              <option
                v-for="house in houses"
                :key="house.id"
                :value="house.name"
              >
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
              <option
                v-for="room in filteredRooms"
                :key="room.roomNumber"
                :value="room.roomNumber"
              >
                Phòng {{ room.roomNumber }}
              </option>
            </select>
          </div>

          <button class="search-button" @click="fetchReport">
            <i class="fas fa-search"></i>
            <span>Xem báo cáo</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="content-section">
      <div class="table-container">
        <table class="modern-table">
          <thead>
            <tr>
              <th>Thông tin phòng</th>
              <th>Chi phí cơ bản</th>
              <th>Chi phí dịch vụ</th>
              <th>Tổng kết</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(invoice, index) in filteredInvoices" :key="index">
              <td>
                <div class="room-info">
                  <div class="room-number">Phòng {{ invoice.roomNumber }}</div>
                  <div class="customer-name">{{ invoice.customerName }}</div>
                </div>
              </td>
              <td>
                <div class="cost-group">
                  <div class="cost-item">
                    <i class="fas fa-home"></i>
                    <span>Tiền thuê:</span>
                    <strong>{{ formatCurrency(invoice.rentalCost) }}</strong>
                  </div>
                  <div class="cost-item">
                    <i class="fas fa-bolt"></i>
                    <span>Tiền điện:</span>
                    <strong>{{ formatCurrency(invoice.electricCost) }}</strong>
                  </div>
                  <div class="cost-item">
                    <i class="fas fa-water"></i>
                    <span>Tiền nước:</span>
                    <strong>{{ formatCurrency(invoice.waterCost) }}</strong>
                  </div>
                </div>
              </td>
              <td>
                <div class="cost-group">
                  <div class="cost-item">
                    <i class="fas fa-concierge-bell"></i>
                    <span>Phí dịch vụ:</span>
                    <strong>{{ formatCurrency(invoice.serviceCost) }}</strong>
                  </div>
                  <div class="cost-item">
                    <i class="fas fa-plus-circle"></i>
                    <span>Phí khác:</span>
                    <strong>{{ formatCurrency(invoice.otherCost) }}</strong>
                  </div>
                </div>
              </td>
              <td>
                <div class="total-group">
                  <div class="total-item">
                    <span>Tổng tiền:</span>
                    <strong class="total-amount">{{
                      formatCurrency(invoice.totalAmount)
                    }}</strong>
                  </div>
                  <div class="total-item">
                    <span>Đã trả:</span>
                    <strong class="paid-amount">{{
                      formatCurrency(invoice.paidAmount)
                    }}</strong>
                  </div>
                  <div class="total-item">
                    <span>Còn lại:</span>
                    <strong class="remaining-amount">{{
                      formatCurrency(invoice.remainingAmount)
                    }}</strong>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="filteredInvoices.length == 0">
              <td colspan="4" class="empty-message">
                <i class="fas fa-inbox"></i>
                <p>Không có dữ liệu</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import crudApi from '@/apis/crudApi';

export default {
  data() {
    return {
      selectedHouse: '',
      selectedRoom: '',
      houses: [],
      rooms: [],
      bills: [],
      currentUser: null,
      isLoading: false,
    };
  },

  computed: {
    filteredRooms() {
      if (!this.rooms) return [];
      return this.selectedHouse
        ? this.rooms.filter((room) => room.houseName == this.selectedHouse)
        : this.rooms;
    },

    filteredInvoices() {
      if (!this.bills) return [];

      let filtered = this.bills;

      if (this.selectedHouse) {
        filtered = filtered.filter(
          (bill) => bill.houseName == this.selectedHouse
        );
      }

      if (this.selectedRoom) {
        filtered = filtered.filter(
          (bill) => bill.roomNumber == this.selectedRoom
        );
      }

      return filtered.map((bill) => ({
        roomNumber: bill.roomNumber,
        customerName: bill.customerName || 'Không có',
        rentalCost: bill.billDetails?.rentalCost?.amount || 0,
        electricCost: bill.billDetails?.electric?.amount || 0,
        waterCost: bill.billDetails?.water?.amount || 0,
        serviceCost:
          bill.billDetails?.services?.reduce(
            (sum, service) => sum + (service.amount || 0),
            0
          ) || 0,
        otherCost:
          bill.billDetails?.otherFees?.reduce(
            (sum, fee) => sum + (fee.amount || 0),
            0
          ) || 0,
        totalAmount: bill.totalAmount || 0,
        paidAmount: bill.paidAmount || 0,
        remainingAmount: bill.remainingAmount || 0,
      }));
    },
  },

  methods: {
    async fetchHouses() {
      try {
        // Lấy thông tin currentUser từ localStorage
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!this.currentUser?.id) {
          throw new Error('Không tìm thấy thông tin người dùng!');
        }

        const response = await crudApi.read('api::home.home', null);
        if (!response.isSuccess) {
          throw new Error('Error to fetch home');
        }
        const homes = response.data;

        // Lọc nhà theo landlordId
        this.houses = homes
          .filter((home) => home.landlordId.id == this.currentUser.id)
          .map((home) => ({
            id: home.id,
            name: home.name,
          }));
      } catch (error) {
        console.error('Lỗi khi tải danh sách nhà:', error);
        this.houses = [];
      }
    },

    async fetchRooms() {
      try {
        const response = await crudApi.read('api::room.room', null);
        if (!response.isSuccess) {
          throw new Error('Error to fetch room');
        }

        const allRooms = await response.data;

        // Lọc phòng theo houses của landlord
        const landlordHouseIds = this.houses.map((h) => h.id);
        this.rooms = allRooms
          .filter((room) => landlordHouseIds.includes(room.houseId.id))
          .map((room) => ({
            id: room.id,
            roomNumber: room.roomNumber,
            houseName: this.houses.find((h) => h.id == room.houseId.id)?.name,
          }));
      } catch (error) {
        console.error('Lỗi khi tải danh sách phòng:', error);
        this.rooms = [];
      }
    },

    async fetchReport() {
      try {
        const response = await crudApi.read('api::bill.bill');
        if (!response.isSuccess) {
          throw new Error('Fetch bill failed');
        }
        const allBills = response.data.map(i => ({ ...i, status: i.customStatus }));

        // Lọc bills theo rooms của landlord
        const landlordRoomIds = this.rooms.map((r) => r.roomNumber);
        this.bills = allBills
          .filter((bill) => landlordRoomIds.includes(bill.roomNumber))
          .map((bill) => ({
            ...bill,
            houseName: this.rooms.find((r) => r.roomNumber == bill.roomNumber)
              ?.houseName,
          }));
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu hóa đơn:', error);
        this.bills = [];
      }
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(value);
    },

    updateRooms() {
      this.selectedRoom = '';
    },
  },

  async mounted() {
    try {
      // Kiểm tra đăng nhập
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser?.id) {
        throw new Error('Vui lòng đăng nhập để xem báo cáo!');
      }

      await this.fetchHouses();
      await this.fetchRooms();
      await this.fetchReport();
    } catch (error) {
      console.error('Lỗi khi khởi tạo dữ liệu:', error);
      // Hiển thị thông báo lỗi cho người dùng
      this.$swal({
        icon: 'error',
        title: 'Lỗi!',
        text: error.message || 'Không thể tải dữ liệu. Vui lòng thử lại sau!',
      });
    }
  },
};
</script>

<style scoped>
.modern-container {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  margin: 3rem auto;
}

.report-header {
  margin-bottom: 2rem;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.title-section i {
  font-size: 2rem;
  color: #4f46e5;
}

h2 {
  font-size: 1.875rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.filter-section {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
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
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #4b5563;
}

.modern-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  transition: all 0.2s;
}

.search-button {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(to right, #4f46e5, #6366f1);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.modern-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.modern-table th {
  background: #f9fafb;
  padding: 1rem;
  font-weight: 600;
  color: #4b5563;
}

.cost-group,
.total-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cost-item,
.total-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cost-item i {
  width: 20px;
  color: #6b7280;
}

.total-amount {
  color: #4f46e5;
}

.paid-amount {
  color: #059669;
}

.remaining-amount {
  color: #dc2626;
}

.empty-message {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .filter-group {
    flex-direction: column;
  }

  .search-button {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .modern-container {
    padding: 1rem;
    margin: 1rem;
  }

  .modern-table {
    font-size: 0.875rem;
  }
}
</style>
