<template>
  <div class="support container mt-4">
    <div class="support-header mb-4">
      <h2><i class="fas fa-headset me-2"></i>Yêu cầu hỗ trợ</h2>
      <p class="text-muted">Gửi yêu cầu hỗ trợ của bạn đến chủ trọ</p>
    </div>

    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <div v-else>
      <!-- Filter and Search Section -->
      <div v-if="supportRequests.length > 0" class="filter-section mb-4">
        <div class="row align-items-center">
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text">
                <i class="fas fa-search"></i>
              </span>
              <input 
                type="text" 
                class="form-control" 
                v-model="searchQuery"
                placeholder="Tìm kiếm yêu cầu..." 
              />
            </div>
          </div>
          <div class="col-md-4">
            <select class="form-select" v-model="statusFilter">
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Đang chờ xử lý</option>
              <option value="resolved">Đã giải quyết</option>
            </select>
          </div>
        </div>
      </div>

      <!-- New Support Request Form -->
      <div v-if="isTenant" class="new-request-section mb-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-4">
              <i class="fas fa-plus-circle me-2"></i>Tạo yêu cầu mới
            </h5>
            <form @submit.prevent="sendSupportRequest">
              <div class="mb-3">
                <label for="supportTitle" class="form-label">Tiêu đề</label>
                <input 
                  type="text" 
                  id="supportTitle" 
                  v-model="newRequest.title" 
                  class="form-control"
                  :class="{ 'is-invalid': errors.title }"
                  required 
                />
                <div class="invalid-feedback">{{ errors.title }}</div>
              </div>
              
              <div class="mb-3">
                <label for="supportMessage" class="form-label">Nội dung yêu cầu</label>
                <textarea 
                  id="supportMessage" 
                  v-model="newRequest.message" 
                  class="form-control" 
                  :class="{ 'is-invalid': errors.message }"
                  rows="4" 
                  required
                ></textarea>
                <div class="invalid-feedback">{{ errors.message }}</div>
              </div>

              <div class="text-end">
                <button 
                  type="button" 
                  class="btn btn-outline-secondary me-2"
                  @click="resetForm"
                >
                  <i class="fas fa-undo me-1"></i>Làm mới
                </button>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="isSubmitting"
                >
                  <i class="fas fa-paper-plane me-1"></i>
                  {{ isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Support Requests List -->
      <div class="requests-section">
        <div v-if="filteredRequests.length > 0">
          <div 
            class="support-request card mb-3" 
            v-for="(request, index) in filteredRequests" 
            :key="index"
          >
            <div class="card-body">
              <div class="request-status" :class="request.resolved ? 'resolved' : 'pending'">
                {{ request.resolved ? 'Đã giải quyết' : 'Đang chờ' }}
              </div>
              <h5 class="card-title">{{ request.title }}</h5>
              <p class="card-text">{{ request.message }}</p>
              <div class="request-meta">
                <span class="sender-info">
                  <i class="fas fa-user me-1"></i>
                  {{ request.senderName }}
                </span>
                <span class="date-info">
                  <i class="fas fa-clock me-1"></i>
                  {{ formatDate(request.date) }}
                </span>
              </div>
              
              <div v-if="isLandlord" class="action-buttons mt-3">
                <button 
                  class="btn btn-success" 
                  @click="markAsResolved(index)" 
                  :disabled="request.resolved"
                >
                  <i class="fas fa-check me-1"></i>
                  {{ request.resolved ? 'Đã giải quyết' : 'Đánh dấu đã giải quyết' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="alert alert-info">
          <i class="fas fa-info-circle me-2"></i>
          Không có yêu cầu hỗ trợ nào để hiển thị.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2';

export default {
  data() {
    return {
      isTenant: false,
      isLandlord: false,
      loading: true,
      isSubmitting: false,
      searchQuery: '',
      statusFilter: 'all',
      errors: {
        title: '',
        message: ''
      },
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

  computed: {
    filteredRequests() {
      return this.supportRequests
        .filter(request => {
          const matchesSearch = request.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                              request.message.toLowerCase().includes(this.searchQuery.toLowerCase());
          const matchesStatus = this.statusFilter == 'all' || 
                              (this.statusFilter == 'resolved' && request.resolved) ||
                              (this.statusFilter == 'pending' && !request.resolved);
          return matchesSearch && matchesStatus;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  },

  async mounted() {
    await this.initializeData();
  },

  methods: {
    async initializeData() {
      try {
        this.checkUserRole();
        await this.loadSupportRequests();
      } catch (error) {
        console.error('Error initializing data:', error);
        Swal.fire('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại sau.', 'error');
      } finally {
        this.loading = false;
      }
    },

    // ... rest of your existing methods ...

    resetForm() {
      this.newRequest = {
        title: '',
        message: '',
        date: '',
        senderName: '',
        senderEmail: '',
        resolved: false,
      };
      this.errors = {
        title: '',
        message: ''
      };
    },

    validateForm() {
      let isValid = true;
      this.errors = {
        title: '',
        message: ''
      };

      if (!this.newRequest.title.trim()) {
        this.errors.title = 'Vui lòng nhập tiêu đề';
        isValid = false;
      }

      if (!this.newRequest.message.trim()) {
        this.errors.message = 'Vui lòng nhập nội dung yêu cầu';
        isValid = false;
      }

      return isValid;
    }
  }
};
</script>

<style scoped>
.support {
  margin-top: 5em !important;
  min-height: 100vh;
  padding: 20px;
  background-color: #f8f9fa;
}

.support-header h2 {
  color: #2a3f54;
  font-size: 30px;
  font-weight: 500;
  margin-bottom: 10px;
}

.card {
  border: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}

.request-status {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.9em;
  font-weight: 500;
}

.request-status.pending {
  background-color: #fff3cd;
  color: #856404;
}

.request-status.resolved {
  background-color: #d4edda;
  color: #155724;
}

.request-meta {
  display: flex;
  gap: 20px;
  color: #6c757d;
  font-size: 0.9em;
  margin-top: 15px;
}

.form-control {
  border-radius: 8px;
  border: 1px solid #ced4da;
  padding: 10px 15px;
}

.form-control:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
}

.alert {
  border-radius: 8px;
  padding: 15px;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

@media (max-width: 768px) {
  .support {
    padding: 10px;
  }
  
  .filter-section .row > div {
    margin-bottom: 10px;
  }
  
  .request-meta {
    flex-direction: column;
    gap: 10px;
  }
}
</style>