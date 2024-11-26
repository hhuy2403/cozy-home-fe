<template>
  <HeaderComponent />
  <div class="login-page">
    <div class="login-container">
      <div class="login-box">
        <h2 class="login-title">Đăng Nhập</h2>

        <!-- Login Form -->
        <form @submit.prevent="login">
          <label for="email" class="form-label">Email</label>
          <div class="mb-3">
            <input v-model="email" id="email" type="email" class="form-control" placeholder="Nhập email"
              @blur="validateEmail" />
          </div>
          <small v-if="emailError" class="text-danger">{{ emailError }}</small>

          <label for="password" class="form-label">Mật khẩu</label>
          <div class="mb-3 password-wrapper">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" id="password"
              placeholder="Nhập mật khẩu" class="login-input form-control" @blur="validatePassword" />
            <button type="button" @click="togglePassword" class="toggle-password-btn">
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <small v-if="passwordError" class="text-danger">{{ passwordError }}</small>

          <!-- Loading and Submit Button -->
          <div class="d-grid">
            <button type="submit" class="btn btn-primary btn-lg" :disabled="isLoading">
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
              Đăng Nhập
            </button>
          </div>

          <p v-if="error" class="text-danger text-center mt-3">{{ error }}</p>
        </form>

        <!-- Forgot Password and Register Links -->
        <div class="text-center mt-4 login-footer">
          <router-link to="/forgot-password" class="forgot-password-link">Quên mật khẩu?</router-link>
          <p class="mt-2">
            Chưa có tài khoản?
            <router-link to="/register" class="register-link">Đăng ký ngay</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
  <FooterComponent />
</template>

<script>
import HeaderComponent from "@/components/HeaderComponent.vue";
import FooterComponent from "@/components/FooterComponent.vue";
import "@/styles/auth/login.css";
import authApi from "@/apis/authApi";

export default {
  components: { FooterComponent, HeaderComponent },
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      error: '',
      emailError: '',
      passwordError: '',
      isLoading: false, // New state for loading
    };
  },



  created() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
  },
  mounted() {
    this.watchInput();
  },


  // mounted() {
  //   // Check if user is already logged in
  //   const token = localStorage.getItem('token');
  //   if (token) {
  //     this.$router.push('/'); // Redirect to home page if user is already logged in
  //   }
  // },

  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    validateEmail() {
      if (!this.email) {
        this.emailError = 'Email không được để trống';
        return false;
      }

      this.email = this.email.trim();

      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(this.email)) {
        this.emailError = 'Email không hợp lệ';
        return false;
      }

      if (this.email.length > 255) {
        this.emailError = 'Email không được vượt quá 255 ký tự';
        return false;
      }

      this.emailError = '';
      return true;
    },

    validatePassword() {
      if (!this.password) {
        this.passwordError = 'Mật khẩu không được để trống';
        return false;
      }

      if (this.password.length < 6) {
        this.passwordError = 'Mật khẩu phải có ít nhất 6 ký tự';
        return false;
      }

      if (this.password.length > 50) {
        this.passwordError = 'Mật khẩu không được vượt quá 50 ký tự';
        return false;
      }

      // Check for at least 1 uppercase, 1 lowercase, 1 number
      const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
      if (!passwordPattern.test(this.password)) {
        this.passwordError = 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số';
        return false;
      }

      // Check for special characters
      const specialChars = /[!@#$%^&*(),.?":{}|<>]/;
      if (!specialChars.test(this.password)) {
        this.passwordError = 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt';
        return false;
      }

      this.passwordError = '';
      return true;
    },

    validateForm() {
      const isEmailValid = this.validateEmail();
      const isPasswordValid = this.validatePassword();

      // Clear previous error message
      this.error = '';

      return isEmailValid && isPasswordValid;
    },

    async login() {
      if (!this.validateForm()) return;
      this.isLoading = true;

      try {
        const response = await authApi.login({
          identifier: this.email,
          password: this.password,
        });

        if (response.error) {
          // Handle specific error messages from backend
          if (response.error.message === 'Invalid identifier or password') {
            this.error = 'Email hoặc mật khẩu không chính xác';
          } else if (response.error.message === 'User not found') {
            this.error = 'Email này chưa được đăng ký';
          } else {
            this.error = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.';
          }
          this.isLoading = false;
          return;
        }

        const user = response.user; // MockAPI returns an array, so get the first element
        user.role = user.customRole;
        user.status = user.customStatus;
        user.name = user.username;

        // Check account status
        if (user.status == 'inactive') {
          this.error = 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.';
          this.isLoading = false;
          return;
        }

        // Store user login information and redirect
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('token', response.jwt);

        // Redirect based on role
        switch (user.role) {
          case 'admin':
            this.$router.push('/admin/dashboard');
            break;
          case 'landlord':
            this.$router.push('/landlord/dashboard');
            break;
          case 'tenant':
            this.$router.push('/tenant/dashboard');
            break;
        }
      } catch (error) {
        if (error.response?.status === 400) {
          this.error = 'Email hoặc mật khẩu không chính xác';
        } else if (error.response?.status === 404) {
          this.error = 'Email này chưa được đăng ký';
        } else {
          this.error = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.';
        }
      } finally {
        this.isLoading = false; 
      }
    },
    watchInput() {
      this.$watch('email', () => {
        if (this.email) this.validateEmail();
      });

      this.$watch('password', () => {
        if (this.password) this.validatePassword();
      });
    }

  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-box {
  background-color: #ffffff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-title {
  font-size: 1.8rem;
  color: #4a4e69;
  margin-bottom: 20px;
}

.password-wrapper {
  position: relative;
}

.toggle-password-btn {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
}

.toggle-password-btn:hover {
  color: #495057;
}

.btn-primary {
  padding: 10px;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.btn-primary:hover {
  background-color: #33354d;
}

/* Spinner Style */
.spinner-border {
  vertical-align: middle;
}
</style>
