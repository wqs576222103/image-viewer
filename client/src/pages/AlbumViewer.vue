<template>
  <div class="photo-album">
    <!-- 头部 -->
    <header>
      <div class="container">
        <h1><el-icon><Camera /></el-icon> 我的相册</h1>
        <p class="subtitle">记录美好瞬间，珍藏珍贵回忆。点击图片查看大图，使用分类筛选快速查找。</p>
      </div>
    </header>

    <main class="container">
      <!-- 筛选按钮 -->
      <div class="filter-buttons">
        <button 
          v-for="button in filterButtons" 
          :key="button.filter"
          :class="['filter-btn', { active: currentFilter === button.filter }]"
          @click="filterPhotos(button.filter)"
        >
          <el-icon><component :is="button.elIcon" /></el-icon> {{ button.text }}
        </button>
      </div>

      <!-- 相册网格 -->
      <div v-if="filteredPhotos.length > 0" class="gallery">
        <div 
          v-for="(photo, index) in filteredPhotos" 
          :key="photo.id"
          class="photo-card"
          @click="openModal(index)"
        >
          <img :src="photo.imgSrc" :alt="photo.title" loading="lazy">
          <div class="photo-info">
            <h3 class="photo-title">{{ photo.title }}</h3>
            <span class="photo-category">
              <el-icon><component :is="getCategoryElIcon(photo.category)" /></el-icon> {{ getCategoryName(photo.category) }}
            </span>
            <span class="photo-date">
              <el-icon><Calendar /></el-icon> {{ photo.formattedDate }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- 无照片提示 -->
      <div v-else class="no-photos">
        <div class="loading-spinner" v-if="loading"></div>
        <p>{{ loading ? '加载中...' : '没有找到符合筛选条件的照片' }}</p>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="total > 0">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[6, 12, 24, 48]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </div>
    </main>

    <!-- Element Plus 模态框 -->
    <el-dialog
      v-model="modalVisible"
      :title="currentPhoto.title"
      width="800px"
      :before-close="handleClose"
      class="photo-modal"
      align-center
    >
      <div class="modal-content">
        <img :src="currentPhoto.imgSrc" :alt="currentPhoto.title" class="modal-img">
        
        <div class="modal-info">
          <p class="modal-description">{{ currentPhoto.description }}</p>
          <div class="modal-meta">
            <span class="modal-category">
              <el-icon><component :is="getCategoryElIcon(currentPhoto.category)" /></el-icon> {{ getCategoryName(currentPhoto.category) }}
            </span>
            <span class="modal-date">
              <el-icon><Calendar /></el-icon> {{ currentPhoto.formattedDate }}
            </span>
          </div>
        </div>
        
        <!-- 导航按钮 -->
        <div class="modal-navigation">
          <el-button 
            :disabled="currentPhotoIndex === 0"
            @click="prevPhoto"
            class="nav-btn prev-btn"
          >
            <el-icon><ArrowLeft /></el-icon> 上一张
          </el-button>
          
          <span class="photo-counter">{{ currentPhotoIndex + 1 }} / {{ filteredPhotos.length }}</span>
          
          <el-button 
            :disabled="currentPhotoIndex === filteredPhotos.length - 1"
            @click="nextPhoto"
            class="nav-btn next-btn"
          >
            下一张 <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { ElDialog, ElButton, ElIcon, ElPagination } from 'element-plus'
import { 
  ArrowLeft, 
  ArrowRight, 
  Camera, 
  Picture, 
  User, 
  OfficeBuilding, 
  Location,
  Calendar
} from '@element-plus/icons-vue'
import imageService, { FILE_SERVER_URL } from '@/services/imageService'
import categoryService from '@/services/categoryService'

// 响应式数据
const currentFilter = ref('all')
const modalVisible = ref(false)
const currentPhotoIndex = ref(0)
const photos = ref([])
const categories = ref([])
const filterButtons = ref([
  { filter: 'all', icon: 'fas fa-layer-group', elIcon: 'OfficeBuilding', text: '全部照片' }
])
const loading = ref(false)

// 分页数据
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

// 计算属性
const filteredPhotos = computed(() => {
  return photos.value
})

const currentPhoto = computed(() => {
  return filteredPhotos.value[currentPhotoIndex.value] || {}
})

// 获取分类数据
const fetchCategories = async () => {
  try {
    const response = await categoryService.getAllCategories()
    categories.value = response.data
    
    // 更新筛选按钮
    filterButtons.value = [
      { filter: 'all', icon: 'fas fa-layer-group', elIcon: 'OfficeBuilding', text: '全部照片' },
      ...categories.value.map(category => ({
        filter: category.code,
        icon: getCategoryIcon(category.code),
        elIcon: getCategoryElIcon(category.code),
        text: category.name
      }))
    ]
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

// 获取图片数据
const fetchImages = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value
    }
    
    if (currentFilter.value !== 'all') {
      params.category = currentFilter.value
    }
    
    const response = await imageService.getAllImages(params)
    const data = response.data
    
    // 格式化数据
    photos.value = data.data.map(photo => ({
      ...photo,
      id: photo.id,
      title: photo.name,
      category: photo.category,
      formattedDate: formatDate(photo.createdAt || photo.date),
      imgSrc: `${FILE_SERVER_URL}${photo.url}`, // 假设后端返回图片URL
      description: photo.remark || '暂无描述'
    }))
    
    total.value = data.pagination.totalCount || 0
  } catch (error) {
    console.error('获取图片失败:', error)
  } finally {
    loading.value = false
  }
}

