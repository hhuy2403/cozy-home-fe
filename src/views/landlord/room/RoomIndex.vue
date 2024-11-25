<template>
  <div class="room-index container mt-5 p-4 bg-light rounded shadow-sm">
    <!-- Title and Filters -->
    <h3 class="mb-4">Danh sách phòng</h3>
    <div class="row mb-4 align-items-center">
      <div class="col-lg-3 col-md-4 col-sm-6 mb-2">
        <select class="form-select" v-model="filterStatus">
          <option value="">- Trạng thái phòng -</option>
          <option value="available">Còn trống</option>
          <option value="rented">Đã cho thuê</option>
        </select>
      </div>
      <div class="col-lg-3 col-md-4 col-sm-6 mb-2">
        <select class="form-select" v-model="filterFeeStatus">
          <option value="">- Trạng thái phí -</option>
          <option value="unpaid">Chưa thu phí</option>
          <option value="paid">Đã thu phí</option>
        </select>
      </div>
      <div class="col-lg-3 col-md-4 col-sm-6 mb-2">
        <input type="text" class="form-control" placeholder="Tìm phòng..." v-model="searchQuery" />
      </div>
      <div class="col-lg-2 col-md-12 col-sm-6 mb-2">
        <button class="btn btn-primary w-100" @click="searchRooms">
          <i class="fas fa-search"></i> Tìm kiếm
        </button>
      </div>

      <div class="col-lg-1 col-md-12 col-sm-6 mb-2">
        <button class="btn btn-secondary w-100" @click="resetFilters" title="Xóa bộ lọc">
          <i class="fas fa-undo"></i>
        </button>
      </div>
      <div class="col-12 d-flex justify-content-start mt-2">
        <span class="text-muted">Còn trống: {{ availableRooms }} | Đã cho thuê: {{ rentedRooms }} | Chưa thu phí: {{
          unpaidRooms }}</span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="d-flex justify-content-end mb-4 flex-wrap">
      <!-- <button class="btn btn-warning me-2 mb-2">
        <i class="fa fa-upload"></i> Nhập phòng từ Excel
      </button> -->
      <router-link to="/landlord/customer">
        <button class="btn btn-primary me-2 mb-2">
          <i class="fa fa-users"></i> Khách thuê
        </button>
      </router-link>
      <router-link to="/landlord/list-room">
        <button class="btn btn-info me-2 mb-2">
          <i class="fa fa-list"></i> Phòng
        </button>
      </router-link>
      <router-link to="/landlord/create-home">
        <button class="btn btn-success mb-2">
          <i class="fa fa-building"></i> Thêm nhà
        </button>
      </router-link>
    </div>

    <!-- Info Alert -->
    <div v-if="!houses.length" class="alert alert-info">
      Chưa có nhà nào được thêm! Vui lòng thêm nhà để sử dụng các tính năng khác.
    </div>

    <!-- House Tabs -->
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item" v-for="(house, index) in houses" :key="index">
        <a class="nav-link" :class="{ active: activeTab == index }" @click="setActiveTab(index)">
          {{ house.name }}
        </a>
      </li>
    </ul>

    <!-- Room Cards -->
    <div class="tab-content">
      <!-- Loading Skeleton -->
      <div v-if="isLoading" class="row">
        <div class="col-lg-4 col-md-6 col-sm-12 mb-4" v-for="n in 6" :key="n">
          <div class="card room-card h-100 shadow-sm p-3 skeleton-loading">
            <div class="card-body d-flex flex-column justify-content-between">
              <div class="text-center mb-3">
                <div class="skeleton-text"></div>
              </div>
              <div class="text-center mb-3">
                <div class="skeleton-button"></div>
              </div>
              <div class="tenant-info text-center mb-3">
                <div class="skeleton-text"></div>
                <div class="skeleton-text"></div>
              </div>
              <div class="text-center mb-3">
                <div class="skeleton-text"></div>
              </div>
              <div class="d-flex justify-content-center gap-2">
                <div class="skeleton-button"></div>
                <div class="skeleton-button"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else v-for="(house, index) in filteredHouses" :key="index" class="tab-pane fade"
        :class="{ show: activeTab == index, active: activeTab == index }">
        <div class="d-flex justify-content-between mb-3">
          <span>
            Còn trống: {{ availableRoomsInHouse(house) }} | Đã cho thuê: {{ rentedRoomsInHouse(house) }} | Chưa thu phí:
            {{ unpaidRoomsInHouse(house) }}
          </span>
          <div>
            <router-link :to="{ path: '/landlord/create-room-fast', query: { houseId: house.id } }">
              <button class="btn btn-outline-info me-2">
                <i class="fa fa-plus"></i> Thêm phòng nhanh
              </button>
            </router-link>
            <router-link :to="{ path: '/landlord/create-room', query: { houseId: house.id } }">
              <button class="btn btn-outline-success me-2">
                <i class="fa fa-bed"></i> Thêm phòng
              </button>
            </router-link>
            <router-link :to="{ path: '/landlord/edit-home', query: { houseId: house.id } }">
              <button class="btn btn-outline-primary me-2">
                <i class="fa fa-pencil-alt"></i> Sửa nhà
              </button>
            </router-link>
            <button class="btn btn-outline-danger" @click="deleteHouse(house)">
              <i class="fa fa-times"></i> Xóa nhà
            </button>
          </div>
        </div>

        <div class="row">
          <div class="col-lg-4 col-md-6 col-sm-12 mb-4" v-for="room in house.rooms" :key="room.id"
            :class="{ 'fade-in': !loadingRooms.has(room.id) }">
            <div class="card room-card h-100 shadow-sm p-3">
              <div class="card-body d-flex flex-column justify-content-between">
                <!-- Room Title -->
                <div class="text-center mb-3">
                  <h5 class="card-title">
                    <i class="fa fa-home me-2"></i> Phòng {{ room.roomNumber }}
                  </h5>
                </div>

                <!-- Add Tenant Button -->
                <div class="text-center mb-3">
                  <div v-if="room.isRented" class="d-flex justify-content-center gap-2 flex-wrap">
                    <button class="btn btn-danger" @click="handleCheckout(room, house.id)">
                      <i class="fa fa-sign-out-alt me-1"></i> Trả
                    </button>
                    <router-link :to="{
                      path: '/landlord/create-customer',
                      query: {
                        roomId: room.id,
                        houseId: house.id,
                        viewOnly: true
                      }
                    }">
                      <button class="btn btn-primary">
                        <i class="fa fa-eye me-1"></i> Xem
                      </button>
                    </router-link>
                    <router-link :to="{
                      path: '/landlord/create-customer',
                      query: {
                        roomId: room.id,
                        houseId: house.id,
                        editMode: true
                      }
                    }">
                      <button class="btn btn-warning">
                        <i class="fa fa-edit me-1"></i> Sửa
                      </button>
                    </router-link>
                  </div>

                  <div v-else>
                    <button class="btn btn-info w-100" @click="handleAddTenant(room, house.id)">
                      <i class="fa fa-user-plus me-1"></i> Thêm khách
                    </button>
                  </div>
                </div>

                <!-- Tenant Info Section -->
                <div class="tenant-info text-center mb-3">
                  <div class="tenant-card">
                    <!-- Hiển thị thông tin khách thuê nếu có -->
                    <template v-if="room.isRented && roomCustomers[room.id]">
                      <div class="tenant-name">
                        <i class="fa fa-user me-2"></i>
                        <span>{{ roomCustomers[room.id].fullName }}</span>
                      </div>
                      <div class="tenant-phone">
                        <i class="fa fa-phone me-2"></i>
                        <span>{{ roomCustomers[room.id].phoneNumber1 }}</span>
                      </div>
                    </template>
                    <!-- Hiển thị "Chưa có khách thuê" nếu phòng trống -->
                    <template v-else>
                      <div class="no-tenant">
                        <i class="fa fa-user-slash me-2"></i>
                        <span>Chưa có khách thuê</span>
                      </div>
                    </template>
                  </div>
                </div>

                <!-- Room Price Section -->
                <div class="text-center mb-3">
                  <p class="mb-0">
                    <i class="fa fa-money-bill"></i> {{ formatCurrency(room.price) }}
                  </p>
                </div>

                <!-- Edit and Delete Buttons -->
                <div class="d-flex justify-content-center align-items-center gap-2 mt-2 flex-wrap">
                  <router-link :to="{ path: '/landlord/edit-room', query: { roomId: room.id } }">
                    <button class="btn btn-edit">
                      <i class="fa fa-edit me-1"></i> Chỉnh sửa
                    </button>
                  </router-link>
                  <button class="btn btn-delete" @click="deleteRoom(room, house.id)">
                    <i class="fa fa-trash me-1"></i> Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
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
      houses: [],
      filterStatus: '',
      filterFeeStatus: '',
      searchQuery: '',
      activeTab: 0,
      roomCustomers: {},
      isLoading: true,
      loadingRooms: new Set(),
    };
  },
  computed: {
    filteredHouses() {
      // Nếu đang tìm kiếm hoặc lọc, chỉ hiển thị nhà có phòng thỏa điều kiện
      if (this.searchQuery.trim() || this.filterStatus || this.filterFeeStatus) {
        return this.houses.map(house => {
          // Đảm bảo house.rooms là một mảng
          const houseRooms = Array.isArray(house.rooms) ? house.rooms : [];
          
          // Lọc phòng theo điều kiện tìm kiếm
          const filteredRooms = houseRooms.filter(room => {
            let matchSearch = true;
            let matchStatus = true;
            let matchFee = true;

            // Tìm kiếm theo từ khóa
            if (this.searchQuery.trim()) {
              const searchTerm = this.searchQuery.toLowerCase().trim();
              const customer = this.roomCustomers[room.id];

              matchSearch =
                room.roomNumber.toString().toLowerCase().includes(searchTerm) ||
                (customer?.fullName || '').toLowerCase().includes(searchTerm) ||
                (customer?.phoneNumber1 || '').includes(searchTerm) ||
                (room.note || '').toLowerCase().includes(searchTerm);
            }

            // Lọc theo trạng thái phòng
            if (this.filterStatus) {
              matchStatus = this.filterStatus == 'available' ? !room.isRented : room.isRented;
            }

            // Lọc theo trạng thái phí
            if (this.filterFeeStatus) {
              matchFee = this.filterFeeStatus == 'unpaid' ? !room.isPaid : room.isPaid;
            }

            return matchSearch && matchStatus && matchFee;
          });

          return {
            ...house,
            rooms: filteredRooms
          };
        }).filter(house => house.rooms.length > 0); // Chỉ hiển thị nhà có phòng thỏa điều kiện khi đang tìm kiếm/lọc
      }

      // Nếu không có tìm kiếm/lọc, hiển thị tất cả các nhà
      return this.houses.map(house => ({
        ...house,
        rooms: Array.isArray(house.rooms) ? house.rooms : [] // Đảm bảo rooms luôn là array
      }));
    },

    availableRooms() {
      return this.houses.reduce((total, house) =>
        total + (Array.isArray(house.rooms) ? house.rooms.filter(room => !room.isRented).length : 0), 0
      );
    },
    rentedRooms() {
      return this.houses.reduce((total, house) =>
        total + (Array.isArray(house.rooms) ? house.rooms.filter(room => room.isRented).length : 0), 0
      );
    },
    unpaidRooms() {
      return this.houses.reduce((total, house) =>
        total + (Array.isArray(house.rooms) ? house.rooms.filter(room => !room.isPaid).length : 0), 0
      );
    },

  },
  methods: {
    searchRooms() {
      // Reset active tab nếu không còn phòng nào trong tab hiện tại
      if (this.filteredHouses.length > 0 && !this.filteredHouses[this.activeTab]) {
        this.activeTab = 0;
      }

      // Hiển thị thông báo nếu không tìm thấy kết quả
      if (this.filteredHouses.length == 0) {
        Swal.fire({
          icon: 'info',
          title: 'Không tìm thấy kết quả',
          text: 'Không có phòng nào phù hợp với điều kiện tìm kiếm.',
          confirmButtonText: 'Đóng'
        });
      }
    },

    resetFilters() {
      this.filterStatus = '';
      this.filterFeeStatus = '';
      this.searchQuery = '';
      this.activeTab = 0;
    },

    async handleAddTenant(room, houseId) {
      const result = await Swal.fire({
        title: 'Thêm hợp đồng trước',
        html: `
        <div class="text-info mb-3">
          <i class="fas fa-info-circle"></i>
          <strong>Lưu ý:</strong> Bạn cần tạo hợp đồng trước khi thêm khách thuê
        </div>
        <p>Bạn muốn thực hiện thao tác nào?</p>
      `,
        icon: 'info',
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: 'Tạo hợp đồng',
        denyButtonText: 'Thêm khách',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#28a745',
        denyButtonColor: '#17a2b8',
        cancelButtonColor: '#6c757d',
      });

      if (result.isConfirmed) {
        // Chuyển đến trang tạo hợp đồng
        this.$router.push({
          path: '/landlord/contract-create',
        });
      } else if (result.isDenied) {
        // Chuyển đến trang thêm khách
        this.$router.push({
          path: '/landlord/create-customer',
          query: {
            roomId: room.id,
            houseId: houseId
          }
        });
      }
    },

    async handleCheckout(room, houseId) {
      const result = await Swal.fire({
        title: 'Xác nhận trả phòng?',
        html: `
      <div class="text-danger mb-3">
        <i class="fas fa-exclamation-triangle"></i>
        <strong>Lưu ý:</strong> Khi trả phòng, các dữ liệu sau sẽ bị xóa:
        <ul class="text-left">
          <li>Hợp đồng của khách thuê</li>
          <li>Tất cả hóa đơn của phòng</li>
          <li>Chỉ số điện, nước</li>
          <li>Chi phí phát sinh</li>
        </ul>
      </div>
      <p>Bạn có chắc muốn cho phòng ${room.roomNumber} trả phòng không?</p>
    `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#d33',
      });

      if (result.isConfirmed) {
        try {
          Swal.fire({
            title: 'Đang xử lý...',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          // Kiểm tra và xóa bills
          await crudApi.delete("api::bill.bill", {room: {id: room.id}});
          await crudApi.delete("api::electric-data.electric-data", {roomId: {id: room.id}});
          await crudApi.delete("api::water-data.water-data", {roomId: {id: room.id}});
          await crudApi.delete("api::other-fee.other-fee", {roomNumber: room.roomNumber});
          delete this.roomCustomers[room.id];

          
          // Kiểm tra và xóa customer data
          const customersResponse = await crudApi.read("api::customer.customer", {rooms: {id: room.id}});
          if (!customersResponse.error) {
            const roomCustomer = customersResponse.data[0];
            
            if (roomCustomer) {
              // Xóa customer
              await crudApi.delete("api::customer.customer", {id: roomCustomer.id});

              // Xóa contracts nếu có
              if (roomCustomer.contracts && roomCustomer.contracts.length > 0) {
                await Promise.all(roomCustomer.contracts.map(contract =>
                  crudApi.delete("api::contract.contract", {id: contract.contractNumber})
                ));
              }
            }
          }

          // Cập nhật trạng thái phòng
          await crudApi.update("api::room.room", {id: room.id}, {
              isRented: false,
              isPaid: false,
              customer: null,
              services: [],
              members: [],
              contracts: [],
              currentContract: null,
              currentTenant: null
            });

          // Cập nhật state
          this.houses = this.houses.map(house => {
            if (house.id == houseId) {
              return {
                ...house,
                rooms: house.rooms.map(r => {
                  if (r.id == room.id) {
                    return {
                      ...r,
                      isRented: false,
                      isPaid: false,
                      customer: null,
                      services: [],
                      members: [],
                      contracts: [],
                      currentContract: null,
                      currentTenant: null
                    };
                  }
                  return r;
                })
              };
            }
            return house;
          });

          Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: `Phòng ${room.roomNumber} đã được trả, tất cả dữ liệu liên quan đã được xóa.`,
            confirmButtonText: 'Đóng'
          });

        } catch (error) {
          console.error('Checkout error:', error);
          Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Không thể thực hiện trả phòng. Vui lòng thử lại!',
            confirmButtonText: 'Đóng'
          });
        }
      }
    },

    async fetchHouses() {
      try {
        this.isLoading = true;
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (!currentUser?.id || currentUser.role !== 'landlord') {
          throw new Error('Invalid user or not a landlord');
        }

        // 1. Fetch tất cả houses
        const resHouses = await crudApi.read('api::home.home', { landlordId: { id: currentUser.id }});
        if (resHouses.error) {
          throw new Error('Failed to fetch houses');
        }

        // 2. Process each house
        const allHouses = resHouses.data;

        // Lọc houses theo landlordId
        const houses = allHouses;

        // 2. Process each house
        const processedHouses = await Promise.all(houses.map(async (house) => {
          try {
            // Fetch tất cả rooms
            const roomResponse = await crudApi.read('api::room.room', {houseId: {id: { $eq: house.id }}});
             
            if (roomResponse.error) {
              throw new Error(`Failed to fetch rooms`);
            }
            const allRooms = roomResponse.data;

            // Lọc rooms theo houseId
            const rooms = allRooms;

            // Add rooms to loadingRooms Set
            rooms.forEach(room => this.loadingRooms.add(room.id));

            // Fetch customer info for rented rooms
            const rentedRooms = rooms.filter(room => room.isRented);
            await Promise.all(rentedRooms.map(async (room) => {
              try {
                const customerResponse = await crudApi.read('api::customer.customer', { rooms: { id: room.id } });
                 
                if (customerResponse.error) {
                  throw new Error(`Failed to fetch customers`);
                }
                const allCustomers = customerResponse.data;

                // Lọc customer theo roomId và houseId
                const customer = allCustomers[0];

                if (customer) {
                  this.roomCustomers[room.id] = customer;
                }
              } catch (error) {
                console.error(`Error fetching customer for room ${room.id}:`, error);
              } finally {
                this.loadingRooms.delete(room.id);
              }
            }));

            return {
              ...house,
              rooms: rooms
            };
          } catch (error) {
            console.error(`Error processing house ${house.id}:`, error);
            return {
              ...house,
              rooms: []
            };
          }
        }));

        this.houses = processedHouses;

      } catch (error) {
        console.error('Error fetching houses:', error);
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Không thể tải dữ liệu. Vui lòng thử lại!"
        });
      } finally {
        setTimeout(() => {
          this.isLoading = false;
        }, 500);
      }
    },

    async fetchHouses1() {
      try {
        this.isLoading = true;
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (!currentUser?.id || currentUser.role !== 'landlord') {
          throw new Error('Invalid user or not a landlord');
        }

        // 1. Fetch tất cả houses
        const houses = await crudApi.read('api::home.home', {
            landlordId: {
              id: {
                $eq: currentUser.id
              }
            }
        });
        if (houses.error) {
          throw new Error('Failed to fetch houses');
        }

        // 2. Process each house
        const allHouses = houses.data;
        const processedHouses = await Promise.all(allHouses.map(async (house) => {
          try {
            // Lọc rooms theo houseId
            const rooms = house.roomId;
            // Add rooms to loadingRooms Set
            rooms.forEach(room => this.loadingRooms.add(room.id));

            // Fetch customer info for rented rooms
            const rentedRooms = rooms.filter(room => room.isRented);
            await Promise.all(rentedRooms.map(async (room) => {
              try {
                const customerResponse = await crudApi.read('api::room.room', {
                    id: {
                      $eq: room.id
                    }
                });
                if (customerResponse.error) {
                  throw new Error(`Failed to fetch customers`);
                }
                const allCustomers = customerResponse.data?.[0]?.customers;
                this.roomCustomers[room.id] = allCustomers;
              } catch (error) {
                console.error(`Error fetching customer for room ${room.id}:`, error);
              } finally {
                this.loadingRooms.delete(room.id);
              }
            }));

            return {
              ...house,
              rooms: rooms
            };
          } catch (error) {
            console.error(`Error processing house ${house.id}:`, error);
            return {
              ...house,
              rooms: []
            };
          }
        }));
        this.houses = processedHouses;

      } catch (error) {
        console.error('Error fetching houses:', error);
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Không thể tải dữ liệu. Vui lòng thử lại!"
        });
      } finally {
        setTimeout(() => {
          this.isLoading = false;
        }, 500);
      }
    },
    setActiveTab(index) {
      this.activeTab = index;
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    },
    availableRoomsInHouse(house) {
      return Array.isArray(house.rooms) ? house.rooms.filter(room => !room.isRented).length : 0;
    },
    rentedRoomsInHouse(house) {
      return Array.isArray(house.rooms) ? house.rooms.filter(room => room.isRented).length : 0;
    },
    unpaidRoomsInHouse(house) {
      return Array.isArray(house.rooms) ? house.rooms.filter(room => !room.isPaid).length : 0;
    },
    async deleteRoom(room, houseId) {
      const confirmed = await Swal.fire({
        title: 'Bạn có chắc chắn?',
        text: `Xóa phòng ${room.roomNumber}? Hành động này không thể hoàn tác.`,
        icon: 'warning',
        showCancelButton: true,
      });
      if (confirmed.isConfirmed) {
        await crudApi.delete('api::room.room', {id: room.id});
        this.houses = this.houses.map(house => house.id == houseId
          ? { ...house, rooms: house.rooms.filter(r => r.id !== room.id) }
          : house
        );
        Swal.fire('Đã xóa!', `Phòng ${room.roomNumber} đã được xóa.`, 'success');
      }
    },
    async deleteHouse(house) {
      const confirmed = await Swal.fire({
        title: 'Bạn có chắc chắn?',
        text: `Xóa nhà ${house.name}? Hành động này không thể hoàn tác.`,
        icon: 'warning',
        showCancelButton: true,
      });
      if (confirmed.isConfirmed) {
        await crudApi.delete('api::home.home', {id: house.id});
        for (const room of house.rooms) {
          await crudApi.delete('api::room.room', {id: room.id});
        }
        this.houses = this.houses.filter(h => h.id !== house.id);
        Swal.fire('Đã xóa!', `Nhà ${house.name} đã được xóa cùng với các phòng liên quan.`, 'success');
      }
    },

    async refreshData() {
      await this.fetchHouses();
    }
  },
  mounted() {
    this.fetchHouses();
  },
};
</script>

