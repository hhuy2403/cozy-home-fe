<template>
  <HeaderComponent />
  <div class="forgot-password-page">
    <div class="forgot-password-box">
      <h1>Quên mật khẩu</h1>
      <p>Vui lòng nhập địa chỉ email của bạn để nhận liên kết khôi phục mật khẩu.</p>

      <!-- Form nhập email -->
      <form @submit.prevent="submitEmail">
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" v-model="email" id="email" placeholder="Nhập địa chỉ email của bạn" @blur="validateEmail"
            class="form-control" />
        </div>
        <small v-if="emailError" class="error-message">{{ emailError }}</small>
        <button type="submit" class="btn btn-primary">Gửi liên kết khôi phục</button>
      </form>

      <!-- Thông báo đã nhớ mật khẩu -->
      <p class="mt-3">
        Đã nhớ mật khẩu?
        <router-link to="/login">Đăng nhập tại đây</router-link>
      </p>

      <!-- Thông báo thành công -->
      <p v-if="successMessage" class="text-success mt-3">
        <a :href="resetLink" target="_blank">{{ successMessage }}</a>
      </p>
      <p v-else-if="errorMessage" class="text-danger mt-3">{{ errorMessage }}</p>
    </div>
  </div>
  <FooterComponent />
</template>

<script>
import Swal from 'sweetalert2';
import HeaderComponent from "@/components/HeaderComponent.vue";
import FooterComponent from "@/components/FooterComponent.vue";

export default {
  name: 'ForgotPassword',
  components: { FooterComponent, HeaderComponent },
  data() {
    return {
      email: '',
      emailError: '',
      successMessage: '',
      errorMessage: '',
      resetLink: '',
    };
  },
  methods: {
    generateResetToken() {
      return Math.random().toString(36).substr(2); // Generate a random string as token
    },

    validateEmail() {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.email) {
        this.emailError = 'Email không được để trống.';
        return false;
      } else if (!emailPattern.test(this.email)) {
        this.emailError = 'Địa chỉ email không hợp lệ.';
        return false;
      }
      this.emailError = '';
      return true;
    },

    submitEmail() {
      if (this.validateEmail()) {
        // Fetch user data from MockAPI to verify the email
        fetch(`https://6725a513c39fedae05b5670b.mockapi.io/api/v1/users?email=${this.email}`)
          .then(response => response.json())
          .then(users => {
            // Only proceed if a user with the provided email exists
            if (users.length == 0) {
              Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Email không tồn tại trong hệ thống.',
                confirmButtonColor: '#d33'
              });
              this.successMessage = '';
              return;
            }

            const user = users[0]; // Assuming the email is unique in the database

            // Generate a reset token
            const resetToken = this.generateResetToken();

            // Save the reset token to MockAPI
            fetch(`https://6725a513c39fedae05b5670b.mockapi.io/api/v1/users/${user.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ resetToken }),
            })
              .then(() => {
                // Display the clickable reset link
                this.resetLink = `${window.location.origin}/reset-password?token=${resetToken}&email=${encodeURIComponent(this.email)}`;
                Swal.fire({
                  icon: 'success',
                  title: 'Thành công!',
                  html: `Nhấp vào <a href="${this.resetLink}" target="_blank">đây</a> để đặt lại mật khẩu của bạn.`,
                  confirmButtonColor: '#28a745'
                });
                this.errorMessage = '';
              })
              .catch(error => {
                Swal.fire({
                  icon: 'error',
                  title: 'Lỗi!',
                  text: 'Không thể lưu mã đặt lại mật khẩu.',
                  confirmButtonColor: '#d33'
                });
                console.error(error);
              });
          })
          .catch(error => {
            console.error('Lỗi khi tìm người dùng:', error);
            Swal.fire({
              icon: 'error',
              title: 'Lỗi!',
              text: 'Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.',
              confirmButtonColor: '#d33'
            });
          });
      }
    },

    resetForm() {
      this.email = '';
      this.emailError = '';
    },
  },
};
</script>

<style scoped>
.forgot-password-page {
  margin-top: -20px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120vh;
  background: linear-gradient(135deg, #fff, #fff);
  color: #ffffff;
}

.forgot-password-box {
  background-color: #ffffff;
  color: #2a3f54;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 100%;
  text-align: center;
}

h1 {
  margin-bottom: 20px;
}

p {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-control {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ced4da;
  transition: border-color 0.3s ease;
}

.form-control:focus {
  border-color: #2a3f54;
  box-shadow: 0 0 0 0.2rem rgba(42, 63, 84, 0.25);
}

.btn-primary {
  padding: 10px 20px;
  background-color: #2a3f54;
  color: #ffffff;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-primary:hover {
  background-color: #1e2d3b;
}

.error-message {
  color: #ff4d4d;
  font-size: 0.9rem;
}

.text-success {
  color: #28a745;
}

.text-danger {
  color: #ff4d4d;
}

/* Responsive cho màn hình nhỏ */
@media (max-width: 576px) {
  .forgot-password-box {
    padding: 20px;
  }

  h1 {
    font-size: 1.5rem;
  }

  .btn-primary {
    padding: 10px 0;
  }
}
</style>
