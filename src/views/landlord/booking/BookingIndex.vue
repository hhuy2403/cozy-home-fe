<template>
  <div class="container mt-4">
    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <!-- Header Section -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Cọc giữ phòng</h2>
      <div>
        <button class="btn btn-success me-2" @click="addBooking">
          <i class="fas fa-plus"></i> Thêm mới
        </button>
        <button class="btn btn-primary" @click="exportToExcel">
          <i class="fas fa-file-excel"></i> Xuất Excel
        </button>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="row mb-3">
      <div class="col-md-3 mb-2">
        <label for="fromDate">Từ ngày</label>
        <input type="date" id="fromDate" class="form-control" v-model="fromDate">
      </div>
      <div class="col-md-3 mb-2">
        <label for="toDate">Đến ngày</label>
        <input type="date" id="toDate" class="form-control" v-model="toDate">
      </div>
      <div class="col-md-3 mb-2">
        <label for="house-select">Nhà</label>
        <select id="house-select" class="form-control" v-model="selectedHouse">
          <option value="all">Tất cả</option>
          <option v-for="house in houses" :key="house.id" :value="house.name">
            {{ house.name }}
          </option>
        </select>
      </div>
      <div class="col-md-3 mb-2">
        <label for="room-select">Phòng</label>
        <select id="room-select" class="form-control" v-model="selectedRoom">
          <option value="all">Tất cả</option>
          <option v-for="room in filteredRooms" :key="room.id" :value="room.roomNumber">
            {{ room.roomNumber }}
          </option>
        </select>
      </div>
    </div>

    <!-- Booking Table -->
    <div class="table-responsive">
      <table class="table table-bordered table-hover">
        <thead class="table-light">
          <tr>
            <th>STT</th>
            <th>Ngày đặt</th>
            <th>Nhà</th>
            <th>Phòng</th>
            <th>Họ tên</th>
            <th>SĐT</th>
            <th>Tiền cọc</th>
            <th>Ngày dự kiến đến</th>
            <th>Trạng thái</th>
            <th>Ghi chú</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td colspan="10" class="text-center">Đang tải dữ liệu...</td>
          </tr>
          <tr v-else-if="paginatedBookings.length == 0">
            <td colspan="10" class="text-center">Không tìm thấy dữ liệu phù hợp</td>
          </tr>
          <tr v-else v-for="(booking, index) in paginatedBookings" :key="booking.id">
            <td>{{ startItem + index }}</td>
            <td>{{ formatDate(booking.bookingDate) }}</td>
            <td>{{ booking.houseName }}</td>
            <td>{{ booking.roomNumber }}</td>
            <td>{{ booking.customerName }}</td>
            <td>{{ booking.phone }}</td>
            <td>{{ formatCurrency(booking.deposit) }}</td>
            <td>{{ formatDate(booking.expectedArrival) }}</td>
            <td>
              <span :class="getStatusBadgeClass(booking.status)">
                {{ getStatusText(booking.status) }}
              </span>
            </td>
            <td>{{ booking.notes }}</td>
            <td>
              <button class="btn btn-danger btn-sm" @click="confirmDelete(booking)"
                :disabled="booking.status == 'confirmed'">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="!isLoading && totalItems > 0" class="d-flex justify-content-between align-items-center mt-3">
      <div>
        Hiển thị {{ startItem }} đến {{ endItem }} trong tổng số {{ totalItems }} mục
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary" :disabled="currentPage == 1" @click="currentPage--">
          <i class="fas fa-chevron-left"></i>
        </button>
        <span class="btn btn-outline-secondary">
          Trang {{ currentPage }}/{{ totalPages }}
        </span>
        <button class="btn btn-outline-primary" :disabled="currentPage == totalPages" @click="currentPage++">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import crudApi from '@/apis/crudApi';

