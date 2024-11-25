<template>
    <div class="notifications container mt-4">
      <h2>Thông báo</h2>
  
      <div v-if="isLandlord">
        <!-- Gửi thông báo (Chỉ hiển thị cho chủ trọ) -->
        <form @submit.prevent="sendNotification" class="mb-4">
          <div class="mb-3">
            <label for="notificationTitle" class="form-label">Tiêu đề</label>
            <input type="text" id="notificationTitle" v-model="newNotification.title" class="form-control" required />
          </div>
          <div class="mb-3">
            <label for="notificationMessage" class="form-label">Nội dung thông báo</label>
            <textarea id="notificationMessage" v-model="newNotification.message" class="form-control" rows="4" required></textarea>
          </div>
          <div class="mb-3">
            <label for="targetTenant" class="form-label">Gửi tới</label>
            <select id="targetTenant" v-model="newNotification.targetEmail" class="form-select" required>
              <option value="" disabled>Chọn người thuê</option>
              <option v-for="tenant in tenants" :key="tenant.email" :value="tenant.email">
                {{ tenant.fullName }} - {{ tenant.email }}
              </option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary"><i class="fas fa-paper-plane"></i> Gửi thông báo</button>
        </form>
      </div>
  
      <!-- Danh sách thông báo -->
      <div v-if="notifications.length > 0">
        <div class="notification-item card mb-3" v-for="(notification, index) in notifications" :key="index">
          <div class="card-body">
            <h5 class="card-title">{{ notification.title }}</h5>
            <p class="card-text">{{ notification.message }}</p>
            <p class="card-text text-muted"><small>Gửi lúc: {{ formatDate(notification.date) }}</small></p>
          </div>
        </div>
      </div>
      <div v-else class="alert alert-info">Không có thông báo nào để hiển thị.</div>
    </div>
  </template>
  
  <script>
  import Swal from 'sweetalert2';
  
  export default {
    data() {
      return {
        isLandlord: false,
        newNotification: {
          title: '',
          message: '',
          targetEmail: '',
          date: '',
        },
        tenants: [],
        notifications: [],
      };
    },
    mounted() {
      this.checkUserRole();
      this.loadTenants();
      this.loadNotifications();
    },
    methods: {
      checkUserRole() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.isLandlord = currentUser && currentUser.role == 'landlord';
      },
      loadTenants() {
        const homes = JSON.parse(localStorage.getItem('homes')) || [];
        this.tenants = homes.flatMap(home =>
          home.rooms
            .filter(room => room.customer && room.customer.email)
            .map(room => ({
              fullName: room.customer.fullName,
              email: room.customer.email,
            }))
        );
      },
      loadNotifications() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const allNotifications = JSON.parse(localStorage.getItem('notifications')) || [];
        this.notifications = allNotifications.filter(
          notification =>
            (this.isLandlord && notification.sender == currentUser.email) ||
            (!this.isLandlord && notification.targetEmail == currentUser.email)
        );
      },
      sendNotification() {
        if (!this.newNotification.targetEmail) {
          Swal.fire('Lỗi', 'Vui lòng chọn người thuê để gửi thông báo.', 'error');
          return;
        }
  
        this.newNotification.date = new Date().toISOString();
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const allNotifications = JSON.parse(localStorage.getItem('notifications')) || [];
  
        const notification = {
          ...this.newNotification,
          sender: currentUser.email,
        };
  
        allNotifications.push(notification);
        localStorage.setItem('notifications', JSON.stringify(allNotifications));
        this.notifications.push(notification);
  
        Swal.fire('Thành công', 'Thông báo đã được gửi tới người thuê.', 'success');
        this.newNotification = {
          title: '',
          message: '',
          targetEmail: '',
          date: '',
        };
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
  
  <style scoped>
  .notifications {
    margin-top: 3em;
  }
  
  h2 {
    color: #2a3f54;
    font-size: 30px;
    font-weight: 500;
    text-align: left;
  }
  
  .notification-item {
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .card-title {
    color: #333;
  }
  
  .btn-primary {
    background-color: #007bff;
    border-color: #007bff;
  }
  </style>
  