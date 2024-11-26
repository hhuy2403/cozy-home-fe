<template>
  <header class="main-header">
    <nav class="navbar navbar-expand-lg" ref="navbar">
      <div class="container-fluid px-4">
        <router-link class="navbar-brand" :to="defaultLink" @click="closeNavbar">
          <div class="brand-content align-items-start">
            <i class="fas fa-home-alt brand-icon"></i>
            <span class="brand-text">CozyHome</span>
          </div>
        </router-link>

        <button class="navbar-toggler" type="button" @click="toggleNavbar" :class="{ 'collapsed': !isNavOpen }"
          aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="toggler-icon top-bar"></span>
          <span class="toggler-icon middle-bar"></span>
          <span class="toggler-icon bottom-bar"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav" :class="{ 'show': isNavOpen }">
          <ul class="navbar-nav ms-auto align-items-end">
            <template v-if="userRole == 'admin'">
              <li class="nav-item" v-for="(item, index) in adminLinks" :key="index">
                <router-link class="nav-link" :to="item.link" @click="closeNavbar"
                  :class="{ 'active': $route.path == item.link }">
                  <i :class="item.icon" class="nav-icon"></i>
                  {{ item.text }}
                </router-link>
              </li>
            </template>

            <template v-else-if="userRole == 'tenant'">
              <li class="nav-item" v-for="(item, index) in tenantLinks" :key="index">
                <router-link class="nav-link" :to="item.link" @click="closeNavbar"
                  :class="{ 'active': $route.path == item.link }">
                  <i :class="item.icon" class="nav-icon"></i>
                  {{ item.text }}
                </router-link>
              </li>
            </template>

            <template v-else>
              <li class="nav-item" v-for="(item, index) in filteredGuestLinks" :key="index">
                <router-link class="nav-link" :to="item.link" @click="closeNavbar">
                  <i :class="item.icon" class="nav-icon"></i>
                  {{ item.text }}
                </router-link>
              </li>
            </template>

            <li v-if="userRole && userRole !== 'guest'" class="nav-item dropdown" ref="userMenu">
              <a class="nav-link dropdown-toggle user-menu" href="#" role="button" @click="toggleUserMenu"
                :class="{ 'show': isUserMenuOpen }">
                <img :src="userAvatar || '/default-avatar.png'" alt="User Avatar" class="user-avatar">
                <span class="user-name">{{ userName }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end" :class="{ 'show': isUserMenuOpen }">
                <li>
                  <router-link class="dropdown-item" :to="userRole == 'admin' ? '/admin/profile' : '/tenant/profile'"
                    @click="closeNavbar">
                    <i class="fas fa-user-circle me-2"></i> Hồ sơ
                  </router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" :to="userRole == 'admin' ? '/admin/settings' : '/tenant/settings'"
                    @click="closeNavbar">
                    <i class="fas fa-cog me-2"></i> Cài đặt
                  </router-link>
                </li>
                <li>
                  <hr class="dropdown-divider">
                </li>
                <li>
                  <a class="dropdown-item text-danger" href="#" @click.prevent="confirmLogout">
                    <i class="fas fa-sign-out-alt me-2"></i> Đăng xuất
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>

<script>
import authApi from '@/apis/authApi';
import Swal from 'sweetalert2';

export default {
  name: 'HeaderComponent',
  data() {
    return {
      isNavOpen: false,
      isUserMenuOpen: false,
      userRole: '',
      userName: 'Guest',
      userAvatar: '/default-avatar.png',
      adminLinks: [
        { text: 'Trang Chủ', link: '/admin/dashboard', icon: 'fas fa-chart-line' },
        { text: 'Người Dùng', link: '/admin/users', icon: 'fas fa-users' },
        { text: 'Tài Chính', link: '/admin/financial', icon: 'fas fa-money-bill-wave' },
        { text: 'Bảo trì', link: '/admin/maintenance', icon: 'fas fa-concierge-bell' },
        { text: 'Thông Báo', link: '/admin/notification', icon: 'fas fa-bell' },
      ],
      tenantLinks: [
        { text: 'Dashboard', link: '/tenant/dashboard', icon: 'fas fa-home' },
        { text: 'Phòng Của Tôi', link: '/tenant/my-room', icon: 'fas fa-bed' },
        { text: 'Hợp Đồng', link: '/tenant/contracts', icon: 'fas fa-file-contract' },
        { text: 'Lịch Sử', link: '/tenant/payment-history', icon: 'fas fa-history' },
        { text: 'Thanh Toán', link: '/tenant/payments', icon: 'fas fa-credit-card' },
        // { text: 'Hỗ Trợ', link: '/tenant/support', icon: 'fas fa-life-ring' },
        { text: 'Thông Báo', link: '/tenant/notification', icon: 'fas fa-bell' },
      ],
      guestLinks: [
        { text: 'Đăng Nhập', link: '/login', icon: 'fas fa-sign-in-alt' },
        { text: 'Đăng Ký', link: '/register', icon: 'fas fa-user-plus' },
      ],
    };
  },
  computed: {
    filteredGuestLinks() {
      return this.guestLinks.filter(link =>
        !(link.link == this.$route.path)
      );
    },

    defaultLink() {
      if (this.userRole == 'admin') return '/admin/dashboard';
      if (this.userRole == 'tenant') return '/tenant/dashboard';
      return '/'; // Default for guest users
    },
  },
  methods: {
    handleOutsideClick(e) {
      const navbar = this.$refs.navbar;
      const userMenu = this.$refs.userMenu;

      if (navbar && !navbar.contains(e.target)) {
        this.closeNavbar();
      }
      if (userMenu && !userMenu.contains(e.target) && !e.target.closest('.dropdown-menu')) {
        this.isUserMenuOpen = false;
      }
    },
    toggleNavbar() {
      this.isNavOpen = !this.isNavOpen;
    },
    toggleUserMenu(event) {
      event.preventDefault();
      this.isUserMenuOpen = !this.isUserMenuOpen;
    },
    closeNavbar() {
      this.isNavOpen = false;
      this.isUserMenuOpen = false;
    },
    confirmLogout() {
      Swal.fire({
        title: 'Bạn có chắc chắn muốn đăng xuất?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Đăng xuất',
      }).then(result => {
        if (result.isConfirmed) this.logout();
      });
    },
    logout() {
      localStorage.clear();
      this.closeNavbar();
      this.$router.push('/login');
      location.reload();
    },

    async fetchUserData() {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser && currentUser.id) {
        try {
          const response = await authApi.getCurrentUser();
          if (response.error) throw new Error('Failed to fetch user data');
          this.userName = response.username;
          this.userAvatar = response.avatar;
          this.userRole = response.customRole || 'guest';
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        this.userRole = 'guest';
      }
    },

  },


  mounted() {
    document.addEventListener('click', this.handleOutsideClick);
    this.fetchUserData();
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick);
  },

};
</script>


