<template>
  <div class="modern-container">
    <!-- Header Section -->
    <div class="report-header">
      <div class="title-section">
        <i class="fas fa-file-contract"></i>
        <h2>Danh sách hợp đồng sắp hết hạn</h2>
        <span class="subtitle">(trong vòng 30 ngày)</span>
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
              :disabled="isLoading"
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
            <select
              class="modern-select"
              v-model="selectedRoom"
              :disabled="isLoading"
            >
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

          <button
            class="search-button"
            @click="fetchReport"
            :disabled="isLoading"
          >
            <i
              class="fa fa-search"
            ></i>
            Tìm kiếm
          </button>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="content-section">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="skeleton-table">
          <div class="skeleton-header">
            <div v-for="i in 9" :key="i" class="skeleton-cell"></div>
          </div>
          <div class="skeleton-body">
            <div v-for="i in 3" :key="i" class="skeleton-row">
              <div v-for="j in 9" :key="j" class="skeleton-cell"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div v-else class="table-container">
        <table class="modern-table">
          <thead>
            <tr>
              <th>Thông tin khách thuê</th>
              <th>Vị trí phòng</th>
              <th>Thông tin hợp đồng</th>
              <th>Thời hạn</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(contract, index) in filteredContracts" :key="index">
              <td>
                <div class="tenant-info">
                  <div class="tenant-name">{{ contract.tenantName }}</div>
                  <div class="tenant-contact">
                    <div>
                      <i class="fas fa-map-marker-alt"></i>
                      {{ contract.tenantAddress }}
                    </div>
                    <div>
                      <i class="fas fa-phone"></i> {{ contract.tenantPhone }}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div class="room-info">
                  <div class="house-name">{{ contract.houseName }}</div>
                  <div class="room-number">Phòng {{ contract.roomNumber }}</div>
                </div>
              </td>
              <td>
                <div class="contract-info">
                  <div class="contract-id">HĐ: {{ contract.id }}</div>
                  <div class="contract-dates">
                    <div>Ngày ký: {{ formatDate(contract.startDate) }}</div>
                    <div>Hết hạn: {{ formatDate(contract.endDate) }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div
                  class="remaining-days"
                  :class="getRemainingDaysClass(contract.remainingDays)"
                >
                  <span class="days-number">{{ contract.remainingDays }}</span>
                  <span class="days-text">ngày</span>
                </div>
              </td>
            </tr>
            <tr v-if="filteredContracts.length == 0">
              <td colspan="4" class="empty-message">
                <i class="fas fa-folder-open"></i>
                <span>Không có dữ liệu</span>
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
import Swal from 'sweetalert2';

export default {
  name: 'ReportCustomerContractExpired',

  data() {
    return {
      selectedHouse: '',
      selectedRoom: '',
      houses: [],
      rooms: [],
      contracts: [],
      isLoading: false,
    };
  },

  computed: {
    filteredRooms() {
      if (!this.selectedHouse) return this.rooms;
      return this.rooms.filter((room) => {
        const house = this.houses.find((h) => h.id == room.houseId);
        return house && house.name == this.selectedHouse;
      });
    },

    filteredContracts() {
      return this.contracts.filter((contract) => {
        // Chỉ lấy những contract thuộc nhà và phòng của landlord
        const house = this.houses.find((h) => h.id == contract.houseId);
        const room = this.rooms.find((r) => r.id == contract.roomId);

        if (!house || !room) return false;

        const matchHouse =
          !this.selectedHouse || contract.houseName == this.selectedHouse;
        const matchRoom =
          !this.selectedRoom || contract.roomNumber == this.selectedRoom;

        return matchHouse && matchRoom;
      });
    },
  },

  methods: {
    async fetchData() {
      try {
        this.isLoading = true;

        // Lấy thông tin currentUser từ localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser?.id) {
          throw new Error('Không tìm thấy thông tin người dùng!');
        }


        const housesResponse = await crudApi.read('api::home.home', {landlordId: {id: currentUser?.id}});
        const listHouseId = housesResponse.data.map((f) => f.id);

        const roomsResponse = await crudApi.read('api::room.room', {houseId: {id: listHouseId}});

        const allHouses = housesResponse.data.map((f) => ({
          ...f,
          landlordId: f.landlordId.id,
          landlord: f.landlordId,
        }));
        const allRooms = roomsResponse.data.map((f) => ({
          ...f,
          houseId: f.houseId.id,
          house: f.houseId,
        }));

        // Lọc houses theo landlordId
        this.houses = allHouses;

        // Lọc rooms theo houses của landlord
        this.rooms = allRooms;

        await this.fetchReport();
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Không thể tải dữ liệu. Vui lòng thử lại sau!',
        });
      } finally {
        this.isLoading = false;
      }
    },

    async fetchReport() {
      try {
        this.isLoading = true;

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser?.id) {
          throw new Error('Không tìm thấy thông tin người dùng!');
        }

        const listHouseId = this.houses.map((f) => f.id);
        const response = await crudApi.read('api::contract.contract', {houseId: {id: listHouseId}});
        if (response.error) {
          throw new Error('Failed to fetch contracts');
        }

        const allContracts = response.data.map((f) => ({
          ...f,
          userId: f.userId.id,
          user: f.userId,
          houseId: f.houseId.id,
          house: f.houseId,
          status: f.customStatus,
        }));

        // Process contracts
        const today = new Date();

        this.contracts = allContracts
          .map((contract) => {
            const house = this.houses.find((h) => h.id == contract.houseId);
            const room = this.rooms.find((r) => r.roomNumber == contract.roomNumber);
            const remainingDays = this.calculateRemainingDays(
              today,
              new Date(contract.endDate)
            );

            return {
              ...contract,
              houseName: house?.name || 'N/A',
              roomNumber: room?.roomNumber || 'N/A',
              remainingDays,
              houseId: contract.houseId,
              roomId: room.id,
            };
          })
          .filter(
            (contract) =>
              contract.remainingDays <= 30 && contract.remainingDays > 0
          )
          .sort((a, b) => a.remainingDays - b.remainingDays);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu báo cáo:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Không thể tải dữ liệu báo cáo. Vui lòng thử lại sau!',
        });
      } finally {
        this.isLoading = false;
      }
    },

    calculateRemainingDays(today, endDate) {
      const diffTime = endDate - today;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
      } catch {
        return dateString;
      }
    },

    getRemainingDaysClass(days) {
      if (days <= 7) return 'text-danger fw-bold';
      if (days <= 15) return 'text-warning fw-bold';
      return 'text-success';
    },
  },

  async mounted() {
    await this.fetchData();
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
  margin-bottom: 1.5rem;
}

