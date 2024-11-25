const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');

module.exports = defineConfig({
    devServer: {
        proxy: {
            '/api': {
                target: 'https://cdtnapi.lyhai.id.vn',
                changeOrigin: true,
                pathRewrite: { '^/api': '' },
            },
        },
    },
    configureWebpack: {
        plugins: [
            new webpack.DefinePlugin({
                __VUE_OPTIONS_API__: true, // Kích hoạt Options API
                __VUE_PROD_DEVTOOLS__: false, // Tắt DevTools trên production
                __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false, // Tắt cảnh báo mismatch
            }),
        ],
    },
});
