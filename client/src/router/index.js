import { createRouter, createWebHistory } from 'vue-router'
import ImageViewer from '../pages/ImageViewer.vue'
import CategoryManager from '../pages/CategoryManager.vue'

const routes = [
  {
    path: '/',
    redirect: '/imageViewer'
  },
  {
    path: '/imageViewer',
    name: 'ImageViewer',
    component: ImageViewer
  },
  {
    path: '/categoryManager',
    name: 'CategoryManager',
    component: CategoryManager
  },
  {
  path: '/mobileImageViewer',
  name: 'MobileImageViewer',
  component: () => import('../pages/MobileImageViewer.vue'),
}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router