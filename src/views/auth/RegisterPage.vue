<template>
  <HeaderComponent />
  <div class="register-page">
    <div class="register-container">
      <div class="register-box">
        <h2 class="register-title">Đăng Ký</h2>
        <form @submit.prevent="registerUser">
          <div class="mb-3">
            <label for="name" class="form-label">Tên</label>
            <input type="text" v-model="user.name" id="name" class="form-control" placeholder="Nhập tên của bạn" />
            <p v-if="errors.name" class="text-danger">{{ errors.name }}</p>
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" v-model="user.email" id="email" class="form-control" placeholder="Nhập email" />
            <p v-if="errors.email" class="text-danger">{{ errors.email }}</p>
          </div>
          <div class="mb-3 password-field">
            <label for="password" class="form-label">Mật khẩu</label>
            <div class="input-group">
              <input :type="showPassword ? 'text' : 'password'" v-model="user.password" id="password"
                class="form-control" placeholder="Nhập mật khẩu" />
              <button type="button" @click="togglePassword" class="toggle-password-btn">
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <p v-if="errors.password" class="text-danger">{{ errors.password }}</p>
          </div>
          <div class="mb-3">
            <label for="role" class="form-label">Vai trò</label>
            <select v-model="user.role" id="role" class="form-control" required>
              <option value="tenant">Người thuê</option>
              <option value="landlord">Chủ nhà</option>
            </select>
            <p v-if="errors.role" class="text-danger">{{ errors.role }}</p>
          </div>
          <div class="d-grid">
            <button type="submit" class="btn btn-primary btn-lg">Đăng Ký</button>
          </div>
          <p v-if="errorMessage" class="text-danger text-center mt-3">{{ errorMessage }}</p>
        </form>
        <div class="text-center mt-4">
          <p>Đã có tài khoản? <router-link to="/login" class="back-to-login-link">Quay lại đăng nhập</router-link></p>
        </div>
      </div>
    </div>
  </div>
  <FooterComponent />
</template>

<script>
import Swal from 'sweetalert2';
import HeaderComponent from "@/components/HeaderComponent.vue";
import FooterComponent from "@/components/FooterComponent.vue";
import "@/styles/auth/register.css";
import authApi from '@/apis/authApi';

export default {
  name: 'RegisterPage',
  components: { FooterComponent, HeaderComponent },
  data() {
    return {
      user: {
        name: '',
        email: '',
        password: '',
        role: 'tenant',
        status: 'active'
      },
      errors: {},
      errorMessage: '',
      showPassword: false, // Trạng thái ẩn/hiện mật khẩu
    };
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    validateForm() {
      this.errors = {};

      // Kiểm tra tên
      if (!this.user.name) {
        this.errors.name = 'Vui lòng nhập tên.';
      }

      // Kiểm tra email hợp lệ
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.user.email) {
        this.errors.email = 'Vui lòng nhập email.';
      } else if (!emailPattern.test(this.user.email)) {
        this.errors.email = 'Email không hợp lệ.';
      }

      // Kiểm tra mật khẩu
      const passwordPattern =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!this.user.password) {
        this.errors.password = 'Vui lòng nhập mật khẩu.';
      } else if (!passwordPattern.test(this.user.password)) {
        this.errors.password =
          'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.';
      }

      // Kiểm tra vai trò
      if (!this.user.role) {
        this.errors.role = 'Vui lòng chọn vai trò.';
      }

      return Object.keys(this.errors).length == 0;
    },
    hashPassword(password) {
      return btoa(password); // Encode to Base64 (chỉ dùng cho demo)
    },
    async registerUser() {
      if (!this.validateForm()) {
        return;
      }

      try {

        const response = await authApi.register({
          username: this.user.name,
          email: this.user.email,
          password: this.user.password
        });
        if(response.error){
          Swal.fire({
            icon: 'error',
            title: "Đăng ký thất bại!",
            text: response.error,
            confirmButtonText: 'OK',
            timer: 3000,
            timerProgressBar: true,
          })

          return;
        }

        const resUpdate = await authApi.updateUser(response.user.id, {
          customRole: this.user.role,
          customStatus: this.user.status,
        }, {
          headers: {
            Authorization: `Bearer ${response.jwt}`,
          },
        });

        

        const resUpdateLandInfo = await authApi.updateDetailLandlordInfo("api::landlord-info.landlord-info", {
          userId: response.user.id,
          personalInfo: {
            name: this.user.name,
            email: this.user.email,
            phone: '',
            address: '',
          },
        }, {
          headers: {
            Authorization: `Bearer ${response.jwt}`,
          },
        });
        
        if(resUpdate.error || resUpdateLandInfo.error){
          Swal.fire({
            icon: 'error',
            title: "Đăng ký thất bại!",
            text: response.error,
            confirmButtonText: 'OK',
            timer: 3000,
            timerProgressBar: true,
          })

          return;
        }

        Swal.fire({
          icon: 'success',
          title: 'Đăng ký thành công!',
          text: 'Bạn có thể đăng nhập bây giờ.',
          confirmButtonText: 'OK',
          timer: 3000,
          timerProgressBar: true,
        }).then(() => {
          this.$router.push('/login');
        });

      } catch (error) {
        this.errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
        Swal.fire({
            icon: 'error',
            title: 'Đăng ký thất bại!',
            text: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
            confirmButtonText: 'OK',
            timer: 3000,
            timerProgressBar: true,
        })
      }
    },
  },
};
</script>