<style scoped>
.room-index {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.room-card {
  border-radius: 10px;
  transition: all 0.3s ease;
  background-color: #ffffff;
}

.room-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 20px;
  font-weight: 600;
}

.btn-edit,
.btn-delete {
  width: 120px;
  height: 40px;
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.btn-edit {
  background-color: #007bff;
  color: white;
  border: none;
}

.btn-edit:hover {
  background-color: #0056b3;
  color: #ffffff;
  transform: scale(1.05);
}

.btn-delete {
  background-color: #ff4d4f;
  color: white;
  border: none;
}

.btn-delete:hover {
  background-color: #d9363e;
  color: #ffffff;
  transform: scale(1.05);
}

.btn {
  transition: all 0.3s ease;
}

.btn:hover {
  transform: scale(1.05);
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
  border-color: #bd2130;
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

.btn-warning {
  background-color: #ffc107;
  border-color: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background-color: #e0a800;
  border-color: #d39e00;
}

.gap-2 {
  gap: 0.5rem !important;
}

.flex-grow-1 {
  flex-grow: 1 !important;
}

.tenant-info {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 10px;
}

.tenant-card {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.tenant-name,
.tenant-phone {
  font-size: 14px;
  color: #495057;
}

.tenant-name i,
.tenant-phone i {
  color: #6c757d;
  width: 16px;
  text-align: center;
}

/* Optional: Add a subtle border */
.tenant-info {
  border: 1px solid #e9ecef;
}

/* Optional: Add hover effect */
.tenant-info:hover {
  background-color: #e9ecef;
  transition: background-color 0.3s ease;
}

.skeleton-loading {
  position: relative;
  overflow: hidden;
}

.skeleton-text {
  height: 20px;
  background: #eee;
  border-radius: 4px;
  margin-bottom: 10px;
  animation: pulse 1.5s infinite;
}

.skeleton-button {
  height: 40px;
  width: 120px;
  background: #eee;
  border-radius: 6px;
  margin: 5px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    background-color: #eee;
  }

  50% {
    background-color: #ddd;
  }

  100% {
    background-color: #eee;
  }
}

/* Fade In Animation */
.fade-in {
  animation: fadeIn 0.5s ease-in;
  opacity: 1;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Shimmer Effect */
.skeleton-loading::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  animation: shimmer 2s infinite;
  background: linear-gradient(to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0) 100%);
  transform: translateX(-100%);
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

/* Staggered Animation for Room Cards */
.room-card {
  animation: slideIn 0.3s ease-out forwards;
  opacity: 0;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Add animation delay for staggered effect */
.room-card:nth-child(1) {
  animation-delay: 0.1s;
}

.room-card:nth-child(2) {
  animation-delay: 0.2s;
}

.room-card:nth-child(3) {
  animation-delay: 0.3s;
}

.room-card:nth-child(4) {
  animation-delay: 0.4s;
}

.room-card:nth-child(5) {
  animation-delay: 0.5s;
}

.room-card:nth-child(6) {
  animation-delay: 0.6s;
}

.no-tenant {
  color: #6c757d;
  font-style: italic;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-tenant i {
  color: #dc3545;
  margin-right: 5px;
}

/* Tùy chỉnh màu nền cho phòng trống */
.tenant-info:not(.has-tenant) {
  background-color: #f8f9fa;
  border: 1px dashed #dee2e6;
}
</style>