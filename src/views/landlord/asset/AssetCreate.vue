<template>
  <div class="asset-form">
    <!-- Header Section -->
    <div class="form-header">
      <div class="header-title">
        <i class="fas fa-box-open"></i>
        <h1>{{ isEditMode ? 'Sửa tài sản' : 'Thêm tài sản' }}</h1>
      </div>
      <div class="header-actions">
        <button type="button" class="action-btn back-btn" @click="goBack">
          <i class="fas fa-arrow-left"></i>
          <span>Quay về</span>
        </button>
        <button
          type="submit"
          form="assetForm"
          class="action-btn save-btn"
          :disabled="isSaving || isLoading"
        >
          <template v-if="isSaving">
            <div class="spinner"></div>
            <span>{{ isEditMode ? 'Đang cập nhật...' : 'Đang lưu...' }}</span>
          </template>
          <template v-else>
            <i class="fas fa-save"></i>
            <span>{{ isEditMode ? 'Cập nhật' : 'Lưu' }}</span>
          </template>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <span>Đang tải...</span>
    </div>

    <!-- Form Content -->
    <form
      v-else
      id="assetForm"
      @submit.prevent="saveAsset"
      class="form-content"
    >
      <div class="form-grid">
        <!-- Asset Basic Info -->
        <div class="form-section">
          <h2 class="section-title">Thông tin cơ bản</h2>
          <div class="input-group">
            <label for="assetCode">Mã tài sản</label>
            <input
              type="text"
              id="assetCode"
              v-model="asset.assetCode"
              placeholder="Nhập mã tài sản"
            />
          </div>
          <div class="input-group required">
            <label for="assetName">Tên tài sản</label>
            <input
              type="text"
              id="assetName"
              v-model="asset.assetName"
              placeholder="Nhập tên tài sản"
            />
          </div>
        </div>

        <!-- Location Info -->
        <div class="form-section">
          <h2 class="section-title">Vị trí</h2>
          <div class="input-group">
            <label for="house">Nhà</label>
            <select
              id="house"
              v-model="asset.houseId"
              @change="loadRooms(asset.houseId)"
              :disabled="isLoading"
            >
              <option value="">Chọn nhà</option>
              <option v-for="house in houses" :key="house.id" :value="house.id">
                {{ house.name }}
              </option>
            </select>
          </div>
          <div class="input-group">
            <label for="room">Phòng</label>
            <select
              id="room"
              v-model="asset.roomNumber"
              :disabled="!asset.houseId || isLoading"
            >
              <option value="">Chọn phòng</option>
              <option
                v-for="room in filteredRooms"
                :key="room.id"
                :value="room.roomNumber"
              >
                {{ room.roomNumber }}
              </option>
            </select>
          </div>
        </div>

        <!-- Quantity & Price -->
        <div class="form-section">
          <h2 class="section-title">Số lượng & Giá</h2>
          <div class="input-group required">
            <label for="quantity">Số lượng</label>
            <input
              type="number"
              id="quantity"
              v-model="asset.quantity"
              min="1"
            />
          </div>
          <div class="input-group">
            <label for="price">Đơn giá (VND)</label>
            <input
              type="number"
              id="price"
              v-model="asset.price"
              placeholder="Nhập đơn giá"
            />
          </div>
        </div>

        <!-- Dates -->
        <div class="form-section">
          <h2 class="section-title">Thời gian</h2>
          <div class="dates-grid">
            <div class="input-group">
              <label for="purchaseDate">Ngày mua</label>
              <input
                type="date"
                id="purchaseDate"
                v-model="asset.purchaseDate"
              />
            </div>
            <div class="input-group">
              <label for="usageDate">Ngày sử dụng</label>
              <input type="date" id="usageDate" v-model="asset.usageDate" />
            </div>
            <div class="input-group">
              <label for="disposalDate">Ngày thanh lý</label>
              <input
                type="date"
                id="disposalDate"
                v-model="asset.disposalDate"
                :disabled="!asset.isDisposed"
              />
            </div>
          </div>
          <div class="checkbox-group">
            <input type="checkbox" id="disposed" v-model="asset.isDisposed" />
            <label for="disposed">Đã thanh lý</label>
          </div>
        </div>

        <!-- Notes -->
        <div class="form-section full-width">
          <h2 class="section-title">Ghi chú</h2>
          <div class="input-group">
            <textarea
              id="notes"
              v-model="asset.notes"
              placeholder="Nhập ghi chú (nếu có)"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Required Fields Note -->
      <div class="required-note">
        <span class="required-star">*</span> Thông tin bắt buộc
      </div>
    </form>
  </div>
