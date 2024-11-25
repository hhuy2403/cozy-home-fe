<template>
  <header class="header-component">
    <div class="menu-icon">
      <span></span>
    </div>
    <div class="action-buttons">
      <button class="green-button" @click="handleNoteClick">
        <i class="fas fa-sticky-note"></i> 
      </button>
      <button class="blue-button" @click="handleCalculatorClick">
        <i class="fas fa-calculator"></i>
      </button>
    </div>
    <div v-if="isNoteModalVisible" class="modal">
      <div class="modal-content">
        <h2>Ghi chú</h2>
        <textarea v-model="noteContent" placeholder="Nhập nội dung ghi chú..."></textarea>
        <button @click="saveNote">Lưu</button>
        <button @click="closeNoteModal">Đóng</button>
      </div>
    </div>
    <div v-if="isCalculatorVisible" class="modal">
      <div class="modal-content">
        <h2>Máy tính</h2>
        <iframe src="https://www.desmos.com/scientific" frameborder="0" style="width: 100%; height: 400px;"></iframe>
        <button @click="closeCalculatorModal">Đóng</button>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'HeaderComponent',
  data() {
    return {
      isNoteModalVisible: false,
      isCalculatorVisible: false,
      noteContent: ''
    };
  },
  methods: {
    handleNoteClick() {
      this.isNoteModalVisible = true;
    },
    handleCalculatorClick() {
      this.isCalculatorVisible = true;
    },
    closeNoteModal() {
      this.isNoteModalVisible = false;
    },
    saveNote() {
      console.log('Nội dung ghi chú:', this.noteContent);
      this.closeNoteModal();
    },
    closeCalculatorModal() {
      this.isCalculatorVisible = false;
    }
  }
};
</script>

<style>
.header-component {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #ffffff;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0px;
  right: 0;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.green-button,
.blue-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.green-button {
  background-color: #28a745; /* Green color */
}

.blue-button {
  background-color: #007bff; /* Blue color */
}

.green-button i,
.blue-button i {
  color: white;
  font-size: 1.2em;
}

.header-component .modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}

.header-component .modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

textarea {
  width: 100%;
  height: 100px;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  margin-right: 10px;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>