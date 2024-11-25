<template>
  <div class="min-vh-100">
    <!-- Loading State -->
    <div v-if="!dataLoaded" class="d-flex justify-content-center align-items-center min-vh-100">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="d-flex justify-content-center align-items-center min-vh-100">
      <div class="text-center">
        <h3 class="text-danger">{{ error }}</h3>
        <button class="btn btn-primary mt-3" @click="retryLoading">Thử lại</button>
      </div>
    </div>

    <!-- Content State -->
    <div v-else class="container mt-4">
      <!-- Header Section -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">Cấu hình</h2>
        <div>
          <button type="button" class="btn btn-secondary me-2" @click="confirmReset">
            <i class="fas fa-refresh"></i> Nhập lại
          </button>
          <button type="button" class="btn btn-primary" @click="saveOwnerInfo" :disabled="isSaving || !isFormValid">
            <template v-if="isSaving">
              <span class="spinner-border spinner-border-sm me-1"></span>
              Đang lưu...
            </template>
            <template v-else>
              <i class="fas fa-save me-1"></i>
              Lưu
            </template>
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <!-- Nav tabs -->
          <ul class="nav nav-tabs mb-4">
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab == 'info' }" @click.prevent="activeTab = 'info'"
                href="#">
                Thông tin chủ trọ
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab == 'payment' }" @click.prevent="activeTab = 'payment'"
                href="#">
                Thanh toán
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" :class="{ active: activeTab == 'utilities' }"
                @click.prevent="activeTab = 'utilities'" href="#">
                Đơn giá điện nước
              </a>
            </li>
          </ul>

          <!-- Info Tab -->
          <div v-if="activeTab == 'info'">
            <!-- Personal Info -->
            <div class="form-group row mb-3">
              <label for="name" class="col-sm-2 col-form-label">Họ tên: <span class="text-danger">*</span></label>
              <div class="col-sm-10">
                <input type="text" class="form-control" :class="{ 'is-invalid': v$.owner.personalInfo.name.$error }"
                  id="name" v-model="owner.personalInfo.name">
                <div class="invalid-feedback" v-if="v$.owner.personalInfo.name.$error">
                  Vui lòng nhập họ tên hợp lệ (ít nhất 2 ký tự)
                </div>
              </div>
            </div>

            <div class="form-group row mb-3">
              <label class="col-sm-2 col-form-label">Avatar:</label>
              <div class="col-sm-10">
                <div class="d-flex align-items-center gap-3">
                  <img :src="owner.personalInfo.avatar" class="img-thumbnail"
                    style="width: 100px; height: 100px; object-fit: cover" v-if="owner.personalInfo.avatar">
                  <input type="file" ref="avatarInput" class="d-none" accept="image/*" @change="handleAvatarUpload">
                  <button type="button" class="btn btn-outline-primary" @click="$refs.avatarInput.click()">
                    <i class="fas fa-upload"></i> Tải lên avatar
                  </button>
                </div>
              </div>
            </div>

            <div class="form-group row mb-3">
              <label for="email" class="col-sm-2 col-form-label">Email: <span class="text-danger">*</span></label>
              <div class="col-sm-10">
                <input type="email" class="form-control" :class="{ 'is-invalid': v$.owner.personalInfo.email.$error }"
                  id="email" v-model="owner.personalInfo.email">
                <div class="invalid-feedback" v-if="v$.owner.personalInfo.email.$error">
                  Vui lòng nhập email hợp lệ
                </div>
              </div>
            </div>

            <div class="form-group row mb-3">
              <label for="phone" class="col-sm-2 col-form-label">Số điện thoại: <span
                  class="text-danger">*</span></label>
              <div class="col-sm-10">
                <input type="tel" class="form-control" :class="{ 'is-invalid': v$.owner.personalInfo.phone.$error }"
                  id="phone" v-model="owner.personalInfo.phone">
                <div class="invalid-feedback" v-if="v$.owner.personalInfo.phone.$error">
                  Vui lòng nhập số điện thoại hợp lệ (10 số)
                </div>
              </div>
            </div>

            <div class="form-group row mb-3">
              <label for="identityCard" class="col-sm-2 col-form-label">CMND/CCCD: <span
                  class="text-danger">*</span></label>
              <div class="col-sm-10">
                <input type="text" class="form-control"
                  :class="{ 'is-invalid': v$.owner.personalInfo.identityCard.$error }" id="identityCard"
                  v-model="owner.personalInfo.identityCard">
                <div class="invalid-feedback" v-if="v$.owner.personalInfo.identityCard.$error">
                  Vui lòng nhập số CMND/CCCD
                </div>
              </div>
            </div>

            <div class="form-group row mb-3">
              <label for="issueDate" class="col-sm-2 col-form-label">Ngày cấp:</label>
              <div class="col-sm-10">
                <input type="date" class="form-control" id="issueDate" v-model="owner.personalInfo.issueDate">
              </div>
            </div>

            <!-- Location Info -->
            <div class="form-group row mb-3">
              <label for="city" class="col-sm-2 col-form-label">Tỉnh/Thành phố:</label>
              <div class="col-sm-10">
                <input type="text" class="form-control" id="city" v-model="owner.city"
                  placeholder="Nhập tỉnh/thành phố">
              </div>
            </div>

            <div class="form-group row mb-3">
              <label for="district" class="col-sm-2 col-form-label">Quận/Huyện:</label>
              <div class="col-sm-10">
                <input type="text" class="form-control" id="district" v-model="owner.district"
                  placeholder="Nhập quận/huyện">
              </div>
            </div>

            <div class="form-group row mb-3">
              <label for="ward" class="col-sm-2 col-form-label">Phường/Xã:</label>
              <div class="col-sm-10">
                <input type="text" class="form-control" id="ward" v-model="owner.ward" placeholder="Nhập phường/xã">
              </div>
            </div>

            <div class="form-group row mb-3">
              <label for="address" class="col-sm-2 col-form-label">Địa chỉ cụ thể:</label>
              <div class="col-sm-10">
                <input type="text" class="form-control" id="address" v-model="owner.personalInfo.address"
                  placeholder="Số nhà, đường, ...">
              </div>
            </div>
          </div> <!-- Payment Tab -->
          <div v-else-if="activeTab == 'payment'" class="p-3">
            <!-- Bank Info -->
            <div class="mb-4">
              <h5>Thông tin tài khoản ngân hàng</h5>
              <div class="mb-3">
                <label class="form-label">Số tài khoản</label>
                <input type="text" class="form-control" v-model="owner.paymentSettings.bankInfo.accountNumber">
              </div>
              <div class="mb-3">
                <label class="form-label">Tên ngân hàng</label>
                <input type="text" class="form-control" v-model="owner.paymentSettings.bankInfo.bankName">
              </div>
              <div class="mb-3">
                <label class="form-label">Chủ tài khoản</label>
                <input type="text" class="form-control" v-model="owner.paymentSettings.bankInfo.accountHolder">
              </div>
              <div class="mt-3">
                <label class="form-label">QR Code Ngân hàng</label>
                <div class="d-flex align-items-center gap-3">
                  <div v-if="owner.paymentSettings.bankInfo.qrCode" class="position-relative">
                    <img :src="owner.paymentSettings.bankInfo.qrCode" class="img-thumbnail" style="max-width: 200px">
                    <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0"
                      @click="removeQR('bank')">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <div v-else>
                    <input type="file" ref="bankQRInput" class="d-none" accept="image/*"
                      @change="handleQRUpload($event, 'bank')">
                    <button type="button" class="btn btn-outline-primary" @click="$refs.bankQRInput.click()">
                      <i class="fas fa-upload"></i> Tải lên QR Code
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- MoMo Info -->
            <div class="mb-4">
              <h5>Thông tin Ví MoMo</h5>
              <div class="mb-3">
                <label class="form-label">Số điện thoại MoMo</label>
                <input type="text" class="form-control" v-model="owner.paymentSettings.momoInfo.phoneNumber">
              </div>
              <div class="mt-3">
                <label class="form-label">QR Code MoMo</label>
                <div class="d-flex align-items-center gap-3">
                  <div v-if="owner.paymentSettings.momoInfo.qrCode" class="position-relative">
                    <img :src="owner.paymentSettings.momoInfo.qrCode" class="img-thumbnail" style="max-width: 200px">
                    <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0"
                      @click="removeQR('momo')">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <div v-else>
                    <input type="file" ref="momoQRInput" class="d-none" accept="image/*"
                      @change="handleQRUpload($event, 'momo')">
                    <button type="button" class="btn btn-outline-primary" @click="$refs.momoQRInput.click()">
                      <i class="fas fa-upload"></i> Tải lên QR Code
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Utilities Tab -->
          <div v-else-if="activeTab == 'utilities'" class="p-3">
            <!-- Cấu hình điện -->
            <div class="mb-4">
              <h5>Cấu hình giá điện theo bậc thang</h5>
              <div class="table-responsive">
                <table class="table table-bordered">
                  <thead>
                    <tr>
                      <th>Bậc</th>
                      <th>Mức tiêu thụ (kWh)</th>
                      <th>Đơn giá (VNĐ/kWh)</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(tier, index) in owner.utilityRates.electric" :key="index">
                      <td>{{ index + 1 }}</td>
                      <td>
                        <div class="input-group">
                          <input type="number" class="form-control" v-model.number="tier.range">
                          <span class="input-group-text">kWh</span>
                        </div>
                      </td>
                      <td>
                        <div class="input-group">
                          <input type="number" class="form-control" v-model.number="tier.price">
                          <span class="input-group-text">VNĐ</span>
                        </div>
                      </td>
                      <td>
                        <button type="button" class="btn btn-danger btn-sm"
                          @click="removeUtilityTier('electric', index)">
                          <i class="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <button type="button" class="btn btn-secondary btn-sm" @click="addUtilityTier('electric')">
                  <i class="fas fa-plus"></i> Thêm bậc
                </button>
              </div>
            </div>

            <!-- Cấu hình nước -->
            <div class="mb-4">
              <h5>Cấu hình giá nước theo bậc thang</h5>
              <div class="table-responsive">
                <table class="table table-bordered">
                  <thead>
                    <tr>
                      <th>Bậc</th>
                      <th>Mức tiêu thụ (m³)</th>
                      <th>Đơn giá (VNĐ/m³)</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(tier, index) in owner.utilityRates.water" :key="index">
                      <td>{{ index + 1 }}</td>
                      <td>
                        <div class="input-group">
                          <input type="number" class="form-control" v-model.number="tier.range">
                          <span class="input-group-text">m³</span>
                        </div>
                      </td>
                      <td>
                        <div class="input-group">
                          <input type="number" class="form-control" v-model.number="tier.price">
                          <span class="input-group-text">VNĐ</span>
                        </div>
                      </td>
                      <td>
                        <button type="button" class="btn btn-danger btn-sm" @click="removeUtilityTier('water', index)">
                          <i class="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <button type="button" class="btn btn-secondary btn-sm" @click="addUtilityTier('water')">
                  <i class="fas fa-plus"></i> Thêm bậc
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, helpers } from '@vuelidate/validators';
import Swal from 'sweetalert2';
import crudApi from '@/apis/crudApi';