</template>

<script>
import crudApi from '@/apis/crudApi';
import Swal from 'sweetalert2';

//const API_URL = 'https://6725a513c39fedae05b5670b.mockapi.io/api/v1';

export default {
  name: 'AssetCreate',
  data() {
    return {
      asset: {
        isEditMode: false,
        assetCode: '',
        assetName: '',
        houseId: '',
        houseName: '',
        roomNumber: '',
        price: '',
        quantity: 1,
        purchaseDate: '',
        usageDate: '',
        disposalDate: '',
        isDisposed: false,
        notes: '',
        status: 'active',
        customStatus: 'active',
        createdAt: '',
        updatedAt: '',
      },
      houses: [],
      filteredRooms: [],
      isLoading: false,
      isSaving: false,
      isEditMode: false,
      currentUser: null,
    };
  },

  computed: {
    pageTitle() {
      return this.isEditMode ? 'Sửa tài sản' : 'Thêm tài sản';
    },
  },

  async mounted() {
    const assetId = this.$route.params.id;
    this.isEditMode = !!assetId;
    await this.loadInitialData(assetId);
  },

  async created() {
    // Kiểm tra xem có phải mode edit không
    const assetId = this.$route.params.id;
    const mode = this.$route.query.mode;

    this.isEditMode = mode == 'edit' && assetId;

    if (this.isEditMode) {
      await this.loadAssetDetails(assetId);
    }
  },

  methods: {
    async loadInitialData(assetId) {
      try {
        this.isLoading = true;

        // Lấy thông tin người dùng từ localStorage
        const userStr = localStorage.getItem('currentUser');
        if (!userStr) {
          throw new Error('Vui lòng đăng nhập để thực hiện chức năng này!');
        }
        this.currentUser = JSON.parse(userStr);

        await this.loadHouses();
        if (this.isEditMode) {
          await this.loadAssetDetails(assetId);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        Swal.fire('Lỗi', error.message || 'Không thể tải dữ liệu', 'error');
      } finally {
        this.isLoading = false;
      }
    },

    async loadHouses() {
      try {
        if (!this.currentUser?.id) {
          throw new Error('Không tìm thấy thông tin người dùng!');
        }

        const response = await crudApi.read('api::home.home', {landlordId: {id: this.currentUser?.id}});
        if (!response.isSuccess) throw new Error('Failed to load houses');
        const allHouses = response.data;

        // Lọc nhà theo landlordId
        this.houses = allHouses;

        if (this.houses.length > 0 && !this.isEditMode) {
          this.asset.houseId = this.houses[0].id;
          this.asset.houseName = this.houses[0].name;
          await this.loadRooms(this.houses[0].id);
        }
      } catch (error) {
        console.error('Error loading houses:', error);
        this.houses = [];
        Swal.fire('Lỗi', 'Không thể tải danh sách nhà', 'error');
      }
    },

    async loadRooms(houseId) {
      try {
        if (!houseId) {
          this.filteredRooms = [];
          return;
        }

        // Kiểm tra xem nhà có thuộc về landlord không
        const selectedHouse = this.houses.find((h) => h.id == houseId);
        if (!selectedHouse) {
          throw new Error('Không có quyền truy cập vào nhà này!');
        }

        this.asset.houseName = selectedHouse.name;
        const listHouseIds = this.houses.map((house) => house.id);
        const response = await crudApi.read('api::room.room', {houseId: {id: listHouseIds}});

        if (!response.isSuccess) throw new Error('Failed to load rooms');
        const rooms = response.data;

        // Lọc phòng theo houseId
        this.filteredRooms = rooms;

        if (this.filteredRooms.length > 0 && !this.isEditMode) {
          this.asset.roomNumber = this.filteredRooms[0].roomNumber;
        }
      } catch (error) {
        console.error('Error loading rooms:', error);
        this.filteredRooms = [];
        Swal.fire('Lỗi', 'Không thể tải danh sách phòng', 'error');
      }
    },

    async loadAssetDetails(assetId) {
      try {
        this.isLoading = true;
        const response = await crudApi.read(
          'api::landlord-asset.landlord-asset',
          { id: assetId }
        );

        if (!response.isSuccess) {
          throw new Error('Failed to load asset details');
        }

        const assetData = response.data[0] ?? {};
        this.asset = {
          ...assetData,
          houseId: assetData.houseId.id,
          house: assetData.houseId,
          status: assetData.customStatus,
        };
        // Load related data
        await this.loadHouses();
        if (this.asset.houseId) {
          await this.loadRooms(this.asset.houseId);
        }
      } catch (error) {
        console.error('Error loading asset details:', error);
        Swal.fire('Lỗi', 'Không thể tải thông tin tài sản', 'error');
      } finally {
        this.isLoading = false;
      }
    },

    validateForm() {
      if (!this.asset.assetName.trim()) {
        Swal.fire('Lỗi', 'Tên tài sản là bắt buộc.', 'error');
        return false;
      }
      if (!this.asset.houseId) {
        Swal.fire('Lỗi', 'Vui lòng chọn nhà.', 'error');
        return false;
      }
      if (!this.asset.roomNumber) {
        Swal.fire('Lỗi', 'Vui lòng chọn phòng.', 'error');
        return false;
      }
      if (this.asset.quantity <= 0) {
        Swal.fire('Lỗi', 'Số lượng phải lớn hơn 0.', 'error');
        return false;
      }
      if (this.asset.price && this.asset.price < 0) {
        Swal.fire('Lỗi', 'Đơn giá không được nhỏ hơn 0.', 'error');
        return false;
      }
      return true;
    },

    async createAsset(data) {
      const resposne = await crudApi.create(
        'api::landlord-asset.landlord-asset',
        data
      );

      if (resposne.error) {
        throw new Error('Create asset failed');
      }

      return resposne.data;
    },

    async updateAsset(data) {
      const resposne = await crudApi.update(
        'api::landlord-asset.landlord-asset',
        { id: data.id },
        data
      );

      if (!resposne.isSuccess) {
        throw new Error('Update asset failed');
      }

      return resposne.data;
    },

    async saveAsset() {
      if (!this.validateForm()) return;

      try {
        this.isSaving = true;

        if (!this.currentUser?.id) {
          throw new Error('Vui lòng đăng nhập để thực hiện chức năng này!');
        }

        // Kiểm tra quyền truy cập
        const selectedHouse = this.houses.find(
          (h) => h.id == this.asset.houseId
        );
        if (!selectedHouse) {
          throw new Error('Không có quyền thêm tài sản cho nhà này!');
        }

        const assetData = {
          ...this.asset,
          landlordId: this.currentUser.id,
          updatedAt: new Date().toISOString(),
          houseId: selectedHouse.id,
          customStatus: this.asset.status,
        };

        if (!this.isEditMode) {
          assetData.createdAt = new Date().toISOString();
        }

        if (!this.isEditMode) {
          await this.createAsset(assetData);
        } else {
          await this.updateAsset(assetData);
        }

        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: `Tài sản đã được ${
            this.isEditMode ? 'cập nhật' : 'thêm'
          } thành công.`,
          confirmButtonText: 'OK',
        });

        this.goBack();
      } catch (error) {
        console.error('Error saving asset:', error);
        Swal.fire(
          'Lỗi',
          error.message ||
            `Không thể ${this.isEditMode ? 'cập nhật' : 'thêm'} tài sản`,
          'error'
        );
      } finally {
        this.isSaving = false;
      }
    },

    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
/* Container */
.asset-form {
  max-width: 1200px;
  margin: 3rem auto;
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Header */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-title i {
  font-size: 1.5rem;
  color: #3b82f6;
}

.header-title h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

/* Action Buttons */
.header-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn {
  background: #f1f5f9;
  color: #475569;
}

.save-btn {
  background: #22c55e;
  color: white;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Form Layout */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-section {
  background: #f8fafc;
  padding: 1.25rem;
  border-radius: 0.75rem;
}

.full-width {
  grid-column: 1 / -1;
}

/* Section Titles */
.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 1rem;
}

/* Form Controls */
.input-group {
  margin-bottom: 1rem;
}

.input-group label {
  display: block;
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.375rem;
}

.input-group input,
.input-group select,
.input-group textarea {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.input-group input:focus,
.input-group select:focus,
.input-group textarea:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Required Fields */
.required label::after {
  content: ' *';
  color: #ef4444;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
}

.spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.required-star {
  color: red;
}

/* Animations */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .asset-form {
    margin: 1rem;
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .header-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
