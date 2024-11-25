<template>
  <div class="modern-container">
    <!-- Header Section -->
    <div class="report-header">
      <div class="title-section">
        <i class="fas fa-users"></i>
        <h2>Danh sách thành viên theo phòng</h2>
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

          <div class="filter-item">
            <label class="filter-label">
              <i class="fas fa-venus-mars"></i> Giới tính
            </label>
            <select
              class="modern-select"
              v-model="selectedStatus"
              :disabled="isLoading"
            >
              <option value="">Tất cả</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>

          <div class="filter-item">
            <label class="filter-label">
              <i></i>
            </label>
            <button
              class="search-button"
              @click="fetchReport"
              :disabled="isLoading"
            >
              <i
                class="fas"
                :class="isLoading ? 'fa-spinner fa-spin' : 'fa-search'"
              ></i>
              {{ isLoading ? 'Đang tải...' : 'Tìm kiếm' }}
            </button>
          </div>

          <!-- <button class="search-button" @click="fetchReport" :disabled="isLoading">
            <i class="fas" :class="isLoading ? 'fa-spinner fa-spin' : 'fa-search'"></i>
            {{ isLoading ? 'Đang tải...' : 'Tìm kiếm' }}
          </button> -->
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="content-section">
      <div v-if="isLoading" class="loading-state">
        <div class="skeleton-table">
          <div class="skeleton-header">
            <div v-for="i in 5" :key="i" class="skeleton-cell"></div>
          </div>
          <div class="skeleton-body">
            <div v-for="i in 3" :key="i" class="skeleton-row">
              <div v-for="j in 5" :key="j" class="skeleton-cell"></div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="table-container">
        <table class="modern-table">
          <thead>
            <tr>
              <th>Thông tin cá nhân</th>
              <th>Thông tin liên hệ</th>
              <th>Vị trí phòng</th>
              <th>Giấy tờ</th>
              <th>Thông tin khác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(member, index) in filteredMembers" :key="index">
              <td>
                <div class="member-info">
                  <div class="member-name">{{ member.fullName }}</div>
                  <div class="member-gender">
                    <i
                      :class="
                        member.gender == 'Nam' ? 'fas fa-mars' : 'fas fa-venus'
                      "
                    ></i>
                    {{ member.gender }}
                  </div>
                  <div class="member-birth">
                    <i class="fas fa-birthday-cake"></i>
                    {{ member.birthDate || 'Không có' }}
                  </div>
                </div>
              </td>
              <td>
                <div class="contact-info">
                  <div>
                    <i class="fas fa-map-marker-alt"></i> {{ member.address }}
                  </div>
                  <div>
                    <i class="fas fa-phone"></i>
                    {{ member.phoneNumber1 || member.phoneNumber }}
                  </div>
                </div>
              </td>
              <td>
                <div class="room-info">
                  <div class="house-name">{{ member.houseName }}</div>
                  <div class="room-number">Phòng {{ member.roomNumber }}</div>
                  <div class="start-date">
                    <i class="fas fa-calendar-alt"></i>
                    Từ: {{ formatDate(member.startDate) }}
                  </div>
                </div>
              </td>
              <td>
                <div class="id-info">
                  <div class="id-number">
                    <i class="fas fa-id-card"></i>
                    {{ member.identityCard }}
                  </div>
                </div>
              </td>
              <td>
                <div class="other-info">
                  <div class="license-plate" v-if="member.licensePlate">
                    <i class="fas fa-motorcycle"></i>
                    {{ member.licensePlate }}
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="filteredMembers.length == 0">
              <td colspan="5" class="empty-message">
                <i class="fas fa-users-slash"></i>
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
  data() {
    return {
      selectedHouse: '',
      selectedRoom: '',
      selectedStatus: '',
      houses: [],
      rooms: [],
      members: [],
      isLoading: false,
    };
  },
  computed: {
    filteredRooms() {
      if (!this.selectedHouse || !this.rooms) return this.rooms || [];
      return this.rooms.filter((room) => {
        const house = this.houses?.find((h) => h.id == room.houseId);
        return house && house.name == this.selectedHouse;
      });
    },
    filteredMembers() {
      if (!this.members) return [];
      return this.members.filter((member) => {
        // Kiểm tra null/undefined
        if (!member) return false;

        const room = this.rooms?.find((r) => r.roomNumber == member.roomNumber);

        if (!room) return false;

        const matchHouse =
          !this.selectedHouse || member.houseName == this.selectedHouse;
        const matchRoom =
          !this.selectedRoom || member.roomNumber == this.selectedRoom;
        const matchStatus =
          !this.selectedStatus || member.gender == this.selectedStatus;

        return matchHouse && matchRoom && matchStatus;
      });
    },
  },
  methods: {
    async fetchData() {
      try {
        this.isLoading = true;
        this.houses = []; // Reset về mảng rỗng
        this.rooms = []; // Reset về mảng rỗng
        this.members = []; // Reset về mảng rỗng

        // Lấy thông tin currentUser từ localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser?.id) {
          throw new Error('Không tìm thấy thông tin người dùng!');
        }

        // Fetch houses và rooms
        const [housesResponse, roomsResponse] = await Promise.all([
          crudApi.read('api::home.home', null),
          crudApi.read('api::room.room', null),
        ]);

        if (!housesResponse.isSuccess || !roomsResponse.isSuccess) {
          throw new Error('Failed to fetch data');
        }

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
        this.houses =
          allHouses.filter((house) => house.landlordId == currentUser.id) ||
          [];

        // Lọc rooms theo houses của landlord
        this.rooms =
          allRooms.filter((room) =>
            this.houses.some((house) => house.id == room.houseId)
          ) || [];

        await this.fetchReport();
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        this.houses = [];
        this.rooms = [];
        this.members = [];
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
        this.members = []; // Reset về mảng rỗng

        const customersResponse = await crudApi.read('api::customer.customer');

        if (!customersResponse.isSuccess) {
          throw new Error('Failed to fetch customers');
        }
        const customersData = customersResponse.data;

        // Transform và lọc data
        this.members = (customersData || [])
          .filter((customer) => {
            if (!customer) return false;
            const room = this.rooms?.find(
              (r) => r.roomNumber == customer.roomNumber
            );
            return room;
          })
          .map((customer) => {
            const room = this.rooms?.find(
              (r) => r.roomNumber == customer.roomNumber
            );

            return {
              //houseName: house ? house.name : 'Không xác định',
              roomNumber: room ? room.roomNumber : 'Không xác định',
              fullName: customer.fullName || 'Không có',
              address: customer.address || 'Không có',
              phoneNumber: customer.phoneNumber || 'Không có',
              phoneNumber1: customer.phoneNumber1 || 'Không có',
              identityCard: customer.identityCard || 'Không có',
              birthDate: customer.birthDate || 'Không có',
              gender: customer.gender || 'Không xác định',
              startDate: customer.startDate || null,
              licensePlate: customer.licensePlate || 'Không có',
              houseId: customer.houseId,
              roomId: customer.roomId,
            };
          });
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu báo cáo:', error);
        this.members = [];
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Không thể tải dữ liệu báo cáo. Vui lòng thử lại sau!',
        });
      } finally {
        this.isLoading = false;
      }
    },

    formatDate(dateString) {
      if (!dateString) return 'Không có';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
      } catch {
        return dateString;
      }
    },
  },
  async mounted() {
    await this.fetchData();
  },
};
</script>

<style scoped>
.modern-container {
  background: #ffffff;
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
  color: #4f46e5;
}

h2 {
  font-size: 1.5rem;
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
  flex-wrap: wrap;
}

.filter-item {
  flex: 1;
  min-width: 200px;
}

.filter-label {
  display: block;
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
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #1f2937;
  transition: all 0.2s;
}

.modern-select:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.search-button {
  padding: 0.7rem 1.5rem;
  background: linear-gradient(to right, #4f46e5, #6366f1);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  min-width: 120px;
}

.search-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
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

.member-info,
.contact-info,
.room-info,
.id-info,
.other-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.member-name {
  font-weight: 600;
  color: #1f2937;
}

.member-gender,
.member-birth {
  font-size: 0.875rem;
  color: #6b7280;
}

.contact-info i,
.room-info i,
.id-info i,
.other-info i {
  width: 16px;
  margin-right: 0.5rem;
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