const CLOUDINARY_UPLOAD_PRESET = 'cozy-home'
const CLOUDINARY_CLOUD_NAME = 'djnt4wlng'
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

const DEFAULT_OWNER = {
  personalInfo: {
    name: '',
    avatar: '',
    email: '',
    phone: '',
    identityCard: '',
    issueDate: '',
    address: ''
  },
  city: '',
  district: '',
  ward: '',
  paymentSettings: {
    defaultMethod: 'bank',
    bankInfo: {
      accountNumber: '',
      bankName: '',
      accountHolder: '',
      qrCode: ''
    },
    momoInfo: {
      phoneNumber: '',
      qrCode: ''
    }
  },
  utilityRates: {
    electric: [{ range: 0, price: 0 }],
    water: [{ range: 0, price: 0 }]
  }
}

export default {
  name: 'SettingIndex',

  setup() {
    return { v$: useVuelidate() }
  },

  data() {
    return {
      activeTab: 'info',
      isSaving: false,
      dataLoaded: false,
      error: null,
      cities: [],
      districts: [],
      wards: [],
      owner: { ...DEFAULT_OWNER }
    }
  },

  validations() {
    return {
      owner: {
        personalInfo: {
          name: { required, minLength: minLength(2) },
          identityCard: { required },
          phone: { required, isValidPhone: helpers.regex(/^[0-9]{10}$/) },
          email: { required, email: helpers.regex(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i) }
        }
      }
    }
  },

  computed: {
    isFormValid() {
      return !this.v$.$error
    }
  },

  async created() {
    await this.loadInitialData()
  },

  methods: {
    async loadInitialData() {
      try {
        this.error = null
        this.dataLoaded = false

        await this.loadOwnerInfo();

        this.dataLoaded = true
      } catch (error) {
        console.error('Error loading initial data:', error)
        this.error = 'Không thể tải dữ liệu. Vui lòng thử lại.'
      }
    },

    async retryLoading() {
      await this.loadInitialData()
    },

    async handleAvatarUpload(event) {
      if (!event?.target?.files?.length) return
      const file = event.target.files[0]

      try {
        const imageUrl = await this.uploadToCloudinary(file)
        this.owner.personalInfo.avatar = imageUrl
      } catch (error) {
        console.error('Error uploading avatar:', error)
        this.showToast('error', 'Lỗi', 'Có lỗi khi tải lên avatar')
      }
    },

    async handleQRUpload(event, type) {
      if (!event?.target?.files?.length) return
      const file = event.target.files[0]

      try {
        const imageUrl = await this.uploadToCloudinary(file)
        if (type == 'bank') {
          this.owner.paymentSettings.bankInfo.qrCode = imageUrl
        } else if (type == 'momo') {
          this.owner.paymentSettings.momoInfo.qrCode = imageUrl
        }
      } catch (error) {
        console.error('Error uploading QR:', error)
        this.showToast('error', 'Lỗi', 'Có lỗi khi tải lên QR Code')
      }
    },

    removeQR(type) {
      if (type == 'bank') {
        this.owner.paymentSettings.bankInfo.qrCode = ''
      } else if (type == 'momo') {
        this.owner.paymentSettings.momoInfo.qrCode = ''
      }
    },

    async uploadToCloudinary(file) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

      try {
        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const data = await response.json()
        return data.secure_url
      } catch (error) {
        console.error('Error uploading to Cloudinary:', error)
        throw error
      }
    },



    async loadOwnerInfo() {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'))
        if (!currentUser?.id) {
          throw new Error('User not found')
        }

        // Kiểm tra role của user có phải là landlord không
        if (currentUser.role !== 'landlord') {
          throw new Error('User is not a landlord')
        }

        // Fetch thông tin user
        const userResponse = await crudApi.read("plugin::users-permissions.user", {id: currentUser.id});
        if (userResponse.error) {
          throw new Error('Failed to fetch user data')
        }
        const allUsers = userResponse.data.map(i => ({ ...i, status: i.customStatus, role: i.customRole }));
        const userData = allUsers[0];

        // Fetch tất cả landlord info
        const landlordResponse = await crudApi.read("api::landlord-info.landlord-info", {userId: {id: currentUser.id}});
        if (landlordResponse.error) {
          throw new Error('Failed to fetch landlord data')
        }
        const landlordData = landlordResponse.data[0];

        // Tìm thông tin landlord của user hiện tại
        const landlordInfo = landlordData;

        if (!landlordInfo) {
          // Nếu chưa có thông tin landlord, khởi tạo với thông tin cơ bản từ user
          this.owner = {
            ...DEFAULT_OWNER,
            personalInfo: {
              ...DEFAULT_OWNER.personalInfo,
              name: userData.username || '',
              avatar: userData.avatar || '',
              email: userData.email || '',
              phone: userData.phone || ''
            }
          }
        } else {
          // Nếu đã có thông tin, load đầy đủ
          this.owner = {
            personalInfo: {
              name: userData.username || '',
              avatar: userData.avatar || '',
              email: userData.email || '',
              phone: userData.phone || '',
              identityCard: landlordInfo.personalInfo?.identityCard || '',
              issueDate: landlordInfo.personalInfo?.issueDate || '',
              address: landlordInfo.personalInfo?.address || ''
            },
            city: landlordInfo.city || '',
            district: landlordInfo.district || '',
            ward: landlordInfo.ward || '',
            paymentSettings: landlordInfo.paymentSettings || DEFAULT_OWNER.paymentSettings,
            utilityRates: landlordInfo.utilityRates || DEFAULT_OWNER.utilityRates
          }
        }

      } catch (error) {
        console.error('Error loading owner info:', error)
        throw error
      }
    },

    showToast(icon, title, text) {
      return Swal.fire({
        icon,
        title,
        text,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
    },

    async confirmReset() {
      const result = await Swal.fire({
        title: 'Xác nhận',
        text: 'Bạn có chắc muốn nhập lại form?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Hủy'
      })

      if (result.isConfirmed) {
        this.owner = { ...DEFAULT_OWNER }
        await this.loadInitialData()
      }
    },

    addUtilityTier(type) {
      this.owner.utilityRates[type].push({ range: 0, price: 0 })
    },

    removeUtilityTier(type, index) {
      this.owner.utilityRates[type].splice(index, 1)
    },

    async saveOwnerInfo() {
      try {
        const isValid = await this.v$.$validate()
        if (!isValid) {
          this.showToast('error', 'Lỗi', 'Vui lòng kiểm tra lại thông tin')
          return
        }

        this.isSaving = true
        const currentUser = JSON.parse(localStorage.getItem('currentUser'))
        if (!currentUser?.id) throw new Error('User not found')

        // 1. Cập nhật thông tin user
        const userUpdateData = {
          name: this.owner.personalInfo.name,
          username: this.owner.personalInfo.name,
          avatar: this.owner.personalInfo.avatar,
          email: this.owner.personalInfo.email,
          phone: this.owner.personalInfo.phone
        }

        // 2. Chuẩn bị dữ liệu landlord
        const landlordUpdateData = {
          userId: currentUser.id,
          personalInfo: this.owner.personalInfo,
          paymentSettings: this.owner.paymentSettings,
          utilityRates: this.owner.utilityRates,
          city: this.owner.city,
          district: this.owner.district,
          ward: this.owner.ward,
          updatedAt: new Date().toISOString()
        }

        // 3. Fetch tất cả landlord info để kiểm tra
        const landlordResponse = await crudApi.read("api::landlord-info.landlord-info", {userId: {id: currentUser.id}});
        const existingLandlord = landlordResponse.data[0];

        // 4. Thực hiện các request cập nhật
        const userResponse = await crudApi.update("plugin::users-permissions.user", {id: currentUser.id}, userUpdateData);
        const landlordResponse2 = existingLandlord
        ? await crudApi.update("api::landlord-info.landlord-info", {id: existingLandlord.id}, landlordUpdateData)
        : await crudApi.create("api::landlord-info.landlord-info", landlordUpdateData);

        if (userResponse.error || landlordResponse2.error) {
          throw new Error('Failed to update data')
        }

        this.showToast('success', 'Thành công', 'Đã lưu thông tin thành công!')
      } catch (error) {
        console.error('Error saving settings:', error)
        this.showToast('error', 'Lỗi', 'Có lỗi xảy ra, vui lòng thử lại!')
      } finally {
        this.isSaving = false
      }
    },
  }
}
</script>

