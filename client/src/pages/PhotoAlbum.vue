<template>
  <div class="container">
    <div class="header">
      <h1><i class="fas fa-book-open"></i> Category:</h1>
      <el-select
        v-model="searchForm.category"
        placeholder="Select Category"
        style="width: 280px"
        clearable
        filterable
        @change="categoryChange"
      >
        <el-option
          v-for="category in categories"
          :key="category.code"
          :label="category.name"
          :value="category.code"
        />
      </el-select>
    </div>

    <div class="photo-album-wrapper">
      <!-- 装饰元素 -->
      <div class="decoration basket"></div>
      <div class="decoration magnifier"></div>
      <div class="decoration vintage-frame"></div>

      <!-- 相册主体 -->
      <div :class="`photo-album ${isOpen ? 'open' : ''}`">
        <!-- 金属环扣 -->
        <div class="ring-holder">
          <div class="ring"></div>
        </div>
        <div class="ring-holder">
          <div class="ring"></div>
        </div>
        <div class="ring-holder">
          <div class="ring"></div>
        </div>

        <!-- 封面 -->
        <div
          class="album-cover"
          :class="{ closed: !isOpen, opened: isOpen }"
          :style="{ 'z-index': zIndex }"
          @click="openAlbum"
        >
          <!-- 金属环扣 -->
          <div class="ring-holder">
            <div class="ring"></div>
          </div>
          <div class="ring-holder">
            <div class="ring"></div>
          </div>
          <div class="ring-holder">
            <div class="ring"></div>
          </div>
          <div v-if="showCoverContent" class="cover-content">
            <h2 class="cover-title">记忆珍藏</h2>
            <p class="cover-subtitle">那些美好的瞬间</p>
            <p class="cover-instruction">点击打开相册</p>
          </div>
        </div>

        <!-- 相册页面 -->
        <div
          v-for="(page, index) in albumPages"
          :key="index"
          class="page"
          :class="{ flipping: page.isFlipping }"
          :style="getPageStyle(index)"
        >
          <div class="page-content">
            <!-- 金属环扣 -->
            <div class="ring-holder">
              <div class="ring"></div>
            </div>
            <div class="ring-holder">
              <div class="ring"></div>
            </div>
            <div class="ring-holder">
              <div class="ring"></div>
            </div>
            <!-- 照片卡片 -->
            <div
              v-for="(card, cardIndex) in page.cards"
              :key="cardIndex"
              class="photo-card"
            >
              <img :src="card.image" :alt="card.title" />
              <div class="photo-label">{{ card.title }}</div>
            </div>
          </div>
          <div class="page-number">第 {{ index + 1 }} 页</div>
        </div>
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="album-controls">
      <button
        class="control-btn"
        @click="prevPage"
        :disabled="!isOpen || currentPage === 0"
      >
        <i class="fas fa-chevron-left"></i> 上一页
      </button>

      <button class="control-btn" @click="toggleAlbum">
        <i :class="isOpen ? 'fas fa-times' : 'fas fa-book-open'"></i>
        {{ isOpen ? "关闭相册" : "打开相册" }}
      </button>

      <button
        class="control-btn"
        @click="nextPage"
        :disabled="currentPage === albumPages.length - 1"
      >
        下一页 <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, onUnmounted, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import categoryService from "@/services/categoryService";
import imageService from "@/services/imageService";

