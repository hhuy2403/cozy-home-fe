<template>
  <div class="create-customer container mt-5">
    <!-- Header Section -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>{{ pageTitle }}</h2>
      <div>
        <button class="btn btn-warning me-2" @click="goBack">
          <i class="fa fa-undo"></i> Quay về
        </button>
        <button v-if="!isViewOnly" class="btn btn-success" @click="saveCustomer">
          <i class="fa fa-check"></i> Lưu
        </button>
      </div>
    </div>

    <form @submit.prevent="saveCustomer">
      <!-- Tabs Navigation -->
      <ul class="nav nav-tabs mb-3">
        <li class="nav-item" v-for="tab in tabs" :key="tab.id">
          <a class="nav-link" :class="{ active: activeTab == tab.id }" @click.prevent="setActiveTab(tab.id)">
            {{ tab.name }}
          </a>
        </li>
      </ul>

      <!-- Tab Content -->
      <div class="tab-content p-3 border border-top-0 rounded-bottom">
        <!-- Customer Info Tab -->
        <div v-show="activeTab == 'customer-info'" class="tab-pane fade show active">
          <div class="row">
            <!-- Basic Info -->
            <div class="col-md-6 mb-3">
              <label class="form-label">Họ và tên <span style="color:red">*</span></label>
              <input type="text" class="form-control" v-model="customer.fullName"
                :class="{ 'is-invalid': errors.fullName }" :readonly="isViewOnly" />
              <div class="invalid-feedback">{{ errors.fullName }}</div>
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label">CMND/CCCD <span style="color:red">*</span></label>
              <input type="text" class="form-control" v-model="customer.identityCard"
                :class="{ 'is-invalid': errors.identityCard }" :readonly="isViewOnly" />
              <div class="invalid-feedback">{{ errors.identityCard }}</div>
            </div>

            <!-- Contact Info -->
            <div class="col-md-6 mb-3">
              <label class="form-label">Điện thoại 1 <span style="color:red">*</span></label>
              <input type="text" class="form-control" v-model="customer.phoneNumber1"
                :class="{ 'is-invalid': errors.phoneNumber1 }" :readonly="isViewOnly" />
              <div class="invalid-feedback">{{ errors.phoneNumber1 }}</div>
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label">Điện thoại 2</label>
              <input type="text" class="form-control" v-model="customer.phoneNumber2" :readonly="isViewOnly" />
            </div>

            <!-- Email and Gender -->
            <div class="col-md-6 mb-3">
              <label class="form-label">Email <span style="color:red">*</span></label>
              <input type="email" class="form-control" v-model="customer.email" :class="{ 'is-invalid': errors.email }"
                :readonly="isViewOnly" />
              <div class="invalid-feedback">{{ errors.email }}</div>
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label">Giới tính <span style="color:red">*</span></label>
              <div>
                <div class="form-check form-check-inline">
                  <input type="radio" class="form-check-input" v-model="customer.gender" value="Nam"
                    :disabled="isViewOnly" />
                  <label class="form-check-label">Nam</label>
                </div>
                <div class="form-check form-check-inline">
                  <input type="radio" class="form-check-input" v-model="customer.gender" value="Nữ"
                    :disabled="isViewOnly" />
                  <label class="form-check-label">Nữ</label>
                </div>
              </div>
            </div>

            <!-- Additional Info -->
            <div class="col-md-6 mb-3">
              <label class="form-label">Ngày sinh</label>
              <input type="date" class="form-control" v-model="customer.birthDate" :readonly="isViewOnly" />
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label">Địa chỉ thường trú</label>
              <input type="text" class="form-control" v-model="customer.address" :readonly="isViewOnly" />
            </div>

            <!-- Room Details -->
            <div class="col-md-6 mb-3">
              <label class="form-label">Phòng số <span style="color:red">*</span></label>
              <input type="text" class="form-control" v-model="customer.roomNumber" readonly />
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label">Ngày bắt đầu <span style="color:red">*</span></label>
              <input type="date" class="form-control" v-model="customer.startDate"
                :class="{ 'is-invalid': errors.startDate }" :readonly="isViewOnly" />
              <div class="invalid-feedback">{{ errors.startDate }}</div>
            </div>

            <!-- Financial Details -->
            <div class="col-md-6 mb-3">
              <label class="form-label">Tiền phòng (VNĐ) <span style="color:red">*</span></label>
              <input type="number" class="form-control" v-model="customer.rentalCost"
                :class="{ 'is-invalid': errors.rentalCost }" readonly />
              <div class="invalid-feedback">{{ errors.rentalCost }}</div>
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label">Tiền đặt cọc (VNĐ) <span style="color:red">*</span></label>
              <input type="number" class="form-control" v-model="customer.deposit"
                :class="{ 'is-invalid': errors.deposit }" :readonly="isViewOnly" />
              <div class="invalid-feedback">{{ errors.deposit }}</div>
            </div>

            <!-- Payment Details -->
            <div class="col-md-6 mb-3">
              <label class="form-label">Kỳ thanh toán <span style="color:red">*</span></label>
              <select class="form-select" v-model="customer.paymentCycle" :disabled="isViewOnly">
                <option value="Kỳ 30">Kỳ 30</option>
                <option value="Kỳ 15">Kỳ 15</option>
              </select>
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label">Số tháng thanh toán <span style="color:red">*</span></label>
              <input type="number" class="form-control" v-model="customer.paymentFrequency" min="1"
                :readonly="isViewOnly" />
            </div>

            <!-- Notes and Image -->
            <div class="col-md-6 mb-3">
              <label class="form-label">Ghi chú</label>
              <textarea class="form-control" v-model="customer.notes" rows="3" :readonly="isViewOnly"></textarea>
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label">Hình ảnh</label>
              <input type="file" class="form-control" @change="handleImageUpload" accept="image/*"
                :disabled="isViewOnly" />
              <img v-if="customer.image" :src="customer.image" class="mt-2 img-thumbnail" style="max-height: 200px" />
            </div>

          </div>
        </div>

        <!-- Services Tab -->
        <div v-show="activeTab == 'services'" class="tab-pane fade show active">
          <div class="alert alert-info">
            Vui lòng chọn các dịch vụ cho khách thuê
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Chọn</th>
                <th>Tên dịch vụ</th>
                <th>Đơn giá (VNĐ)</th>
                <th>Số lượng</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="service in services" :key="service.id">
                <td>
                  <input type="checkbox" v-model="service.selected" :disabled="isViewOnly" />
                </td>
                <td>{{ service.name }}</td>
                <td>{{ formatCurrency(service.price) }}</td>
                <td>
                  <input type="number" class="form-control" v-model="service.quantity" min="1"
                    :disabled="!service.selected || isViewOnly" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Members Tab -->
        <div v-show="activeTab == 'members'" class="tab-pane fade show active">
          <div class="mb-3">
            <button v-if="!isViewOnly" class="btn btn-primary mb-3" @click.prevent="addMember">
              <i class="fa fa-plus"></i> Thêm thành viên
            </button>
          </div>

          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Ngày sinh</th>
                  <th>Giới tính</th>
                  <th>CMND/CCCD</th>
                  <th>Địa chỉ</th>
                  <th>Điện thoại</th>
                  <th>Biển số xe</th>
                  <th v-if="!isViewOnly">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(member, index) in members" :key="index">
                  <td>
                    <input type="text" class="form-control" v-model="member.fullName" :readonly="isViewOnly" />
                  </td>
                  <td>
                    <input type="date" class="form-control" v-model="member.birthDate" :readonly="isViewOnly" />
                  </td>
                  <td>
                    <select class="form-select" v-model="member.gender" :disabled="isViewOnly">
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </td>
                  <td>
                    <input type="text" class="form-control" v-model="member.identityCard" :readonly="isViewOnly" />
                  </td>
                  <td>
                    <input type="text" class="form-control" v-model="member.address" :readonly="isViewOnly" />
                  </td>
                  <td>
                    <input type="text" class="form-control" v-model="member.phoneNumber" :readonly="isViewOnly" />
                  </td>
                  <td>
                    <input type="text" class="form-control" v-model="member.licensePlate" :readonly="isViewOnly" />
                  </td>
                  <td v-if="!isViewOnly">
                    <button class="btn btn-danger btn-sm" @click="removeMember(index)">
                      <i class="fa fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Contract Tab -->
        <div v-show="activeTab == 'contract'" class="tab-pane fade show active">
          <div class="alert alert-info">
            Thông tin hợp đồng sẽ được sử dụng để in hợp đồng thuê phòng
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Số hợp đồng <span style="color:red">*</span></label>
              <input type="text" class="form-control" v-model="contract.contractNumber"
                :class="{ 'is-invalid': errors.contractNumber }" :readonly="isViewOnly" />
              <div class="invalid-feedback">{{ errors.contractNumber }}</div>
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label">Ngày ký <span style="color:red">*</span></label>
              <input type="date" class="form-control" v-model="contract.contractDate"
                :class="{ 'is-invalid': errors.contractDate }" :readonly="isViewOnly" />
              <div class="invalid-feedback">{{ errors.contractDate }}</div>
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label">Thời hạn (tháng) <span style="color:red">*</span></label>
              <input type="number" class="form-control" v-model="contract.contractDuration" min="1"
                @input="updateEndDate" :readonly="isViewOnly" />
            </div>

            <div class="col-md-6 mb-3">
              <label class="form-label">Ngày kết thúc <span style="color:red">*</span></label>
              <input type="date" class="form-control" v-model="contract.contractEndDate" readonly />
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import crudApi from '@/apis/crudApi';
import Swal from 'sweetalert2';

