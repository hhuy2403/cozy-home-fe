<template>
  <div class="container mt-4">
    <!-- Header Section -->
    <div class="header-section">
      <h2 class="page-title">
        <i class="fas fa-box-open me-2"></i>
        Danh sách tài sản
      </h2>
      <div class="action-buttons">
        <button class="btn btn-warning">
          <i class="fas fa-search"></i>
          <span>Xem</span>
        </button>
        <button class="btn btn-success" @click="addAsset">
          <i class="fas fa-plus"></i>
          <span>Thêm</span>
        </button>
        <button class="btn btn-danger" @click="deleteSelectedAssets">
          <i class="fas fa-trash"></i>
          <span>Xóa</span>
        </button>
        <button class="btn btn-primary" @click="exportToExcel">
          <i class="fas fa-file-excel"></i>
          <span>Excel</span>
        </button>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="row mb-3">
      <div class="col-md-3">
        <label for="house-select">Nhà</label>
        <select id="house-select" class="form-control" v-model="selectedHouse">
          <option value="all">Tất cả</option>
          <option v-for="house in houses" :key="house.id" :value="house.id">
            {{ house.name }}
          </option>
        </select>
      </div>
      <div class="col-md-3">
        <label for="room-select">Phòng</label>
        <select id="room-select" class="form-control" v-model="selectedRoom">
          <option value="all">Tất cả</option>
          <option
            v-for="room in filteredRooms"
            :key="room.roomNumber"
            :value="room.roomNumber"
          >
            {{ room.roomNumber }}
          </option>
        </select>
      </div>
      <div class="col-md-2">
        <label for="entries-select">Xem</label>
        <select id="entries-select" class="form-control" v-model="itemsPerPage">
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
    </div>

    <!-- Table Section with Horizontal Scroll -->
    <div class="table-responsive">
      <table class="table table-bordered table-hover">
        <thead class="thead-light">
          <tr>
            <th>
              <input type="checkbox" v-model="selectAll" @change="toggleAll" />
            </th>
            <th>Nhà</th>
            <th>Phòng</th>
            <th>Mã TS</th>
            <th>Tên TS</th>
            <th>Ngày sử dụng</th>
            <th>Số lượng</th>
            <th>Đơn giá (VND)</th>
            <th>Đã thanh lý</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="asset in paginatedAssets" :key="asset.id">
            <td>
              <input type="checkbox" v-model="selectedAssets" :value="asset" />
            </td>
            <td>{{ asset.houseId.name }}</td>
            <td>{{ asset.roomNumber }}</td>
            <td>{{ asset.assetCode }}</td>
            <td>{{ asset.assetName }}</td>
            <td>{{ asset.usageDate }}</td>
            <td>{{ asset.quantity }}</td>
            <td>{{ asset.price }}</td>
            <td>{{ asset.isDisposed ? 'Có' : 'Không' }}</td>
            <td>
              <button
                class="btn btn-sm btn-primary me-2"
                @click="editAsset(asset)"
              >
                <i class="fas fa-edit"></i> Sửa
              </button>
            </td>
          </tr>
          <tr v-if="paginatedAssets.length == 0">
            <td colspan="9" class="text-center">
              <template v-if="isLoading">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </template>
              <template v-else> Không tìm thấy dòng nào phù hợp </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination-section">
      <div class="pagination-info">
        Đang xem {{ startItem }} đến {{ endItem }} trong tổng số
        {{ totalItems }} mục
      </div>
      <div class="pagination-buttons">
        <button class="btn" :disabled="currentPage == 1" @click="previousPage">
          <i class="fas fa-chevron-left me-1"></i> Trước
        </button>
        <button
          class="btn"
          :disabled="currentPage == totalPages"
          @click="nextPage"
        >
          Tiếp <i class="fas fa-chevron-right ms-1"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import crudApi from '@/apis/crudApi';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

//const API_URL = 'https://6725a513c39fedae05b5670b.mockapi.io/api/v1';

