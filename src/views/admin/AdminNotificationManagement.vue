<template>
  <div class="admin-notification-management container-fluid">
    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <h1 class="dashboard-title my-4">
      <i class="fas fa-bell"></i> Quản Lý Thông Báo
    </h1>

    <!-- Error Alert -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ error }}
      <button type="button" class="btn-close" @click="error = null"></button>
    </div>

    <!-- Dashboard Summary Cards -->
    <div class="dashboard-summary row g-4 mb-4">
      <div class="col-12 col-md-6 col-lg-3">
        <div class="summary-card">
          <div class="card-body">
            <h5 class="card-title">Tổng Thông Báo</h5>
            <h3 class="card-value">{{ notifications.length }}</h3>
            <div class="card-icon">
              <i class="fas fa-bell"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-6 col-lg-3">
        <div class="summary-card">
          <div class="card-body">
            <h5 class="card-title">Đã Gửi</h5>
            <h3 class="card-value">{{ sentCount }}</h3>
            <div class="card-icon">
              <i class="fas fa-paper-plane"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-6 col-lg-3">
        <div class="summary-card">
          <div class="card-body">
            <h5 class="card-title">Lên Lịch</h5>
            <h3 class="card-value">{{ scheduledCount }}</h3>
            <div class="card-icon">
              <i class="fas fa-clock"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-6 col-lg-3">
        <div class="summary-card">
          <div class="card-body">
            <h5 class="card-title">Bản Nháp</h5>
            <h3 class="card-value">{{ draftCount }}</h3>
            <div class="card-icon">
              <i class="fas fa-file-alt"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification Management Section -->
    <div class="notification-management mb-5">
      <div class="section-header d-flex justify-content-between align-items-center mb-4">
        <h2><i class="fas fa-bell"></i> Danh Sách Thông Báo</h2>
        <button @click="openCreateModal" class="btn btn-primary">
          <i class="fas fa-plus me-1"></i> Tạo Thông Báo
        </button>
      </div>

      <!-- Filter & Search Bar -->
      <div class="filter-search-bar mb-4">
        <div class="row g-3">
          <div class="col-12 col-md-3">
            <div class="search-box">
              <input v-model="searchTerm" @input="searchNotifications" type="text" class="form-control"
                placeholder="Tìm kiếm thông báo...">
            </div>
          </div>
          <div class="col-12 col-md-3">
            <select v-model="typeFilter" @change="filterNotifications" class="form-select">
              <option value="">Tất cả loại</option>
              <option value="system">Hệ thống</option>
              <option value="promotion">Khuyến mãi</option>
              <option value="update">Cập nhật</option>
              <option value="alert">Cảnh báo</option>
            </select>
          </div>
          <div class="col-12 col-md-3">
            <select v-model="statusFilter" @change="filterNotifications" class="form-select">
              <option value="">Tất cả trạng thái</option>
              <option value="draft">Bản nháp</option>
              <option value="scheduled">Đã lên lịch</option>
              <option value="sent">Đã gửi</option>
            </select>
          </div>
          <div class="col-12 col-md-3">
            <select v-model="targetFilter" @change="filterNotifications" class="form-select">
              <option value="">Tất cả đối tượng</option>
              <option value="all">Tất cả người dùng</option>
              <option value="tenant">Người thuê</option>
              <option value="landlord">Chủ trọ</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Notifications Table -->
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th @click="sortBy('id')">ID
                <i v-if="sortKey == 'id'" :class="['fas', sortAsc ? 'fa-sort-up' : 'fa-sort-down']"></i>
              </th>
              <th @click="sortBy('title')">Tiêu đề
                <i v-if="sortKey == 'title'" :class="['fas', sortAsc ? 'fa-sort-up' : 'fa-sort-down']"></i>
              </th>
              <th>Loại</th>
              <th>Đối tượng</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Đang tải...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="filteredNotifications.length == 0">
              <td colspan="7" class="text-center">Không có thông báo nào</td>
            </tr>
            <tr v-else v-for="notification in paginatedNotifications" :key="notification.id">
              <td>{{ notification.id }}</td>
              <td>{{ notification.title }}</td>
              <td>
                <span :class="['type-badge', notification.type]">
                  <i :class="getTypeIcon(notification.type)"></i>
                  {{ getTypeText(notification.type) }}
                </span>
              </td>
              <td>
                <span :class="['target-badge', notification.targetType]">
                  <i class="fas fa-users"></i>
                  {{ getTargetText(notification.targetType) }}
                </span>
              </td>
              <td>
                <span :class="['status-badge', getStatusClass(notification.status)]">
                  <i :class="getStatusIcon(notification.status)"></i>
                  {{ getStatusText(notification.status) }}
                </span>
              </td>
              <td>{{ formatDate(notification.createdAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button @click="editNotification(notification)" class="btn btn-icon" title="Chỉnh sửa">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button v-if="notification.status == 'draft'" @click="confirmDeleteNotification(notification.id)"
                    class="btn btn-icon danger" title="Xóa">
                    <i class="fas fa-trash"></i>
                  </button>
                  <button v-if="notification.status == 'draft'" @click="sendNotification(notification.id)"
                    class="btn btn-icon success" title="Gửi ngay">
                    <i class="fas fa-paper-plane"></i>
                  </button>
                  <button v-if="notification.status == 'draft'" @click="scheduleNotification(notification)"
                    class="btn btn-icon warning" title="Lên lịch">
                    <i class="far fa-clock"></i>
                  </button>
                  <button @click="viewDetails(notification)" class="btn btn-icon" title="Chi tiết">
                    <i class="fas fa-info-circle"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <nav v-if="filteredNotifications.length > 0" class="mt-4">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: currentPage == 1 }">
            <button class="page-link" @click="prevPage">
              <i class="fas fa-chevron-left"></i> Trang trước
            </button>
          </li>
          <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage == page }">
            <button class="page-link" @click="currentPage = page">{{ page }}</button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage == totalPages }">
            <button class="page-link" @click="nextPage">
              Trang sau <i class="fas fa-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal fade show d-block">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i :class="['fas', isEditing ? 'fa-edit' : 'fa-plus-circle', 'me-2']"></i>
              {{ isEditing ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit" class="needs-validation" novalidate>
              <div class="mb-3">
                <label for="title" class="form-label required">Tiêu đề</label>
                <input type="text" id="title" v-model="modalNotification.title" class="form-control"
                  :class="{ 'is-invalid': titleError }" required />
                <div class="invalid-feedback">{{ titleError }}</div>
              </div>

              <div class="mb-3">
                <label for="message" class="form-label required">Nội dung</label>
                <textarea id="message" v-model="modalNotification.message" class="form-control"
                  :class="{ 'is-invalid': messageError }" rows="4" required></textarea>
                <div class="invalid-feedback">{{ messageError }}</div>
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="type" class="form-label required">Loại thông báo</label>
                  <select id="type" v-model="modalNotification.type" class="form-select" required>
                    <option value="system">Hệ thống</option>
                    <option value="promotion">Khuyến mãi</option>
                    <option value="update">Cập nhật</option>
                    <option value="alert">Cảnh báo</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label for="targetType" class="form-label required">Đối tượng nhận</label>
                  <select id="targetType" v-model="modalNotification.targetType" class="form-select" required>
                    <option value="all">Tất cả người dùng</option>
                    <option value="tenant">Người thuê</option>
                    <option value="landlord">Chủ trọ</option>
                  </select>
                </div>
              </div>

              <div class="mb-3">
                <label for="link" class="form-label">Link liên kết (tùy chọn)</label>
                <input type="url" id="link" v-model="modalNotification.link" class="form-control"
                  :class="{ 'is-invalid': linkError }" />
                <div class="invalid-feedback">{{ linkError }}</div>
              </div>

              <div class="mb-3">
                <div class="form-check">
                  <input type="checkbox" id="schedule" v-model="isScheduled" class="form-check-input">
                  <label class="form-check-label" for="schedule">Lên lịch gửi</label>
                </div>
              </div>

              <div v-if="isScheduled" class="mb-3">
                <label for="scheduledAt" class="form-label required">Thời gian gửi</label>
                <input type="datetime-local" id="scheduledAt" v-model="modalNotification.scheduledAt"
                  class="form-control" :class="{ 'is-invalid': scheduleError }" required />
                <div class="invalid-feedback">{{ scheduleError }}</div>
              </div>

              <div class="notification-preview" v-if="modalNotification.title || modalNotification.message">
                <h6>Xem trước thông báo:</h6>
                <div class="preview-content">
                  <h5>{{ modalNotification.title }}</h5>
                  <p>{{ modalNotification.message }}</p>
                  <small v-if="modalNotification.link">
                    <i class="fas fa-link"></i> {{ modalNotification.link }}
                  </small>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              <i class="fas fa-times me-2"></i>Hủy
            </button>
            <button type="submit" class="btn btn-primary" @click="handleSubmit" :disabled="isSubmitting">
              <i class="fas fa-save me-2"></i>
              {{ isEditing ? 'Cập nhật' : 'Tạo thông báo' }}
              <span v-if="isSubmitting" class="spinner-border spinner-border-sm ms-2"></span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="showDetailsModal" class="modal fade show d-block">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-info-circle me-2"></i>
              Chi tiết thông báo
            </h5>
            <button type="button" class="btn-close" @click="closeDetailsModal"></button>
          </div>
          <div class="modal-body">
            <div class="notification-details">
              <div class="detail-section">
                <h6>Thông tin cơ bản</h6>
                <div class="row">
                  <div class="col-md-6">
                    <p><strong>Tiêu đề:</strong> {{ selectedNotification.title }}</p>
                    <p><strong>Loại:</strong> {{ getTypeText(selectedNotification.type) }}</p>
                    <p><strong>Trạng thái:</strong> {{ getStatusText(selectedNotification.status) }}</p>
                  </div>
                  <div class="col-md-6">
                    <p><strong>Ngày tạo:</strong> {{ formatDate(selectedNotification.createdAt) }}</p>
                    <p><strong>Đối tượng:</strong> {{ getTargetText(selectedNotification.targetType) }}</p>
                    <p v-if="selectedNotification.scheduledAt">
                      <strong>Lên lịch:</strong> {{ formatDate(selectedNotification.scheduledAt) }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <h6>Nội dung thông báo</h6>
                <p>{{ selectedNotification.message }}</p>
                <p v-if="selectedNotification.link">
                  <strong>Link:</strong>
                  <a :href="selectedNotification.link" target="_blank">{{ selectedNotification.link }}</a>
                </p>
              </div>

              <div class="detail-section">
                <h6>Thống kê</h6>
                <div class="stats-grid">
                  <div class="stat-box">
                    <i class="fas fa-paper-plane"></i>
                    <div>
                      <strong>Đã gửi</strong>
                      <span>{{ selectedNotification.sentCount || 0 }}</span>
                    </div>
                  </div>
                  <div class="stat-box">
                    <i class="fas fa-envelope-open"></i>
                    <div>
                      <strong>Đã đọc</strong>
                      <span>{{ selectedNotification.readCount || 0 }}</span>
                    </div>
                  </div>
                  <div class="stat-box">
                    <i class="fas fa-mouse-pointer"></i>
                    <div>
                      <strong>Đã click</strong>
                      <span>{{ selectedNotification.clickCount || 0 }}</span>
                    </div>
                  </div>
                  <div class="stat-box">
                    <i class="fas fa-users"></i>
                    <div>
                      <strong>Tổng người nhận</strong>
                      <span>{{ selectedNotification.recipientCount || 0 }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDetailsModal">
              <i class="fas fa-times me-2"></i>Đóng
            </button>
            <button v-if="selectedNotification.status == 'draft'" type="button" class="btn btn-primary"
              @click="editNotification(selectedNotification)">
              <i class="fas fa-edit me-2"></i>Chỉnh sửa
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal backdrop -->
    <div v-if="showModal || showDetailsModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
import Swal from "sweetalert2";
// import axios from "axios";
import crudApi from "@/apis/crudApi";


export default {
  name: "AdminNotificationManagement",

  data() {
    return {
      notifications: [],
      filteredNotifications: [],
      selectedNotification: {},
      error: null,
      loading: false,
      isLoading: false,
      isSearching: false,
      isSubmitting: false,

      // Pagination
      currentPage: 1,
      pageSize: 10,

      // Filters
      searchTerm: "",
      typeFilter: "",
      statusFilter: "",
      targetFilter: "",
      sortKey: "",
      sortAsc: true,

      // Modals
      showModal: false,
      showDetailsModal: false,
      isEditing: false,
      isScheduled: false,

      // Form validation
      titleError: "",
      messageError: "",
      linkError: "",
      scheduleError: "",

      // Modal notification data
      modalNotification: {
        id: null,
        title: "",
        message: "",
        type: "system",
        targetType: "all",
        link: "",
        status: "draft",
        scheduledAt: null,
        sentCount: 0,
        readCount: 0,
        clickCount: 0,
        recipientCount: 0,
      },

      debounceTimeout: null,
    };
  },

  computed: {
    sentCount() {
      return this.notifications.filter(n => n.status == 'sent').length;
    },

    scheduledCount() {
      return this.notifications.filter(n => n.status == 'scheduled').length;
    },

    draftCount() {
      return this.notifications.filter(n => n.status == 'draft').length;
    },

    paginatedNotifications() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + parseInt(this.pageSize, 10);
      return this.filteredNotifications.slice(start, end);
    },

    totalPages() {
      return Math.ceil(this.filteredNotifications.length / this.pageSize);
    },
  },

  methods: {
    openCreateModal() {
      this.isEditing = false;
      this.modalNotification = {
        id: null,
        title: "",
        message: "",
        type: "system",
        targetType: "all",
        link: "",
        status: "draft",
        scheduledAt: null,
        sentCount: 0,
        readCount: 0,
        clickCount: 0,
        recipientCount: 0,
      };
      this.showModal = true;
    },
    async fetchNotifications() {
      this.loading = true;
      this.error = null;
      try {
        const response = await crudApi.read("api::notification.notification");
        this.notifications = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        this.filterNotifications();
      } catch (error) {
        this.error = "Không thể tải danh sách thông báo. Vui lòng thử lại sau.";
        console.error("Error fetching notifications:", error);
      } finally {
        this.loading = false;
      }
    },

    validateTitle() {
      this.modalNotification.title = this.modalNotification.title.trim();
      if (!this.modalNotification.title) {
        this.titleError = "Tiêu đề không được để trống";
        return false;
      }
      if (this.modalNotification.title.length > 200) {
        this.titleError = "Tiêu đề không được vượt quá 200 ký tự";
        return false;
      }
      this.titleError = "";
      return true;
    },

    validateMessage() {
      this.modalNotification.message = this.modalNotification.message.trim();
      if (!this.modalNotification.message) {
        this.messageError = "Nội dung không được để trống";
        return false;
      }
      if (this.modalNotification.message.length > 1000) {
        this.messageError = "Nội dung không được vượt quá 1000 ký tự";
        return false;
      }
      this.messageError = "";
      return true;
    },

    validateLink() {
      if (this.modalNotification.link) {
        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        if (!urlPattern.test(this.modalNotification.link)) {
          this.linkError = "Link không hợp lệ";
          return false;
        }
      }
      this.linkError = "";
      return true;
    },

    validateSchedule() {
      if (this.isScheduled) {
        if (!this.modalNotification.scheduledAt) {
          this.scheduleError = "Vui lòng chọn thời gian gửi";
          return false;
        }
        const scheduledTime = new Date(this.modalNotification.scheduledAt);
        if (scheduledTime <= new Date()) {
          this.scheduleError = "Thời gian gửi phải lớn hơn thời gian hiện tại";
          return false;
        }
      }
      this.scheduleError = "";
      return true;
    },

    validateForm() {
      const isTitleValid = this.validateTitle();
      const isMessageValid = this.validateMessage();
      const isLinkValid = this.validateLink();
      const isScheduleValid = this.validateSchedule();
      return isTitleValid && isMessageValid && isLinkValid && isScheduleValid;
    },

    searchNotifications() {
      clearTimeout(this.debounceTimeout);
      this.isSearching = true;

      this.debounceTimeout = setTimeout(() => {
        this.filterNotifications();
        this.isSearching = false;
      }, 300);
    },

    filterNotifications() {
      let filtered = [...this.notifications];

      // Apply search filter
      if (this.searchTerm) {
        const searchTerm = this.searchTerm.toLowerCase();
        filtered = filtered.filter(notification =>
          notification.title.toLowerCase().includes(searchTerm) ||
          notification.message.toLowerCase().includes(searchTerm)
        );
      }

      // Apply type filter
      if (this.typeFilter) {
        filtered = filtered.filter(notification => notification.type == this.typeFilter);
      }

      // Apply status filter
      if (this.statusFilter) {
        filtered = filtered.filter(notification => notification.status == this.statusFilter);
      }

      // Apply target filter
      if (this.targetFilter) {
        filtered = filtered.filter(notification => notification.targetType == this.targetFilter);
      }

      // Apply sorting
      if (this.sortKey) {
        filtered.sort((a, b) => {
          let valueA = a[this.sortKey];
          let valueB = b[this.sortKey];

          if (typeof valueA == 'string') valueA = valueA.toLowerCase();
          if (typeof valueB == 'string') valueB = valueB.toLowerCase();

          if (valueA < valueB) return this.sortAsc ? -1 : 1;
          if (valueA > valueB) return this.sortAsc ? 1 : -1;
          return 0;
        });
      }

      this.filteredNotifications = filtered;
      this.currentPage = 1;
    },

    sortBy(key) {
      if (this.sortKey == key) {
        this.sortAsc = !this.sortAsc;
      } else {
        this.sortKey = key;
        this.sortAsc = true;
      }
      this.filterNotifications();
    },

    getTypeText(type) {
      const types = {
        system: 'Hệ thống',
        promotion: 'Khuyến mãi',
        update: 'Cập nhật',
        alert: 'Cảnh báo'
      };
      return types[type] || type;
    },

    getTypeIcon(type) {
      const icons = {
        system: 'fas fa-cog',
        promotion: 'fas fa-gift',
        update: 'fas fa-sync',
        alert: 'fas fa-exclamation-triangle'
      };
      return icons[type] || 'fas fa-bell';
    },

    getTargetText(targetType) {
      const targets = {
        all: 'Tất cả người dùng',
        tenant: 'Người thuê',
        landlord: 'Chủ trọ'
      };
      return targets[targetType] || targetType;
    },

    getStatusText(status) {
      const statuses = {
        draft: 'Bản nháp',
        scheduled: 'Đã lên lịch',
        sent: 'Đã gửi'
      };
      return statuses[status] || status;
    },

    getStatusIcon(status) {
      const icons = {
        draft: 'fas fa-file-alt',
        scheduled: 'fas fa-clock',
        sent: 'fas fa-paper-plane'
      };
      return icons[status] || 'fas fa-question-circle';
    },

    getStatusClass(status) {
      const classes = {
        draft: 'draft',
        scheduled: 'scheduled',
        sent: 'sent'
      };
      return classes[status] || '';
    },

    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleString('vi-VN');
    },

    async handleSubmit() {
      if (!this.validateForm()) return;

      this.isSubmitting = true;
      try {
        if (this.isEditing) {
          await this.updateNotification();
        } else {
          await this.createNotification();
        }
      } finally {
        this.isSubmitting = false;
      }
    },

    async createNotification() {
      try {
        const newNotification = {
          ...this.modalNotification,
          createdAt: new Date().toISOString(),
          status: this.isScheduled ? 'scheduled' : 'draft'
        };
        const response = await crudApi.create("api::notification.notification", newNotification);
        this.notifications.unshift(response.data);
        this.filterNotifications();
        this.closeModal();

        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Thông báo mới đã được tạo!",
        });
      } catch (error) {
        console.error("Error creating notification:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể tạo thông báo. Vui lòng thử lại sau.",
        });
      }
    },

    async updateNotification() {
      try {
        const updatedNotification = {
          ...this.modalNotification,
          status: this.isScheduled ? 'scheduled' : 'draft'
        };

        const response = await crudApi.update("api::notification.notification", {id: updatedNotification.id}, updatedNotification);
        const index = this.notifications.findIndex(n => n.id == this.modalNotification.id);

        if (index !== -1) {
          this.notifications.splice(index, 1, response.data);
          this.filterNotifications();
          this.closeModal();

          Swal.fire({
            icon: "success",
            title: "Thành công",
            text: "Thông báo đã được cập nhật!",
          });
        }
      } catch (error) {
        console.error("Error updating notification:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể cập nhật thông báo. Vui lòng thử lại sau.",
        });
      }
    },

    editNotification(notification) {
      this.isEditing = true;
      this.modalNotification = { ...notification };
      this.isScheduled = !!notification.scheduledAt;
      this.showModal = true;
    },

    async confirmDeleteNotification(id) {
      const result = await Swal.fire({
        title: "Xác nhận xóa",
        text: "Bạn có chắc chắn muốn xóa thông báo này?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        await this.deleteNotification(id);
      }
    },

    async deleteNotification(id) {
      try {
        await crudApi.delete("api::notification.notification", {id: id});
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.filterNotifications();

        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Thông báo đã được xóa.",
        });
      } catch (error) {
        console.error("Error deleting notification:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể xóa thông báo. Vui lòng thử lại sau.",
        });
      }
    },

    async sendNotification(id) {
      try {
        const notification = this.notifications.find(n => n.id == id);
        if (notification) {
          await crudApi.update("api::notification.notification", {id: id}, {
            ...notification,
            status: 'sent',
            sentAt: new Date().toISOString()
          });

          notification.status = 'sent';
          this.filterNotifications();

          Swal.fire({
            icon: "success",
            title: "Thành công",
            text: "Thông báo đã được gửi!",
          });
        }
      } catch (error) {
        console.error("Error sending notification:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể gửi thông báo. Vui lòng thử lại sau.",
        });
      }
    },

    viewDetails(notification) {
      this.selectedNotification = { ...notification };
      this.showDetailsModal = true;
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

    closeModal() {
      this.showModal = false;
      this.isEditing = false;
      this.isScheduled = false;
      this.modalNotification = {
        id: null,
        title: "",
        message: "",
        type: "system",
        targetType: "all",
        link: "",
        status: "draft",
        scheduledAt: null,
        sentCount: 0,
        readCount: 0,
        clickCount: 0,
        recipientCount: 0,
      };
      this.titleError = "";
      this.messageError = "";
      this.linkError = "";
      this.scheduleError = "";
    },

    closeDetailsModal() {
      this.showDetailsModal = false;
      this.selectedNotification = {};
    },
  },

  async created() {
    await this.fetchNotifications();
  },

  watch: {
    pageSize() {
      this.filterNotifications();
    }
  }
};
</script>

