<template>
  <div class="admin-tenant-layout">
    <!-- HeaderComponent.vue dùng chung cho admin và tenant -->
    <HeaderComponent />

    <!-- Nội dung chính được hiển thị dựa trên route -->
    <main class="main-content">
      <router-view />
    </main>
  </div>

  <FooterComponent />
</template>

<script>
import HeaderComponent from '@/components/HeaderComponent.vue';
import FooterComponent from "@/components/FooterComponent.vue";

export default {
  name: 'AdminTenantLayout',
  components: {
    FooterComponent,
    HeaderComponent
  }
};
</script>

<style scoped>
.admin-tenant-layout {
  display: flex;
  flex-direction: column;
  height: auto;
}

.main-content {
  flex-grow: 1;
  padding: 20px;
  background-color: #f0f2f5;
  overflow-y: auto;
}
</style>
