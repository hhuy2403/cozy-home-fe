import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './styles/main.css';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/js/all.js';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


// Import BootstrapVue3 (Vue 3 version)
import BootstrapVue3 from 'bootstrap-vue-3';
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css';

// Create the Vue app
const app = createApp(App);

// Use plugins
app.use(router);
app.use(BootstrapVue3);

// Mount the app
app.mount('#app');