export default {
  name: "PhotoAlbum",
  setup() {
    // 状态
    const isOpen = ref(false);
    const showCoverContent = ref(true);
    const currentPage = ref(0);
    const isFlipping = ref(false);
    const albumPages = ref([]);
    const zIndex = ref(9999);

    const pagination = reactive({
      currentPage: 1,
      totalCount: 0,
      totalPages: 0,
    });
    const finished = ref(false);

    const categories = ref([]);

    // Forms
    const searchForm = reactive({
      name: "",
      category: "",
      remark: "",
    });

    // Load categories
    const loadCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        categories.value = response.data;
      } catch (error) {
        console.error("Error loading categories:", error);
        ElMessage.error("Failed to load categories");
      }
    };

    const categoryChange = () => {
      if (isOpen.value) {
        toggleAlbum();
      }
      setTimeout(() => {
        finished.value = false;
        albumPages.value = [];
        pagination.currentPage = 1;
        fetchImages();
      }, 1000);
    };

    // 从API获取图片数据
    const fetchImages = async () => {
      if (finished.value) {
        return;
      }
      try {
        const response = await imageService.getAllImages({
          page: pagination.currentPage,
          limit: 10,
          category: searchForm.category,
        });
        const res = response.data;
        const resPage = res.pagination || {};
        pagination.totalCount = resPage.totalCount || 0;
        pagination.totalPages = resPage.totalPages || 0;
        finished.value = resPage.totalPages <= resPage.currentPage;
        pagination.currentPage++;

        // 处理图片数据，转换为相册格式
        const images = res.data.map((img) => ({
          image: `${process.env.VUE_APP_API_FILE_SERVER_URL || ""}${img.url}`, // 假设后端返回图片URL
          title: img.name || "未命名图片",
          id: img.id,
        }));

        // 将图片分页，每页x张
        let count = 1;
        const pages = [...albumPages.value];
        for (let i = 0; i < images.length; i += count) {
          pages.push({
            cards: images.slice(i, i + count),
            isFlipping: false,
          });
        }

        albumPages.value = pages;
      } catch (error) {
        console.error("获取图片数据失败:", error);
        // 如果获取失败，使用默认数据
        albumPages.value = [];
      }
    };

    // 打开/关闭相册
    const openAlbum = () => {
      if (albumPages.value.length === 0) {
        ElMessage.error("该相册没有图片");
        return;
      }
      if (!isOpen.value) {
        isOpen.value = true;
        currentPage.value = 0;
        setTimeout(() => {
          showCoverContent.value = false;
        }, 500);
      }
    };
    const toggleAlbum = () => {
      if (albumPages.value.length === 0) {
        ElMessage.error("该相册没有图片");
        return;
      }
      isOpen.value = !isOpen.value;
      setTimeout(
        () => {
          showCoverContent.value = !showCoverContent.value;
        },
        isOpen.value ? 500 : 750
      );
      if (!isOpen.value) {
        currentPage.value = 0;
      }
    };

    // 翻页功能
    const flipPage = (pageIndex) => {
      if (
        isFlipping.value ||
        pageIndex < 0 ||
        pageIndex >= albumPages.value.length
      )
        return;

      isFlipping.value = true;

      // 设置当前页面为翻页状态
      albumPages.value[currentPage.value].isFlipping = true;

      setTimeout(() => {
        albumPages.value[currentPage.value].isFlipping = false;
        currentPage.value = pageIndex;
        isFlipping.value = false;
        // 如果是最后一页，则加载更多图片
        if (currentPage.value === albumPages.value.length - 1) {
          console.log("加载更多", finished.value);
          fetchImages();
        }
      }, 300);
    };

    const nextPage = () => {
      if (!isOpen.value) {
        toggleAlbum();
        return;
      }
      if (currentPage.value < albumPages.value.length - 1) {
        flipPage(currentPage.value + 1);
      }
    };

    const prevPage = () => {
      if (currentPage.value > 0) {
        flipPage(currentPage.value - 1);
      }
    };

    // 计算页面样式
    const getPageStyle = (index) => {
      const distance = currentPage.value - index;
      if (!isOpen.value) {
        return {
          transform: "rotateY(0deg)",
          zIndex: distance,
        };
      }

      // 左侧页面
      if (index < currentPage.value) {
        return {
          transform: `rotateY(-180deg)`,
          zIndex: index + zIndex.value,
          //   transitionDelay: `${distance * 0.1}s`,
        };
      }

      // 右侧页面
      if (index > currentPage.value) {
        return {
          transform: `rotateY(0deg)`,
          zIndex: distance,
          //   transitionDelay: `${distance * 0.1}s`,
        };
      }

      // 当前页面
      if (index === currentPage.value) {
        const distance = index - currentPage.value;
        return {
          transform: "rotateY(0deg)",
          //   zIndex: index + zIndex.value,
          transitionDelay: `${distance * 0.1}s`,
        };
      }

      return {};
    };

    // 监听键盘事件
    const handleKeydown = (e) => {
      if (!isOpen.value) return;

      if (e.key === "ArrowRight" || e.key === "PageDown") {
        nextPage();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        prevPage();
      } else if (e.key === "Escape") {
        isOpen.value = false;
      }
    };

    // 组件挂载时获取数据并添加键盘事件监听
    onMounted(() => {
      loadCategories();
      fetchImages();
      document.addEventListener("keydown", handleKeydown);
    });

    // 组件卸载时移除键盘事件监听
    onUnmounted(() => {
      document.removeEventListener("keydown", handleKeydown);
    });

    return {
      isOpen,
      zIndex,
      showCoverContent,
      currentPage,
      albumPages,
      categories,
      searchForm,
      pagination,
      finished,
      openAlbum,
      toggleAlbum,
      nextPage,
      prevPage,
      getPageStyle,
      categoryChange,
    };
  },
};
</script>
<style scoped>


