import { createRouter, createWebHistory } from 'vue-router';
import IndexPage from '@/views/IndexPage.vue';
// Import cho Admin
import AdminDashboard from '@/views/admin/AdminDashboard.vue';
import AdminUserManagement from '@/views/admin/AdminUserManagement.vue';
import AdminFinancialManagement from "@/views/admin/AdminFinancialManagement.vue";
import AdminMaintenanceManagement from "@/views/admin/AdminMaintenanceManagement.vue";
import AdminNotificationManagement from "@/views/admin/AdminNotificationManagement.vue";
import AdminProfile from "@/views/admin/AdminProfile.vue";
import AdminSettings from '@/views/admin/AdminSettings.vue';

// Import cho Tenant
import TenantDashboard from '@/views/tenant/TenantDashboard.vue';
import TenantContracts from '@/views/tenant/TenantContracts.vue';
import TenantPaymentHistory from '@/views/tenant/TenantPaymentHistory.vue';
import TenantPayments from '@/views/tenant/TenantPayments.vue';
import TenantProfile from '@/views/tenant/TenantProfile.vue';
import TenantMyRoom from '@/views/tenant/TenantMyRoom.vue';
import TenantSetting from '@/views/tenant/TenantSetting.vue';

// Import cho Landlord
import LandlordDashboard from '@/views/landlord/LandlordDashboard.vue';
import RoomIndex from "@/views/landlord/room/RoomIndex.vue";
import CreateHome from "@/views/landlord/area/CreateHome.vue";
import CreateRoom from "@/views/landlord/room/CreateRoom.vue";
import EditHome from "@/views/landlord/area/EditHome.vue";
import CreateRoomFast from "@/views/landlord/room/CreateRoomFast.vue";
import EditRoom from "@/views/landlord/room/EditRoom.vue";
import ListRoom from "@/views/landlord/room/ListRoom.vue";
import CreateCustomer from "@/views/landlord/customer/CreateCustomer.vue";
import ServiceIndex from "@/views/landlord/service/ServiceIndex.vue";
import CreateService from "@/views/landlord/service/CreateService.vue";
import CustomerList from "@/views/landlord/room/CustomerList.vue";
import DataPower from "@/views/landlord/datapower/DataPower.vue";
import DataWater from "@/views/landlord/datapower/DataWater.vue";
import OtherFee from "@/views/landlord/otherfee/OtherFee.vue";
import OtherFeeCreate from "@/views/landlord/otherfee/OtherFeeCreate.vue";
import calculatorMoney from "@/views/landlord/calculator-money/CalculatorMoney.vue";
import SettingIndex from "@/views/landlord/setting/SettingIndex.vue";
import AssetIndex from "@/views/landlord/asset/AssetIndex.vue";
import AssetCreate from "@/views/landlord/asset/AssetCreate.vue";
import ContractIndex from "@/views/landlord/contract/ContractIndex.vue";
import ContractCreate from "@/views/landlord/contract/ContractCreate.vue";
import BookingIndex from "@/views/landlord/booking/BookingIndex.vue";
import BookingCreate from "@/views/landlord/booking/BookingCreate.vue";
import ReportCustomerRent from "@/views/landlord/report/ReportCustomerRent.vue";
import ReportCustomerDebt from "@/views/landlord/report/ReportCustomerDebt.vue";
import ReportCustomerDeposit from "@/views/landlord/report/ReportCustomerDeposit.vue";
import ReportCustomerContractExpired from "@/views/landlord/report/ReportCustomerContractExpired.vue";
import ReportRoomPerson from "@/views/landlord/report/ReportRoomPerson.vue";
import ReportInvoiceDetail from "@/views/landlord/report/ReportInvoiceDetail.vue";



// Import Layouts
import AdminTenantLayout from '@/layouts/AdminTenantLayout.vue';
import LandlordLayout from '@/layouts/LandlordLayout.vue';
import LoginPage from "@/views/auth/LoginPage.vue";
import RegisterPage from "@/views/auth/RegisterPage.vue";
import ForgotPassword from "@/views/auth/ForgotPassword.vue";
import ChangePassword from "@/views/settings/ChangePassword.vue";
import NotificationPage from "@/views/NotificationPage.vue";
import SupportPage from "@/views/SupportPage.vue";
import ResetPassword from "@/views/auth/ResetPassword.vue";

