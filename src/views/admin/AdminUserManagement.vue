<template>
  <div class="admin-user-management container-fluid">
    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <h1 class="dashboard-title my-4">
      <i class="fas fa-users"></i> Quản Lý Người Dùng
    </h1>

    <!-- Error Alert -->
    <div
      v-if="error"
      class="alert alert-danger alert-dismissible fade show"
      role="alert"
    >
      {{ error }}
      <button type="button" class="btn-close" @click="error = null"></button>
    </div>

    <!-- Dashboard Summary Cards -->
    <div class="dashboard-summary row g-4 mb-4">
      <div class="col-12 col-md-6 col-lg-3">
        <div class="summary-card">
          <div class="card-body">
            <h5 class="card-title">Tổng Người Dùng</h5>
            <h3 class="card-value">{{ users.length }}</h3>
            <div class="card-icon">
              <i class="fas fa-users"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-6 col-lg-3">
        <div class="summary-card">
          <div class="card-body">
            <h5 class="card-title">Quản Trị Viên</h5>
            <h3 class="card-value">{{ adminCount }}</h3>
            <div class="card-icon">
              <i class="fas fa-user-shield"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-6 col-lg-3">
        <div class="summary-card">
          <div class="card-body">
            <h5 class="card-title">Chủ Nhà</h5>
            <h3 class="card-value">{{ landlordCount }}</h3>
            <div class="card-icon">
              <i class="fas fa-house-user"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-6 col-lg-3">
        <div class="summary-card">
          <div class="card-body">
            <h5 class="card-title">Người Thuê</h5>
            <h3 class="card-value">{{ tenantCount }}</h3>
            <div class="card-icon">
              <i class="fas fa-user"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- User Management Section -->
    <div class="user-management mb-5">
      <div
        class="section-header d-flex justify-content-between align-items-center mb-4"
      >
        <h2><i class="fas fa-user-cog"></i> Danh Sách Người Dùng</h2>
        <button @click="showAddUserModal = true" class="btn btn-primary">
          <i class="fas fa-plus me-1"></i> Thêm Người Dùng
        </button>
      </div>

      <!-- Filter & Search Bar -->
      <div class="filter-search-bar mb-4">
        <div class="row g-3">
          <div class="col-12 col-md-4">
            <div class="search-box">
              <input
                v-model="searchTerm"
                @input="searchUsers"
                type="text"
                class="form-control"
                placeholder="Tìm kiếm theo email hoặc tên..."
              />
            </div>
          </div>
          <div class="col-12 col-md-4">
            <select
              v-model="roleFilter"
              @change="paginateUsers"
              class="form-select"
            >
              <option value="">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="landlord">Chủ nhà</option>
              <option value="tenant">Người thuê</option>
            </select>
          </div>
          <div class="col-12 col-md-4">
            <select
              v-model="statusFilter"
              @change="paginateUsers"
              class="form-select"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Vô hiệu hóa</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th @click="sortBy('id')">
                ID
                <i
                  v-if="sortKey == 'id'"
                  :class="['fas', sortAsc ? 'fa-sort-up' : 'fa-sort-down']"
                ></i>
              </th>
              <th @click="sortBy('name')">
                Tên
                <i
                  v-if="sortKey == 'name'"
                  :class="['fas', sortAsc ? 'fa-sort-up' : 'fa-sort-down']"
                ></i>
              </th>
              <th @click="sortBy('email')">
                Email
                <i
                  v-if="sortKey == 'email'"
                  :class="['fas', sortAsc ? 'fa-sort-up' : 'fa-sort-down']"
                ></i>
              </th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="6" class="text-center">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Đang tải...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="paginatedUsers.length == 0">
              <td colspan="6" class="text-center">Không có người dùng nào</td>
            </tr>
            <tr v-else v-for="user in paginatedUsers" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.username || 'N/A' }}</td>
              <td>{{ user.email }}</td>
              <td>
                <select
                  v-model="user.customRole"
                  @change="changeUserRole(user.id, user.customRole)"
                  class="form-select form-select-sm"
                >
                  <option value="admin">Quản trị viên</option>
                  <option value="landlord">Chủ nhà</option>
                  <option value="tenant">Người thuê</option>
                </select>
              </td>
              <td>
                <span
                  :class="[
                    'status-badge',
                    user.customStatus === 'active' ? 'paid' : 'unpaid',
                  ]"
                >
                  <i
                    :class="[
                      'fas',
                      user.customStatus === 'active'
                        ? 'fa-check-circle'
                        : 'fa-ban',
                    ]"
                  ></i>
                  {{
                    user.customStatus === 'active' ? 'Hoạt động' : 'Vô hiệu hóa'
                  }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button
                    @click="editUser(user)"
                    class="btn btn-icon"
                    title="Chỉnh sửa"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="confirmDeleteUser(user.id)"
                    class="btn btn-icon danger"
                    title="Xóa"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                  <button
                    @click="toggleUserStatus(user.id)"
                    class="btn btn-icon"
                    :class="user.status == 'active' ? 'warning' : 'success'"
                    :title="
                      user.status == 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'
                    "
                  >
                    <i
                      :class="[
                        'fas',
                        user.status == 'active' ? 'fa-ban' : 'fa-check',
                      ]"
                    ></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <nav v-if="filteredUsers.length > 0" class="mt-4">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: currentPage == 1 }">
            <button class="page-link" @click="prevPage">
              <i class="fas fa-chevron-left"></i> Trang trước
            </button>
          </li>
          <li
            v-for="page in totalPages"
            :key="page"
            class="page-item"
            :class="{ active: currentPage == page }"
          >
            <button class="page-link" @click="currentPage = page">
              {{ page }}
            </button>
          </li>
          <li
            class="page-item"
            :class="{ disabled: currentPage == totalPages }"
          >
            <button class="page-link" @click="nextPage">
              Trang sau <i class="fas fa-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Add/Edit User Modal -->
    <div
      v-if="showAddUserModal || showEditUserModal"
      class="modal fade show d-block"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i
                :class="[
                  'fas',
                  showEditUserModal ? 'fa-edit' : 'fa-plus-circle',
                  'me-2',
                ]"
              ></i>
              {{ showEditUserModal ? 'Sửa người dùng' : 'Thêm người dùng mới' }}
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModal"
            ></button>
          </div>
          <div class="modal-body">
            <form
              @submit.prevent="handleSubmit"
              class="needs-validation"
              novalidate
            >
              <div class="mb-3">
                <label for="username" class="form-label required"
                  >Tên người dùng</label
                >
                <input
                  type="text"
                  id="username"
                  v-model="modalUser.username"
                  class="form-control"
                  :class="{ 'is-invalid': nameError }"
                  required
                  minlength="3"
                />
                <div class="invalid-feedback">{{ nameError }}</div>
              </div>
              <div class="mb-3">
                <label for="email" class="form-label required">Email</label>
                <input
                  type="email"
                  id="email"
                  v-model="modalUser.email"
                  @blur="validateEmail"
                  @input="checkEmailLength"
                  maxlength="256"
                  class="form-control"
                  :class="{ 'is-invalid': emailError }"
                  required
                />
                <div class="invalid-feedback">{{ emailError }}</div>
              </div>

              <div class="mb-3" v-if="!showEditUserModal">
                <label for="password" class="form-label required"
                  >Mật khẩu</label
                >
                <div class="input-group">
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    id="password"
                    v-model="modalUser.password"
                    class="form-control"
                    :class="{ 'is-invalid': passwordError }"
                    @blur="validatePassword"
                    required
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="showPassword = !showPassword"
                  >
                    <i
                      :class="['fas', showPassword ? 'fa-eye-slash' : 'fa-eye']"
                    ></i>
                  </button>
                </div>
                <div class="invalid-feedback" v-if="passwordError">
                  {{ passwordError }}
                </div>
                <small class="text-muted">
                  Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường,
                  số và ký tự đặc biệt.
                </small>
              </div>

              <div class="mb-3">
                <label for="role" class="form-label required">Vai trò</label>
                <select
                  id="role"
                  v-model="modalUser.role"
                  class="form-select"
                  required
                >
                  <option value="admin">Quản trị viên</option>
                  <option value="landlord">Chủ nhà</option>
                  <option value="tenant">Người thuê</option>
                </select>
              </div>

              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                  @click="closeModal"
                >
                  <i class="fas fa-times me-2"></i>Hủy
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="isSubmitting"
                >
                  <i class="fas fa-save me-2"></i>
                  {{ showEditUserModal ? 'Cập nhật' : 'Thêm' }}
                  <span
                    v-if="isSubmitting"
                    class="spinner-border spinner-border-sm ms-2"
                  ></span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal backdrop -->
    <div
      v-if="showAddUserModal || showEditUserModal"
      class="modal-backdrop fade show"
    ></div>
  </div>
