<template>
    <div class="support container mt-4">
      <h2>Yêu cầu hỗ trợ</h2>
  
      <div v-if="isTenant">
        <!-- Gửi yêu cầu hỗ trợ (Chỉ hiển thị cho người thuê) -->
        <form @submit.prevent="sendSupportRequest" class="mb-4">
          <div class="mb-3">
            <label for="supportTitle" class="form-label">Tiêu đề</label>
            <input type="text" id="supportTitle" v-model="newRequest.title" class="form-control" required />
          </div>
          <div class="mb-3">
            <label for="supportMessage" class="form-label">Nội dung yêu cầu</label>
            <textarea id="supportMessage" v-model="newRequest.message" class="form-control" rows="4" required></textarea>
          </div>
          <button type="submit" class="btn btn-primary"><i class="fas fa-paper-plane"></i> Gửi yêu cầu</button>
        </form>
      </div>
  
      <!-- Danh sách yêu cầu hỗ trợ -->
      <div v-if="supportRequests.length > 0">
        <div class="support-request card mb-3" v-for="(request, index) in supportRequests" :key="index">
          <div class="card-body">
            <h5 class="card-title">{{ request.title }}</h5>
            <p class="card-text">{{ request.message }}</p>
            <p class="card-text text-muted"><small>Gửi bởi: {{ request.senderName }} lúc {{ formatDate(request.date) }}</small></p>
            <div v-if="isLandlord" class="text-end">
              <button class="btn btn-success" @click="markAsResolved(index)" :disabled="request.resolved">
                <i class="fas fa-check"></i> {{ request.resolved ? 'Đã giải quyết' : 'Đánh dấu đã giải quyết' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="alert alert-info">Không có yêu cầu hỗ trợ nào để hiển thị.</div>
    </div>
  </template>
  
  <script>
  import Swal from 'sweetalert2';
  
  export default {
    data() {
      return {
        isTenant: false,
        isLandlord: false,
        newRequest: {
          title: '',
          message: '',
          date: '',
          senderName: '',
          senderEmail: '',
          resolved: false,
        },
        supportRequests: [],
      };
    },
    mounted() {
      this.checkUserRole();
      this.loadSupportRequests();
    },
    methods: {
      checkUserRole() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
          this.isTenant = currentUser.role == 'tenant';
          this.isLandlord = currentUser.role == 'landlord';
        }
      },
      loadSupportRequests() {
        const allSupportRequests = JSON.parse(localStorage.getItem('supportRequests')) || [];
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
        this.supportRequests = allSupportRequests.filter(request =>
          (this.isLandlord || (this.isTenant && request.senderEmail == currentUser.email))
        );
      },
      sendSupportRequest() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
          Swal.fire('Lỗi', 'Không thể xác định người gửi yêu cầu.', 'error');
          return;
        }
  
        this.newRequest.date = new Date().toISOString();
        this.newRequest.senderName = currentUser.name;
        this.newRequest.senderEmail = currentUser.email;
  
        const allSupportRequests = JSON.parse(localStorage.getItem('supportRequests')) || [];
        allSupportRequests.push({ ...this.newRequest });
        localStorage.setItem('supportRequests', JSON.stringify(allSupportRequests));
  
        this.supportRequests.push({ ...this.newRequest });
        Swal.fire('Thành công', 'Yêu cầu hỗ trợ đã được gửi.', 'success');
  
        // Reset form
        this.newRequest = {
          title: '',
          message: '',
          date: '',
          senderName: '',
          senderEmail: '',
          resolved: false,
        };
      },
      markAsResolved(index) {
        this.supportRequests[index].resolved = true;
        const allSupportRequests = JSON.parse(localStorage.getItem('supportRequests')) || [];
        const updatedRequests = allSupportRequests.map(request => {
          if (
            request.title == this.supportRequests[index].title &&
            request.senderEmail == this.supportRequests[index].senderEmail &&
            request.date == this.supportRequests[index].date
          ) {
            request.resolved = true;
          }
          return request;
        });
        localStorage.setItem('supportRequests', JSON.stringify(updatedRequests));
        Swal.fire('Thành công', 'Yêu cầu hỗ trợ đã được đánh dấu là đã giải quyết.', 'success');
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
  .support {
    margin-top: 3em;
  }
  
  h2 {
    color: #2a3f54;
    font-size: 30px;
    font-weight: 500;
    text-align: left;
  }
  
  .support-request {
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
  
  .btn-success {
    background-color: #28a745;
    border-color: #28a745;
    color: #fff;
  }
  
  .alert-info {
    font-size: 16px;
    color: #856404;
    background-color: #fff3cd;
    border-color: #ffeeba;
  }
  </style>
  