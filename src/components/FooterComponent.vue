<template>
  <footer class="footer">
    <!-- Main Footer -->
    <div class="footer-main">
      <div class="container">
        <div class="row">
          <!-- About Section -->
          <div class="col-lg-4 col-md-6 mb-4 mb-md-0">
            <div class="footer-widget">
              <div class="footer-logo">
                <i class="fas fa-home-alt"></i>
                <span>CozyHome</span>
              </div>
              <p class="footer-desc">
                CozyHome là giải pháp quản lý nhà trọ thông minh, giúp chủ trọ và người thuê
                kết nối hiệu quả, quản lý dễ dàng và thanh toán tiện lợi.
              </p>
              <div class="social-links">
                <a href="#" class="social-link facebook">
                  <i class="fab fa-facebook-f"></i>
                </a>
                <a href="#" class="social-link twitter">
                  <i class="fab fa-twitter"></i>
                </a>
                <a href="#" class="social-link instagram">
                  <i class="fab fa-instagram"></i>
                </a>
                <a href="#" class="social-link linkedin">
                  <i class="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="col-lg-2 col-md-6 mb-4 mb-md-0">
            <div class="footer-widget">
              <h4 class="widget-title">Liên Kết Nhanh</h4>
              <ul class="footer-links">
                <li>
                  <router-link to="/">
                    <i class="fas fa-chevron-right"></i>&nbsp; Trang Chủ
                  </router-link>
                </li>
                <li>
                  <router-link to="/about">
                    <i class="fas fa-chevron-right"></i>&nbsp; Giới Thiệu
                  </router-link>
                </li>
                <li>
                  <router-link to="/services">
                    <i class="fas fa-chevron-right"></i>&nbsp; Dịch Vụ
                  </router-link>
                </li>
                <li>
                  <router-link to="/pricing">
                    <i class="fas fa-chevron-right"></i>&nbsp; Bảng Giá
                  </router-link>
                </li>
                <li>
                  <router-link to="/contact">
                    <i class="fas fa-chevron-right"></i>&nbsp; Liên Hệ
                  </router-link>
                </li>
              </ul>
            </div>
          </div>

          <!-- Services -->
          <div class="col-lg-3 col-md-6 mb-4 mb-md-0">
            <div class="footer-widget">
              <h4 class="widget-title">Dịch Vụ</h4>
              <ul class="footer-links">
                <li>
                  <a href="#">
                    <i class="fas fa-chevron-right"></i>&nbsp; Quản Lý Phòng Trọ
                  </a>
                </li>
                <li>
                  <a href="#">
                    <i class="fas fa-chevron-right"></i>&nbsp; Quản Lý Hợp Đồng
                  </a>
                </li>
                <li>
                  <a href="#">
                    <i class="fas fa-chevron-right"></i>&nbsp; Thanh Toán Online
                  </a>
                </li>
                <li>
                  <a href="#">
                    <i class="fas fa-chevron-right"></i>&nbsp; Báo Cáo Thống Kê
                  </a>
                </li>
                <li>
                  <a href="#">
                    <i class="fas fa-chevron-right"></i>&nbsp; Hỗ Trợ 24/7
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <!-- Contact Info -->
          <div class="col-lg-3 col-md-6">
            <div class="footer-widget">
              <h4 class="widget-title">Thông Tin Liên Hệ</h4>
              <div class="contact-info">
                <div class="contact-item">
                  <i class="fas fa-map-marker-alt"></i>
                  <p>&nbsp;123 Đường ABC, Quận XYZ, TP.HCM</p>
                </div>
                <div class="contact-item">
                  <i class="fas fa-phone-alt"></i>
                  <p>
                    <a href="tel:0123456789">&nbsp;0123 456 789</a>
                  </p>
                </div>
                <div class="contact-item">
                  <i class="fas fa-envelope"></i>
                  <p>
                    <a href="mailto:contact@cozyhome.vn">&nbsp;contact@cozyhome.vn</a>
                  </p>
                </div>
                <div class="contact-item">
                  <i class="fas fa-clock"></i>
                  <p>&nbsp;Thứ 2 - Thứ 6: 8:00 - 17:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Bottom -->
    <div class="footer-bottom">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-6">
            <p class="copyright">
              © {{ currentYear }} CozyHome. Nhom 9 - CDTN - K71
            </p>
          </div>
          <div class="col-md-6">
            <ul class="footer-bottom-links">
              <li>
                <router-link to="/privacy">Chính sách bảo mật</router-link>
              </li>
              <li>
                <router-link to="/terms">Điều khoản sử dụng</router-link>
              </li>
              <li>
                <router-link to="/faq">FAQ</router-link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll to Top Button -->
    <button class="scroll-top" :class="{ 'show': showScrollTop }" @click="scrollToTop">
      <i class="fas fa-arrow-up"></i>
    </button>
  </footer>
