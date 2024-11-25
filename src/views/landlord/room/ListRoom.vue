<template>
  <div class="list-room container-fluid p-4">
    <!-- Header Section -->
    <div class="header-section mb-4">
      <div class="row align-items-center g-3">
        <div class="col-md-4">
          <h2 class="page-title mb-0">
            <i class="fas fa-bed me-2"></i>Danh Sách Phòng
          </h2>
        </div>

        <div class="col-md-8">
          <div class="d-flex gap-3 flex-wrap justify-content-md-end">
            <!-- Search Box -->
            <div class="search-box">
              <i class="fas fa-search search-icon"></i>
              <input type="text" v-model="searchQuery" class="form-control search-input"
                placeholder="Tìm kiếm phòng..." />
            </div>

            <!-- Action Buttons -->
            <div class="btn-group">
              <button class="btn btn-light" @click="goBack" title="Quay về">
                <i class="fas fa-arrow-left"></i>
              </button>
              <button class="btn btn-primary" @click="saveChanges" :disabled="isSaving || !hasChanges"
                title="Lưu thay đổi">
                <i class="fas fa-save"></i>
                <span class="d-none d-md-inline ms-1">
                  {{ isSaving ? 'Đang lưu...' : 'Lưu' }}
                </span>
              </button>
              <button class="btn btn-success" @click="exportToExcel" title="Xuất Excel">
                <i class="fas fa-file-excel"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="stats-card">
          <div class="stats-icon bg-primary">
            <i class="fas fa-door-open"></i>
          </div>
          <div class="stats-info">
            <h3>{{ filteredRooms.length }}</h3>
            <p>Tổng số phòng</p>
          </div>
        </div>
      </div>
      <!--  các stats card khác  -->
    </div>

    <!-- Main Content -->
    <div class="content-card">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-grow text-primary" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
      </div>

      <!-- Error Messages -->
      <div v-if="errors.length" class="alert alert-danger fade show">
        <i class="fas fa-exclamation-triangle me-2"></i>
        <ul class="mb-0">
          <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>
      </div>

      <!-- No Results -->
      <div v-if="!isLoading && filteredRooms.length == 0" class="alert alert-info fade show">
        <i class="fas fa-info-circle me-2"></i>
        Không tìm thấy phòng nào{{ searchQuery ? ` phù hợp với "${searchQuery}"` : '' }}
      </div>

      <!-- Room Table -->
      <div class="table-responsive" v-if="!isLoading && filteredRooms.length > 0">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Tên phòng</th>
              <th>Khu vực</th>
              <th>Thứ tự</th>
              <th>Đơn giá (VNĐ)</th>
              <th>Ghi chú</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="room in sortedRooms" :key="room.id">
              <td>
                <div class="input-group input-group-sm">
                  <span class="input-group-text">
                    <i class="fas fa-door-closed"></i>
                  </span>
                  <input type="text" v-model="room.roomNumber" class="form-control" />
                </div>
              </td>
              <td>
                <span class="badge bg-info">{{ room.houseName }}</span>
              </td>
              <td>
                <input type="number" v-model="room.order" class="form-control form-control-sm" />
              </td>
              <td>
                <div class="input-group input-group-sm">
                  <span class="input-group-text">₫</span>
                  <input type="number" v-model="room.price" class="form-control" />
                </div>
              </td>
              <td>
                <input type="text" v-model="room.note" class="form-control form-control-sm" placeholder="Ghi chú..." />
              </td>
              <td>
                <button class="btn btn-danger btn-sm" @click="confirmDeleteRoom(room)" :disabled="isDeleting">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import crudApi from '@/apis/crudApi';

