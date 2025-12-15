import { createRouter, createWebHistory } from 'vue-router'
import ImageViewer from '../pages/ImageViewer.vue'

const routes = [
  {
    path: '/',
    redirect: '/imageViewer'
  },
  {
    path: '/imageViewer',
    name: 'ImageViewer',
    component: ImageViewer
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router