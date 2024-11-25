<template>
  <div class="contract-list">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-title">
        <i class="fas fa-file-contract"></i>
        <h1>Danh sách hợp đồng</h1>
      </div>
      <div class="header-actions">
        <button class="action-btn add-btn" @click="addContract">
          <i class="fas fa-plus"></i>
          <span>Thêm hợp đồng</span>
        </button>
        <button
          class="action-btn print-btn"
          :disabled="!selectedContract"
          @click="printContract"
        >
          <i class="fas fa-print"></i>
          <span>In hợp đồng</span>
        </button>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-grid">
        <div class="filter-group">
          <label>Nhà</label>
          <select v-model="selectedHouse">
            <option value="all">Tất cả nhà</option>
            <option v-for="house in houses" :key="house.id" :value="house.id">
              {{ house.name }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Phòng</label>
          <select v-model="selectedRoom" :disabled="selectedHouse == 'all'">
            <option value="all">Tất cả phòng</option>
            <option
              v-for="room in filteredRooms"
              :key="room.roomNumber"
              :value="room.roomNumber"
            >
              {{ room.roomNumber }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Trạng thái</label>
          <select v-model="selectedStatus">
            <option value="all">Tất cả</option>
            <option value="active">Đang hiệu lực</option>
            <option value="expired">Đã hết hạn</option>
            <option value="terminating">Sắp hết hạn</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Tìm kiếm</label>
          <div class="search-input">
            <i class="fas fa-search"></i> &nbsp;
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Tìm theo tên, mã hợp đồng..."
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <span>Đang tải dữ liệu...</span>
    </div>

    <!-- Contracts Table -->
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nhà</th>
            <th>Phòng</th>
            <th>Mã HĐ</th>
            <th>Khách thuê</th>
            <th>Ngày bắt đầu</th>
            <th>Ngày kết thúc</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="contract in paginatedContracts"
            :key="contract.id"
            @click="viewContract(contract)"
          >
            <td>{{ contract.houseName }}</td>
            <td>{{ contract.roomNumber }}</td>
            <td>{{ contract.id }}</td>
            <td>{{ contract.tenantName }}</td>
            <td>{{ formatDate(contract.startDate) }}</td>
            <td>{{ formatDate(contract.endDate) }}</td>
            <td>
              <span :class="getStatusClass(contract)">
                {{ getStatusText(contract) }}
              </span>
            </td>
            <td>
              <div class="action-group">
                <button
                  class="icon-btn view-btn"
                  @click.stop="viewContract(contract)"
                >
                  <i class="fas fa-eye"></i>
                </button>
                <button
                  class="icon-btn edit-btn"
                  @click.stop="editContract(contract.id)"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  class="icon-btn delete-btn"
                  @click.stop="deleteContract(contract)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="paginatedContracts.length == 0" class="empty-state">
        <i class="fas fa-file-contract"></i>
        <p>Không tìm thấy hợp đồng phù hợp</p>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination-section">
      <span class="pagination-info">
        Hiển thị {{ startItem }} đến {{ endItem }} trong tổng số
        {{ totalItems }} hợp đồng
      </span>
      <div class="pagination-controls">
        <button
          class="page-btn"
          :disabled="currentPage == 1"
          @click="previousPage"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <span class="page-info">Trang {{ currentPage }}/{{ totalPages }}</span>
        <button
          class="page-btn"
          :disabled="currentPage == totalPages"
          @click="nextPage"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Contract Modal -->
    <div v-if="selectedContract" class="modal-overlay" @click="closeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2>Chi tiết hợp đồng</h2>
          <button class="close-btn" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-content">
          <!-- Thông tin chủ trọ -->
          <div class="info-section">
            <h3>Bên cho thuê</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Chủ trọ:</label>
                <span>{{ selectedContract.landlordName }}</span>
              </div>
              <div class="info-item">
                <label>Địa chỉ:</label>
                <span>{{ selectedContract.landlordAddress }}</span>
              </div>
              <div class="info-item">
                <label>Số điện thoại:</label>
                <span>{{ selectedContract.landlordPhone }}</span>
              </div>
            </div>
          </div>

          <!-- Thông tin người thuê -->
          <div class="info-section">
            <h3>Bên thuê</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Họ tên:</label>
                <span>{{ selectedContract.tenantName }}</span>
              </div>
              <div class="info-item">
                <label>CMND/CCCD:</label>
                <span>{{ selectedContract.tenantIdentityCard }}</span>
              </div>
              <div class="info-item">
                <label>Địa chỉ:</label>
                <span>{{ selectedContract.tenantAddress }}</span>
              </div>
              <div class="info-item">
                <label>Số điện thoại:</label>
                <span>{{ selectedContract.tenantPhone }}</span>
              </div>
            </div>
          </div>

          <!-- Thông tin phòng và hợp đồng -->
          <div class="info-section">
            <h3>Thông tin hợp đồng</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Mã hợp đồng:</label>
                <span>{{ selectedContract.id }}</span>
              </div>
              <div class="info-item">
                <label>Nhà:</label>
                <span>{{ selectedContract.houseName }}</span>
              </div>
              <div class="info-item">
                <label>Phòng:</label>
                <span>{{ selectedContract.roomNumber }}</span>
              </div>
              <div class="info-item">
                <label>Ngày bắt đầu:</label>
                <span>{{ selectedContract.startDate }}</span>
              </div>
              <div class="info-item">
                <label>Ngày kết thúc:</label>
                <span>{{ selectedContract.endDate }}</span>
              </div>
              <div class="info-item">
                <label>Tiền thuê:</label>
                <span>{{ selectedContract.rentalCost }}</span>
              </div>
              <div class="info-item">
                <label>Tiền đặt cọc:</label>
                <span>{{ selectedContract.deposit }}</span>
              </div>
            </div>
          </div>

          <!-- Điều khoản hợp đồng -->
          <div class="info-section">
            <h3>Điều khoản hợp đồng</h3>
            <div class="terms-content">
              {{ selectedContract.terms }}
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Đóng</button>
          <button class="btn btn-primary" @click="printContract">
            <i class="fas fa-print"></i> In hợp đồng
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import crudApi from '@/apis/crudApi';
import Swal from 'sweetalert2';

//const API_URL = 'https://6725a513c39fedae05b5670b.mockapi.io/api/v1';

export default {
  name: 'ContractIndex',

  data() {
    return {
      isLoading: false,
      selectedHouse: 'all',
      selectedRoom: 'all',
      selectedStatus: 'all',
      searchQuery: '',
      itemsPerPage: 10,
      currentPage: 1,
      houses: [],
      rooms: [],
      contracts: [],
      selectedContract: null,
      userId: null,
      warningDays: 30,
    };
  },

  computed: {
    filteredRooms() {
      if (this.selectedHouse == 'all') return [];
      return this.rooms.filter((room) => room.houseId == this.selectedHouse);
    },

    filteredContracts() {
      let filtered = [...this.contracts];

      // Filter by house
      if (this.selectedHouse !== 'all') {
        filtered = filtered.filter(
          (contract) => contract.houseId == this.selectedHouse
        );
      }

      // Filter by room
      if (this.selectedRoom !== 'all') {
        filtered = filtered.filter(
          (contract) =>
            contract.roomNumber == this.selectedRoom &&
            contract.houseId == this.selectedHouse
        );
      }

      // Filter by status
      if (this.selectedStatus !== 'all') {
        const today = new Date();
        const warningDate = new Date();
        warningDate.setDate(today.getDate() + this.warningDays);

        filtered = filtered.filter((contract) => {
          const endDate = new Date(contract.endDate);
          switch (this.selectedStatus) {
            case 'active':
              return endDate > today;
            case 'expired':
              return endDate <= today;
            case 'terminating':
              return endDate <= warningDate && endDate > today;
            default:
              return true;
          }
        });
      }

      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(
          (contract) =>
            contract.id.toLowerCase().includes(query) ||
            contract.tenantName.toLowerCase().includes(query) ||
            contract.houseName.toLowerCase().includes(query)
        );
      }

      return filtered.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    },

    paginatedContracts() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredContracts.slice(start, start + this.itemsPerPage);
    },

    totalItems() {
      return this.filteredContracts.length;
    },

    totalPages() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },

    startItem() {
      return this.totalItems == 0
        ? 0
        : (this.currentPage - 1) * this.itemsPerPage + 1;
    },

    endItem() {
      return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    },
  },

  async created() {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser?.id) {
        throw new Error('User not found');
      }
      this.userId = currentUser.id;
      await this.loadInitialData();
    } catch (error) {
      console.error('Error in created:', error);
      Swal.fire(
        'Lỗi',
        'Không thể tải dữ liệu. Vui lòng đăng nhập lại.',
        'error'
      );
      this.$router.push('/login');
    }
  },

  methods: {
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('vi-VN');
    },

    formatCurrency(value) {
      if (!value) return '0 VND';
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(value);
    },

    getStatusClass(contract) {
      const today = new Date();
      const endDate = new Date(contract.endDate);
      const warningDate = new Date();
      warningDate.setDate(today.getDate() + this.warningDays);

      if (endDate <= today) {
        return 'badge bg-danger';
      } else if (endDate <= warningDate) {
        return 'badge bg-warning text-dark';
      }
      return 'badge bg-success';
    },

    getStatusText(contract) {
      const today = new Date();
      const endDate = new Date(contract.endDate);
      const warningDate = new Date();
      warningDate.setDate(today.getDate() + this.warningDays);

      if (endDate <= today) {
        return 'Đã hết hạn';
      } else if (endDate <= warningDate) {
        return 'Sắp hết hạn';
      }
      return 'Đang hiệu lực';
    },

    async loadInitialData() {
      try {
        this.isLoading = true;
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        // Load houses của landlord hiện tại
        await this.loadHouses();

        // Load contracts nếu có houses
        if (this.houses.length > 0) {
          await this.loadContracts();
        } else {
          this.contracts = [];
          console.log('No houses found for landlord:', currentUser.id);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không thể tải dữ liệu. Vui lòng thử lại sau.',
          confirmButtonText: 'OK',
        });
      } finally {
        this.isLoading = false;
      }
    },

    async loadHouses() {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser?.id) {
          throw new Error('User not found');
        }

        const response = await crudApi.read('api::home.home', {
          landlordId: currentUser.id,
        });

        if (!response.isSuccess) {
          throw new Error('Failed to load houses');
        }

        // Lấy danh sách nhà của landlord hiện tại
        this.houses = response.data.map((f) => ({
          ...f,
          landlordId: f.landlordId.id,
          landlord: f.landlordId,
        }));
      } catch (error) {
        console.error('Error loading houses:', error);
        throw error;
      }
    },

    async loadRooms(houseId) {
      try {
        const response = await crudApi.read('api::room.room', {
          houseId: houseId,
        });

        if (!response.isSuccess) throw new Error('Failed to load rooms');

        this.rooms = response.data.map((f) => ({
          ...f,
          houseId: f.houseId.id,
          house: f.houseId,
        }));
      } catch (error) {
        console.error('Error loading rooms:', error);
        throw error;
      }
    },

    async loadContracts() {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        // Lấy danh sách nhà của landlord hiện tại
        const houseIds = this.houses.map((house) => house.id);

        // Lấy tất cả contracts
        const response = await crudApi.read('api::contract.contract', null);
        if (!response.isSuccess) {
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

        // Lọc contracts theo houses của landlord hiện tại
        const filteredContracts = allContracts.filter(
          (contract) =>
            houseIds.includes(contract.houseId) &&
            contract.userId == currentUser.id
        );

        // Map thông tin house name cho mỗi contract
        this.contracts = await Promise.all(
          filteredContracts.map(async (contract) => {
            const house = this.houses.find((h) => h.id == contract.houseId);

            const response = await crudApi.read('api::home.home', {
              houseId: contract.houseId,
              roomNumber: contract.roomNumber,
            });

            // Lấy thông tin phòng
            const room = response.isSuccess ? response.data[0] : null;

            return {
              ...contract,
              houseName: house ? house.name : 'N/A',
              roomId: room ? room.id : null,
              price: room ? room.price : 0,
            };
          })
        );
      } catch (error) {
        console.error('Error loading contracts:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không thể tải danh sách hợp đồng',
          confirmButtonText: 'OK',
        });
        throw error;
      }
    },
    addContract() {
      this.$router.push('/landlord/contract-create');
    },

    editContract(contractId) {
      this.$router.push(`/landlord/contract-create/${contractId}?mode=edit`);
    },

    async deleteContract(contract) {
      try {
        const result = await Swal.fire({
          title: 'Xác nhận xóa',
          text: `Bạn có chắc chắn muốn xóa hợp đồng này?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Xóa',
          cancelButtonText: 'Hủy',
          confirmButtonColor: '#dc3545',
          cancelButtonColor: '#6c757d',
        });

        if (result.isConfirmed) {
          this.isLoading = true;

          const roomResponse = await crudApi.read('api::room.room', {
            houseId: contract.houseId,
            roomNumber: contract.roomNumber,
          });

          // Tìm room trước khi xóa contract

          if (!roomResponse.isSuccess) throw new Error('Failed to find room');
          //const rooms = await roomResponse.json();
          const room = roomResponse.data[0];

          if (!room) throw new Error('Room not found');

          // Xóa contract
          const contractResponse = await crudApi.delete(
            'api::contract.contract',
            { id: contract.id }
          );

          if (!contractResponse.isSuccess)
            throw new Error('Failed to delete contract');

          // Cập nhật trạng thái phòng
          const updateRoomResponse = await crudApi.update(
            'api::room.room',
            { id: room.id },
            {
              ...room,
              isRented: false,
              currentContract: null,
              currentTenant: null,
              customer: null,
            }
          );

          if (!updateRoomResponse.isSuccess)
            throw new Error('Failed to update room status');

          // Xóa customer tương ứng

          const customerResponse = await crudApi.read(
            'api::customer.customer',
            {
              contractNumber: contract.id,
            }
          );
          if (customerResponse.isSuccess) {
            const customers = customerResponse.data;
            if (customers.length > 0) {
              const deleteCustomerResponse = await crudApi.delete(
                'api::customer.customer',
                {
                  id: customers[0].id,
                }
              );
              if (!deleteCustomerResponse.isSuccess) {
                console.error('Failed to delete customer');
              }
            }
          }

          await this.loadContracts();
          Swal.fire('Thành công', 'Đã xóa hợp đồng', 'success');
        }
      } catch (error) {
        console.error('Error deleting contract:', error);
        Swal.fire('Lỗi', `Không thể xóa hợp đồng: ${error.message}`, 'error');
      } finally {
        this.isLoading = false;
      }
    },

    async viewContract(contract) {
      try {
        const house = this.houses.find((h) => h.id == contract.houseId);

        const roomResponse = await crudApi.read('api::contract.contract', {
          houseId: contract.houseId,
          roomNumber: contract.roomNumber,
        });
        if (!roomResponse.isSuccess)
          throw new Error('Failed to load room details');
        const rooms = roomResponse.data.map(i => ({ ...i, status: i.customStatus }));
        const room = rooms[0];

        this.selectedContract = {
          ...contract,
          houseName: house ? house.name : 'N/A',
          roomId: room ? room.id : null,
          startDate: this.formatDate(contract.startDate),
          endDate: this.formatDate(contract.endDate),
          rentalCost: this.formatCurrency(contract.rentalCost),
          deposit: this.formatCurrency(contract.deposit),
        };
        document.body.classList.add('modal-open');
      } catch (error) {
        console.error('Error viewing contract:', error);
        Swal.fire('Lỗi', 'Không thể tải thông tin hợp đồng', 'error');
      }
    },

    closeModal() {
      this.selectedContract = null;
      document.body.classList.remove('modal-open');
    },

    printContract() {
      if (!this.selectedContract) {
        Swal.fire('Cảnh báo', 'Vui lòng chọn hợp đồng trước khi in', 'warning');
        return;
      }

      const printWindow = window.open('', '', 'width=800,height=600');
      printWindow.document.write(`
        <html>
          <head>
            <title>Hợp đồng thuê phòng</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 40px;
                line-height: 1.6;
              }
              h1 {
                text-align: center;
                margin-bottom: 30px;
              }
              .section {
                margin-bottom: 30px;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 5px;
              }
              .section h2 {
                color: #333;
                margin-bottom: 15px;
                border-bottom: 2px solid #ddd;
                padding-bottom: 10px;
              }
              .info-row {
                margin: 10px 0;
                display: flex;
                flex-wrap: wrap;
              }
              .info-label {
                font-weight: bold;
                min-width: 150px;
              }
              .terms {
                white-space: pre-wrap;
                margin-top: 10px;
              }
              @media print {
                body { padding: 20px; }
                .section { break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <h1>HỢP ĐỒNG THUÊ PHÒNG</h1>

            <div class="section">
              <h2>BÊN CHO THUÊ</h2>
              <div class="info-row">
                <span class="info-label">Chủ trọ:</span> ${this.selectedContract.landlordName}
              </div>
              <div class="info-row">
                <span class="info-label">Địa chỉ:</span> ${this.selectedContract.landlordAddress}
              </div>
              <div class="info-row">
                <span class="info-label">Số điện thoại:</span> ${this.selectedContract.landlordPhone}
              </div>
            </div>

            <div class="section">
              <h2>BÊN THUÊ</h2>
              <div class="info-row">
                <span class="info-label">Họ tên:</span> ${this.selectedContract.tenantName}
              </div>
              <div class="info-row">
                <span class="info-label">CMND/CCCD:</span> ${this.selectedContract.tenantIdentityCard}
              </div>
              <div class="info-row">
                <span class="info-label">Địa chỉ:</span> ${this.selectedContract.tenantAddress}
              </div>
              <div class="info-row">
                <span class="info-label">Số điện thoại:</span> ${this.selectedContract.tenantPhone}
              </div>
            </div>

            <div class="section">
              <h2>THÔNG TIN HỢP ĐỒNG</h2>
              <div class="info-row">
                <span class="info-label">Nhà:</span> ${this.selectedContract.houseName}
              </div>
              <div class="info-row">
                <span class="info-label">Phòng:</span> ${this.selectedContract.roomNumber}
              </div>
              <div class="info-row">
                <span class="info-label">Ngày bắt đầu:</span> ${this.selectedContract.startDate}
              </div>
              <div class="info-row">
                <span class="info-label">Ngày kết thúc:</span> ${this.selectedContract.endDate}
              </div>
              <div class="info-row">
                <span class="info-label">Tiền thuê:</span> ${this.selectedContract.rentalCost}
              </div>
              <div class="info-row">
                <span class="info-label">Tiền đặt cọc:</span> ${this.selectedContract.deposit}
              </div>
            </div>

            <div class="section">
              <h2>ĐIỀU KHOẢN HỢP ĐỒNG</h2>
              <div class="terms">${this.selectedContract.terms}</div>
            </div>

            <div class="section">
              <h2>CHỮ KÝ CÁC BÊN</h2>
              <div style="display: flex; justify-content: space-between; margin-top: 50px;">
                <div style="text-align: center;">
                  <p><strong>BÊN CHO THUÊ</strong></p>
                  <p style="margin-top: 80px;">${this.selectedContract.landlordName}</p>
                </div>
                <div style="text-align: center;">
                  <p><strong>BÊN THUÊ</strong></p>
                  <p style="margin-top: 80px;">${this.selectedContract.tenantName}</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    },

    previousPage() {
      if (this.currentPage > 1) this.currentPage--;
    },

    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
  },

  watch: {
    selectedHouse: {
      async handler(newValue) {
        if (newValue !== 'all') {
          await this.loadRooms(newValue);
        }
        this.selectedRoom = 'all';
        this.currentPage = 1;
      },
    },

    searchQuery() {
      this.currentPage = 1;
    },

    selectedStatus() {
      this.currentPage = 1;
    },
  },
};
</script>

<style scoped>
.contract-list {
  max-width: 1400px;
  margin: 3rem auto;
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Header Styles */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-title i {
  font-size: 1.75rem;
  color: #3b82f6;
}

.header-title h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

/* Action Buttons */
.header-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn {
  background: #22c55e;
  color: white;
}

.print-btn {
  background: #3b82f6;
  color: white;
}

.page-btn {
  border: none;
  color: #64748b;
}

/* Filter Section */
.filter-section {
  margin-bottom: 1.5rem;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
}

.filter-group select,
.filter-group input {
  padding: 0.625rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

/* Table Styles */
.table-container {
  overflow-x: auto;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f8fafc;
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 500;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.data-table tr:hover {
  background: #f8fafc;
}

/* Status Badges */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-expired {
  background: #fee2e2;
  color: #991b1b;
}

.status-warning {
  background: #fef3c7;
  color: #92400e;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Pagination */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
}

.modal-content {
  padding: 1.5rem;
}

.info-section {
  margin-bottom: 2rem;
}

.info-section h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
}

.info-item span {
  font-size: 0.875rem;
  color: #1e293b;
}

.terms-content {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  line-height: 1.6;
  white-space: pre-wrap;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary {
  background: #e2e8f0;
  color: #475569;
  border: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
}

/* Responsive Design */
@media (max-width: 640px) {
  .modal-container {
    width: 95%;
    margin: 1rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .contract-list {
    margin: 1rem;
    padding: 1rem;
  }

  .header-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .pagination-section {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }
}
</style>
