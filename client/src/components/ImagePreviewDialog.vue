<template>
  <el-dialog
    v-model="visible"
    :title="imageData.name || 'Image Preview'"
    width="95%"
    @close="handleClose"
    class="image-preview-dialog"
    :fullscreen="true"
  >
    <div class="image-preview-container">
      <div class="preview-navigation" v-if="images.length > 1">
        <el-button 
          circle 
          class="nav-button nav-button-prev"
          @click="prevImage"
          :disabled="currentIndex <= 0"
        >
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
      </div>
      
      <div class="preview-image-wrapper">
        <div 
          class="preview-image-container"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <img
            :src="imageData.imagePath"
            :alt="imageData.name"
            class="preview-image"
            :style="imageStyle"
            @wheel="handleWheel"
          />
        </div>
      </div>
      
      <div class="preview-navigation" v-if="images.length > 1">
        <el-button 
          circle 
          class="nav-button nav-button-next"
          @click="nextImage"
          :disabled="currentIndex >= images.length - 1"
        >
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>

    <div class="image-counter" v-if="images.length > 1">
      {{ currentIndex + 1 }} / {{ images.length }}
    </div>

    <div class="image-details">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="Name">{{
          imageData.name || ""
        }}</el-descriptions-item>
        <el-descriptions-item label="Category">{{
          imageData.category || ""
        }}</el-descriptions-item>
        <el-descriptions-item label="Remark">{{
          imageData.remark || ""
        }}</el-descriptions-item>
        <el-descriptions-item label="Created">{{
          formatDate(imageData.createdAt) || ""
        }}</el-descriptions-item>
        <el-descriptions-item label="Updated">{{
          formatDate(imageData.updatedAt) || ""
        }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">Close</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { ref, watch, computed } from "vue";
import { ArrowLeft, ArrowRight } from "@element-plus/icons-vue";

export default {
  name: "ImagePreviewDialog",
  components: {
    ArrowLeft,
    ArrowRight
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    imageData: {
      type: Object,
      default: () => ({}),
    },
    images: {
      type: Array,
      default: () => [],
    }
  },
  emits: ["update:modelValue", "change-image"],
  setup(props, { emit }) {
    const visible = ref(false);
    const scale = ref(1);
    const translateX = ref(0);
    const translateY = ref(0);
    const isDragging = ref(false);
    const startX = ref(0);
    const startY = ref(0);
    const startTranslateX = ref(0);
    const startTranslateY = ref(0);
    
    // 触摸相关状态
    const touchStartDistance = ref(0);
    const startScale = ref(1);

    // 计算当前图片索引
    const currentIndex = computed(() => {
      if (!props.images.length) return -1;
      return props.images.findIndex(img => img.id === props.imageData.id);
    });

    // 计算图片样式
    const imageStyle = computed(() => {
      return {
        transform: `scale(${scale.value}) translate(${translateX.value}px, ${translateY.value}px)`,
        transition: isDragging.value ? 'none' : 'transform 0.2s ease',
        cursor: scale.value > 1 ? 'move' : 'default'
      };
    });

    // Watch for modelValue changes
    watch(
      () => props.modelValue,
      (newValue) => {
        visible.value = newValue;
        if (!newValue) {
          // 重置缩放和位置
          scale.value = 1;
          translateX.value = 0;
          translateY.value = 0;
        }
      }
    );

    // Watch for visible changes
    watch(visible, (newValue) => {
      emit("update:modelValue", newValue);
    });

    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    };

    // 上一张图片
    const prevImage = () => {
      if (currentIndex.value > 0) {
        const prevImg = props.images[currentIndex.value - 1];
        emit("change-image", prevImg);
      }
    };

    // 下一张图片
    const nextImage = () => {
      if (currentIndex.value < props.images.length - 1) {
        const nextImg = props.images[currentIndex.value + 1];
        emit("change-image", nextImg);
      }
    };

    // 处理鼠标滚轮缩放
    const handleWheel = (event) => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? 0.9 : 1.1;
      const newScale = scale.value * delta;
      scale.value = Math.max(0.5, Math.min(newScale, 5)); // 限制缩放范围在0.5-5倍
      
      // 限制位移范围
      if (scale.value <= 1) {
        translateX.value = 0;
        translateY.value = 0;
      }
    };

    // 处理触摸开始
    const handleTouchStart = (event) => {
      if (event.touches.length === 1) {
        // 单指触摸 - 拖拽
        isDragging.value = true;
        startX.value = event.touches[0].clientX;
        startY.value = event.touches[0].clientY;
        startTranslateX.value = translateX.value;
        startTranslateY.value = translateY.value;
      } else if (event.touches.length === 2) {
        // 双指触摸 - 缩放
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        touchStartDistance.value = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        startScale.value = scale.value;
      }
    };

    // 处理触摸移动
    const handleTouchMove = (event) => {
      event.preventDefault();
      
      if (event.touches.length === 1 && isDragging.value && scale.value > 1) {
        // 单指拖拽（仅在放大时）
        const deltaX = event.touches[0].clientX - startX.value;
        const deltaY = event.touches[0].clientY - startY.value;
        
        translateX.value = startTranslateX.value + deltaX;
        translateY.value = startTranslateY.value + deltaY;
      } else if (event.touches.length === 2) {
        // 双指缩放
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        const scaleChange = currentDistance / touchStartDistance.value;
        scale.value = Math.max(0.5, Math.min(startScale.value * scaleChange, 5));
        
        // 当缩放比例小于等于1时重置位移
        if (scale.value <= 1) {
          translateX.value = 0;
          translateY.value = 0;
        }
      }
    };

    // 处理触摸结束
    const handleTouchEnd = () => {
      isDragging.value = false;
    };

    const close = () => {
      visible.value = false;
    };

    const handleClose = () => {
      // 重置状态
      scale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
    };

    return {
      visible,
      scale,
      translateX,
      translateY,
      isDragging,
      currentIndex,
      imageStyle,
      formatDate,
      prevImage,
      nextImage,
      handleWheel,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      close,
      handleClose,
    };
  },
};
</script>

<style scoped>
.image-preview-dialog {
  text-align: center;
  display: flex;
  flex-direction: column;
}

.image-preview-dialog :deep(.el-dialog__body) {
  flex: 1;
  overflow: hidden;
  padding: 0;
}

.image-preview-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 200px);
  overflow: hidden;
}

.preview-image-wrapper {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.preview-image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  touch-action: none;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}

.image-details {
  width: 100%;
  padding: 0 20px 20px;
}

.image-counter {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 14px;
  z-index: 10;
}

.preview-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.nav-button {
  margin: 0 10px;
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.nav-button-prev {
  left: 10px;
}

.nav-button-next {
  right: 10px;
}

@media (min-width: 768px) {
  .image-preview-dialog {
    width: 90% !important;
    max-width: 1200px;
  }
  
  .image-preview-container {
    height: 70vh;
  }
  
  .preview-image {
    max-width: 90%;
    max-height: 90%;
  }
}
</style>
