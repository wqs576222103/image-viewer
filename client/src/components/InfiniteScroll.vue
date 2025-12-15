<template>
  <div class="infinite-scroll">
    <slot></slot>
    
    <!-- 加载更多指示器 -->
    <div v-if="loading" class="loading-more">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>{{ loadingText }}</span>
    </div>
    
    <!-- 没有更多数据 -->
    <div v-if="noMore && !loading" class="no-more">
      <span>{{ noMoreText }}</span>
    </div>
  </div>
</template>

<script>
import { onMounted, onUnmounted } from "vue";
import { Loading } from "@element-plus/icons-vue";

export default {
  name: "InfiniteScroll",
  components: {
    Loading
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    noMore: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: "Loading more..."
    },
    noMoreText: {
      type: String,
      default: "No more data"
    },
    distance: {
      type: Number,
      default: 20
    }
  },
  emits: ["loadMore"],
  setup(props, { emit }) {
    const handleScroll = () => {
      // 检查是否滚动到底部
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      const scrollHeight = document.documentElement.scrollHeight;
      
      if (
        scrollTop + clientHeight >= scrollHeight - props.distance &&
        !props.loading &&
        !props.noMore
      ) {
        emit("loadMore");
      }
    };

    onMounted(() => {
      window.addEventListener("scroll", handleScroll);
    });

    onUnmounted(() => {
      window.removeEventListener("scroll", handleScroll);
    });

    return {
      // 组件不需要返回任何数据
    };
  }
};
</script>

<style scoped>
.loading-more, .no-more {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  color: #999;
  font-size: 0.9rem;
  gap: 8px;
}
</style>