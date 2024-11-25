<template>
  <div class="layout">
    <LandlordSidebar />

    <div class="main-content">
      <LandlordHeader/>
      <router-view />
    </div>
  </div>
</template>

<script>
import LandlordSidebar from '@/components/LandlordSidebar.vue';
import LandlordHeader from '@/components/LandlordHeader.vue';
export default {
  components: {
    LandlordSidebar,
    LandlordHeader
  }
};
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f4f7f9;
}
</style>
