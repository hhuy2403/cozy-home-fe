<template>
  <div class="datapower-wrapper">
    <!-- Loading overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner-wrapper">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>

    <div class="datapower">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản lý điện</h2>
        <div class="d-flex gap-2">
          <input v-model="selectedMonth" type="month" class="form-control" :max="new Date().toISOString().slice(0, 7)"
            @change="fetchInitialData">
        </div>
      </div>

      <!-- Alerts -->
      <div v-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>
      <div v-if="warningMessage" class="alert alert-warning" role="alert">
        {{ warningMessage }}
      </div>

      <!-- Filters -->
      <div class="row mb-4">
        <div class="col-md-3">
          <select v-model="selectedHouse" class="form-select">
            <option value="">Tất cả nhà</option>
            <option v-for="house in houses" :key="house.id" :value="house.id">
              {{ house.name }}
            </option>
          </select>
        </div>
        <div class="col-md-3">
          <select v-model="roomStatus" class="form-select">
            <option value="">Tất cả trạng thái</option>
            <option value="rented">Đã cho thuê</option>
            <option value="available">Còn trống</option>
          </select>
        </div>
        <div class="col-md-6 text-end">
          <button class="btn btn-secondary me-2" @click="resetFilters" :disabled="!selectedHouse && !roomStatus">
            <i class="fas fa-undo"></i> Reset
          </button>
          <button class="btn btn-primary" @click="saveAllData" :disabled="!hasUnsavedChanges || isLoading">
            <i class="fas fa-save"></i> Lưu tất cả
          </button>
        </div>
      </div>

      <div class="alert alert-info">
        <strong>Lưu ý:</strong> <br>
        - Bạn phải gán dịch vụ thuộc loại điện cho khách thuê trước thì phần chỉ số này mới được tính cho phòng đó khi
        tính tiền. <br>
        - Đối với lần đầu tiên sử dụng phần mềm bạn sẽ phải nhập chỉ số cũ và mới cho tháng sử dụng đầu tiên, các tháng
        tiếp theo phần mềm sẽ tự động lấy chỉ số mới tháng trước làm chỉ số cũ tháng sau.
      </div>

      <!-- Table -->
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th @click="sortBy('houseName')" class="sortable">
                Nhà <i :class="getSortIcon('houseName')"></i>
              </th>
              <th @click="sortBy('roomNumber')" class="sortable">
                Phòng <i :class="getSortIcon('roomNumber')"></i>
              </th>
              <th>Khách thuê</th>
              <th>Chỉ số cũ</th>
              <th>Chỉ số mới</th>
              <th>Sử dụng</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="room in paginatedRooms" :key="room.id" :class="{
              'table-warning': room.hasChanges,
              'saving': room.isSaving
            }">
              <td>{{ room.houseName }}</td>
              <td>{{ room.roomNumber }}</td>
              <td>{{ room.customers?.[0]?.fullName || 'Trống' }}</td>
              <td>
                <input type="number" class="form-control" v-model="room.oldElectricIndex"
                  :disabled="!room.isOldIndexEditable || room.isPaid" min="0" :max="MAX_INDEX"
                  @input="validateRoomData(room) && handleElectricIndexChange(room)">
              </td>
              <td>
                <input type="number" class="form-control" v-model="room.newElectricIndex" :disabled="room.isPaid"
                  min="0" :max="MAX_INDEX" @input="validateRoomData(room) && handleElectricIndexChange(room)">
              </td>
              <td>{{ room.electricUsage }}</td>
              <td>
                <span :class="room.isPaid ? 'text-success' : 'text-warning'">
                  {{ room.isPaid ? 'Đã thu' : 'Chưa thu' }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-primary" @click="saveRoomData(room)"
                  :disabled="!room.hasChanges || room.isPaid || room.isSaving">
                  <i class="fas fa-save"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
        <nav aria-label="Page navigation">
          <ul class="pagination">
            <li class="page-item" :class="{ disabled: currentPage == 1 }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                <i class="fas fa-chevron-left"></i>
              </a>
            </li>
            <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage == page }">
              <a class="page-link" href="#" @click.prevent="changePage(page)">
                {{ page }}
              </a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage == totalPages }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
                <i class="fas fa-chevron-right"></i>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import { debounce } from 'lodash';