<style scoped>
.main-header {
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.navbar {
  padding: 0.5rem 0;
  min-height: 70px;
}

/* Brand/Logo Styles */
.brand-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-icon {
  font-size: 1.8rem;
  color: #2a3f54;
  transition: transform 0.3s ease;
}

.brand-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  letter-spacing: -0.5px;
}

.navbar-brand:hover .brand-icon {
  transform: scale(1.1);
}

/* Navigation Links */
.nav-link {
  color: #2c3e50;
  font-weight: 500;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
  border-radius: 6px;
  margin: 0 3px;
  display: flex;
  align-items: center;
}

.nav-item {
  margin-bottom: 0px;
}

.nav-link:hover {
  color: #3498db;
  background: rgba(52, 152, 219, 0.1);
}

.nav-link.active {
  color: #3498db;
  background: rgba(52, 152, 219, 0.1);
}

.nav-icon {
  margin-right: 8px;
  font-size: 0.9em;
}

/* User Menu Styles */
.user-menu {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 10px;
}

.user-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-name {
  font-weight: 500;
  color: #2c3e50;
}

/* Dropdown Menu */
.dropdown-menu {
  display: block;
  visibility: hidden;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 8px 0;
  min-width: 200px;
}

.dropdown-menu.show {
  visibility: visible;
  opacity: 1;
  transform: translateY(0);
}

.dropdown-item {
  padding: 8px 20px;
  color: #2c3e50;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
}

.dropdown-item:hover {
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

.dropdown-item.text-danger:hover {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

/* Custom Toggler Style */
.navbar-toggler {
  border: none;
  padding: 0;
  width: 30px;
  height: 20px;
  position: relative;
  transition: .5s ease-in-out;
  background: transparent;
}

.navbar-toggler:focus {
  box-shadow: none;
  outline: none;
}

.toggler-icon {
  display: block;
  position: absolute;
  height: 2px;
  width: 100%;
  background: #2c3e50;
  border-radius: 1px;
  opacity: 1;
  left: 0;
  transform: rotate(0deg);
  transition: .25s ease-in-out;
}

.toggler-icon.top-bar {
  margin-top: 0;
  transform-origin: left center;
}

.toggler-icon.middle-bar {
  margin-top: 8px;
  transform-origin: left center;
}

.toggler-icon.bottom-bar {
  margin-top: 16px;
  transform-origin: left center;
}

.navbar-toggler.collapsed .top-bar {
  transform: rotate(45deg);
  margin-top: -2px;
}

.navbar-toggler.collapsed .middle-bar {
  opacity: 0;
}

.navbar-toggler.collapsed .bottom-bar {
  transform: rotate(-45deg);
  margin-top: 14px;
}

/* Mobile Styles */
@media (max-width: 991.98px) {
  .navbar-collapse {
    background: white;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    position: absolute;
    top: 70px;
    left: 0;
    right: 0;
    margin: 0 1rem;
    transform: translateY(-10px);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }

  .navbar-collapse.show {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-link {
    padding: 0.8rem 1rem;
    margin: 2px 0;
  }

  .user-menu {
    justify-content: center;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }

  .dropdown-menu {
    position: static !important;
    float: none;
    width: 100%;
    margin-top: 0.5rem;
    background-color: #f8f9fa;
    box-shadow: none;
    border-radius: 4px;
  }
}

/* Animation Keyframes */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(0);
  }
}
</style>