const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/file': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  // 生产环境下的公共路径, 生产环境用 /front
  publicPath: process.env.NODE_ENV === 'production' ? '/front' : '/',
})