<style scoped>
.admin-notification-management {
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
}

.status-badge.draft {
  background-color: rgba(108, 117, 125, 0.1);
  color: #6c757d;
  border: 1px solid rgba(108, 117, 125, 0.2);
}

.status-badge.scheduled {
  background-color: rgba(255, 193, 7, 0.1);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.2);
}

.status-badge.sent {
  background-color: rgba(40, 199, 111, 0.1);
  color: #28c76f;
  border: 1px solid rgba(40, 199, 111, 0.2);
}

/* Type Badges */
.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.75rem;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 500;
}

.type-badge.system {
  background-color: rgba(52, 152, 219, 0.1);
  color: #3498db;
  border: 1px solid rgba(52, 152, 219, 0.2);
}

.type-badge.promotion {
  background-color: rgba(155, 89, 182, 0.1);
  color: #9b59b6;
  border: 1px solid rgba(155, 89, 182, 0.2);
}

.type-badge.update {
  background-color: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.2);
}

.type-badge.alert {
  background-color: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.2);
}

/* Target Badges */
.target-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.75rem;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 500;
}

.target-badge.all {
  background-color: rgba(52, 152, 219, 0.1);
  color: #3498db;
  border: 1px solid rgba(52, 152, 219, 0.2);
}

.target-badge.tenant {
  background-color: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.2);
}

.target-badge.landlord {
  background-color: rgba(155, 89, 182, 0.1);
  color: #9b59b6;
  border: 1px solid rgba(155, 89, 182, 0.2);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.375rem;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-secondary {
  background-color: #fff;
  color: #2c3e50;
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

/* Notification Preview */
.notification-preview {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.preview-content {
  background: white;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

/* Details Modal */
.detail-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #dee2e6;
}

.detail-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.detail-section h6 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-box i {
  font-size: 1.5rem;
  color: #3498db;
}

.stat-box div {
  display: flex;
  flex-direction: column;
}

.stat-box strong {
  font-size: 0.875rem;
  color: #6c757d;
}

.stat-box span {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
}

.required::after {
  content: " *";
  color: red;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .admin-notification-management {
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

  .filter-search-bar .row>* {
    margin-bottom: 0.75rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
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