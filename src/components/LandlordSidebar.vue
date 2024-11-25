<template>
  <aside :class="['sidebar', { collapsed: isCollapsed }]">
    <button class="toggle-sidebar" @click="toggleSidebar">
      <i class="fas fa-arrow-right"></i>
    </button>

    <div class="header" v-if="!isCollapsed">
      <h2>QUẢN LÝ NHÀ TRỌ</h2>
      <h3>CozyHome</h3>
      <p>XIN CHÀO, {{ userName }}</p>
    </div>

    <ul class="nav-list">
      <li v-for="item in menuItems" :key="item.route" class="nav-item">
        <router-link v-if="!item.children" :to="item.route" active-class="active" class="nav-link">
          <i :class="item.icon"></i>
          <span v-if="!isCollapsed">{{ item.label }}</span>
        </router-link>

        <div v-if="item.children" class="submenu">
          <a class="nav-link" @click="toggleSubmenu(item)">
            <div class="submenu-label">
              <i :class="item.icon"></i>
              <span v-if="!isCollapsed">{{ item.label }}</span>
            </div>
            <i class="fas arrow-icon" :class="item.open ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
          </a>
          <ul v-if="item.open" class="submenu-list">
            <li v-for="child in item.children" :key="child.route">
              <router-link :to="child.route" active-class="active" class="nav-link">
                <i :class="child.icon"></i>
                <span>{{ child.label }}</span>
              </router-link>
            </li>
          </ul>
        </div>
      </li>

      <li class="nav-item">
        <a @click="handleLogout" class="nav-link">
          <i class="fas fa-sign-out-alt"></i>
          <span>Đăng xuất</span>
        </a>
      </li>
    </ul>

    <div class="bottom-icons">
      <router-link to="/landlord/change-password">
        <i class="fas fa-key"></i>
      </router-link>
      <button @click="toggleFullScreen">
        <i class="fas fa-expand"></i>
      </button>
      <button @click="toggleVisibility">
        <i :class="isVisible ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
      </button>
      <button @click="handleLogout">
        <i class="fas fa-sign-out-alt"></i>
      </button>
    </div>
  </aside>
</template>

<script>
import Swal from 'sweetalert2';
import "@/styles/landlord/sidebar.css";

export default {
  name: 'LandlordSidebar',
  data() {
    return {
      isCollapsed: false,
      userName: '',
      isVisible: true,
      menuItems: [
        { label: 'Trang chủ', route: '/landlord/dashboard', icon: 'fas fa-home' },
        { label: 'Phòng', route: '/landlord/room-index', icon: 'fas fa-door-open' },
        { label: 'Dịch vụ', route: '/landlord/service-index', icon: 'fas fa-concierge-bell' },
        { label: 'Chỉ số điện', route: '/landlord/data-power', icon: 'fas fa-bolt' },
        { label: 'Chỉ số nước', route: '/landlord/data-water', icon: 'fas fa-tint' },
        { label: 'Phát sinh', route: '/landlord/other-fee', icon: 'fas fa-file-invoice-dollar' },
        { label: 'Tính tiền', route: '/landlord/calculator-money', icon: 'fas fa-money-check-alt' },
        {
          label: 'Báo cáo',
          icon: 'fas fa-chart-line',
          open: false,
          children: [
            { label: 'DS khách thuê', route: '/landlord/customer-rent', icon: 'fas fa-file-invoice' },
            { label: 'DS khách nợ tiền', route: '/landlord/customer-debt', icon: 'fas fa-file-invoice' },
            { label: 'DS khách đặt cọc', route: '/landlord/customer-deposit', icon: 'fas fa-file-invoice' },
            { label: 'DS khách sắp hết HĐ', route: '/landlord/customer-contract-expired', icon: 'fas fa-file-invoice' },
            { label: 'DS thành viên phòng', route: '/landlord/room-person', icon: 'fas fa-file-invoice' },
            { label: 'Chi tiêt doanh thu', route: '/landlord/invoice-detail', icon: 'fas fa-file-invoice' },
          ],
        },
        { label: 'Thiết lập', route: '/landlord/setting-index', icon: 'fas fa-cogs' },
        { label: 'Tài sản', route: '/landlord/asset-index', icon: 'fas fa-box' },
        { label: 'Hợp đồng', route: '/landlord/contract-index', icon: 'fas fa-file-contract' },
        { label: 'Cọc giữ phòng', route: '/landlord/booking-index', icon: 'fas fa-shield-alt' },
        { label: 'Đổi mật khẩu', route: '/landlord/change-password', icon: 'fas fa-key' },
      ],
    };
  },
  methods: {
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
    },

    toggleSubmenu(item) {
      item.open = !item.open;
    },

    getUserName() {
      const users = JSON.parse(localStorage.getItem('users'));
      const userRole = localStorage.getItem('userRole');

      if (users && userRole) {
        const currentUser = users.find(user => user.role == userRole && user.role == 'landlord');
        if (currentUser) {
          this.userName = currentUser.name;
        } else {
          this.userName = 'Người dùng';
        }
      } else {
        this.userName = 'Người dùng';
      }
    },

    handleLogout() {
      Swal.fire({
        title: 'Bạn có chắc chắn muốn đăng xuất?',
        text: 'Bạn sẽ cần đăng nhập lại sau khi đăng xuất!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Đăng xuất',
        cancelButtonText: 'Hủy',
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.clear();
          this.$router.push('/login');
          location.reload();
        }
      });
    },

    toggleFullScreen() {
      const doc = document;
      const docEl = doc.documentElement;

      const requestFullScreen =
          docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
      const cancelFullScreen =
          doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

      if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        requestFullScreen.call(docEl);
      } else {
        cancelFullScreen.call(doc);
      }
    },

    toggleVisibility() {
      this.isVisible = !this.isVisible;
    },

    checkWindowSize() {
      if (window.innerWidth < 768) {
        this.isCollapsed = true; // Collapse the sidebar if the window width is less than 768px
      } else {
        this.isCollapsed = false; // Expand the sidebar if the window width is more than or equal to 768px
      }
    },
  },
  mounted() {
    this.getUserName();
    this.checkWindowSize(); // Check initial window size
    window.addEventListener('resize', this.checkWindowSize); // Add event listener for window resize
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkWindowSize); // Clean up the event listener
  },
};
</script>

<style scoped>
.nav-item {
  margin: 10px 0;
}
.submenu-label {
  display: flex;
  align-items: center;
}
.submenu-label span {
  margin-left: 10px;
}
.arrow-icon {
  margin-left: auto;
}
.submenu-list {
  padding-left: 20px;
  display: block;
  font-size: 0.875rem;
}
</style>