</template>

<script>
import Swal from 'sweetalert2';
// import axios from "axios";
import crudApi from '@/apis/crudApi';

export default {
  name: 'AdminUserManagement',

  data() {
    return {
      users: [],
      filteredUsers: [],
      error: null,
      loading: false,
      isLoading: false,
      isSearching: false,
      isSubmitting: false,

      // Pagination
      currentPage: 1,
      pageSize: 10,

      // Filters
      searchTerm: '',
      roleFilter: '',
      statusFilter: '',
      sortKey: '',
      sortAsc: true,

      // Modals
      showAddUserModal: false,
      showEditUserModal: false,
      showPassword: false,

      // Form validation
      emailError: '',
      passwordError: '',
      nameError: '',

      // Modal user data
      modalUser: {
        username: '',
        email: '',
        password: '',
        customRole: 'tenant',
        customStatus: 'active',
        confirmed: true,
        blocked: false,
        provider: 'local',
      },

      debounceTimeout: null,
    };
  },

  computed: {
    adminCount() {
      return (
        this.users?.filter((user) => user?.customRole === 'admin')?.length || 0
      );
    },

    landlordCount() {
      return (
        this.users?.filter((user) => user?.customRole === 'landlord')?.length ||
        0
      );
    },

    tenantCount() {
      return (
        this.users?.filter((user) => user?.customRole === 'tenant')?.length || 0
      );
    },

    paginatedUsers() {
      if (!this.filteredUsers) return [];
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + parseInt(this.pageSize, 10);
      return this.filteredUsers.slice(start, end);
    },

    totalPages() {
      if (!this.filteredUsers) return 0;
      return Math.ceil(this.filteredUsers.length / this.pageSize);
    },
  },

  methods: {
    async fetchUsers() {
      this.loading = true;
      this.error = null;
      try {
        const response = await crudApi.read('plugin::users-permissions.user');
        // Đảm bảo dữ liệu trả về có đầy đủ các trường cần thiết
        this.users = response.data.map((user) => ({
          id: user.id,
          username: user.username || '',
          email: user.email || '',
          customRole: user.customRole || 'landlord', // Giá trị mặc định nếu không có
          customStatus: user.customStatus || 'active', // Giá trị mặc định nếu không có
        }));
        this.paginateUsers();
      } catch (error) {
        this.error =
          'Không thể tải danh sách người dùng. Vui lòng thử lại sau.';
        console.error('Error fetching users:', error);
      } finally {
        this.loading = false;
      }
    },

    validateName() {
      this.modalUser.username = this.modalUser.username.trim();
      if (!this.modalUser.username) {
        this.nameError = 'Tên không được để trống';
        return false;
      }
      if (this.modalUser.username.length < 3) {
        this.nameError = 'Tên phải có ít nhất 3 ký tự';
        return false;
      }
      this.nameError = '';
      return true;
    },

    checkEmailLength() {
      if (this.modalUser.email.length > 256) {
        this.emailError = 'Email không được vượt quá 256 ký tự';
        return false;
      }
      this.emailError = '';
      return true;
    },

    validateEmail() {
      this.modalUser.email = this.modalUser.email.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const sqlInjectionPattern = /['";]/;

      if (!this.modalUser.email) {
        this.emailError = 'Email không được để trống';
        return false;
      }

      if (sqlInjectionPattern.test(this.modalUser.email)) {
        this.emailError = 'Email chứa ký tự không hợp lệ';
        return false;
      }

      if (!emailPattern.test(this.modalUser.email)) {
        this.emailError = 'Email không đúng định dạng';
        return false;
      }

      return true;
    },

    validatePassword() {
      if (!this.showEditUserModal) {
        const passwordPattern =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!this.modalUser.password) {
          this.passwordError = 'Mật khẩu không được để trống';
          return false;
        }

        if (!passwordPattern.test(this.modalUser.password)) {
          this.passwordError =
            'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt';
          return false;
        }
      }
      this.passwordError = '';
      return true;
    },

    validateForm() {
      const isNameValid = this.validateName();
      const isEmailValid = this.validateEmail();
      const isPasswordValid = this.validatePassword();
      return isNameValid && isEmailValid && isPasswordValid;
    },

    searchUsers() {
      clearTimeout(this.debounceTimeout);
      this.isSearching = true;

      this.debounceTimeout = setTimeout(() => {
        this.paginateUsers();
        this.isSearching = false;
      }, 300);
    },

    paginateUsers() {
      let filteredUsers = [...this.users];

      // Apply search filter
      if (this.searchTerm) {
        const searchTerm = this.searchTerm.toLowerCase();
        filteredUsers = filteredUsers.filter(
          (user) =>
            user.name?.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
      }

      // Apply role filter
      if (this.roleFilter) {
        filteredUsers = filteredUsers.filter(
          (user) => user.role == this.roleFilter
        );
      }

      // Apply status filter
      if (this.statusFilter) {
        filteredUsers = filteredUsers.filter(
          (user) => user.status == this.statusFilter
        );
      }

      // Apply sorting
      if (this.sortKey) {
        filteredUsers.sort((a, b) => {
          let valueA = a[this.sortKey];
          let valueB = b[this.sortKey];

          if (valueA == null || valueA == undefined) valueA = '';
          if (valueB == null || valueB == undefined) valueB = '';

          if (typeof valueA == 'string') valueA = valueA.toLowerCase();
          if (typeof valueB == 'string') valueB = valueB.toLowerCase();

          if (valueA < valueB) return this.sortAsc ? -1 : 1;
          if (valueA > valueB) return this.sortAsc ? 1 : -1;
          return 0;
        });
      }

      this.filteredUsers = filteredUsers;
      this.currentPage = 1;
    },

    sortBy(key) {
      if (this.sortKey == key) {
        this.sortAsc = !this.sortAsc;
      } else {
        this.sortKey = key;
        this.sortAsc = true;
      }
      this.paginateUsers();
    },

    async handleSubmit() {
      if (!this.validateForm()) return;

      this.isSubmitting = true;
      try {
        if (this.showEditUserModal) {
          await this.updateUser();
        } else {
          await this.createUser();
        }
      } finally {
        this.isSubmitting = false;
      }
    },

    async createUser() {
      try {
        const response = await crudApi.create(
          'plugin::users-permissions.user',
          {
            username: this.modalUser.username,
            email: this.modalUser.email,
            password: this.modalUser.password,
            customRole: this.modalUser.customRole,
            customStatus: this.modalUser.customStatus,
            confirmed: true,
            blocked: false,
            provider: 'local',
          }
        );

        // Create landlord info if role is landlord
        if (this.modalUser.customRole === 'landlord') {
          await crudApi.create('api::landlord-info.landlord-info', {
            userId: response.data.id,
            personalInfo: {
              name: this.modalUser.username,
              email: this.modalUser.email,
              phone: '',
              address: '',
            },
          });
        }

        this.users.unshift(response.data);
        this.paginateUsers();
        this.closeModal();

        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Người dùng mới đã được thêm thành công!',
        });
      } catch (error) {
        console.error('Error creating user:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không thể thêm người dùng. Vui lòng thử lại sau.',
        });
      }
    },
    async updateUser() {
      try {
        const updatedUser = {
          ...this.modalUser,
          name: this.modalUser.name.trim(),
          email: this.modalUser.email.trim(),
        };

        const response = await crudApi.update(
          'plugin::users-permissions.user',
          { id: this.modalUser.id },
          updatedUser
        );
        const index = this.users.findIndex(
          (user) => user.id == this.modalUser.id
        );

        if (index !== -1) {
          this.users.splice(index, 1, response.data);
          this.paginateUsers();
          this.closeModal();

          Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: 'Thông tin người dùng đã được cập nhật!',
          });
        }
      } catch (error) {
        console.error('Error updating user:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không thể cập nhật thông tin người dùng. Vui lòng thử lại sau.',
        });
      }
    },

    editUser(user) {
      this.modalUser = { ...user };
      this.showEditUserModal = true;
    },

    async confirmDeleteUser(id) {
      const result = await Swal.fire({
        title: 'Xác nhận xóa',
        text: 'Bạn có chắc chắn muốn xóa người dùng này?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
      });

      if (result.isConfirmed) {
        await this.deleteUser(id);
      }
    },

    async deleteUser(id) {
      try {
        await crudApi.delete('plugin::users-permissions.user', { id });
        this.users = this.users.filter((user) => user.id !== id);
        this.paginateUsers();

        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Người dùng đã được xóa thành công.',
        });
      } catch (error) {
        console.error('Error deleting user:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không thể xóa người dùng. Vui lòng thử lại sau.',
        });
      }
    },

    async changeUserRole(id, customRole) {
      try {
        await crudApi.update(
          'plugin::users-permissions.user',
          { id },
          { customRole }
        );

        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Vai trò người dùng đã được cập nhật!',
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error('Error changing user role:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không thể thay đổi vai trò người dùng. Vui lòng thử lại sau.',
        });
      }
    },

    async toggleUserStatus(id) {
      try {
        const user = this.users.find((user) => user.id == id);
        if (user) {
          const newStatus = user.status == 'active' ? 'inactive' : 'active';
          await crudApi.update(
            'plugin::users-permissions.user',
            { id },
            { status: newStatus }
          );
          user.status = newStatus;
          this.paginateUsers();

          Swal.fire({
            icon: newStatus == 'active' ? 'success' : 'warning',
            title: newStatus == 'active' ? 'Đã kích hoạt' : 'Đã vô hiệu hóa',
            text: `Người dùng đã được ${
              newStatus == 'active' ? 'kích hoạt' : 'vô hiệu hóa'
            }.`,
            timer: 1500,
            showConfirmButton: false,
          });
        }
      } catch (error) {
        console.error('Error toggling user status:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không thể thay đổi trạng thái người dùng. Vui lòng thử lại sau.',
        });
      }
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },

    resetFilters() {
      this.searchTerm = '';
      this.roleFilter = '';
      this.statusFilter = '';
      this.sortKey = '';
      this.sortAsc = true;
      this.currentPage = 1;
      this.paginateUsers();
    },

    closeModal() {
      this.showAddUserModal = false;
      this.showEditUserModal = false;
      this.modalUser = {
        id: null,
        username: '',
        email: '',
        password: '',
        customRole: 'tenant',
        customStatus: 'active',
        confirmed: true,
        blocked: false,
        provider: 'local',
      };
      this.emailError = '';
      this.passwordError = '';
      this.nameError = '';
      this.showPassword = false;
    },
  },

  async created() {
    await this.fetchUsers();
  },

  watch: {
    pageSize() {
      this.paginateUsers();
    },
  },
};
</script>

