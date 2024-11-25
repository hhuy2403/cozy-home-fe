<template>
  <div class="maintenance-page">
    <div class="maintenance-container">
      <!-- Header Section -->
      <header class="page-header">
        <h1><i class="fas fa-tools"></i> Quản Lý Bảo Trì</h1>
      </header>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-file-contract"></i></div>
          <div class="stat-content">
            <h3>Tổng Hợp Đồng</h3>
            <p>{{ contracts.length }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
          <div class="stat-content">
            <h3>Lịch Bảo Trì Sắp Tới</h3>
            <p>{{ upcomingMaintenances }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-clock"></i></div>
          <div class="stat-content">
            <h3>Đang Hiệu Lực</h3>
            <p>{{ activeContracts }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fas fa-exclamation-circle"></i></div>
          <div class="stat-content">
            <h3>Hết Hạn</h3>
            <p>{{ expiredContracts }}</p>
          </div>
        </div>
      </div>
      <!-- Contracts Section -->
      <section class="content-section">
        <div class="section-header">
          <h2><i class="fas fa-file-contract"></i> Quản Lý Hợp Đồng</h2>
          <button class="btn btn-primary" @click="showCreateContractForm">
            <i class="fas fa-plus"></i> Thêm Hợp Đồng
          </button>
        </div>

        <!-- Search Bar -->
        <div class="search-bar">
          <i class="fas fa-search"></i>
          <input type="text" v-model="contractSearchQuery" placeholder="Tìm kiếm hợp đồng..." />
        </div>

        <!-- Contract Form -->
        <div v-if="isContractFormVisible" class="modal-overlay">
          <div class="modal-content">
            <div class="modal-header">
              <h3>{{ isEditing ? 'Chỉnh Sửa Hợp Đồng' : 'Thêm Hợp Đồng Mới' }}</h3>
              <button class="btn-close" @click="closeContractForm">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <form @submit.prevent="saveContract" class="form">
              <div class="form-group">
                <label>Đối tác:</label>
                <input v-model="contractForm.partner" type="text" required />
              </div>
              <div class="form-group">
                <label>Điều khoản:</label>
                <input v-model="contractForm.terms" type="text" required />
              </div>
              <div class="form-group">
                <label>Ngày bắt đầu:</label>
                <input v-model="contractForm.startDate" type="date" required />
              </div>
              <div class="form-group">
                <label>Ngày kết thúc:</label>
                <input v-model="contractForm.endDate" type="date" required />
              </div>
              <div class="form-group">
                <label>File hợp đồng:</label>
                <div class="file-upload">
                  <input type="file" ref="fileInput" @change="handleFileChange" accept=".pdf,.doc,.docx"
                    class="file-input" />
                  <button type="button" class="btn btn-outline" @click="triggerFileInput">
                    <i class="fas fa-upload"></i> Chọn file
                  </button>
                  <span class="file-name">{{ selectedFileName || 'Chưa chọn file' }}</span>
                </div>
                <div v-if="contractForm.fileUrl" class="file-preview">
                  <a :href="contractForm.fileUrl" target="_blank" class="file-link">
                    <i class="fas fa-file-alt"></i> Xem file hiện tại
                  </a>
                </div>
              </div>
              <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                  <i class="fas fa-save"></i>
                  {{ isEditing ? 'Cập Nhật' : 'Lưu' }}
                </button>
                <button type="button" class="btn btn-secondary" @click="closeContractForm">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Contracts Table -->
        <div class="table-container">
          <table v-if="!isLoading">
            <thead>
              <tr>
                <th>Đối Tác</th>
                <th>Điều Khoản</th>
                <th>Ngày Bắt Đầu</th>
                <th>Ngày Kết Thúc</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredContracts.length == 0">
                <td colspan="6" class="no-data">Không có dữ liệu</td>
              </tr>
              <tr v-else v-for="(contract, index) in filteredContracts" :key="contract.id">
                <td>{{ contract.partner }}</td>
                <td>{{ contract.terms }}</td>
                <td>{{ formatDate(contract.startDate) }}</td>
                <td>{{ formatDate(contract.endDate) }}</td>
                <td>
                  <span class="status-badge" :class="getContractStatus(contract)">
                    {{ getContractStatusText(contract) }}
                  </span>
                </td>
                <td class="actions">
                  <button class="btn btn-icon" @click="editContract(contract)" title="Sửa">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-icon danger" @click="deleteContract(contract.id, index)" title="Xóa">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Đang tải...</span>
          </div>
        </div>
      </section>

      <!-- Maintenance Section -->
      <section class="content-section">
        <div class="section-header">
          <h2><i class="fas fa-calendar-check"></i> Lịch Bảo Trì</h2>
          <button class="btn btn-primary" @click="showCreateMaintenanceForm">
            <i class="fas fa-plus"></i> Thêm Lịch Bảo Trì
          </button>
        </div>

        <!-- Search Bar -->
        <div class="search-bar">
          <i class="fas fa-search"></i>
          <input type="text" v-model="maintenanceSearchQuery" placeholder="Tìm kiếm lịch bảo trì..." />
        </div>

        <!-- Maintenance Form -->
        <div v-if="isMaintenanceFormVisible" class="modal-overlay">
          <div class="modal-content">
            <div class="modal-header">
              <h3>{{ isEditingMaintenance ? 'Chỉnh Sửa Lịch Bảo Trì' : 'Thêm Lịch Bảo Trì Mới' }}</h3>
              <button class="btn-close" @click="hideCreateMaintenanceForm">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <form @submit.prevent="saveMaintenance" class="form">
              <div class="form-group">
                <label>Ngày:</label>
                <input v-model="maintenanceForm.date" type="date" required />
              </div>
              <div class="form-group">
                <label>Loại bảo trì:</label>
                <input v-model="maintenanceForm.type" type="text" required />
              </div>
              <div class="form-group">
                <label>Chi tiết:</label>
                <textarea v-model="maintenanceForm.details" rows="3" required></textarea>
              </div>
              <div class="form-group">
                <label>Hợp đồng:</label>
                <select v-model="maintenanceForm.contractId" required>
                  <option value="">Chọn hợp đồng</option>
                  <option v-for="contract in contracts" :key="contract.id" :value="contract.id">
                    {{ contract.partner }}
                  </option>
                </select>
              </div>
              <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                  <i class="fas fa-save"></i>
                  {{ isEditingMaintenance ? 'Cập Nhật' : 'Lưu' }}
                </button>
                <button type="button" class="btn btn-secondary" @click="hideCreateMaintenanceForm">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Maintenance Table -->
        <div class="table-container">
          <table v-if="!isLoading">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Loại Bảo Trì</th>
                <th>Chi Tiết</th>
                <th>Hợp Đồng</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredMaintenanceSchedules.length == 0">
                <td colspan="5" class="no-data">Không có dữ liệu</td>
              </tr>
              <tr v-else v-for="(schedule, index) in filteredMaintenanceSchedules" :key="schedule.id">
                <td>{{ formatDate(schedule.date) }}</td>
                <td>{{ schedule.type }}</td>
                <td>{{ schedule.details }}</td>
                <td>{{ getContractPartner(schedule.contractId) }}</td>
                <td class="actions">
                  <button class="btn btn-icon" @click="editMaintenance(schedule)" title="Sửa">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-icon danger" @click="deleteMaintenance(schedule.id, index)" title="Xóa">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Đang tải...</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import axios from 'axios'
import Swal from 'sweetalert2'

// API Configuration
const API_BASE_URL = 'https://6725a513c39fedae05b5670b.mockapi.io/api/v1'

// State Management
const contracts = ref([])
const maintenanceSchedules = ref([])
const isLoading = ref(false)
const isContractFormVisible = ref(false)
const isMaintenanceFormVisible = ref(false)
const isEditing = ref(false)
const isEditingMaintenance = ref(false)
const contractSearchQuery = ref('')
const maintenanceSearchQuery = ref('')
const selectedFile = ref(null)
const selectedFileName = ref('')
const fileInput = ref(null)

// Form States
const contractForm = ref({
  partner: '',
  terms: '',
  startDate: '',
  endDate: '',
  fileUrl: ''
})

const maintenanceForm = ref({
  date: '',
  type: '',
  details: '',
  contractId: ''
})

// Thêm các function xử lý file
const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/djnt4wlng/upload'
const CLOUDINARY_UPLOAD_PRESET = 'cozy-home'

const triggerFileInput = () => {
  fileInput.value.click()
}

const validateFile = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  if (file.size > maxSize) {
    Swal.fire('Lỗi!', 'File không được vượt quá 5MB', 'error');
    return false;
  }

  if (!allowedTypes.includes(file.type)) {
    Swal.fire('Lỗi!', 'Chỉ chấp nhận file PDF hoặc DOC/DOCX', 'error');
    return false;
  }

  return true;
}

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file && validateFile(file)) {
    selectedFile.value = file;
    selectedFileName.value = file.name;
  } else {
    event.target.value = '';
  }
}