export default {
  name: "ListRoom",
  data() {
    return {
      rooms: [],
      searchQuery: "",
      errors: [],
      isLoading: true,
      isSaving: false,
      isDeleting: false,
      originalRooms: [] // To track changes
    };
  },

  computed: {
    filteredRooms() {
      if (!this.searchQuery.trim()) return this.rooms;

      const searchTerm = this.searchQuery.toLowerCase().trim();
      return this.rooms.filter(room => {
        return (
          room.roomNumber.toString().toLowerCase().includes(searchTerm) ||
          room.houseName.toLowerCase().includes(searchTerm) ||
          (room.note && room.note.toLowerCase().includes(searchTerm))
        );
      });
    },

    hasChanges() {
      return this.rooms.some(room => {
        const original = this.originalRooms.find(r => r.id == room.id);
        return !original ||
          room.roomNumber !== original.roomNumber ||
          room.order !== original.order ||
          room.price !== original.price ||
          room.note !== original.note;
      });
    },

    sortedRooms() {
      return [...this.filteredRooms].sort((a, b) => {
        // Sort by house name first
        if (a.houseName !== b.houseName) {
          return a.houseName.localeCompare(b.houseName);
        }
        // Then by order if available
        if (a.order && b.order) {
          return a.order - b.order;
        }
        // Finally by room number
        return a.roomNumber.localeCompare(b.roomNumber);
      });
    }
  },

  async mounted() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser?.id || currentUser.role !== 'landlord') {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Bạn không có quyền truy cập trang này!'
      }).then(() => {
        this.$router.push('/login');
      });
      return;
    }
    await this.fetchRooms();
  },

  methods: {
    formatCurrency(value) {
      if (!value) return '0';
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(value);
    },

    formatDate(date) {
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    },

    async fetchRooms() {
      try {
        this.isLoading = true;

        // Lấy thông tin user đang đăng nhập
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser?.id || currentUser.role !== 'landlord') {
          throw new Error('Invalid user or not a landlord');
        }

        Swal.fire({
          title: 'Đang tải dữ liệu...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        // 1. Fetch tất cả nhà
        const housesResponse = await crudApi.read('api::home.home', {
            landlordId: {
              id: {
                $eq: currentUser.id
              }
            }
        });

        const landlordHouses = housesResponse.data;

        // Lọc nhà theo landlordId
        // const landlordHouseIds = landlordHouses.map(house => house.id);

        // Tạo map để tra cứu nhanh thông tin nhà
        const housesMap = new Map(landlordHouses.map(house => [house.id, house]));

        let rooms = [];
        for(let house of landlordHouses){
          for(let room of house.roomId){
            rooms.push({...room, houseName: housesMap.get(room.houseId)?.name || 'Không xác định', houseId: room.houseId, originalData: { ...room, houseId: room.houseId }});
          }
        }
        this.rooms = rooms;

        // // 2. Fetch tất cả phòng
        // const roomsResponse = await fetch('https://6725a513c39fedae05b5670b.mockapi.io/api/v1/rooms');
        // const allRooms = await roomsResponse.json();

        // // Lọc và map rooms với thông tin nhà
        // this.rooms = allRooms
        //   .filter(room => landlordHouseIds.includes(room.houseId))
        //   .map(room => ({
        //     ...room,
        //     houseName: housesMap.get(room.houseId)?.name || 'Không xác định',
        //     originalData: { ...room }
        //   }));

        this.originalRooms = JSON.parse(JSON.stringify(this.rooms));
        Swal.close();

      } catch (error) {
        console.error('Error fetching rooms:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: error.message == 'Invalid user or not a landlord'
            ? 'Bạn không có quyền truy cập!'
            : 'Không thể tải dữ liệu phòng.'
        });
        if (error.message == 'Invalid user or not a landlord') {
          this.$router.push('/login');
        }
      } finally {
        this.isLoading = false;
      }
    },

    goBack() {
      if (this.hasChanges) {
        Swal.fire({
          title: 'Bạn có thay đổi chưa được lưu!',
          text: "Bạn có muốn lưu thay đổi trước khi quay lại?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Lưu',
          cancelButtonText: 'Không lưu'
        }).then((result) => {
          if (result.isConfirmed) {
            this.saveChanges().then(() => {
              this.$router.push("/landlord/room-index");
            });
          } else {
            this.$router.push("/landlord/room-index");
          }
        });
      } else {
        this.$router.push("/landlord/room-index");
      }
    },

    validate() {
      this.errors = [];
      const roomsByHouse = {};

      // Group rooms by house
      this.rooms.forEach(room => {
        if (!roomsByHouse[room.houseName]) {
          roomsByHouse[room.houseName] = new Set();
        }
      });

      for (const room of this.rooms) {
        const roomNumber = room.roomNumber.toString().trim();

        // Validate room number
        if (!roomNumber) {
          this.errors.push(`Phòng ${room.id}: Tên phòng không được để trống`);
          continue;
        }

        // Check for duplicate room numbers within the same house
        if (roomsByHouse[room.houseName].has(roomNumber)) {
          this.errors.push(
            `Phòng "${roomNumber}" đã tồn tại trong khu vực ${room.houseName}`
          );
        } else {
          roomsByHouse[room.houseName].add(roomNumber);
        }

        // Validate price
        if (!room.price || isNaN(room.price) || room.price <= 0) {
          this.errors.push(
            `Phòng ${roomNumber}: Giá phòng phải là số dương`
          );
        }

        // Validate order if present
        if (room.order !== null && room.order !== undefined) {
          if (isNaN(room.order) || room.order < 0) {
            this.errors.push(
              `Phòng ${roomNumber}: Thứ tự phải là số không âm`
            );
          }
        }
      }

      return this.errors.length == 0;
    },

    async saveChanges() {
      if (!this.validate()) {
        Swal.fire('Lỗi!', 'Vui lòng kiểm tra lại thông tin nhập.', 'error');
        return;
      }

      try {
        this.isSaving = true;
        Swal.fire({
          title: 'Đang lưu thay đổi...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        // Lọc ra các phòng có thay đổi
        const changedRooms = this.rooms.filter(room => {
          const original = this.originalRooms.find(r => r.id == room.id);
          return !original || JSON.stringify(room) !== JSON.stringify(original);
        });

        if (changedRooms.length == 0) {
          Swal.fire('Thông báo', 'Không có thay đổi để lưu', 'info');
          return;
        }

        // Lọc ra các phòng có thay đổi giá
        const roomsWithPriceChange = changedRooms.filter(room => {
          const original = this.originalRooms.find(r => r.id == room.id);
          return original && room.price !== original.price;
        });

        // Cập nhật thông tin phòng
        const updateRoomsPromises = changedRooms.map(room => {
          const updateData = {
            roomNumber: room.roomNumber,
            order: room.order,
            price: room.price,
            note: room.note,
            houseId: room.houseId
          };

          return crudApi.update("api::room.room", {id: room.id}, updateData);
        });

        await Promise.all(updateRoomsPromises);

        // Nếu có phòng thay đổi giá, kiểm tra và cập nhật rentalCost cho khách thuê
        if (roomsWithPriceChange.length > 0) {
          const confirmUpdate = await Swal.fire({
            title: 'Cập nhật giá thuê',
            text: 'Bạn có muốn cập nhật giá thuê cho các khách đang thuê không?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Có',
            cancelButtonText: 'Không'
          });

          if (confirmUpdate.isConfirmed) {
            // Cập nhật giá thuê cho khách
            const updateCustomersPromises = roomsWithPriceChange.map(async room => {
              try {
                // Fetch customers của phòng
                const customersResponse = await crudApi.read("api::customer.customer", {
                  rooms: { id: room.id }
                });
                const customers = customersResponse.data;

                // Nếu có khách thuê, cập nhật rentalCost
                if (customers && customers.length > 0) {
                  const customer = customers[0];
                  return crudApi.update("api::customer.customer", {id: customer.id}, {
                        ...customer,
                        rentalCost: room.price,
                        lastUpdated: new Date().toISOString()
                      });
                }
              } catch (error) {
                console.error(`Error updating customer for room ${room.id}:`, error);
              }
            });

            await Promise.all(updateCustomersPromises);
          }
        }

        // Cập nhật dữ liệu gốc
        this.originalRooms = JSON.parse(JSON.stringify(this.rooms));

        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Đã lưu tất cả thay đổi!',
          timer: 1500
        });

      } catch (error) {
        console.error('Error saving changes:', error);
        Swal.fire('Lỗi!', 'Không thể lưu thay đổi. Vui lòng thử lại!', 'error');
      } finally {
        this.isSaving = false;
      }
    },

    async confirmDeleteRoom(room) {
      const result = await Swal.fire({
        title: 'Bạn có chắc chắn muốn xóa phòng này không?',
        text: "Bạn sẽ không thể khôi phục lại dữ liệu!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
      });

      if (result.isConfirmed) {
        await this.deleteRoom(room);
      }
    },

    async deleteRoom(room) {
      try {
        this.isDeleting = true;
        await crudApi.delete("api::room.room", {id: room.id});

        this.rooms = this.rooms.filter(r => r.id !== room.id);
        this.originalRooms = this.originalRooms.filter(r => r.id !== room.id);

        Swal.fire('Đã xóa!', 'Phòng đã được xóa thành công.', 'success');
      } catch (error) {
        Swal.fire('Lỗi!', 'Không thể xóa phòng.', 'error');
      } finally {
        this.isDeleting = false;
      }
    },

    exportToExcel() {
      try {
        const exportData = this.sortedRooms.map(room => ({
          'Tên phòng': room.roomNumber,
          'Khu vực': room.houseName,
          'Thứ tự': room.order || '',
          'Đơn giá (VNĐ)': this.formatCurrency(room.price),
          'Trạng thái': room.isRented ? 'Đã thuê' : 'Trống',
          'Ghi chú': room.note || ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();

        // Set column widths
        const wscols = [
          { wch: 15 }, // Tên phòng
          { wch: 20 }, // Khu vực
          { wch: 10 }, // Thứ tự
          { wch: 15 }, // Đơn giá
          { wch: 15 }, // Trạng thái
          { wch: 30 }  // Ghi chú
        ];
        worksheet['!cols'] = wscols;

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách phòng');
        XLSX.writeFile(workbook, `Danh_sach_phong_${this.formatDate(new Date())}.xlsx`);
      } catch (error) {
        console.error('Error exporting to Excel:', error);
        Swal.fire('Lỗi!', 'Không thể xuất file Excel.', 'error');
      }
    }
  }
};
</script>

<style scoped>
.list-room {
  margin-top: 3rem !important;
  background: #f8f9fa;
}

.page-title {
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
}

.content-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

/* Search Box */
.search-box {
  position: relative;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 35%;
  transform: translateY(-50%);
  color: #6c757d;
}

.search-input {
  padding-left: 35px;
  border-radius: 20px;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.search-input:focus {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.15);
  border-color: #80bdff;
}

/* Stats Card */
.stats-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stats-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stats-info h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.stats-info p {
  margin: 0;
  color: #6c757d;
  font-size: 0.875rem;
}

/* Table Styling */
.table {
  margin-bottom: 0;
}

.table thead th {
  background: #f8f9fa;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  padding: 1rem;
  border-bottom: 2px solid #dee2e6;
}

.table tbody td {
  vertical-align: middle;
  padding: 0.75rem;
}

/* Button Group */
.btn-group .btn {
  padding: 0.5rem 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .search-box {
    width: 100%;
  }

  .btn-group {
    width: 100%;
    justify-content: space-between;
  }

  .stats-card {
    margin-bottom: 1rem;
  }
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Input Groups */
.input-group-sm>.form-control {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.badge {
  font-weight: 500;
  padding: 0.5em 0.75em;
}
</style>