import crudApi from '@/apis/crudApi';

const ITEMS_PER_PAGE = 10;
const MAX_INDEX = 999999;

export default {
  name: 'DataPower',

  data() {
    return {
      // Basic data
      selectedMonth: new Date().toISOString().substring(0, 7),
      selectedHouse: "",
      roomStatus: "",
      houses: [],
      rooms: [],
      filteredRooms: [],

      // UI states
      isLoading: false,
      error: null,
      warningMessage: null,
      currentPage: 1,

      // Sorting
      sortKey: null,
      sortOrder: 'asc',

      // Cache
      cache: new Map(),
      currentUser: null,
    };
  },

  computed: {
    hasUnsavedChanges() {
      return this.filteredRooms.some(room => room.hasChanges && !room.isPaid);
    },

    totalPages() {
      return Math.ceil(this.filteredRooms.length / ITEMS_PER_PAGE);
    },

    paginatedRooms() {
      const start = (this.currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      return this.filteredRooms.slice(start, end);
    }
  },

  created() {
    this.debouncedApplyFilters = debounce(this.applyFilters, 300);
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  },

  async mounted() {
    await this.fetchInitialData();
  },

  beforeUnmount() {
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
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

    // Navigation Guards
    handleBeforeUnload(e) {
      if (this.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    },

    // Data Fetching Methods
    async fetchInitialData() {
      try {
        // Kiểm tra quyền truy cập trước
        if (!await this.checkAccess()) return;

        this.isLoading = true;
        this.error = null;
        this.rooms = [];
        this.filteredRooms = [];
        this.warningMessage = null;

        if (!this.validateSelectedMonth()) return;

        // Fetch all required data in parallel
        // const [houses, rooms, electricData] = await Promise.all([
        //   this.fetchWithCache('/homes', { landlordId: this.currentUser.id }), // Lọc theo landlordId
        //   this.fetchWithCache('/rooms'),
        //   this.fetchElectricData()
        // ]);

        const houses = await this.fetchWithCache('/homes', { landlordId: this.currentUser.id });
        const landlordHouseIds = houses.map(h => h.id);

        const rooms = await this.fetchWithCache('/rooms', { houseId: landlordHouseIds });
        const roomIds = rooms.map(r => r.id);
        
        const electricData = await this.fetchElectricData(roomIds);

        if (!Array.isArray(houses) || houses.length == 0) {
          throw new Error('Không có dữ liệu nhà');
        }

        // Lọc rooms theo houses của landlord
        const filteredRooms = rooms;

        if (filteredRooms.length == 0) {
          throw new Error('Không có dữ liệu phòng');
        }

        this.houses = houses;
        const processedRooms = await this.processRoomsData(houses, filteredRooms, electricData || []);
        this.rooms = processedRooms;
        this.applyFilters();

        if (processedRooms.length < filteredRooms.length) {
          const failedCount = filteredRooms.length - processedRooms.length;
          this.warningMessage = `${failedCount} phòng không thể tải dữ liệu. Vui lòng thử lại sau.`;
        }

      } catch (error) {
        console.error('Error in fetchInitialData:', error);
        this.error = error.message || 'Không thể tải dữ liệu. Vui lòng thử lại!';
        Swal.fire({
          title: 'Lỗi!',
          text: this.error,
          icon: 'error',
          confirmButtonText: 'Đóng'
        });
      } finally {
        this.isLoading = false;
      }
    },

    async fetchElectricData(roomIds) {
      try {
        console.log(this.selectedMonth);
        if (!this.selectedMonth) {
          throw new Error('Chưa chọn tháng');
        }

        // Lấy tất cả dữ liệu điện và lọc theo landlordId và tháng
        const response = await crudApi.read("api::electric-data.electric-data", {
          roomId: {id: {$in: roomIds}},
          monthYear: {$contains: this.selectedMonth}
        });

        if (response.error) {
          return [];
        }

        // Lọc dữ liệu theo landlordId và tháng
        return response.data;

      } catch (error) {
        console.error('Error fetching electric data:', error);
        return [];
      }
    },
    async getResource(endpoint, params={}){
      if(endpoint == "/homes"){
        return await crudApi.read("api::home.home", {landlordId: {id: params.landlordId}});
      }

      if(endpoint == "/rooms"){
        return await crudApi.read("api::room.room", {houseId: {id: {$in: params.houseId}}});
      }
      return {};
    },
    // API Methods
    async fetchWithCache(endpoint, params = {}) {
      try {
        const cacheKey = this.getCacheKey(endpoint, params);
        const cachedData = this.getCacheData(cacheKey);

        if (cachedData) return cachedData;

        try {
          const response = await this.getResource(endpoint, params);
          
          // await fetch(url.toString(), {
          //   signal: controller.signal
          // });

          if (response.error) {
            this.setCacheData(cacheKey, []);
            return [];
          }

          const data = response.data;
          this.setCacheData(cacheKey, data);
          return data;

        } catch (error) {
          if (error.name == 'AbortError') {
            throw new Error('Request timeout');
          }
          throw error;
        }

      } catch (error) {
        console.error('Error in fetchWithCache:', error);
        if (error.message.includes('404')) {
          return [];
        }
        throw error;
      }
    },
    // Cache Methods
    getCacheKey(endpoint, params = {}) {
      return `${endpoint}?${new URLSearchParams(params).toString()}`;
    },

    getCacheData(key) {
      const cached = this.cache.get(key);
      if (!cached) return null;

      const now = Date.now();
      if (now > cached.expiry) {
        this.cache.delete(key);
        return null;
      }

      return cached.data;
    },

    setCacheData(key, data, ttl = 300000) { // 5 minutes default TTL
      this.cache.set(key, {
        data,
        expiry: Date.now() + ttl
      });
    },

    // Data Processing Methods
    async processRoomsData(houses, rooms, electricData) {
      const processedRooms = [];
      const roomIds = rooms.map(r => r.id);

      // Fetch all customers first to avoid multiple API calls
      const customerResponse = await crudApi.read("api::customer.customer", {rooms: {id: {$in: roomIds}}});

      const customers = customerResponse.data || [];

      for (const room of rooms) {
        try {
          const house = houses.find(h => h.id == room.houseId.id);
          if (!house) {
            console.warn(`Không tìm thấy thông tin nhà cho phòng ${room.roomNumber}`);
            continue;
          }

          const electric = electricData?.find(e => e.roomId.id == room.id);
          const customer = customers.find(c => c.rooms.id == room.id);

          let oldElectricIndex = 0;
          let newElectricIndex = 0;
          let isOldIndexEditable = false;

          if (electric) {
            // Nếu đã có dữ liệu điện tháng này
            oldElectricIndex = Number(electric.oldElectricIndex) || 0;
            newElectricIndex = Number(electric.newElectricIndex) || oldElectricIndex;
          } else {
            // Nếu chưa có dữ liệu điện tháng này, lấy từ tháng trước
            const previousData = await this.getPreviousMonthData(room.id);
            if (previousData) {
              // Lấy chỉ số mới của tháng trước làm chỉ số cũ của tháng này
              oldElectricIndex = Number(previousData.newElectricIndex) || 0;
              newElectricIndex = oldElectricIndex; // Chỉ số mới khởi tạo bằng chỉ số cũ
              isOldIndexEditable = false; // Không cho phép sửa chỉ số cũ vì lấy từ tháng trước
            } else {
              // Nếu không có dữ liệu tháng trước (tháng đầu tiên)
              oldElectricIndex = 0;
              newElectricIndex = 0;
              isOldIndexEditable = true; // Cho phép sửa chỉ số cũ vì là tháng đầu tiên
            }
          }

          processedRooms.push({
            ...room,
            houseName: house.name,
            customer: customer || null,
            oldElectricIndex,
            newElectricIndex,
            electricUsage: newElectricIndex - oldElectricIndex,
            isPaid: electric?.isPaid || false,
            isOldIndexEditable, // Chỉ cho phép sửa chỉ số cũ nếu là tháng đầu tiên
            electricId: electric?.id,
            isSaving: false,
            hasChanges: false,
            originalValues: {
              oldElectricIndex,
              newElectricIndex
            }
          });

        } catch (error) {
          console.error(`Error processing room ${room.roomNumber}:`, error);
        }
      }

      return processedRooms.sort((a, b) => {
        const houseCompare = a.houseName.localeCompare(b.houseName);
        return houseCompare || a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true });
      });
    },

    // Validation Methods
    validateSelectedMonth() {
      try {
        if (!this.selectedMonth) {
          throw new Error('Vui lòng chọn tháng');
        }

        const selectedDate = new Date(this.selectedMonth);
        const currentDate = new Date();
        const minDate = new Date(2020, 0);

        // Set all dates to first day of month for comparison
        [selectedDate, currentDate, minDate].forEach(date => {
          date.setDate(1);
          date.setHours(0, 0, 0, 0);
        });

        if (selectedDate > currentDate) {
          throw new Error('Không thể chọn tháng trong tương lai');
        }

        if (selectedDate < minDate) {
          throw new Error('Chỉ có thể xem dữ liệu từ tháng 1/2020 trở đi');
        }

        return true;
      } catch (error) {
        this.error = error.message;
        return false;
      }
    },

    // Save Methods
    async saveRoomData(room) {
      if (!this.validateRoomData(room)) return;

      try {
        room.isSaving = true;
        this.error = null;
        this.warningMessage = null;

        const electricData = {
          roomId: room.id,
          houseId: room.houseId,
          monthYear: this.selectedMonth,
          oldElectricIndex: Number(room.oldElectricIndex),
          newElectricIndex: Number(room.newElectricIndex),
          electricUsage: Number(room.newElectricIndex - room.oldElectricIndex),
          isPaid: false
        };

        const result = await Swal.fire({
          title: 'Xác nhận',
          text: `Bạn có chắc muốn lưu chỉ số điện cho phòng ${room.roomNumber}?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Lưu',
          cancelButtonText: 'Hủy'
        });

        if (!result.isConfirmed) return;

        const response = room.electricId
          ? await this.updateElectricData(room.electricId, electricData)
          : await this.saveElectricData(electricData);

        // Update room data after successful save
        room.electricId = response.id;
        room.originalValues = {
          oldElectricIndex: room.oldElectricIndex,
          newElectricIndex: room.newElectricIndex
        };
        room.hasChanges = false;

        Swal.fire({
          title: 'Thành công!',
          text: `Đã lưu chỉ số điện cho phòng ${room.roomNumber}`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

      } catch (error) {
        console.error('Error saving room data:', error);
        Swal.fire('Lỗi!', error.message || 'Không thể lưu dữ liệu', 'error');
      } finally {
        room.isSaving = false;
      }
    },

    async saveAllData() {
      const unsavedRooms = this.filteredRooms.filter(room => room.hasChanges && !room.isPaid);

      if (unsavedRooms.length == 0) {
        Swal.fire('Thông báo', 'Không có thay đổi nào cần lưu', 'info');
        return;
      }

      try {
        const result = await Swal.fire({
          title: 'Xác nhận',
          text: `Bạn có chắc muốn lưu ${unsavedRooms.length} phòng có thay đổi?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Lưu tất cả',
          cancelButtonText: 'Hủy'
        });

        if (!result.isConfirmed) return;

        this.isLoading = true;
        let successCount = 0;
        let failCount = 0;

        for (const room of unsavedRooms) {
          try {
            await this.saveRoomData(room);
            successCount++;
          } catch (error) {
            console.error(`Error saving room ${room.roomNumber}:`, error);
            failCount++;
          }
        }

        const message = failCount == 0
          ? `Đã lưu thành công ${successCount} phòng`
          : `Đã lưu ${successCount} phòng, ${failCount} phòng lỗi`;

        Swal.fire({
          title: failCount == 0 ? 'Thành công!' : 'Hoàn tất',
          text: message,
          icon: failCount == 0 ? 'success' : 'warning'
        });

      } catch (error) {
        console.error('Error in saveAllData:', error);
        Swal.fire('Lỗi!', 'Có lỗi xảy ra khi lưu dữ liệu', 'error');
      } finally {
        this.isLoading = false;
      }
    },

    async saveElectricData(data) {
      const electricData = {
        ...data,
        landlordId: this.currentUser.id, // Thêm landlordId khi lưu
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await crudApi.create("api::electric-data.electric-data", electricData);

      if (response.error) {
        throw new Error('Không thể lưu dữ liệu. Vui lòng thử lại!');
      }

      return response.data;
    },


    async updateElectricData(id, data) {
      const electricData = {
        ...data,
        landlordId: this.currentUser.id, // Thêm landlordId khi cập nhật
        updatedAt: new Date().toISOString()
      };

      const response = await crudApi.update("api::electric-data.electric-data", {id: id}, electricData);

      if (response.error) {
        throw new Error('Không thể cập nhật dữ liệu. Vui lòng thử lại!');
      }

      return response.data;
    },
    // Helper Methods
    async getPreviousMonthData(roomIdRq) {
      try {
        if (!this.selectedMonth) return null;

        const [year, month] = this.selectedMonth.split('-').map(Number);
        let previousYear = year;
        let previousMonth = month - 1;

        if (previousMonth == 0) {
          previousMonth = 12;
          previousYear--;
        }

        const previousMonthStr = `${previousYear}-${String(previousMonth).padStart(2, '0')}`;

        // Lấy tất cả dữ liệu điện
        const response = await crudApi.read("api::electric-data.electric-data", {
          roomId: {id: roomIdRq},
          monthYear: {$contains: previousMonthStr}
        });

        if (response.error) return null;

        // Lọc theo roomId, landlordId và tháng trước
        return response.data;

      } catch (error) {
        console.warn('Could not fetch previous month data:', error);
        return null;
      }
    },

    validateRoomData(room) {
      try {
        if (!room) throw new Error('Không tìm thấy dữ liệu phòng.');
        if (!room.id || !room.houseId) throw new Error('Thiếu thông tin phòng hoặc nhà.');

        const oldIndex = Number(room.oldElectricIndex);
        const newIndex = Number(room.newElectricIndex);

        if (isNaN(oldIndex) || isNaN(newIndex)) throw new Error('Chỉ số điện phải là một số hợp lệ.');
        if (oldIndex < 0 || newIndex < 0) throw new Error('Chỉ số điện không được là số âm.');
        if (newIndex < oldIndex) throw new Error('Chỉ số điện mới không thể nhỏ hơn chỉ số cũ.');
        if (oldIndex > MAX_INDEX || newIndex > MAX_INDEX) throw new Error(`Chỉ số điện không thể vượt quá ${MAX_INDEX}.`);

        return true;
      } catch (error) {
        Swal.fire('Lỗi!', error.message, 'error');
        return false;
      }
    },


    // Event Handlers
    handleElectricIndexChange(room) {
      try {
        if (!room) return;

        const oldIndex = Number(room.oldElectricIndex);
        const newIndex = Number(room.newElectricIndex);

        // Reset usage if invalid input
        if (isNaN(oldIndex) || isNaN(newIndex)) {
          room.electricUsage = 0;
          return;
        }

        // Calculate usage
        room.electricUsage = Math.max(0, newIndex - oldIndex);

        // Check for changes
        room.hasChanges =
          room.oldElectricIndex !== room.originalValues.oldElectricIndex ||
          room.newElectricIndex !== room.originalValues.newElectricIndex;

      } catch (error) {
        console.error('Error handling electric index change:', error);
        this.error = 'Có lỗi xảy ra khi tính toán chỉ số điện';
      }
    },

    // Filter and Sort Methods
    applyFilters() {
      let filtered = [...this.rooms];

      // Apply house filter
      if (this.selectedHouse) {
        filtered = filtered.filter(room => room.houseId == this.selectedHouse);
      }

      // Apply status filter
      if (this.roomStatus) {
        filtered = filtered.filter(room => {
          switch (this.roomStatus) {
            case 'rented': return room.isRented;
            case 'available': return !room.isRented;
            default: return true;
          }
        });
      }

      // Apply sorting
      if (this.sortKey) {
        filtered.sort((a, b) => {
          let aVal = a[this.sortKey];
          let bVal = b[this.sortKey];

          // Handle numeric values
          if (typeof aVal == 'number' && typeof bVal == 'number') {
            return this.sortOrder == 'asc' ? aVal - bVal : bVal - aVal;
          }

          // Handle string values
          if (typeof aVal == 'string' && typeof bVal == 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
            return this.sortOrder == 'asc'
              ? aVal.localeCompare(bVal)
              : bVal.localeCompare(aVal);
          }

          return 0;
        });
      }

      this.filteredRooms = filtered;
      this.currentPage = 1;
    },

    resetFilters() {
      this.selectedHouse = "";
      this.roomStatus = "";
      this.sortKey = null;
      this.sortOrder = 'asc';
      this.applyFilters();
    },

    sortBy(key) {
      if (this.sortKey == key) {
        this.sortOrder = this.sortOrder == 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortOrder = 'asc';
      }
      this.applyFilters();
    },

    getSortIcon(key) {
      if (this.sortKey !== key) return 'fas fa-sort';
      return this.sortOrder == 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    },

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    errorCaptured(err, vm, info) {
      console.error('Error captured:', err, vm, info);
      return false; // prevent error from propagating
    }
  },

  watch: {
    selectedHouse() {
      this.debouncedApplyFilters();
    },
    roomStatus() {
      this.debouncedApplyFilters();
    }
  }
};
</script>

<style scoped>
/* Modern Container */
.datapower-wrapper {
  position: relative;
  min-height: 200px;
  background: linear-gradient(135deg, #f8fafc 0%, #eef2f7 100%);
  padding: 1rem;
}

h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.datapower {
  margin-top: 2.5rem !important;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  padding: 1.25rem;
  backdrop-filter: blur(10px);
}

/* Modern Table Design */
.table {
  background: transparent;
  margin: 0;
}

.table th {
  background: rgba(248, 249, 250, 0.8);
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  padding: 0.75rem 1rem;
  border: none;
}

.table td {
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.table-hover tbody tr:hover {
  background: rgba(248, 250, 252, 0.5);
}

/* Modern Form Controls */
.form-control,
.form-select {
  font-size: 0.9rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  transition: all 0.2s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Modern Buttons */
.btn {
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

/* Modern Alerts */
.alert {
  border-radius: 8px;
  font-size: 0.9rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border: none;
}

.alert-info {
  background: rgba(59, 130, 246, 0.1);
  color: #1e40af;
}

/* Modern Pagination */
.pagination {
  gap: 0.25rem;
}

.page-link {
  border-radius: 6px;
  padding: 0.4rem 0.75rem;
  font-size: 0.9rem;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.page-item.active .page-link {
  background: #3b82f6;
  border-color: #3b82f6;
}

/* Loading State */
.loading-overlay {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
}

.spinner-wrapper {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

/* Responsive Design */
@media (max-width: 768px) {
  .datapower {
    padding: 1rem;
  }

  .table th,
  .table td {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }

  .btn {
    font-size: 0.85rem;
    padding: 0.4rem 0.75rem;
  }

  .form-control,
  .form-select {
    font-size: 0.85rem;
  }
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #94a3b8;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>