export default {
  data() {
    return {
      fromDate: '',
      toDate: '',
      selectedHouse: 'all',
      selectedRoom: 'all',
      itemsPerPage: 10,
      currentPage: 1,
      houses: [],
      rooms: [],
      bookings: [],
      isLoading: false
    };
  },
  computed: {
    filteredRooms() {
      if (!this.rooms) return [];
      return this.selectedHouse == 'all'
        ? this.rooms
        : this.rooms.filter(room => room.houseId == this.houses.find(h => h.name == this.selectedHouse)?.id);
    },
    filteredBookings() {
      if (!this.bookings) return [];
      let filtered = [...this.bookings];

      if (this.selectedHouse !== 'all') {
        filtered = filtered.filter(booking => booking.houseName == this.selectedHouse);
      }
      if (this.selectedRoom !== 'all') {
        filtered = filtered.filter(booking => booking.roomNumber == this.selectedRoom);
      }
      if (this.fromDate && this.toDate) {
        filtered = filtered.filter(booking =>
          new Date(booking.bookingDate) >= new Date(this.fromDate) &&
          new Date(booking.bookingDate) <= new Date(this.toDate)
        );
      }
      return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    paginatedBookings() {
      if (!this.filteredBookings) return [];
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredBookings.slice(start, start + this.itemsPerPage);
    },
    totalItems() {
      return this.filteredBookings?.length || 0;
    },
    totalPages() {
      return Math.ceil(this.totalItems / this.itemsPerPage) || 1;
    },
    startItem() {
      return this.totalItems == 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    endItem() {
      return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    }
  },
  methods: {
    async confirmDelete(booking) {
      try {
        const result = await Swal.fire({
          title: 'Xác nhận xóa?',
          text: `Bạn có chắc muốn xóa đặt cọc của ${booking.customerName} cho phòng ${booking.roomNumber}?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Xóa',
          cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
          await this.deleteBooking(booking);
        }
      } catch (error) {
        console.error('Error in confirmDelete:', error);
        Swal.fire('Lỗi', 'Không thể xóa đặt cọc. Vui lòng thử lại!', 'error');
      }
    },

    async deleteBooking(booking) {
      try {
        this.isLoading = true;

        // 1. Lấy thông tin phòng hiện tại
        const roomResponse = await crudApi.read("api::room.room", {id: booking.roomId.id});
        const roomData = roomResponse.data[0];

        // 2. Xóa booking
        const bookingResponse = await crudApi.delete("api::landlord-booking.landlord-booking", {id: booking.id});

        if (bookingResponse.error) {
          throw new Error('Không thể xóa đặt cọc');
        }

        // 3. Cập nhật trạng thái phòng
        const updatedRoomData = {
          ...roomData,
          hasBooking: false,
          currentBooking: null,
          landlordBokingId: null
        };

        const updateRoomResponse = await crudApi.update("api::room.room", {id: roomData.id}, updatedRoomData);

        if (updateRoomResponse.error) {
          throw new Error('Không thể cập nhật trạng thái phòng');
        }

        // 4. Refresh data
        await this.fetchData();

        Swal.fire(
          'Đã xóa!',
          'Đặt cọc đã được xóa thành công.',
          'success'
        );

      } catch (error) {
        console.error('Error deleting booking:', error);
        Swal.fire('Lỗi', error.message || 'Không thể xóa đặt cọc. Vui lòng thử lại!', 'error');
      } finally {
        this.isLoading = false;
      }
    },

    async fetchData() {
      try {
        this.isLoading = true;

        // 1. Lấy thông tin chủ trọ từ localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser?.id || currentUser.role !== 'landlord') {
          throw new Error('Không tìm thấy thông tin chủ trọ!');
        }

        // 2. Fetch houses của chủ trọ
        const housesResponse = await crudApi.read("api::home.home", {landlordId: {id: currentUser.id}});
        if (housesResponse.error) {
          throw new Error('Không thể tải danh sách nhà');
        }
        const housesData = housesResponse.data;
        this.houses = housesData.map(home => ({
          id: home.id,
          name: home.name,
          landlordId: home.landlordId
        }));

        // 3. Lấy danh sách ID nhà của chủ trọ
        const landlordHouseIds = this.houses.map(house => house.id);

        // 4. Fetch rooms thuộc các nhà của chủ trọ
        const roomsResponse = await crudApi.read("api::room.room", {
            houseId: {
              $in: landlordHouseIds
            }
          });
        
        if (roomsResponse.error) {
          throw new Error('Không thể tải danh sách phòng');
        }
        const roomsData = roomsResponse.data;
        const listRoomId = roomsData.map(room => room.id);

        // Lọc phòng theo houses của landlord
        this.rooms = roomsData
          .map(room => ({
            id: room.id,
            roomNumber: room.roomNumber,
            houseId: room.houseId
          }));

        // 5. Fetch bookings
        const bookingsResponse = await crudApi.read("api::landlord-booking.landlord-booking", {roomId: {id: {$in: listRoomId}}});
        if (bookingsResponse.error) {
          throw new Error('Không thể tải danh sách đặt cọc');
        }
        const bookingsData = bookingsResponse.data.map(i => ({ ...i, status: i.customStatus }));

        // 6. Lọc bookings theo nhà của chủ trọ
        this.bookings = bookingsData;

      } catch (error) {
        console.error('Error fetching data:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: error.message || 'Không thể tải dữ liệu. Vui lòng thử lại!',
          confirmButtonText: 'Đóng'
        });
        this.bookings = [];
        this.houses = [];
        this.rooms = [];
      } finally {
        this.isLoading = false;
      }
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('vi-VN');
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(value);
    },

    getStatusBadgeClass(status) {
      switch (status) {
        case 'pending': return 'badge bg-warning text-dark';
        case 'confirmed': return 'badge bg-success';
        case 'cancelled': return 'badge bg-danger';
        default: return 'badge bg-secondary';
      }
    },

    getStatusText(status) {
      switch (status) {
        case 'pending': return 'Đang chờ';
        case 'confirmed': return 'Đã xác nhận';
        case 'cancelled': return 'Đã hủy';
        default: return status;
      }
    },

    addBooking() {
      this.$router.push('/landlord/booking-create');
    },

    async exportToExcel() {
      if (this.filteredBookings.length == 0) {
        Swal.fire('Thông báo', 'Không có dữ liệu để xuất.', 'info');
        return;
      }

      const exportData = this.filteredBookings.map((booking, index) => ({
        'STT': index + 1,
        'Ngày đặt': this.formatDate(booking.bookingDate),
        'Nhà': booking.houseName,
        'Phòng': booking.roomNumber,
        'Họ tên': booking.customerName,
        'Số điện thoại': booking.phone,
        'Tiền cọc': booking.deposit,
        'Ngày dự kiến đến': this.formatDate(booking.expectedArrival),
        'Trạng thái': this.getStatusText(booking.status),
        'Ghi chú': booking.notes
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');

      // Tạo tên file với timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `Danh_sach_coc_giu_phong_${timestamp}.xlsx`);

      Swal.fire('Thành công!', 'Xuất file Excel thành công.', 'success');
    }
  },
  async mounted() {
    await this.fetchData();
  },
  watch: {
    // Reset về trang 1 khi thay đổi bộ lọc
    selectedHouse() { this.currentPage = 1; },
    selectedRoom() { this.currentPage = 1; },
    fromDate() { this.currentPage = 1; },
    toDate() { this.currentPage = 1; }
  }
};
</script>

<style scoped>
/* Container */
.container {
  margin-top: 3rem !important;
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

/* Header Section */
h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #0f172a;
  letter-spacing: -0.025em;
}

/* Action Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.btn-success {
  background: #10b981;
  border: none;
}

.btn-success:hover {
  background: #059669;
  transform: translateY(-1px);
}

.btn-primary {
  background: #3b82f6;
  border: none;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

/* Filter Section */
.form-control,
.form-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 0.375rem;
}

/* Table Styles */
.table-responsive {
  background: #ffffff;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table {
  margin-bottom: 0;
  font-size: 0.875rem;
}

.table th {
  background: #f8fafc;
  font-weight: 600;
  color: #475569;
  padding: 0.75rem 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.table td {
  padding: 0.75rem 1rem;
  vertical-align: middle;
  color: #334155;
}

/* Status Badges */
.badge {
  padding: 0.375rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 0.375rem;
}

.bg-warning {
  background: #fef3c7 !important;
  color: #92400e !important;
}

.bg-success {
  background: #dcfce7 !important;
  color: #166534 !important;
}

.bg-danger {
  background: #fee2e2 !important;
  color: #991b1b !important;
}

/* Pagination */
.btn-outline-primary {
  color: #3b82f6;
  border-color: #3b82f6;
  background: transparent;
}

.btn-outline-primary:hover:not(:disabled) {
  background: #3b82f6;
  color: white;
  transform: translateY(-1px);
}

.btn-outline-secondary {
  background: #f1f5f9;
  border: none;
  color: #64748b;
  font-weight: 500;
}

/* Loading Overlay */
.loading-overlay {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
}

.spinner-border {
  width: 2.5rem;
  height: 2.5rem;
  color: #3b82f6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .btn {
    padding: 0.5rem 0.75rem;
  }

  .table th,
  .table td {
    padding: 0.625rem 0.75rem;
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