<style scoped>
/* Base Container */
.min-vh-100 {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #eef2f7 100%);
}

.container {
  margin-top: 3rem !important;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

/* Card Styling */
.card {
  border: none;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.card-body {
  padding: 1.25rem;
}

/* Header Section */
.header-title {
  font-size: 1.35rem;
  font-weight: 600;
  color: #2c3e50;
}

/* Navigation Tabs */
.nav-tabs {
  border: none;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 0.3rem;
  margin-bottom: 1.25rem;
  gap: 0.25rem;
}

.nav-tabs .nav-link {
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #64748b;
  transition: all 0.2s ease;
}

.nav-tabs .nav-link:hover {
  color: #334155;
  background: rgba(0, 0, 0, 0.03);
}

.nav-tabs .nav-link.active {
  color: #fff;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
}

/* Form Elements */
.form-control {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  min-height: 38px;
  transition: all 0.2s ease;
}

.form-control:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 0.3rem;
}

/* Buttons */
.btn {
  padding: 0.45rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #e2e8f0;
  color: #2c3e50;
}

.btn-danger {
  background: #ef4444;
  border: none;
  color: white;
}

.btn-sm {
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
}

/* Tables */
.table {
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.table th {
  background: #f8fafc;
  font-weight: 600;
  color: #475569;
  padding: 0.75rem;
  border-bottom: 2px solid #e2e8f0;
}

.table td {
  padding: 0.75rem;
  vertical-align: middle;
  border-bottom: 1px solid #e2e8f0;
}

/* Input Groups */
.input-group {
  border-radius: 8px;
  overflow: hidden;
}

.input-group-text {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 0.9rem;
  padding: 0.5rem 0.75rem;
}

/* Image Upload */
.img-thumbnail {
  max-width: 120px;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  transition: all 0.2s ease;
}

.img-thumbnail:hover {
  border-color: #3b82f6;
}

/* Validation States */
.is-invalid {
  border-color: #ef4444;
}

.invalid-feedback {
  font-size: 0.8rem;
  color: #ef4444;
  margin-top: 0.25rem;
}

/* Loading States */
.spinner-border {
  width: 1.2rem;
  height: 1.2rem;
  border-width: 0.15em;
}

/* Utilities */
.mb-3 {
  margin-bottom: 0.75rem !important;
}

.mb-4 {
  margin-bottom: 1rem !important;
}

.gap-3 {
  gap: 0.75rem !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .card-body {
    padding: 1rem;
  }

  .form-group {
    margin-bottom: 0.75rem;
  }

  .col-form-label {
    margin-bottom: 0.25rem;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .header-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active {
  animation: fadeIn 0.3s ease-out;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #94a3b8;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>