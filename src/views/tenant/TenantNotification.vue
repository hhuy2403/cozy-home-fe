<template>
  <div class="notifications container">
    <div class="notifications-header mb-4">
      <h2><i class="fas fa-bell me-2"></i>Thông báo</h2>
      <p class="text-muted">Quản lý và theo dõi các thông báo của bạn</p>
    </div>

    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <div v-else>
      <!-- Search and Filter Section -->
      <div v-if="notifications.length > 0" class="filter-section mb-4">
        <div class="row align-items-center">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text">
                <i class="fas fa-search"></i>
              </span>
              <input
                type="text"
                class="form-control"
                v-model="searchQuery"
                placeholder="Tìm kiếm thông báo..."
              />
            </div>
          </div>
          <div class="col-md-6 text-end">
            <button
              class="btn btn-outline-secondary"
              @click="markAllAsRead"
              v-if="unreadCount > 0"
            >
              <i class="fas fa-check-double me-1"></i>
              Đánh dấu tất cả là đã đọc
            </button>
          </div>
        </div>
      </div>

      <!-- Landlord's Notification Form -->
      <div v-if="isLandlord" class="notification-form mb-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-4">
              <i class="fas fa-paper-plane me-2"></i>Gửi thông báo mới
            </h5>
            <form @submit.prevent="sendNotification">
              <div class="mb-3">
                <label for="notificationTitle" class="form-label"
                  >Tiêu đề</label
                >
                <input
                  type="text"
                  id="notificationTitle"
                  v-model="newNotification.title"
                  class="form-control"
                  :class="{ 'is-invalid': errors.title }"
                  required
                />
                <div class="invalid-feedback">{{ errors.title }}</div>
              </div>

              <div class="mb-3">
                <label for="notificationMessage" class="form-label"
                  >Nội dung thông báo</label
                >
                <textarea
                  id="notificationMessage"
                  v-model="newNotification.message"
                  class="form-control"
                  :class="{ 'is-invalid': errors.message }"
                  rows="4"
                  required
                ></textarea>
                <div class="invalid-feedback">{{ errors.message }}</div>
              </div>

              <div class="mb-3">
                <label for="targetTenant" class="form-label">Gửi tới</label>
                <select
                  id="targetTenant"
                  v-model="newNotification.targetEmail"
                  class="form-select"
                  :class="{ 'is-invalid': errors.targetEmail }"
                  required
                >
                  <option value="" disabled>Chọn người thuê</option>
                  <option
                    v-for="tenant in tenants"
                    :key="tenant.email"
                    :value="tenant.email"
                  >
                    {{ tenant.fullName }} - {{ tenant.email }}
                  </option>
                </select>
                <div class="invalid-feedback">{{ errors.targetEmail }}</div>
              </div>

              <div class="text-end">
                <button
                  type="button"
                  class="btn btn-outline-secondary me-2"
                  @click="resetForm"
                >
                  <i class="fas fa-undo me-1"></i>Làm mới
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="isSubmitting"
                >
                  <i class="fas fa-paper-plane me-1"></i>
                  {{ isSubmitting ? 'Đang gửi...' : 'Gửi thông báo' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="notifications-list">
        <div v-if="filteredNotifications.length > 0">
          <div
            v-for="(notification, index) in filteredNotifications"
            :key="index"
            class="notification-item card mb-3"
            :class="{ unread: !notification.read }"
            @click="markAsRead(index)"
          >
            <div class="card-body">
              <div class="notification-status">
                <span v-if="!notification.read" class="badge bg-primary"
                  >Mới</span
                >
              </div>
              <h5 class="card-title">{{ notification.title }}</h5>
              <p class="card-text">{{ notification.message }}</p>
              <div class="notification-meta">
                <span class="date">
                  <i class="fas fa-clock me-1"></i>
                  {{ formatDate(notification.date) }}
                </span>
                <span class="sender" v-if="!isLandlord">
                  <i class="fas fa-user me-1"></i>
                  Từ: Chủ trọ
                </span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="alert alert-info">
          <i class="fas fa-info-circle me-2"></i>
          Không có thông báo nào để hiển thị.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import '@/styles/tenant/tenant-notification.css';

export default {
  data() {
    return {
      loading: true,
      isSubmitting: false,
      isLandlord: false,
      searchQuery: '',
      newNotification: {
        title: '',
        message: '',
        targetEmail: '',
        date: '',
        read: false,
      },
      errors: {
        title: '',
        message: '',
        targetEmail: '',
      },
      tenants: [],
      notifications: [],
    };
  },

  computed: {
    filteredNotifications() {
      if (!this.searchQuery) return this.notifications;

      const query = this.searchQuery.toLowerCase();
      return this.notifications.filter(
        (notification) =>
          notification.title.toLowerCase().includes(query) ||
          notification.message.toLowerCase().includes(query)
      );
    },

    unreadCount() {
      return this.notifications.filter((n) => !n.read).length;
    },
  },

  async created() {
    try {
      await this.initializeData();
    } catch (error) {
      console.error('Error initializing page:', error);
      Swal.fire('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại sau.', 'error');
    } finally {
      this.loading = false;
    }
  },

  methods: {
    async initializeData() {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser) {
        this.isLandlord = currentUser.role == 'landlord';
        await Promise.all([
          this.loadNotifications(),
          this.isLandlord && this.loadTenants(),
        ]);
      }
    },

    async loadTenants() {
      try {
        const homes = JSON.parse(localStorage.getItem('homes')) || [];
        this.tenants = homes.flatMap((home) =>
          home.rooms
            .filter((room) => room.customer && room.customer.email)
            .map((room) => ({
              fullName: room.customer.fullName,
              email: room.customer.email,
            }))
        );
      } catch (error) {
        console.error('Error loading tenants:', error);
        throw error;
      }
    },

    async loadNotifications() {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const allNotifications =
          JSON.parse(localStorage.getItem('notifications')) || [];

        this.notifications = allNotifications
          .filter(
            (notification) =>
              (this.isLandlord && notification.sender == currentUser.email) ||
              (!this.isLandlord &&
                notification.targetEmail == currentUser.email)
          )
          .sort((a, b) => new Date(b.date) - new Date(a.date));
      } catch (error) {
        console.error('Error loading notifications:', error);
        throw error;
      }
    },

    validateForm() {
      let isValid = true;
      this.errors = {
        title: '',
        message: '',
        targetEmail: '',
      };

      if (!this.newNotification.title.trim()) {
        this.errors.title = 'Vui lòng nhập tiêu đề';
        isValid = false;
      }

      if (!this.newNotification.message.trim()) {
        this.errors.message = 'Vui lòng nhập nội dung thông báo';
        isValid = false;
      }

      if (!this.newNotification.targetEmail) {
        this.errors.targetEmail = 'Vui lòng chọn người nhận';
        isValid = false;
      }

      return isValid;
    },

    async sendNotification() {
      if (!this.validateForm()) return;

      try {
        this.isSubmitting = true;
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        const notification = {
          ...this.newNotification,
          date: new Date().toISOString(),
          sender: currentUser.email,
          read: false,
        };

        const allNotifications =
          JSON.parse(localStorage.getItem('notifications')) || [];
        allNotifications.push(notification);
        localStorage.setItem('notifications', JSON.stringify(allNotifications));

        this.notifications.unshift(notification);

        await Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Thông báo đã được gửi thành công!',
          timer: 1500,
          showConfirmButton: false,
        });

        this.resetForm();
      } catch (error) {
        console.error('Error sending notification:', error);
        Swal.fire(
          'Lỗi',
          'Không thể gửi thông báo. Vui lòng thử lại sau.',
          'error'
        );
      } finally {
        this.isSubmitting = false;
      }
    },

    resetForm() {
      this.newNotification = {
        title: '',
        message: '',
        targetEmail: '',
        date: '',
        read: false,
      };
      this.errors = {
        title: '',
        message: '',
        targetEmail: '',
      };
    },

    async markAsRead(index) {
      if (this.notifications[index].read) return;

      try {
        const allNotifications =
          JSON.parse(localStorage.getItem('notifications')) || [];
        const notification = this.notifications[index];

        // Update in local array
        this.notifications[index].read = true;

        // Update in localStorage
        const notificationIndex = allNotifications.findIndex(
          (n) =>
            n.date == notification.date &&
            n.targetEmail == notification.targetEmail
        );

        if (notificationIndex !== -1) {
          allNotifications[notificationIndex].read = true;
          localStorage.setItem(
            'notifications',
            JSON.stringify(allNotifications)
          );
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },

    async markAllAsRead() {
      try {
        const allNotifications =
          JSON.parse(localStorage.getItem('notifications')) || [];
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        // Update all unread notifications
        this.notifications.forEach((n) => (n.read = true));

        // Update in localStorage
        allNotifications.forEach((n) => {
          if (n.targetEmail == currentUser.email) {
            n.read = true;
          }
        });

        localStorage.setItem('notifications', JSON.stringify(allNotifications));

        await Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Tất cả thông báo đã được đánh dấu là đã đọc!',
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error('Error marking all as read:', error);
        Swal.fire(
          'Lỗi',
          'Không thể cập nhật trạng thái thông báo. Vui lòng thử lại sau.',
          'error'
        );
      }
    },

    formatDate(date) {
      return new Date(date).toLocaleString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
  },
};
</script>
