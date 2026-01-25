import { createRouter, createWebHistory } from 'vue-router'
import ImageViewer from '../pages/ImageViewer.vue'
import CategoryManager from '../pages/CategoryManager.vue'
import AlbumViewer from '../pages/AlbumViewer.vue'
import PhotoAlbum from '../pages/PhotoAlbum.vue'
import Login from '../pages/Login.vue'
import AuthService from '../services/authService'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录',
      hideSidebar: true,
      hideHeader: true
    }
  },
  {
    path: '/',
    redirect: '/imageViewer'
  },
  {
    path: '/imageViewer',
    name: 'ImageViewer',
    component: ImageViewer,
    meta: {
      title: 'Image Viewer',
      icon: 'Picture',
      showInMenu: true,
      requiresAuth: true
    }
  },
  {
    path: '/categoryManager',
    name: 'CategoryManager',
    component: CategoryManager,
    meta: {
      title: 'Category Manager',
      icon: 'Collection',
      showInMenu: true,
      requiresAuth: true
    }
  },
  {
    path: '/mobileImageViewer',
    name: 'MobileImageViewer',
    component: () => import('../pages/MobileImageViewer.vue'),
    meta: {
      title: 'Mobile Viewer',
      icon: 'Grid',
      showInMenu: true,
      requiresAuth: true
    }
  },
  // {
  //   path: '/album',
  //   name: 'AlbumViewer',
  //   component: AlbumViewer,
  //   meta: {
  //     title: 'Photo Album',
  //     icon: 'PictureRounded',
  //     showInMenu: true,
  //   }
  // },
  {
    path: '/PhotoAlbum',
    name: 'PhotoAlbum',
    component: PhotoAlbum,
    meta: {
      title: 'Vintage Photo Album',
      icon: 'PictureRounded',
      showInMenu: true,
    }
  }
]

const router = createRouter({
  history: process.env.NODE_ENV === 'production' ? createWebHistory('./') : createWebHistory(),
  routes
})

// 全局路由守卫
router.beforeEach((to, from, next) => {
  // 如果路由需要认证
  if (to.meta.requiresAuth) {
    // 检查用户是否已认证
    if (AuthService.isAuthenticated()) {
      next()
    } else {
      // 未认证则跳转到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath } // 保存重定向的目标路径
      })
    }
  } else {
    // 不需要认证的路由直接通过
    next()
  }
})

export default router