<style scoped>
.admin-user-management {
  margin-top: 80px;
  padding: 1.5rem;
  background-color: #f8f9fa;
  min-height: calc(100vh - 80px);
  height: auto;
}

.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.dashboard-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dashboard-title i {
  color: #3498db;
}

/* Summary Cards */
.summary-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  height: 100%;
  transition: transform 0.2s;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.summary-card .card-body {
  padding: 1.25rem;
  position: relative;
}

.card-title {
  font-size: 0.875rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.card-value {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.card-icon {
  position: absolute;
  right: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.75rem;
  opacity: 0.2;
  color: #2c3e50;
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h2 {
  font-size: 1.25rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Filter Search Bar */
.filter-search-bar {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Table Styles */
.table-responsive {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
}

.table {
  margin: 0;
  font-size: 0.875rem;
}

.table th {
  background: #f8f9fa;
  font-weight: 600;
  padding: 0.75rem;
  border-bottom: 2px solid #dee2e6;
  cursor: pointer;
}

.table td {
  padding: 0.75rem;
  vertical-align: middle;
}

/* Status Badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.75rem;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.status-badge.paid {
  background-color: rgba(40, 199, 111, 0.1);
  color: #28c76f;
  border: 1px solid rgba(40, 199, 111, 0.2);
}

.status-badge.unpaid {
  background-color: rgba(234, 84, 85, 0.1);
  color: #ea5455;
  border: 1px solid rgba(234, 84, 85, 0.2);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.375rem;
}

.btn-primary {
  background-color: #3498db;
  border-color: #3498db;
}

.btn-secondary {
  background-color: #fff;
  border-color: #6c757d;
  color: #3b3d3e;
}

.btn-icon {
  padding: 0.4rem;
  border-radius: 4px;
  color: #666;
  border: 1px solid #ddd;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background-color: #f8f9fa;
}

.btn-icon.danger {
  color: #dc3545;
}

.btn-icon.warning {
  color: #ffc107;
}

.btn-icon.success {
  color: #28a745;
}

/* Modal Styles */
.modal-content {
  border-radius: 8px;
  border: none;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #dee2e6;
}

.required::after {
  content: ' *';
  color: red;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .admin-user-management {
    padding: 1rem;
  }

  .dashboard-summary {
    margin-bottom: 1rem;
  }

  .card-value {
    font-size: 1.25rem;
  }

  .card-icon {
    font-size: 1.5rem;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .filter-search-bar .row > * {
    margin-bottom: 0.75rem;
  }
}

/* Utility Classes */
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shadow-sm {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
}

.transition {
  transition: all 0.2s ease;
}
</style>