// 方法
const filterPhotos = async (filter) => {
  currentFilter.value = filter
  currentPage.value = 1  // 重置到第一页
  await fetchImages()
}

const openModal = (index) => {
  currentPhotoIndex.value = index
  modalVisible.value = true
}

const handleClose = (done) => {
  done()
}

const prevPhoto = () => {
  if (currentPhotoIndex.value > 0) {
    currentPhotoIndex.value--
  }
}

const nextPhoto = () => {
  if (currentPhotoIndex.value < filteredPhotos.value.length - 1) {
    currentPhotoIndex.value++
  }
}

const getCategoryName = (category) => {
  const categoryItem = categories.value.find(item => item.code === category)
  return categoryItem ? categoryItem.name : '未分类'
}

const getCategoryIcon = (category) => {
  // 首先尝试从分类数据中获取图标
  const categoryItem = categories.value.find(item => item.code === category)
  if (categoryItem?.icon) {
    return categoryItem.icon
  }
  
  // 根据分类代码返回默认图标
  const iconMap = {
    nature: 'fas fa-tree',
    travel: 'fas fa-plane',
    people: 'fas fa-user-friends',
    urban: 'fas fa-city',
    default: 'fas fa-image'
  }
  
  return iconMap[category] || iconMap.default
}

// Element Plus 图标映射
const getCategoryElIcon = (category) => {
  const elIconMap = {
    nature: 'Picture',
    travel: 'Location',
    people: 'User',
    urban: 'OfficeBuilding',
    default: 'Picture'
  }
  
  return elIconMap[category] || elIconMap.default
}

const formatDate = (dateString) => {
  if (!dateString) return '未知日期'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 分页相关方法
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchImages()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchImages()
}

// 键盘事件处理
const handleKeyDown = (event) => {
  if (!modalVisible.value) return
  
  if (event.key === 'Escape') {
    modalVisible.value = false
  } else if (event.key === 'ArrowLeft') {
    prevPhoto()
  } else if (event.key === 'ArrowRight') {
    nextPhoto()
  }
}

