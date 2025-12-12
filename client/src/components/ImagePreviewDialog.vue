<template>
  <el-dialog
    v-model="visible"
    :title="imageData.name || 'Image Preview'"
    width="80%"
    @close="handleClose"
    class="image-preview-dialog"
  >
    <div class="image-preview-container">
      <div class="preview-image-container">
        <img
          :src="imageData.imagePath"
          :alt="imageData.name"
          class="preview-image"
        />
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
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">Close</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { ref, watch } from "vue";

export default {
  name: "ImagePreviewDialog",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    imageData: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const visible = ref(false);

    // Watch for modelValue changes
    watch(
      () => props.modelValue,
      (newValue) => {
        visible.value = newValue;
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

    const close = () => {
      visible.value = false;
    };

    const handleClose = () => {
      // Any cleanup logic can go here
    };

    return {
      visible,
      formatDate,
      close,
      handleClose,
    };
  },
};
</script>

<style scoped>
.image-preview-dialog {
  text-align: center;
}

.image-preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.preview-image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
  margin-bottom: 20px;
}

.image-details {
  width: 100%;
  max-width: 600px;
}

@media (min-width: 768px) {
  .image-preview-container {
    flex-direction: row;
    justify-content: space-between;
  }

  .preview-image {
    max-width: 60%;
    margin-bottom: 0;
  }

  .image-details {
    max-width: 35%;
  }
}
</style>