</template>

<script>
export default {
  name: 'FooterComponent',
  data() {
    return {
      currentYear: new Date().getFullYear(),
      showScrollTop: false
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    handleScroll() {
      this.showScrollTop = window.scrollY > 300;
    },
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }
}
</script>

<style scoped>
.footer {
  background-color: #2a3f54;
  color: #ffffff;
  position: relative;
}

.footer-main {
  padding: 80px 0 50px;
}

/* Footer Widget Styles */
.footer-widget {
  margin-bottom: 30px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.footer-logo i {
  font-size: 2.5rem;
  color: #3498db;
}

.footer-logo span {
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
}

.footer-desc {
  color: #b3b3b3;
  line-height: 1.6;
  margin-bottom: 25px;
  text-align: justify;
}

.widget-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 25px;
  position: relative;
  padding-bottom: 10px;
}

.widget-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 50px;
  height: 2px;
  background: #3498db;
}

/* Social Links */
.social-links {
  display: flex;
  gap: 15px;
}

.social-link {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  transition: all 0.3s ease;
}

.social-link.facebook {
  background: #3b5998;
}

.social-link.twitter {
  background: #1da1f2;
}

.social-link.instagram {
  background: #e1306c;
}

.social-link.linkedin {
  background: #0077b5;
}

.social-link:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

/* Footer Links */
.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 12px;
}

.footer-links li a {
  color: #b3b3b3;
  text-decoration: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.footer-links li a i {
  font-size: 0.8rem;
  margin-right: 8px;
  transition: transform 0.3s ease;
}

.footer-links li a:hover {
  color: #3498db;
  padding-left: 5px;
}

.footer-links li a:hover i {
  transform: translateX(3px);
}

/* Contact Info */
.contact-info {
  color: #b3b3b3;
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.contact-item i {
  min-width: 25px;
  margin-top: 5px;
  color: #3498db;
}

.contact-item p {
  margin: 0;
}

.contact-item a {
  color: #b3b3b3;
  text-decoration: none;
  transition: color 0.3s ease;
}

.contact-item a:hover {
  color: #3498db;
}

/* Footer Bottom */
.footer-bottom {
  background: rgba(0, 0, 0, 0.2);
  padding: 20px 0;
}

.copyright {
  margin: 0;
  color: #b3b3b3;
}

.footer-bottom-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: flex-end;
  gap: 20px;
}

.footer-bottom-links a {
  color: #b3b3b3;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-bottom-links a:hover {
  color: #3498db;
}

/* Scroll to Top Button */
.scroll-top {
  position: fixed;
  right: 30px;
  bottom: 30px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #3498db;
  color: #ffffff;
  border: none;
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.scroll-top.show {
  opacity: 1;
  visibility: visible;
}

.scroll-top:hover {
  background: #2980b9;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

/* Responsive Styles */
@media (max-width: 991.98px) {
  .footer-main {
    padding: 50px 0 30px;
  }
}

@media (max-width: 767.98px) {
  .footer-bottom {
    text-align: center;
  }

  .footer-bottom-links {
    justify-content: center;
    margin-top: 15px;
  }

  .copyright {
    margin-bottom: 10px;
  }

  .scroll-top {
    right: 15px;
    bottom: 15px;
  }
}
</style>