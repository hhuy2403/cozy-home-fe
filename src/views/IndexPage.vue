<template>
  <div class="index-page">
    <!-- Header Section -->
    <header class="cozyhome-header">
      <video autoplay muted loop class="header-video">
        <source src="@/assets/intro.mp4" type="video/mp4" />
      </video>
      <div class="cozyhome-header-overlay">
        <div class="cozyhome-header-content">
          <h1 class="cozyhome-header-title">
            <i class="fas fa-home"></i>
            Chào mừng đến với
            <span class="highlight">CozyHome</span>
          </h1>
          <div class="cozyhome-header-buttons">
            <button class="cozyhome-btn cozyhome-btn-primary" @click="startNow">
              <i class="fas fa-sign-in-alt"></i>
              Bắt đầu ngay
            </button>
            <button class="cozyhome-btn cozyhome-btn-secondary" @click="exploreNow">
              <i class="fas fa-user-plus"></i>
              Khám phá ngay
            </button>
          </div>
          <div class="cozyhome-header-links">
            <a href="#features" class="header-link">Tính năng</a>
            <a href="#pricing" class="header-link">Gói dịch vụ</a>
            <a href="#contact" class="header-link">Liên hệ</a>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="cozyhome-main">
      <!-- About Section -->
      <section class="cozyhome-about" id="info">
        <h2 class="cozyhome-about-title">
          <i class="fas fa-info-circle"></i> Giới thiệu về CozyHome
        </h2>
        <div class="cozyhome-about-content">
          <div class="cozyhome-about-text">
            <p>
              CozyHome là giải pháp quản lý nhà trọ toàn diện, giúp bạn dễ dàng quản lý tài sản, hợp đồng và thanh toán
              một cách hiệu quả.
              Với hệ thống thân thiện, bảo mật, bạn có thể quản lý mọi lúc, mọi nơi.
            </p>
            <div class="cozyhome-about-features">
              <div class="cozyhome-about-feature">
                <i class="fas fa-check-circle"></i> Quản lý hợp đồng, tài sản một cách hiệu quả.
              </div>
              <div class="cozyhome-about-feature">
                <i class="fas fa-check-circle"></i> Hỗ trợ thanh toán trực tuyến, dễ dàng theo dõi lịch sử giao dịch.
              </div>
              <div class="cozyhome-about-feature">
                <i class="fas fa-check-circle"></i> Cập nhật thông tin tức thì, bảo mật cao.
              </div>
            </div>
          </div>
          <div class="cozyhome-about-image">
            <img src="@/assets/about-image.png" alt="About CozyHome" />
          </div>
        </div>
      </section>

      <!-- Pricing Section -->
      <section class="cozyhome-pricing" id="pricing">
        <h2 class="cozyhome-pricing-title">
          <i class="fas fa-tags"></i> Các Gói Dịch Vụ
        </h2>
        <div class="cozyhome-pricing-cards">
          <div class="cozyhome-pricing-card">
            <h3>Gói Cơ Bản</h3>
            <p class="pricing-price">Giá: <span>299,000 VND/tháng</span></p>
            <img src="@/assets/basic-package.png" alt="Gói Cơ Bản" class="pricing-image" />
            <ul>
              <li><i class="fas fa-check-circle"></i> Quản lý cơ bản</li>
              <li><i class="fas fa-check-circle"></i> Hỗ trợ 24/7</li>
            </ul>
            <button class="cozyhome-btn cozyhome-btn-primary">Bắt đầu ngay</button>
          </div>
          <div class="cozyhome-pricing-card">
            <h3>Gói Nâng Cao</h3>
            <p class="pricing-price">Giá: <span>499,000 VND/tháng</span></p>
            <img src="@/assets/advanced-package.png" alt="Gói Nâng Cao" class="pricing-image" />
            <ul>
              <li><i class="fas fa-check-circle"></i> Đầy đủ tính năng quản lý</li>
              <li><i class="fas fa-check-circle"></i> Bảo mật nâng cao</li>
            </ul>
            <button class="cozyhome-btn cozyhome-btn-primary">Bắt đầu ngay</button>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="cozyhome-features" id="features">
        <h2 class="cozyhome-features-title"><i class="fas fa-star"></i> Tính năng nổi bật</h2>
        <div class="cozyhome-feature-list">
          <div class="cozyhome-feature-item">
            <div class="cozyhome-feature-icon">
              <i class="fas fa-warehouse"></i>
            </div>
            <img src="@/assets/feature4.png" alt="Quản lý tài sản" class="cozyhome-feature-image" />
            <h3 class="cozyhome-feature-title">Quản lý phòng</h3>
            <p class="cozyhome-feature-description">
              Theo dõi và quản lý nhà trọ của bạn một cách dễ dàng và hiệu quả.
            </p>
            <a href="#" class="cozyhome-btn cozyhome-btn-secondary">Tìm hiểu thêm</a>
          </div>
          <div class="cozyhome-feature-item">
            <div class="cozyhome-feature-icon">
              <i class="fas fa-warehouse"></i>
            </div>
            <img src="@/assets/feature1.png" alt="Quản lý tài sản" class="cozyhome-feature-image" />
            <h3 class="cozyhome-feature-title">Quản lý tài sản</h3>
            <p class="cozyhome-feature-description">
              Theo dõi và quản lý tài sản của bạn một cách dễ dàng và hiệu quả.
            </p>
            <a href="#" class="cozyhome-btn cozyhome-btn-secondary">Tìm hiểu thêm</a>
          </div>
          <div class="cozyhome-feature-item">
            <div class="cozyhome-feature-icon">
              <i class="fas fa-credit-card"></i>
            </div>
            <img src="@/assets/feature2.png" alt="Thanh toán tiện lợi" class="cozyhome-feature-image" />
            <h3 class="cozyhome-feature-title">Thanh toán tiện lợi</h3>
            <p class="cozyhome-feature-description">
              Đơn giản, thuận tiện, giúp bạn dễ dàng theo dõi toàn bộ lịch sử giao dịch.
            </p>
            <a href="#" class="cozyhome-btn cozyhome-btn-secondary">Tìm hiểu thêm</a>
          </div>
          <div class="cozyhome-feature-item">
            <div class="cozyhome-feature-icon">
              <i class="fas fa-hand-holding-heart"></i>
            </div>
            <img src="@/assets/feature3.png" alt="Quản lý dịch vụ" class="cozyhome-feature-image" />
            <h3 class="cozyhome-feature-title">Quản lý dịch vụ</h3>
            <p class="cozyhome-feature-description">
              Quản lý chuyên nghiệp, đảm bảo tính linh hoạt và hiệu quả tối đa cho mọi nhu cầu.
            </p>
            <a href="#" class="cozyhome-btn cozyhome-btn-secondary">Tìm hiểu thêm</a>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer Section -->
    <footer class="cozyhome-footer glass" id="contact">
      <div class="cozyhome-footer-content">
        <div class="cozyhome-footer-columns">

          <!-- Column 1: About -->
          <div class="cozyhome-footer-column">
            <h3><i class="fas fa-home"></i> CozyHome</h3>
            <p>
              CozyHome là nền tảng quản lý nhà trọ hiện đại, giúp quản lý tài sản, hợp đồng và thanh toán một cách dễ
              dàng.
            </p>
          </div>

          <!-- Column 2: Quick Links -->
          <div class="cozyhome-footer-column">
            <h3><i class="fas fa-link"></i> Liên Kết Nhanh</h3>
            <ul class="cozyhome-footer-links">
              <li><a href="#info">Giới thiệu</a></li>
              <li><a href="#features">Tính năng</a></li>
              <li><a href="#pricing">Bảng giá</a></li>
              <li>
                <router-link to="/login">Đăng Nhập</router-link>
              </li>
              <li>
                <router-link to="/register">Đăng Ký</router-link>
              </li>
            </ul>
          </div>

          <!-- Column 3: Contact Information -->
          <div class="cozyhome-footer-column">
            <h3><i class="fas fa-envelope"></i> Liên Hệ</h3>
            <p><i class="fas fa-map-marker-alt"></i> 136 Xuân Thuỷ, Cầu Giấy, Hà Nội</p>
            <p><i class="fas fa-phone-alt"></i> 0123 456 789</p>
            <p><i class="fas fa-envelope"></i> zero24032003@gmail.com</p>
            <div class="cozyhome-footer-social-icons">
              <a href="https://www.facebook.com/hhhuy.03" target="_blank">
                <i class="fab fa-facebook-f"></i>
              </a>
              <a href="https://x.com/hhuy2403" target="_blank">
                <i class="fab fa-twitter"></i>
              </a>
              <a href="https://www.instagram.com/hhhuy.03/" target="_blank">
                <i class="fab fa-instagram"></i>
              </a>
              <a href="https://www.linkedin.com/in/huy-ho%C3%A0ng-657532333/" target="_blank">
                <i class="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>

  </div>
</template>

<script>
import "@/styles/main.css";

export default {
  name: 'IndexPage',
  methods: {
    startNow() {
      this.$router.push('/login');
    },
    exploreNow() {
      this.$router.push('/register');
    }
  }
};
</script>