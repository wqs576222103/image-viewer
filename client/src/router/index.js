import { createRouter, createWebHistory } from 'vue-router'
import ImageViewer from '../pages/ImageViewer.vue'
import CategoryManager from '../pages/CategoryManager.vue'
import AlbumViewer from '../pages/AlbumViewer.vue'
import PhotoAlbum from '../pages/PhotoAlbum.vue'

const routes = [
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
      showInMenu: true
    }
  },
  {
    path: '/categoryManager',
    name: 'CategoryManager',
    component: CategoryManager,
    meta: {
      title: 'Category Manager',
      icon: 'Collection',
      showInMenu: true
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
  history: createWebHistory(),
  routes
})

export default router