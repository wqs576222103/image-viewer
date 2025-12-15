<template>
  <div 
    class="pull-to-refresh"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    :style="{ transform: `translateY(${pullDownDistance}px)` }"
  >
    <div class="refresh-indicator" v-if="pullDownDistance > 0">
      <div v-if="pullDownDistance < 60" class="arrow-down">
        <el-icon><ArrowDown /></el-icon>
      </div>
      <div v-else class="loading">
        <el-icon class="is-loading"><Loading /></el-icon>
      </div>
    </div>
    
    <slot></slot>
  </div>
</template>

<script>
import { ref } from "vue";
import { ArrowDown, Loading } from "@element-plus/icons-vue";

export default {
  name: "PullToRefresh",
  components: {
    ArrowDown,
    Loading
  },
  props: {
    refreshing: {
      type: Boolean,
      default: false
    }
  },
  emits: ["refresh"],
  setup(props, { emit }) {
    const pullDownDistance = ref(0);
    const touchStartY = ref(0);
    const isRefreshing = ref(false);

    const handleTouchStart = (e) => {
      // 只有在页面顶部才启用下拉刷新
      if (window.scrollY === 0 && !isRefreshing.value) {
        touchStartY.value = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (window.scrollY === 0 && !isRefreshing.value && touchStartY.value > 0) {
        const currentY = e.touches[0].clientY;
        const diff = currentY - touchStartY.value;
        
        if (diff > 0) {
          e.preventDefault();
          pullDownDistance.value = Math.min(diff / 3, 100);
        }
      }
    };

    const handleTouchEnd = () => {
      if (pullDownDistance.value >= 60) {
        // 触发刷新
        isRefreshing.value = true;
        emit("refresh");
      } else {
        // 取消刷新动画
        pullDownDistance.value = 0;
      }
      
      touchStartY.value = 0;
    };

    const completeRefresh = () => {
      isRefreshing.value = false;
      pullDownDistance.value = 0;
    };

    return {
      pullDownDistance,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      completeRefresh
    };
  }
};
</script>

<style scoped>
.pull-to-refresh {
  transition: transform 0.2s ease-out;
  position: relative;
}

.refresh-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  color: #409eff;
}

.arrow-down {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>