.title-section i {
  font-size: 2rem;
  color: #3b82f6;
}

.title-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.subtitle {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Filter Styles */
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
  margin-bottom: 0.5rem;
  color: #4b5563;
  font-weight: 500;
}

.modern-select {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #1f2937;
  transition: all 0.2s;
}

.modern-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-button {
  padding: 0.625rem 1.5rem;
  background: linear-gradient(to right, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.search-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

/* Table Styles */
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
  text-align: left;
}

.modern-table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.tenant-info,
.room-info,
.contract-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tenant-name {
  font-weight: 600;
  color: #1f2937;
}

.tenant-contact {
  font-size: 0.875rem;
  color: #6b7280;
}

.tenant-contact i {
  width: 16px;
  margin-right: 0.5rem;
}

.remaining-days {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
}

.remaining-days.text-danger {
  background: #fee2e2;
  color: #991b1b;
}

.remaining-days.text-warning {
  background: #fef3c7;
  color: #92400e;
}

.remaining-days.text-success {
  background: #dcfce7;
  color: #166534;
}

.days-number {
  font-size: 1.25rem;
}

.days-text {
  font-size: 0.75rem;
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

  .title-section {
    flex-direction: column;
    text-align: center;
  }

  .modern-table {
    font-size: 0.875rem;
  }
}
</style>