// 生命周期钩子
onMounted(async () => {
  window.addEventListener('keydown', handleKeyDown)
  await fetchCategories()
  await fetchImages()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
  background-color: #f5f7ff;
  color: var(--dark-color);
  line-height: 1.6;
  padding-bottom: 2rem;
}

.photo-album .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

header {
  text-align: center;
  padding: 2.5rem 0;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border-radius: 0 0 20px 20px;
  margin-bottom: 2.5rem;
  box-shadow: var(--shadow);
}

h1 {
  font-size: 2.8rem;
  margin-bottom: 0.5rem;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

/* 筛选按钮 */
.filter-buttons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-bottom: 2.5rem;
}

.filter-btn {
  padding: 0.7rem 1.5rem;
  background-color: white;
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-btn:hover {
  background-color: #e9ecef;
  transform: translateY(-2px);
}

.filter-btn.active {
  background-color: var(--primary-color);
  color: white;
  box-shadow: 0 4px 8px rgba(67, 97, 238, 0.3);
}

/* 相册网格 */
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.8rem;
  margin-bottom: 3rem;
}

.photo-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: var(--transition);
  cursor: pointer;
  position: relative;
}

.photo-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
}

.photo-card img {
  width: 100%;
  height: 220px;
  object-fit: contain;
  display: block;
  transition: transform 0.5s ease;
}

.photo-card:hover img {
  transform: scale(1.05);
}

.photo-info {
  padding: 1.2rem;
}

.photo-title {
  font-weight: 700;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: var(--dark-color);
}

.photo-category {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  background-color: #e9ecef;
  color: var(--gray-color);
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
}

.photo-date {
  display: block;
  color: var(--gray-color);
  font-size: 0.9rem;
  margin-top: 0.8rem;
}

/* 无照片提示 */
.no-photos {
  text-align: center;
  padding: 3rem;
  color: var(--gray-color);
}

.loading-spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(67, 97, 238, 0.3);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 分页样式 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

/* 模态框样式 */
.photo-modal :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  max-width: 800px;
}

.photo-modal :deep(.el-dialog__header) {
  margin: 0;
  padding: 1.5rem 1.5rem 0;
  font-size: 1.6rem;
  color: var(--dark-color);
}

.photo-modal :deep(.el-dialog__body) {
  padding: 0;
}

.photo-modal :deep(.el-dialog__headerbtn) {
  top: 20px;
  right: 20px;
  font-size: 1.5rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-modal :deep(.el-dialog__headerbtn:hover) {
  background-color: rgba(0, 0, 0, 0.1);
}

.photo-modal :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: var(--dark-color);
  font-size: 1.2rem;
}

.modal-content {
  max-height: 80vh;
  overflow-y: auto;
}

.modal-img {
  width: 100%;
  max-height: 50vh;
  object-fit: contain;
  display: block;
}

.modal-info {
  padding: 1.5rem;
}

.modal-description {
  color: var(--gray-color);
  margin-bottom: 1.5rem;
  line-height: 1.6;
  font-size: 1.05rem;
}

.modal-meta {
  display: flex;
  justify-content: space-between;
  color: var(--gray-color);
  font-size: 0.95rem;
}

.modal-category {
  display: inline-block;
  padding: 0.4rem 0.9rem;
  background-color: #e9ecef;
  border-radius: 50px;
  font-weight: 600;
}

.modal-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-top: 1px solid #e8e8e8;
  background-color: #f9f9f9;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.2rem;
  font-weight: 600;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.prev-btn {
  background-color: white;
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
}

.next-btn {
  background-color: var(--primary-color);
  color: white;
}

.photo-counter {
  font-weight: 600;
  color: var(--dark-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  h1 {
    font-size: 2.2rem;
  }
  
  .gallery {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  .filter-buttons {
    gap: 0.5rem;
  }
  
  .filter-btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
  
  .photo-modal :deep(.el-dialog) {
    width: 90%;
    margin-top: 5vh !important;
  }
}

@media (max-width: 576px) {
  .gallery {
    grid-template-columns: 1fr;
  }
  
  .modal-navigation {
    flex-direction: column;
    gap: 1rem;
  }
  
  .modal-navigation .el-button {
    width: 100%;
  }
}
</style>