body {
  font-family: "Georgia", serif;
  background-color: #f8f1e4;
  background-image: radial-gradient(#e3d5b8 2px, transparent 2px),
    radial-gradient(#e3d5b8 2px, transparent 2px);
  background-size: 40px 40px;
  background-position: 0 0, 20px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  color: #5a4a3a;
}

.container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.header {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header h1 {
  font-size: 2.8rem;
  color: #4a3929;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  font-weight: normal;
  letter-spacing: 2px;
}

.header p {
  font-size: 1.2rem;
  color: #7d6d5c;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.photo-album-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 2000px;
  position: relative;
  padding: 20px;
}

/* 装饰元素 */
.decoration {
  position: absolute;
  z-index: 1;
}

.basket {
  bottom: 30px;
  left: 30px;
  width: 120px;
  height: 80px;
  background: #d4b483;
  border-radius: 5px;
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.2);
}

.basket:before,
.basket:after {
  content: "";
  position: absolute;
  background: #b89a6d;
}

.basket:before {
  width: 130px;
  height: 10px;
  top: -5px;
  left: -5px;
  border-radius: 3px;
}

.magnifier {
  top: 30px;
  right: 50px;
  width: 60px;
  height: 60px;
  border: 8px solid #a88c6c;
  border-radius: 50%;
}

.magnifier:after {
  content: "";
  position: absolute;
  width: 40px;
  height: 8px;
  background: #a88c6c;
  bottom: -18px;
  right: -30px;
  transform: rotate(45deg);
}

.vintage-frame {
  position: absolute;
  top: 20px;
  left: 50px;
  width: 80px;
  height: 100px;
  border: 5px solid #b89a6d;
  box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.2);
  transform: rotate(-5deg);
}

.vintage-frame:after {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(216, 191, 154, 0.3);
}

/* 相册主体 */
.photo-album {
  width: 850px;
  height: 550px;
  position: relative;
  z-index: 2;
  transform-style: preserve-3d;
  transition: transform 2s ease;
}

.photo-album.open {
  transform: translateX(50%);
}

/* 封面样式 */
.album-cover {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #3e2e1f 0%, #5a4a3a 100%);
  border-radius: 5px 12px 12px 5px;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.3),
    0 0 40px rgba(139, 69, 19, 0.2) inset;
  transform-origin: left center;
  transition: transform 2s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #e3d5b8;
  overflow: hidden;
}
.cover-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #e3d5b8;
  overflow: hidden;
}

.album-cover:before {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="none" stroke="%23b89a6d" stroke-width="0.5"/></svg>');
  opacity: 0.2;
}

.album-cover.closed {
  transform: rotateY(0deg);
}

.album-cover.opened {
  transform: rotateY(-180deg);
}

.cover-title {
  font-size: 3.5rem;
  margin-bottom: 15px;
  text-align: center;
  font-family: "Palatino", serif;
  text-shadow: 3px 3px 5px rgba(0, 0, 0, 0.5);
  letter-spacing: 3px;
}

.cover-subtitle {
  font-size: 1.3rem;
  margin-bottom: 40px;
  opacity: 0.9;
  font-style: italic;
}

