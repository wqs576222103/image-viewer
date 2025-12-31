App.vue
<template>
  <div id="app">
    <el-container style="min-height: 100vh;">
      <!-- 在移动端隐藏侧边栏，使用顶部导航 -->
      <el-aside 
        v-if="showSidebar" 
        :width="isCollapse ? '64px' : '200px'" 
        class="sidebar" 
        :class="{ 'mobile-hidden': isMobile }"
      >
        <el-menu
          :default-active="activeIndex"
          class="el-menu-vertical"
          @select="handleSelect"
          :collapse="isCollapse"
          router
        >
          <el-menu-item 
            v-for="menuItem in menuItems" 
            :key="menuItem.path" 
            :index="menuItem.path"
          >
            <el-icon v-if="menuItem.meta.icon === 'Picture'"><Picture /></el-icon>
            <el-icon v-else-if="menuItem.meta.icon === 'Grid'"><Grid /></el-icon>
            <el-icon v-else-if="menuItem.meta.icon === 'Collection'"><Collection /></el-icon>
            <el-icon v-else-if="menuItem.meta.icon === 'PictureRounded'"><PictureRounded /></el-icon>
            <span v-if="!isCollapse">{{ menuItem.meta.title }}</span>
          </el-menu-item>
        </el-menu>
        <div class="menu-collapse-btn" @click="toggleCollapse">
          <el-icon v-if="isCollapse"><ArrowRight /></el-icon>
          <el-icon v-else><ArrowLeft /></el-icon>
        </div>
      </el-aside>
      
      <!-- 在移动端显示顶部导航栏 -->
      <el-header v-if="showHeader && isMobile" class="mobile-header">
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
        v-if="showSidebar && isMobile"
      >
        <el-menu
          :default-active="activeIndex"
          class="el-menu-vertical mobile-menu"
          @select="handleMobileSelect"
          router
        >
          <el-menu-item 
            v-for="menuItem in menuItems" 
            :key="menuItem.path" 
            :index="menuItem.path"
          >
            <el-icon v-if="menuItem.meta.icon === 'Picture'"><Picture /></el-icon>
            <el-icon v-else-if="menuItem.meta.icon === 'Grid'"><Grid /></el-icon>
            <el-icon v-else-if="menuItem.meta.icon === 'Collection'"><Collection /></el-icon>
            <el-icon v-else-if="menuItem.meta.icon === 'PictureRounded'"><PictureRounded /></el-icon>
            <span>{{ menuItem.meta.title }}</span>
          </el-menu-item>
        </el-menu>
      </el-drawer>
      
      <el-main>
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component 
              :is="Component" 
              :showSidebar="showSidebar"
              :showHeader="showHeader"
            />
          </keep-alive>
        </router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { Picture, Grid, Collection, Menu, PictureRounded, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import router from './router'; // 导入router实例

// 导入全局主题CSS
import './assets/css/theme.css';

export default {
  name: 'App',
  components: {
    Picture,
    Grid,
    Collection,
    Menu,
    PictureRounded,
    ArrowLeft,
    ArrowRight
  },
  setup() {
    const route = useRoute();
    const activeIndex = ref(route.path);
    const drawerVisible = ref(false);
    const isCollapse = ref(false);
    
    // 获取路由中需要在菜单中显示的项
    const menuItems = computed(() => {
      return router.options.routes.filter(item => 
        item.meta && item.meta.showInMenu !== false && item.path !== '/'
      );
    });
    
    // 检测是否为移动端
    const isMobile = computed(() => {
      return window.innerWidth <= 768;
    });
    
    // 根据当前路由设置标题
    const headerTitle = computed(() => {
      const routeWithTitle = menuItems.value.find(item => item.path === route.path);
      return routeWithTitle ? routeWithTitle.meta.title : 'Image Management';
    });
    
    // 控制是否显示侧边栏
    const showSidebar = computed(() => {
      return !route.meta.hideSidebar;
    });
    
    // 控制是否显示header
    const showHeader = computed(() => {
      return !route.meta.hideHeader;
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

    const toggleCollapse = () => {
      isCollapse.value = !isCollapse.value;
    };

    return {
      activeIndex,
      drawerVisible,
      isMobile,
      headerTitle,
      handleSelect,
      handleMobileSelect,
      toggleMenu,
      menuItems,
      showSidebar,
      showHeader,
      isCollapse,
      toggleCollapse
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
  border: none;
}
.sidebar {
  position: relative;
}

.sidebar.mobile-hidden {
  display: none;
}

.menu-header {
  padding: 20px 15px 10px;
  height: 50px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e6e6e6;
}

.menu-title {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.menu-collapse-btn {
  position: absolute;
  bottom: 50%;
  right: 0px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  cursor: pointer;
  color: #409eff;
  transition: all 0.3s;
  border-radius: 50%;
}

.menu-collapse-btn:hover {
  background-color: #e6f1ff;
  right: 4px;
}

.menu-collapse-btn .el-icon {
  font-size: 16px;
}

.mobile-header {
  background-color: #409eff;
  color: white;
  padding: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  padding: 0;
  height: 40px;
  z-index: 100;
}

.mobile-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 5px;
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