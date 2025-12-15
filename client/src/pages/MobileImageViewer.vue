<template>
  <div class="mobile-container">
    <div class="header">
      <h1>Image Gallery</h1>
    </div>

    <!-- 搜索栏 -->
    <div class="search-section">
      <div class="search-bar">
        <el-input
          v-model="searchForm.name"
          placeholder="Search by name"
          clearable
          @clear="resetSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      
      <div class="filter-button" @click="showFilters = !showFilters">
        <el-icon><Filter /></el-icon>
        <span>Filters</span>
      </div>
      
      <div v-show="showFilters" class="filters">
        <el-input
          v-model="searchForm.category"
          placeholder="Category"
          clearable
        />
        <el-input
          v-model="searchForm.remark"
          placeholder="Remark"
          clearable
        />
        <div class="filter-actions">
          <el-button @click="resetSearch">Reset</el-button>
          <el-button type="primary" @click="searchImages">Apply</el-button>
        </div>
      </div>
    </div>

    <!-- 下拉刷新组件 -->
    <pull-to-refresh 
      :refreshing="isRefreshing" 
      @refresh="refreshImages"
      ref="pullToRefreshRef"
    >
      <!-- 图片网格组件 -->
      <image-grid 
        :images="images" 
        @preview="previewImage"
      />
      
      <!-- 上拉加载组件 -->
      <infinite-scroll
        :loading="loadingMore"
        :no-more="noMoreData"
        @load-more="loadMoreImages"
      />
    </pull-to-refresh>

    <!-- 图片预览对话框 -->
    <image-preview-dialog
      v-model="showPreviewDialog"
      :image-data="previewImageData"
    />

    <!-- 回到顶部按钮 -->
    <div 
      class="back-to-top" 
      v-show="showBackToTop"
      @click="scrollToTop"
    >
      <el-icon><CaretTop /></el-icon>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, nextTick } from "vue";
import { ElMessage } from "element-plus";
import {
  Search,
  Filter,
  CaretTop
} from "@element-plus/icons-vue";
import imageService, { FILE_SERVER_URL } from "../services/imageService";
import ImagePreviewDialog from "../components/ImagePreviewDialog.vue";
import PullToRefresh from "../components/PullToRefresh.vue";
import InfiniteScroll from "../components/InfiniteScroll.vue";
import ImageGrid from "../components/ImageGrid.vue";

export default {
  name: "MobileImageViewer",
  components: {
    ImagePreviewDialog,
    PullToRefresh,
    InfiniteScroll,
    ImageGrid,
    Search,
    Filter,
    CaretTop
  },
  setup() {
    // 状态
    const images = ref([]);
    const showPreviewDialog = ref(false);
    const previewImageData = ref({});
    const showFilters = ref(false);
    const showBackToTop = ref(false);
    const loadingMore = ref(false);
    const noMoreData = ref(false);
    const isRefreshing = ref(false);
    
    // 组件引用
    const pullToRefreshRef = ref(null);
    
    // 分页状态
    const pagination = reactive({
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
    });

    // 表单
    const searchForm = reactive({
      name: "",
      category: "",
      remark: "",
    });

    // 预览图片
    const previewImage = (image) => {
      previewImageData.value = image;
      showPreviewDialog.value = true;
    };

    // 搜索图片
    const searchImages = async (resetPage = true) => {
      try {
        if (resetPage) {
          pagination.currentPage = 1;
          images.value = [];
          noMoreData.value = false;
        }
        
        const params = {
          page: pagination.currentPage,
          limit: pagination.pageSize,
        };

        if (searchForm.name) params.name = searchForm.name;
        if (searchForm.category) params.category = searchForm.category;
        if (searchForm.remark) params.remark = searchForm.remark;

        const response = await imageService.getAllImages(params);

        if (response.data && response.data.data) {
          const newImages = response.data.data.map((v) => {
            return {
              ...v,
              imagePath: v.url ? `${FILE_SERVER_URL}${v.url}` : "",
            };
          });
          
          if (resetPage) {
            images.value = newImages;
          } else {
            images.value = [...images.value, ...newImages];
          }

          // 更新分页信息
          if (response.data.pagination) {
            pagination.currentPage = response.data.pagination.currentPage;
            pagination.pageSize = response.data.pagination.pageSize;
            pagination.totalCount = response.data.pagination.totalCount;
            pagination.totalPages = response.data.pagination.totalPages;
          }
          
          // 检查是否还有更多数据
          noMoreData.value = pagination.currentPage >= pagination.totalPages;
        } else {
          images.value = [];
          noMoreData.value = true;
        }
        console.log('images', images.value);
      } catch (error) {
        console.error("Error searching images:", error);
        ElMessage.error("Failed to search images");
      }
    };

    // 重置搜索
    const resetSearch = () => {
      searchForm.name = "";
      searchForm.category = "";
      searchForm.remark = "";
      searchImages();
    };

    // 刷新图片
    const refreshImages = async () => {
      isRefreshing.value = true;
      
      try {
        await searchImages(true);
        ElMessage.success("Refreshed successfully");
      } catch (error) {
        console.error("Error refreshing images:", error);
        ElMessage.error("Failed to refresh images");
      } finally {
        // 完成刷新
        if (pullToRefreshRef.value) {
          pullToRefreshRef.value.completeRefresh();
        }
        isRefreshing.value = false;
      }
    };

    // 加载更多图片
    const loadMoreImages = async () => {
      if (pagination.currentPage < pagination.totalPages) {
        loadingMore.value = true;
        pagination.currentPage++;
        
        try {
          await searchImages(false);
        } catch (error) {
          console.error("Error loading more images:", error);
          ElMessage.error("Failed to load more images");
          pagination.currentPage--;
        } finally {
          loadingMore.value = false;
        }
      }
    };

    // 滚动到顶部
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    };

    // 滚动处理
    const handleScroll = () => {
      // 显示/隐藏回到顶部按钮
      showBackToTop.value = window.scrollY > 300;
    };

    // 生命周期钩子
    onMounted(() => {
      searchImages();
      window.addEventListener("scroll", handleScroll);
    });

    onUnmounted(() => {
      window.removeEventListener("scroll", handleScroll);
    });

    return {
      images,
      showPreviewDialog,
      previewImageData,
      showFilters,
      showBackToTop,
      loadingMore,
      noMoreData,
      isRefreshing,
      pullToRefreshRef,
      searchForm,
      pagination,
      previewImage,
      searchImages,
      resetSearch,
      refreshImages,
      loadMoreImages,
      scrollToTop,
    };
  },
};
</script>

<style scoped>
.mobile-container {
  max-width: 100%;
  padding: 0;
}

.header {
  background: #409eff;
  color: white;
  padding: 15px 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
}

.search-section {
  padding: 15px;
  background: white;
  border-bottom: 1px solid #eee;
}

.search-bar {
  margin-bottom: 10px;
}

.filter-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
}

.filters {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-actions {
  display: flex;
  gap: 10px;
}

.back-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  cursor: pointer;
  z-index: 99;
}
</style>