export default {
  data() {
    return {
      selectedHouse: 'all',
      selectedRoom: 'all',
      itemsPerPage: 20,
      currentPage: 1,
      selectAll: false,
      selectedAssets: [],
      houses: [],
      rooms: [],
      assets: [],
      isLoading: false,
    };
  },
  computed: {
    filteredRooms() {
      return this.selectedHouse == 'all'
        ? this.rooms
        : this.rooms.filter((room) => room.houseId.id == this.selectedHouse);
    },
    filteredAssets() {
      let filtered = [...this.assets];

      if (this.selectedHouse !== 'all') {
        filtered = filtered.filter((asset) => {
          const house = this.houses.find((h) => h.id == asset.houseId.id);
          return house && house.id == this.selectedHouse;
        });
      }

      if (this.selectedRoom !== 'all') {
        filtered = filtered.filter(
          (asset) => asset.roomNumber == this.selectedRoom
        );
      }

      return filtered;
    },
    paginatedAssets() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredAssets.slice(start, start + this.itemsPerPage);
    },
    totalItems() {
      return this.filteredAssets.length;
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
  async mounted() {
    await this.loadInitialData();
  },
  methods: {
    editAsset(asset) {
      this.$router.push({
        path: `/landlord/asset-create/${asset.id}`,
        query: { mode: 'edit' },
      });
    },

    async loadInitialData() {
      try {
        this.isLoading = true;

        // Lấy thông tin currentUser
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser?.id) {
          throw new Error('Vui lòng đăng nhập để xem danh sách tài sản!');
        }

        // Load houses và assets song song
        await Promise.all([
          this.loadHouses(currentUser.id),
          this.loadAssets(currentUser.id),
        ]);

        // Load rooms sau khi có houses
        await this.loadRooms();
      } catch (error) {
        console.error('Error loading initial data:', error);
        Swal.fire('Lỗi', error.message || 'Không thể tải dữ liệu', 'error');
      } finally {
        this.isLoading = false;
      }
    },

    async loadHouses(landlordId) {
      try {
        const response = await crudApi.read('api::home.home', {landlordId: {id: landlordId}});
        if (!response.isSuccess) throw new Error('Failed to load houses');
        const allHouses = response.data;
        
        // Lọc nhà theo landlordId
        this.houses = allHouses;
      } catch (error) {
        console.error('Error loading houses:', error);
        this.houses = [];
        throw error;
      }
    },

    async loadRooms() {
      try {
        if (this.selectedHouse == 'all') {
          // Nếu chọn tất cả, load rooms của tất cả nhà thuộc landlord
          const houseIds = this.houses.map((house) => house.id);

          const response = await crudApi.read('api::room.room', {houseId: {id: houseIds}});
          if (!response.isSuccess) throw new Error('Failed to load rooms');
          const allRooms = response.data;

          this.rooms = allRooms;
        } else {
          // Load rooms của nhà được chọn
          const response = await crudApi.read('api::room.room', {
            houseId: this.selectedHouse,
          });
          if (!response.isSuccess) throw new Error('Failed to load rooms');

          this.rooms = response.data;
        }
      } catch (error) {
        console.error('Error loading rooms:', error);
        this.rooms = [];
        throw error;
      }
    },

    async loadAssets(landlordId) {
      try {
        const response = await crudApi.read(
          'api::landlord-asset.landlord-asset', {landlordId: {id: landlordId}}
        );
        if (!response.isSuccess) throw new Error('Failed to load assets');
        const allAssets = response.data;

        // Lọc assets theo landlordId và map với house information
        this.assets = allAssets
          .map((asset) => {
            const house = this.houses.find((h) => h.id == asset.houseId.id);
            return {
              ...asset,
              houseName: house ? house.name : 'Không xác định',
              status: asset.customStatus,
            };
          });
      } catch (error) {
        console.error('Error loading assets:', error);
        this.assets = [];
        throw error;
      }
    },

    addAsset() {
      this.$router.push('/landlord/asset-create');
    },

    previousPage() {
      if (this.currentPage > 1) this.currentPage--;
    },

    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },

    toggleAll() {
      this.selectedAssets = this.selectAll ? [...this.paginatedAssets] : [];
    },

    async deleteSelectedAssets() {
      if (this.selectedAssets.length == 0) {
        Swal.fire(
          'Thông báo',
          'Vui lòng chọn ít nhất một tài sản để xóa.',
          'warning'
        );
        return;
      }

      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser?.id) {
        Swal.fire(
          'Lỗi',
          'Vui lòng đăng nhập để thực hiện chức năng này!',
          'error'
        );
        return;
      }

      // Kiểm tra quyền xóa
      const unauthorizedAssets = this.selectedAssets.filter(
        (asset) => asset.landlordId.id !== currentUser.id
      );

      if (unauthorizedAssets.length > 0) {
        Swal.fire(
          'Lỗi',
          'Bạn không có quyền xóa một số tài sản đã chọn!',
          'error'
        );
        return;
      }

      const result = await Swal.fire({
        title: 'Xóa tài sản?',
        text: 'Bạn có chắc chắn muốn xóa các tài sản đã chọn?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
      });

      if (result.isConfirmed) {
        try {
          const response = await Promise.all(
            this.selectedAssets.map((asset) =>
              crudApi.delete('api::landlord-asset.landlord-asset', {
                id: asset.id,
              })
            )
          );

          if (response.some((f) => !f.isSuccess)) {
            throw new Error('Error to delete landlord-asset');
          }

          this.selectedAssets = [];
          this.selectAll = false;
          await this.loadAssets(currentUser.id);

          Swal.fire(
            'Đã xóa!',
            'Các tài sản đã được xóa thành công.',
            'success'
          );
        } catch (error) {
          console.error('Error deleting assets:', error);
          Swal.fire('Lỗi', 'Không thể xóa tài sản', 'error');
        }
      }
    },

    exportToExcel() {
      const exportData = this.assets.map((asset) => ({
        Nhà: asset.houseName,
        Phòng: asset.roomNumber,
        'Mã TS': asset.assetCode,
        'Tên TS': asset.assetName,
        'Ngày sử dụng': asset.usageDate,
        'Số lượng': asset.quantity,
        'Đơn giá': asset.price,
        'Đã thanh lý': asset.isDisposed ? 'Có' : 'Không',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Assets');
      XLSX.writeFile(workbook, 'Danh_sach_tai_san.xlsx');
    },
  },
  watch: {
    selectedHouse: {
      async handler() {
        this.selectedRoom = 'all';
        await this.loadRooms();
      },
    },
  },
};
</script>

<style scoped>
/* Container & Layout */
.container {
  margin-top: 3rem !important;
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}

/* Header Section */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

/* Action Buttons */
.action-buttons .btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-warning {
  background: #fbbf24;
  border: none;
  color: #92400e;
}

.btn-success {
  background: #34d399;
  border: none;
  color: #065f46;
}

.btn-danger {
  background: #f87171;
  border: none;
  color: #991b1b;
}

.btn-primary {
  background: #60a5fa;
  border: none;
  color: #1e40af;
}

.btn:hover {
  transform: translateY(-1px);
  filter: brightness(105%);
}

/* Filters Section */
.filters-section {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
}

.form-control,
.form-select {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-control:focus,
.form-select:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
}

/* Table Styles */
.table-responsive {
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  background: white;
}

.table {
  margin-bottom: 0;
  font-size: 0.875rem;
}

.table thead th {
  background: #f1f5f9;
  color: #475569;
  font-weight: 600;
  padding: 0.75rem;
  border-bottom: 2px solid #e2e8f0;
}

.table tbody td {
  padding: 0.75rem;
  vertical-align: middle;
  border-bottom: 1px solid #e2e8f0;
}

.table tbody tr:hover {
  background: #f8fafc;
}

/* Custom Checkbox */
.custom-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #cbd5e1;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.custom-checkbox:checked {
  background: #60a5fa;
  border-color: #60a5fa;
}

/* Pagination */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  font-size: 0.875rem;
  color: #64748b;
}

.pagination-buttons .btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.5rem;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.pagination-buttons .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading Spinner */
.spinner-border {
  width: 1.5rem;
  height: 1.5rem;
  border-width: 0.2em;
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .header-section {
    flex-direction: column;
    gap: 1rem;
  }

  .action-buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .btn span {
    display: none;
  }

  .filters-section .row {
    gap: 1rem;
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

.container {
  animation: fadeIn 0.3s ease-out;
}
</style>
