<template>
  <div class="image-grid">
    <div class="grid-container">
      <div 
        class="image-card"
        v-for="(image, index) in images"
        :key="image.id"
        :style="{ transitionDelay: `${index * 0.05}s` }"
        @click="previewImage(image)"
      >
        <img :src="image.imagePath" :alt="image.name" class="image-preview" />
        <div class="image-info">
          <h3>{{ image.name || 'Untitled' }}</h3>
          <p v-if="image.category" class="category">{{ image.category }}</p>
          <p v-if="image.remark" class="remark">{{ image.remark }}</p>
          <p class="date">{{ formatDate(image.createdAt) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, watch } from "vue";

export default {
  name: "ImageGrid",
  props: {
    images: {
      type: Array,
      default: () => []
    }
  },
  emits: ["preview"],
  setup(props, { emit }) {
    const previewImage = (image) => {
      emit("preview", image);
    };

    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString();
    };

    return {
      previewImage,
      formatDate
    };
  }
};
</script>

<style scoped>
.image-grid {
  width: 100%;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  padding: 15px;
}

.image-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  background: white;
  opacity: 0;
  transform: perspective(800px) rotateY(90deg);
  animation: flipIn 0.4s forwards;
}

@keyframes flipIn {
  to {
    opacity: 1;
    transform: perspective(800px) rotateY(0deg);
  }
}

.image-preview {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}

.image-info {
  padding: 10px;
}

.image-info h3 {
  margin: 0 0 5px 0;
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.category, .remark {
  margin: 3px 0;
  font-size: 0.8rem;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.date {
  margin: 5px 0 0 0;
  font-size: 0.75rem;
  color: #999;
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
    padding: 10px;
  }
  
  .image-info {
    padding: 8px;
  }
  
  .image-info h3 {
    font-size: 0.85rem;
  }
}
</style>