// Định nghĩa các routes
const routes = [
    {
        path: '/',
        component: IndexPage,
    },
    {
        path: '/login',
        component: LoginPage,
    },
    {
        path: '/register',
        component: RegisterPage,
    },
    {
        path: '/forgot-password',
        component: ForgotPassword,
    },
    {
        path: '/reset-password',
        component: ResetPassword,
    },
    {
        path: '/notification',
        component: NotificationPage,
    },
    {
        path: '/support',
        component: SupportPage,
    },
    {
        path: '/admin',
        component: AdminTenantLayout,  // Layout cho admin và tenant
        meta: { requiresAdmin: true },  // Đánh dấu yêu cầu quyền admin
        children: [
            { path: 'dashboard', component: AdminDashboard },
            { path: 'users', component: AdminUserManagement },
            { path: 'financial', component: AdminFinancialManagement },
            { path: 'maintenance', component: AdminMaintenanceManagement },
            { path: 'notification', component: AdminNotificationManagement },
            { path: 'profile', component: AdminProfile },
            { path: 'settings', component: AdminSettings }
        ]
    },
    {
        path: '/tenant',
        component: AdminTenantLayout,  // Layout cho tenant
        meta: { requiresTenant: true },  // Đánh dấu yêu cầu quyền tenant
        children: [
            { path: 'dashboard', component: TenantDashboard },
            { path: 'contracts', component: TenantContracts },
            { path: 'payment-history', component: TenantPaymentHistory },
            { path: 'payments', component: TenantPayments },
            { path: 'profile', component: TenantProfile },
            { path: 'my-room', component: TenantMyRoom },
            { path: 'settings', component: TenantSetting },
            { path: 'notification', component: NotificationPage },
            { path: 'support', component: SupportPage }
        ]
    },
    {
        path: '/landlord',
        component: LandlordLayout,  // Layout riêng cho landlord
        meta: { requiresLandlord: true },  // Đánh dấu yêu cầu quyền landlord
        children: [
            { path: 'dashboard', component: LandlordDashboard },
            { path: 'room-index', component: RoomIndex },
            { path: 'create-home', component: CreateHome },
            { path: 'create-room', component: CreateRoom },
            { path: 'edit-home', component: EditHome },
            { path: 'create-room-fast', component: CreateRoomFast },
            { path: 'edit-room', component: EditRoom },
            { path: 'list-room', component: ListRoom },
            { path: 'create-customer', component: CreateCustomer },
            { path: 'service-index', component: ServiceIndex },
            { path: 'create-service', component: CreateService },
            { path: 'customer', component: CustomerList },
            { path: 'data-power', component: DataPower },
            { path: 'data-water', component: DataWater },
            { path: 'other-fee', component: OtherFee },
            { path: 'other-fee-create', component: OtherFeeCreate },
            { path: 'calculator-money', component: calculatorMoney },
            { path: 'setting-index', component: SettingIndex },
            { path: 'asset-index', component: AssetIndex },
            { path: 'asset-create/:id?', component: AssetCreate },
            { path: 'contract-index', component: ContractIndex },
            { path: 'contract-create/:id?', component: ContractCreate },
            { path: 'booking-index', component: BookingIndex },
            { path: 'booking-create', component: BookingCreate },
            { path: 'change-password', component: ChangePassword },
            { path: 'customer-rent', component: ReportCustomerRent },
            { path: 'customer-debt', component: ReportCustomerDebt },
            { path: 'customer-deposit', component: ReportCustomerDeposit },
            { path: 'customer-contract-expired', component: ReportCustomerContractExpired },
            { path: 'room-person', component: ReportRoomPerson },
            { path: 'invoice-detail', component: ReportInvoiceDetail },
            { path: 'notification', component: NotificationPage },
            { path: 'support', component: SupportPage }
            





        ]
    }
];

// Tạo và export router
const router = createRouter({
    history: createWebHistory(),  // Sử dụng chế độ history mode
    routes
});

// Thêm logic để bảo vệ các route yêu cầu quyền admin, landlord, tenant
router.beforeEach((to, from, next) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (to.matched.some(record => record.meta.requiresAdmin)) {
        if (currentUser && currentUser.role == 'admin') {
            next();
        } else {
            next('/login');
        }
    } else if (to.matched.some(record => record.meta.requiresLandlord)) {
        if (currentUser && currentUser.role == 'landlord') {
            next();
        } else {
            next('/login');
        }
    } else if (to.matched.some(record => record.meta.requiresTenant)) {
        if (currentUser && currentUser.role == 'tenant') {
            next();
        } else {
            next('/login');
        }
    } else {
        next();
    }
});

router.beforeEach((to, from, next) => {
    window.scrollTo(0, 0);
    next();
});

export default router;