const uploadFileToCloudinary = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

  try {
    const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data.secure_url
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

// Computed Properties
const filteredContracts = computed(() => {
  if (!contractSearchQuery.value) return contracts.value

  const query = contractSearchQuery.value.toLowerCase()
  return contracts.value.filter(contract =>
    contract.partner.toLowerCase().includes(query) ||
    contract.terms.toLowerCase().includes(query)
  )
})

const filteredMaintenanceSchedules = computed(() => {
  if (!maintenanceSearchQuery.value) return maintenanceSchedules.value

  const query = maintenanceSearchQuery.value.toLowerCase()
  return maintenanceSchedules.value.filter(schedule =>
    schedule.type.toLowerCase().includes(query) ||
    schedule.details.toLowerCase().includes(query) ||
    getContractPartner(schedule.contractId).toLowerCase().includes(query)
  )
})

const activeContracts = computed(() => {
  const today = new Date()
  return contracts.value.filter(contract => {
    const endDate = new Date(contract.endDate)
    return endDate >= today
  }).length
})

const upcomingMaintenances = computed(() => {
  const today = new Date()
  return maintenanceSchedules.value.filter(schedule => {
    const scheduleDate = new Date(schedule.date)
    return scheduleDate > today
  }).length
})

const expiredContracts = computed(() => {
  const today = new Date()
  return contracts.value.filter(contract => {
    const endDate = new Date(contract.endDate)
    return endDate < today
  }).length
})

// Form Validation
const validateContractForm = () => {
  const today = new Date()
  const startDate = new Date(contractForm.value.startDate)
  const endDate = new Date(contractForm.value.endDate)

  if (endDate < startDate) {
    Swal.fire('Lỗi!', 'Ngày kết thúc phải sau ngày bắt đầu.', 'error')
    return false
  }

  if (startDate < today && !isEditing.value) {
    Swal.fire('Lỗi!', 'Ngày bắt đầu không thể trong quá khứ.', 'error')
    return false
  }

  return true
}

const validateMaintenanceForm = () => {
  const maintenanceDate = new Date(maintenanceForm.value.date)
  const today = new Date()

  if (maintenanceDate < today) {
    Swal.fire('Lỗi!', 'Ngày bảo trì không thể trong quá khứ', 'error')
    return false
  }

  const contract = contracts.value.find(c => c.id == maintenanceForm.value.contractId)
  if (!contract) {
    Swal.fire('Lỗi!', 'Vui lòng chọn hợp đồng', 'error')
    return false
  }

  const contractStartDate = new Date(contract.startDate)
  const contractEndDate = new Date(contract.endDate)

  if (maintenanceDate < contractStartDate || maintenanceDate > contractEndDate) {
    Swal.fire('Lỗi!', 'Ngày bảo trì phải nằm trong thời hạn hợp đồng', 'error')
    return false
  }

  return true
}
// Utility Functions
const formatDate = (date) => {
  return format(new Date(date), 'dd/MM/yyyy', { locale: vi })
}

const getContractPartner = (contractId) => {
  const contract = contracts.value.find(c => c.id == contractId)
  return contract ? contract.partner : 'N/A'
}

const getContractStatus = (contract) => {
  const today = new Date()
  const endDate = new Date(contract.endDate)
  const startDate = new Date(contract.startDate)

  if (today < startDate) return 'status-pending'
  if (today > endDate) return 'status-expired'
  return 'status-active'
}

const getContractStatusText = (contract) => {
  const today = new Date()
  const endDate = new Date(contract.endDate)
  const startDate = new Date(contract.startDate)

  if (today < startDate) return 'Sắp bắt đầu'
  if (today > endDate) return 'Đã hết hạn'
  return 'Đang hiệu lực'
}

// Form Handlers
const showCreateContractForm = () => {
  isContractFormVisible.value = true
  isEditing.value = false
  resetContractForm()
}

const closeContractForm = async () => {
  if (selectedFile.value || contractForm.value.partner) {
    const result = await Swal.fire({
      title: 'Xác nhận',
      text: 'Bạn có chắc muốn hủy? Dữ liệu đã nhập sẽ bị mất.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    })
    if (!result.isConfirmed) return
  }
  isContractFormVisible.value = false
  resetContractForm()
}

const resetContractForm = () => {
  contractForm.value = {
    partner: '',
    terms: '',
    startDate: '',
    endDate: '',
    fileUrl: ''
  }
  selectedFile.value = null
  selectedFileName.value = ''
}

const showCreateMaintenanceForm = () => {
  isMaintenanceFormVisible.value = true
  isEditingMaintenance.value = false
  resetMaintenanceForm()
}

const hideCreateMaintenanceForm = () => {
  isMaintenanceFormVisible.value = false
  resetMaintenanceForm()
}

const resetMaintenanceForm = () => {
  maintenanceForm.value = {
    date: '',
    type: '',
    details: '',
    contractId: ''
  }
}

// API Operations
const handleApiError = async (error, message) => {
  console.error(message, error)
  let errorMessage = 'Đã có lỗi xảy ra.'

  if (error.response) {
    switch (error.response.status) {
      case 400:
        errorMessage = 'Dữ liệu không hợp lệ.'
        break
      case 401:
        errorMessage = 'Vui lòng đăng nhập lại.'
        break
      case 403:
        errorMessage = 'Bạn không có quyền thực hiện thao tác này.'
        break
      case 404:
        errorMessage = 'Không tìm thấy dữ liệu.'
        break
      case 500:
        errorMessage = 'Lỗi hệ thống.'
        break
    }
  }

  await Swal.fire('Lỗi!', errorMessage, 'error')
}

const fetchContracts = async () => {
  try {
    isLoading.value = true
    const response = await axios.get(`${API_BASE_URL}/contracts-admin`)
    contracts.value = response.data
  } catch (error) {
    await handleApiError(error, 'Error fetching contracts')
  } finally {
    isLoading.value = false
  }
}

const fetchMaintenanceSchedules = async () => {
  try {
    isLoading.value = true
    const response = await axios.get(`${API_BASE_URL}/maintenance`)
    maintenanceSchedules.value = response.data
  } catch (error) {
    await handleApiError(error, 'Error fetching maintenance schedules')
  } finally {
    isLoading.value = false
  }
}


// CRUD Operations
const saveContract = async () => {
  if (!validateContractForm()) return

  try {
    isLoading.value = true

    // Upload file nếu có file mới
    if (selectedFile.value) {
      const fileUrl = await uploadFileToCloudinary(selectedFile.value)
      contractForm.value.fileUrl = fileUrl
    }

    if (isEditing.value) {
      await axios.put(`${API_BASE_URL}/contracts-admin/${contractForm.value.id}`, contractForm.value)
      const index = contracts.value.findIndex(c => c.id == contractForm.value.id)
      if (index !== -1) {
        contracts.value[index] = { ...contractForm.value }
      }
    } else {
      const response = await axios.post(`${API_BASE_URL}/contracts-admin`, contractForm.value)
      contracts.value.push(response.data)
    }

    await Swal.fire('Thành công!', 'Hợp đồng đã được lưu.', 'success')
    isContractFormVisible.value = false
    resetContractForm()

    // Reset file selection
    selectedFile.value = null
    selectedFileName.value = ''

  } catch (error) {
    console.error('Error saving contract:', error)
    await Swal.fire('Lỗi!', 'Không thể lưu hợp đồng.', 'error')
  } finally {
    isLoading.value = false
  }
}

const saveMaintenance = async () => {
  if (!validateMaintenanceForm()) return

  try {
    isLoading.value = true
    if (isEditingMaintenance.value) {
      await axios.put(`${API_BASE_URL}/maintenance/${maintenanceForm.value.id}`, maintenanceForm.value)
      const index = maintenanceSchedules.value.findIndex(m => m.id == maintenanceForm.value.id)
      if (index !== -1) {
        maintenanceSchedules.value[index] = { ...maintenanceForm.value }
      }
    } else {
      const response = await axios.post(`${API_BASE_URL}/maintenance`, maintenanceForm.value)
      maintenanceSchedules.value.push(response.data)
    }

    await Swal.fire('Thành công!', 'Lịch bảo trì đã được lưu.', 'success')
    hideCreateMaintenanceForm()
  } catch (error) {
    console.error('Error saving maintenance:', error)
    await Swal.fire('Lỗi!', 'Không thể lưu lịch bảo trì.', 'error')
  } finally {
    isLoading.value = false
  }
}

const editMaintenance = (schedule) => {
  maintenanceForm.value = { ...schedule }
  isEditingMaintenance.value = true
  isMaintenanceFormVisible.value = true
}


const editContract = (contract) => {
  contractForm.value = { ...contract }
  isEditing.value = true
  isContractFormVisible.value = true
}

const deleteMaintenance = async (id, index) => {
  const result = await Swal.fire({
    title: 'Xác nhận xóa',
    text: 'Bạn có chắc chắn muốn xóa lịch bảo trì này?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Xóa',
    cancelButtonText: 'Hủy'
  })

  if (result.isConfirmed) {
    try {
      isLoading.value = true
      await axios.delete(`${API_BASE_URL}/maintenance/${id}`)
      maintenanceSchedules.value.splice(index, 1)
      await Swal.fire('Đã xóa!', 'Lịch bảo trì đã được xóa thành công.', 'success')
    } catch (error) {
      console.error('Error deleting maintenance:', error)
      await Swal.fire('Lỗi!', 'Không thể xóa lịch bảo trì.', 'error')
    } finally {
      isLoading.value = false
    }
  }
}


const deleteContract = async (id, index) => {
  const result = await Swal.fire({
    title: 'Xác nhận xóa',
    text: 'Bạn có chắc chắn muốn xóa hợp đồng này?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Xóa',
    cancelButtonText: 'Hủy'
  })

  if (result.isConfirmed) {
    try {
      isLoading.value = true
      await axios.delete(`${API_BASE_URL}/contracts-admin/${id}`)
      contracts.value.splice(index, 1)
      await Swal.fire('Đã xóa!', 'Hợp đồng đã được xóa thành công.', 'success')
    } catch (error) {
      console.error('Error deleting contract:', error)
      await Swal.fire('Lỗi!', 'Không thể xóa hợp đồng.', 'error')
    } finally {
      isLoading.value = false
    }
  }
}

// Lifecycle Hooks
onMounted(async () => {
  await Promise.all([
    fetchContracts(),
    fetchMaintenanceSchedules()
  ])
})
</script>

<style scoped>
/* Main Layout */
.maintenance-page {
  margin-top: 80px;
  min-height: 100vh;
  background: #f8f9fa;
  padding: 1.5rem;
}

.maintenance-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.page-header {
  margin-bottom: 1.5rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
}

.page-header h1 {
  color: #2c3e50;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  background: #3498db;
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.stat-content h3 {
  color: #666;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.stat-content p {
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
}

/* Section Styles */
.content-section {
  background: #fff;
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #eee;
}

.section-header h2 {
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Search Bar */
.search-bar {
  position: relative;
  margin-bottom: 1rem;
}

.search-bar input {
  width: 100%;
  padding: 0.6rem 0.6rem 0.6rem 2rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
}

.search-bar i {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

/* Table Styles */
.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #f8f9fa;
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.85rem;
  color: #2c3e50;
}

td {
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
  font-size: 0.85rem;
}

/* Button Styles */
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #3498db;
  color: #fff;
}

.btn-secondary {
  background: #f8f9fa;
  color: #2c3e50;
  border: 1px solid #ddd;
}

.btn-icon {
  padding: 0.4rem;
  border-radius: 4px;
  color: #666;
  border: 1px solid #ddd;
}

.btn-icon.danger {
  color: #dc3545;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 8px;
  width: 100%;
  max-width: 450px;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 1.1rem;
}

/* Form Styles */
.form {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.85rem;
  color: #666;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

/* Status Badges */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-expired {
  background: #ffebee;
  color: #c62828;
}

.status-pending {
  background: #fff3e0;
  color: #ef6c00;
}

/* Loading & No Data States */
.loading,
.no-data {
  padding: 1.5rem;
  text-align: center;
  color: #666;
}

/* File Upload Styles */
.file-upload {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.file-input {
  display: none;
}

.btn-outline {
  background: transparent;
  border: 1px solid #3498db;
  color: #3498db;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-outline:hover {
  background: #3498db;
  color: #fff;
}

.file-name {
  color: #666;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.file-preview {
  margin-top: 0.75rem;
}

.file-link {
  color: #3498db;
  text-decoration: none;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.file-link:hover {
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 768px) {
  .maintenance-page {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .section-header {
    flex-direction: column;
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>