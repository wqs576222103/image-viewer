<template>
  <div id="app">
    <el-container style="min-height: 100vh;">
      <!-- 在移动端隐藏侧边栏，使用顶部导航 -->
      <el-aside width="200px" class="sidebar" :class="{ 'mobile-hidden': isMobile }">
        <el-menu
          :default-active="activeIndex"
          class="el-menu-vertical"
          @select="handleSelect"
          router
        >
          <el-menu-item index="/imageViewer">
            <el-icon><Picture /></el-icon>
            <span>Image Viewer</span>
          </el-menu-item>
          <el-menu-item index="/mobileImageViewer">
            <el-icon><Grid /></el-icon>
            <span>Mobile Viewer</span>
          </el-menu-item>
          <el-menu-item index="/categoryManager">
            <el-icon><Collection /></el-icon>
            <span>Category Manager</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <!-- 在移动端显示顶部导航栏 -->
      <el-header v-if="isMobile" class="mobile-header">
        <div class="mobile-header-content">
          <div class="menu-toggle" @click="toggleMenu">
            <el-icon><Menu /></el-icon>
          </div>
          <div class="header-title">{{ headerTitle }}</div>
          <div class="empty-placeholder"></div>
        </div>
      </el-header>
      
      <!-- 移动端侧边栏抽屉 -->
      <el-drawer
        v-model="drawerVisible"
        direction="ltr"
        size="200px"
        :with-header="false"
        v-if="isMobile"
      >
        <el-menu
          :default-active="activeIndex"
          class="el-menu-vertical mobile-menu"
          @select="handleMobileSelect"
          router
        >
          <el-menu-item index="/imageViewer">
            <el-icon><Picture /></el-icon>
            <span>Image Viewer</span>
          </el-menu-item>
          <el-menu-item index="/mobileImageViewer">
            <el-icon><Grid /></el-icon>
            <span>Mobile Viewer</span>
          </el-menu-item>
          <el-menu-item index="/categoryManager">
            <el-icon><Collection /></el-icon>
            <span>Category Manager</span>
          </el-menu-item>
        </el-menu>
      </el-drawer>
      
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { Picture, Grid, Collection, Menu } from '@element-plus/icons-vue'

export default {
  name: 'App',
  components: {
    Picture,
    Grid,
    Collection,
    Menu
  },
  setup() {
    const route = useRoute();
    const activeIndex = ref(route.path);
    const drawerVisible = ref(false);
    
    // 检测是否为移动端
    const isMobile = computed(() => {
      return window.innerWidth <= 768;
    });
    
    // 根据当前路由设置标题
    const headerTitle = computed(() => {
      switch (route.path) {
        case '/imageViewer':
          return 'Image Viewer';
        case '/mobileImageViewer':
          return 'Mobile Viewer';
        case '/categoryManager':
          return 'Category Manager';
        default:
          return 'Image Management';
      }
    });

    watch(
      () => route.path,
      (newPath) => {
        activeIndex.value = newPath;
        // 关闭抽屉
        drawerVisible.value = false;
      }
    );

    const handleSelect = (key) => {
      activeIndex.value = key;
    };
    
    const handleMobileSelect = (key) => {
      activeIndex.value = key;
      drawerVisible.value = false;
    };
    
    const toggleMenu = () => {
      drawerVisible.value = !drawerVisible.value;
    };

    return {
      activeIndex,
      drawerVisible,
      isMobile,
      headerTitle,
      handleSelect,
      handleMobileSelect,
      toggleMenu
    };
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background-color: #f5f5f5;
}

.el-menu-vertical {
  height: 100%;
}

.sidebar.mobile-hidden {
  display: none;
}

.mobile-header {
  background-color: #409eff;
  color: white;
  padding: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.mobile-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 15px;
}

.menu-toggle {
  font-size: 20px;
  cursor: pointer;
}

.header-title {
  font-size: 18px;
  font-weight: 500;
}

.empty-placeholder {
  width: 20px; /* 平衡布局 */
}

.mobile-menu {
  border-right: none;
}

@media (min-width: 769px) {
  .mobile-header {
    display: none;
  }
}
</style>