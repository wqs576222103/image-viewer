import { createRouter, createWebHistory } from 'vue-router'
import ImageViewer from '../components/ImageViewer.vue'

const routes = [
  {
    path: '/',
    name: 'ImageViewer',
    component: ImageViewer
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router