.cover-instruction {
  position: absolute;
  bottom: 40px;
  font-size: 1.1rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 10px 20px;
  border-radius: 30px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.7;
  }
}

/* 页面样式 */
.page {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #f5f0e6;
  background-image: linear-gradient(
      rgba(232, 220, 202, 0.5) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(232, 220, 202, 0.5) 1px, transparent 1px);
  background-size: 20px 20px;
  transform-origin: left center;
  transition: transform 1s ease;
  box-shadow: inset 5px 0 10px rgba(0, 0, 0, 0.05),
    inset -1px 0 2px rgba(255, 255, 255, 0.8);
  border-radius: 0 5px 5px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  will-change: transform;
}

/* 页面内容 */
.page-content {
  width: 95%;
  height: 95%;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  position: relative;
}

/* 照片卡片样式 */
.photo-card {
  width: 560px;
  height: 450px;
  background: white;
  border: 8px solid white;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.photo-card:hover {
  transform: translateY(-5px);
  box-shadow: 4px 4px 15px rgba(0, 0, 0, 0.15);
}

/* 透明塑料卡套效果 */
.photo-card:before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.4) 0%,
    rgba(255, 255, 255, 0) 30%
  );
  z-index: 2;
  pointer-events: none;
}

.photo-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-label {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px;
  font-size: 14px;
  line-height: 16px;
  text-align: center;
  color: #5a4a3a;
  height: 46px;
  opacity: 0.8;

  /* 最多展示三行 */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}

/* 翻页时的卷边效果 */
.page::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 30px;
  height: 100%;
  background: linear-gradient(
    to left,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0) 100%
  );
  z-index: 2;
  transform-origin: right center;
  transform: rotateY(-90deg);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.page.flipping::before {
  opacity: 1;
}

/* 页面编号 */
.page-number {
  position: absolute;
  bottom: 15px;
  right: 20px;
  font-size: 1rem;
  color: #a08e7a;
  font-family: "Courier New", monospace;
}

/* 控制按钮 */
.album-controls {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  gap: 20px;
}

.control-btn {
  background: #5a4a3a;
  color: #f5f0e6;
  border: none;
  padding: 12px 25px;
  font-size: 1.1rem;
  border-radius: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.2);
}

.control-btn:hover {
  background: #4a3929;
  transform: translateY(-2px);
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.3);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.2);
}

/* 金属环扣效果 */
.ring-holder {
  position: fixed;
  left: -20px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 20px;
  z-index: 99999;
  isolation: isolate;
}

.ring-holder:nth-child(1) {
  top: 20%;
}
.ring-holder:nth-child(2) {
  top: 50%;
  transform: translateY(-50%);
}
.ring-holder:nth-child(3) {
  top: 80%;
}

.ring {
  position: relative;
  width: 50%;
  height: 100%;
  left: 50%;
  background: linear-gradient(
    to bottom,
    #c0c0c0 0%,
    #a0a0a0 30%,
    #808080 70%,
    #c0c0c0 100%
  );
  border-radius: 0 10px 10px 0;
  box-shadow: 5px 0px 2px rgba(0, 0, 0, 0.3), 2px 0 5px rgba(0, 0, 0, 0.2);
}

.ring::before {
  content: "";
  position: relative;
  display: inline-block;
  width: 100%;
  height: 100%;
  left: -100%;
  background: linear-gradient(
    to bottom,
    #c0c0c0 0%,
    #a0a0a0 30%,
    #808080 70%,
    #c0c0c0 100%
  );
  border-radius: 10px 0 0 10px;
}

/* 响应式调整 */
@media (max-width: 900px) {
  .photo-album {
    width: 700px;
    height: 500px;
  }

  .photo-card {
    width: 470px;
    height: 410px;
  }

  .cover-title {
    font-size: 2.8rem;
  }
  .control-btn {
    font-size: 0.8rem;
  }
}

@media (max-width: 768px) {
  .photo-album {
    width: 550px;
    height: 400px;
  }

  .photo-card {
    width: 240px;
    height: 240px;
  }

  .page-content {
    padding: 0;
  }

  .cover-title {
    font-size: 2.2rem;
  }

  .decoration {
    display: none;
  }
}
</style>