export default {
  name: 'CreateCustomer',

  data() {
    return {
      roomId: null,
      houseId: null,
      isViewOnly: false,
      isEditMode: false,
      activeTab: 'customer-info',

      tabs: [
        { id: 'customer-info', name: 'Thông tin khách thuê' },
        { id: 'services', name: 'Dịch vụ' },
        { id: 'members', name: 'Thành viên' },
        { id: 'contract', name: 'Hợp đồng' }
      ],

      customer: {
        fullName: '',
        identityCard: '',
        gender: 'Nam',
        phoneNumber1: '',
        phoneNumber2: '',
        email: '',
        birthDate: '',
        address: '',
        roomNumber: '',
        startDate: new Date().toISOString().split('T')[0],
        rentalCost: 0,
        deposit: 0,
        paymentCycle: 'Kỳ 30',
        paymentFrequency: 1,
        notes: '',
        image: null
      },

      services: [],

      members: [],

      contract: {
        contractNumber: '',
        contractDate: new Date().toISOString().split('T')[0],
        contractDuration: 12,
        contractEndDate: ''
      },

      errors: {
        fullName: '',
        identityCard: '',
        phoneNumber1: '',
        email: '',
        startDate: '',
        deposit: '',
        contractNumber: '',
        contractDate: ''
      },
    };
  },

  computed: {
    pageTitle() {
      if (this.isViewOnly) return 'Xem thông tin khách thuê';
      if (this.isEditMode) return 'Sửa thông tin khách thuê';
      return 'Thêm khách thuê';
    }
  },

  async mounted() {
    try {
      // Get query parameters
      this.roomId = this.$route.query.roomId;
      this.houseId = this.$route.query.houseId;
      this.isViewOnly = this.$route.query.viewOnly == 'true';
      this.isEditMode = this.$route.query.editMode == 'true';

      // Get current landlord from localStorage
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser?.id || currentUser.role !== 'landlord') {
        throw new Error('Không tìm thấy thông tin chủ trọ!');
      }

      if (!this.roomId || !this.houseId) {
        throw new Error('Thiếu thông tin phòng hoặc nhà!');
      }

      // Fetch room and home data
      const [roomResponse, homeResponse] = await Promise.all([
        crudApi.read('api::room.room', { id: this.roomId }),
        crudApi.read('api::home.home', { id: this.houseId }),
      ]);

      const roomData = roomResponse.data[0];
      const homeData = homeResponse.data[0];

      // Set room details
      this.customer.roomNumber = roomData.roomNumber;
      this.customer.rentalCost = roomData.price || homeData.price || 0;

      // Fetch services for current landlord
      const servicesResponse = await crudApi.read('api::service.service', { landlordId: { id: currentUser.id } });
      if (servicesResponse.error) {
        throw new Error('Không thể tải danh sách dịch vụ!');
      }
      const servicesData = servicesResponse.data;

      this.services = servicesData.map(service => ({
        ...service,
        selected: false,
        quantity: 1
      }));

      // If editing or viewing, fetch customer data
      if (this.isEditMode || this.isViewOnly) {
        await this.fetchCustomerData();
      }

      // Initialize contract end date
      this.updateEndDate();

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: error.message || 'Không thể tải dữ liệu!'
      });
      this.goBack();
    }
  },

  methods: {
    async updateRentalCost() {
      try {

        const roomResponse = await crudApi.read('api::room.room', { id: this.roomId });
        const roomData = roomResponse.data[0];

        const homeResponse = crudApi.read('api::home.home', { id: this.houseId });
        const homeData = homeResponse.data[0];


        this.customer.rentalCost = roomData.price || homeData.price || 0;
      } catch (error) {
        console.error('Error updating rental cost:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Không thể cập nhật giá thuê phòng!'
        });
      }
    },

    async fetchCustomerData() {
      try {
        const response = await crudApi.read('api::customer.customer', { rooms: { id: this.roomId } });
        const customers = response.data;

        if (customers.length > 0) {
          const customerData = customers[0];
          this.customer = { ...this.customer, ...customerData };

          this.members = customerData.members || [];
          this.contract = customerData.contracts?.[0] || this.contract;


          // Update services selection
          if (customerData.services) {
            this.services = this.services.map(service => {
              const selectedService = customerData.services.find(s => s.id == service.id);
              return selectedService ?
                { ...service, selected: true, quantity: selectedService.quantity } :
                service;
            });
          }
        }
      } catch (error) {
        throw new Error('Không thể tải thông tin khách thuê!');
      }
    },

    setActiveTab(tabId) {
      this.activeTab = tabId;
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(value);
    },

    async handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "cozy-home"); // Thay bằng upload preset của bạn
      formData.append("cloud_name", "djnt4wlng"); // Thay bằng cloud name của bạn

      try {
        const response = await fetch(
          "https://api.cloudinary.com/v1_1/djnt4wlng/image/upload", // Thay `your_cloud_name` bằng tên cloud của bạn
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        this.customer.image = data.secure_url; // Lưu URL ảnh vào thuộc tính `image` của customer
        Swal.fire({
          icon: 'success',
          title: 'Tải ảnh thành công!',
          text: 'Ảnh đã được tải lên Cloudinary và URL đã lưu vào hệ thống.',
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi tải ảnh!',
          text: 'Không thể tải ảnh lên Cloudinary.',
        });
      }
    },

    addMember() {
      this.members.push({
        fullName: '', // Họ tên
        birthDate: '', // Ngày sinh
        gender: 'Nam', // Giới tính mặc định
        identityCard: '', // CMND/CCCD
        address: '', // Địa chỉ
        phoneNumber: '', // Điện thoại
        licensePlate: '' // Biển số xe
      });
    },

    removeMember(index) {
      this.members.splice(index, 1); // Xóa thành viên tại vị trí chỉ định
    },


    updateEndDate() {
      if (this.contract.contractDate && this.contract.contractDuration) {
        const startDate = new Date(this.contract.contractDate);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + parseInt(this.contract.contractDuration));
        this.contract.contractEndDate = endDate.toISOString().split('T')[0];
      }
    },

    validateForm() {
      this.errors = {
        fullName: '',
        identityCard: '',
        phoneNumber1: '',
        email: '',
        startDate: '',
        deposit: '',
        contractNumber: '',
        contractDate: '',
        rentalCost: ''
      };

      console.log("this.customer", this.customer);

      if (!this.customer.fullName) {
        this.errors.fullName = 'Vui lòng nhập họ tên';
      }
      if (!this.customer.identityCard) {
        this.errors.identityCard = 'Vui lòng nhập CMND/CCCD';
      }
      if (!this.customer.phoneNumber1) {
        this.errors.phoneNumber1 = 'Vui lòng nhập số điện thoại';
      }
      if (!this.customer.email) {
        this.errors.email = 'Vui lòng nhập email';
      }
      if (!this.customer.startDate) {
        this.errors.startDate = 'Vui lòng chọn ngày bắt đầu';
      }
      if (!this.customer.deposit) {
        this.errors.deposit = 'Vui lòng nhập tiền đặt cọc';
      }
      if (!this.contract.contractNumber) {
        this.errors.contractNumber = 'Vui lòng nhập số hợp đồng';
      }
      if (!this.contract.contractDate) {
        this.errors.contractDate = 'Vui lòng chọn ngày ký hợp đồng';
      }
      if (!this.customer.rentalCost || this.customer.rentalCost <= 0) {
        this.errors.rentalCost = 'Giá thuê phòng không hợp lệ';
      }

      return Object.values(this.errors).every(error => !error);
    },

    async saveCustomer() {
      try {
        // 1. Validate form
        if (!this.validateForm()) {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Vui lòng điền đầy đủ thông tin bắt buộc!',
          });
          return;
        }

        // 2. Show loading
        Swal.fire({
          title: 'Đang xử lý...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // 3. Fetch current room and home data
        const [roomResponse, homeResponse] = await Promise.all([
          crudApi.read('api::room.room', { id: this.roomId }),
          crudApi.read('api::home.home', { id: this.houseId }),
        ]);

        const roomData = roomResponse.data[0];
        const homeData = homeResponse.data[0];

        // 4. Prepare customer data
        const customerData = {
          fullName: this.customer.fullName,
          identityCard: this.customer.identityCard,
          gender: this.customer.gender,
          phoneNumber1: this.customer.phoneNumber1,
          phoneNumber2: this.customer.phoneNumber2 || '',
          email: this.customer.email,
          birthDate: this.customer.birthDate || '',
          address: this.customer.address || '',
          roomId: this.roomId,
          rooms: this.roomId,
          houseId: this.houseId,
          roomNumber: this.customer.roomNumber,
          startDate: this.customer.startDate,
          rentalCost: roomData.price || homeData.price || 0,
          deposit: this.customer.deposit,
          paymentCycle: this.customer.paymentCycle,
          paymentFrequency: this.customer.paymentFrequency,
          notes: this.customer.notes || '',
          image: this.customer.image || '',

          // Process selected services
          services: this.services
            .filter(s => s.selected)
            .map(s => ({
              id: s.id,
              name: s.name,
              price: s.price,
              quantity: s.quantity
            })),

          // Process members
          members: this.members.map(member => ({
            fullName: member.fullName,
            birthDate: member.birthDate || '',
            gender: member.gender,
            identityCard: member.identityCard || '',
            address: member.address || '',
            phoneNumber: member.phoneNumber || '',
            licensePlate: member.licensePlate || ''
          })),

          // Process contract
          contracts: [{
            contractNumber: this.contract.contractNumber,
            contractDate: this.contract.contractDate,
            contractDuration: this.contract.contractDuration,
            contractEndDate: this.contract.contractEndDate
          }]
        };

        const customerResponse = this.isEditMode
          ? await crudApi.update('api::customer.customer', { id: this.customer.id }, customerData)
          : await crudApi.create('api::customer.customer', customerData);

        if (customerResponse.error) {
          throw new Error('Không thể lưu thông tin khách thuê!');
        }

        // 6. Update room status
        const roomUpdateResponse = await crudApi.update('api::room.room', { id: this.roomId }, {
          isRented: true,
          isPaid: false,
          lastUpdated: new Date().toISOString()
        });

        if (roomUpdateResponse.error) {
          throw new Error('Không thể cập nhật trạng thái phòng!');
        }

        // 7. Show success message
        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: `${this.isEditMode ? 'Cập nhật' : 'Thêm'} thông tin khách thuê thành công!`,
          confirmButtonText: 'OK'
        });

        // 8. Navigate back
        this.$router.push('/landlord/room-index');

      } catch (error) {
        console.error('Save customer error:', error);

        // Show error message
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: error.message || 'Không thể lưu thông tin khách thuê!',
          confirmButtonText: 'Đóng'
        });
      }
    },

    goBack() {
      this.$router.push('/landlord/room-index');
    }
  }
};
</script>

<style scoped>
.create-customer {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.nav-tabs .nav-link {
  cursor: pointer;
  color: #495057;
}

.nav-tabs .nav-link.active {
  color: #007bff;
  font-weight: 500;
}

.form-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.invalid-feedback {
  display: block;
  margin-top: 0.25rem;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 500;
}

.btn-danger {
  padding: 0.25rem 0.5rem;
}

.img-thumbnail {
  max-width: 200px;
  height: auto;
}

.alert {
  margin-bottom: 1.5rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .create-customer {
    padding: 1rem;
  }

  .table-responsive {
    margin-bottom: 1rem;
  }

  .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}
</style>