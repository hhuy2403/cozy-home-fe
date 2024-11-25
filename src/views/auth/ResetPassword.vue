<template>
    <HeaderComponent />
    <div class="reset-password-page">
      <div class="reset-password-box">
        <h1>Đặt lại mật khẩu</h1>
  
        <!-- Success/Error Messages -->
        <p v-if="successMessage" class="text-success">{{ successMessage }}</p>
        <p v-else-if="errorMessage" class="text-danger">{{ errorMessage }}</p>
  
        <!-- Reset Password Form -->
        <form @submit.prevent="validateTokenAndResetPassword" v-if="!successMessage">
          <div class="form-group">
            <label for="newPassword">Mật khẩu mới:</label>
            <input type="password" v-model="newPassword" id="newPassword" required class="form-control" placeholder="Nhập mật khẩu mới" />
          </div>
          <button type="submit" class="btn btn-primary">Đặt lại mật khẩu</button>
        </form>
      </div>
    </div>
    <FooterComponent />
  </template>
  
  <script>
  import HeaderComponent from "@/components/HeaderComponent.vue";
  import FooterComponent from "@/components/FooterComponent.vue";
  
  export default {
    name: 'ResetPassword',
    components: { FooterComponent, HeaderComponent },
    data() {
      return {
        email: new URLSearchParams(window.location.search).get('email') || '',
        token: new URLSearchParams(window.location.search).get('token') || '',
        newPassword: '',
        successMessage: '',
        errorMessage: '',
      };
    },
    methods: {
      validateTokenAndResetPassword() {
        fetch(`https://6725a513c39fedae05b5670b.mockapi.io/api/v1/users?email=${this.email}`)
          .then(response => response.json())
          .then(users => {
            const user = users[0];
            if (user && user.resetToken == this.token) {
              fetch(`https://6725a513c39fedae05b5670b.mockapi.io/api/v1/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  password: btoa(this.newPassword), // Encode password (example)
                  resetToken: '' // Clear reset token
                })
              })
                .then(() => {
                  this.successMessage = 'Mật khẩu của bạn đã được đặt lại thành công!';
                })
                .catch(error => {
                  console.error('Lỗi khi đặt lại mật khẩu:', error);
                  this.errorMessage = 'Không thể đặt lại mật khẩu. Vui lòng thử lại sau.';
                });
            } else {
              this.errorMessage = 'Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.';
            }
          })
          .catch(error => {
            console.error('Lỗi khi xác minh mã:', error);
            this.errorMessage = 'Không thể xác minh mã đặt lại mật khẩu.';
          });
      }
    }
  };
  </script>
  
  <style scoped>
  .reset-password-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #f0f4f8, #d3d9e2);
  }
  
  .reset-password-box {
    background-color: #ffffff;
    color: #2a3f54;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    max-width: 450px;
    width: 100%;
    text-align: center;
  }
  
  h1 {
    font-size: 1.8rem;
    margin-bottom: 15px;
    color: #4a4e69;
  }
  
  p {
    margin-bottom: 15px;
    font-size: 0.9rem;
    color: #495057;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-control {
    width: 100%;
    padding: 12px;
    border-radius: 6px;
    border: 1px solid #ced4da;
    transition: border-color 0.3s ease;
  }
  
  .form-control:focus {
    border-color: #4a4e69;
    box-shadow: 0 0 0 0.2rem rgba(74, 78, 105, 0.25);
  }
  
  .btn-primary {
    width: 100%;
    padding: 12px;
    background-color: #4a4e69;
    color: #ffffff;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .btn-primary:hover {
    background-color: #33354d;
  }
  
  .text-success {
    color: #28a745;
    font-size: 1rem;
    margin-bottom: 10px;
  }
  
  .text-danger {
    color: #e63946;
    font-size: 1rem;
    margin-bottom: 10px;
  }
  
  /* Responsive for smaller screens */
  @media (max-width: 576px) {
    .reset-password-box {
      padding: 20px;
    }
  
    h1 {
      font-size: 1.5rem;
    }
  }
  </style>
  