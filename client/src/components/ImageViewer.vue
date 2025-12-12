<template>
  <div class="container">
    <div class="header">
      <h1>Image Management System</h1>
      <div>
        <el-button type="primary" @click="addImage">Add Image</el-button>
        <el-button type="success" @click="batchAddImages" style="margin-left: 10px;">Batch Add Images</el-button>
        <el-button type="danger" @click="batchDeleteImages" style="margin-left: 10px;" :disabled="selectedImages.length === 0">Batch Delete ({{ selectedImages.length }})</el-button>
      </div>
    </div>

    <!-- Search Form -->
    <div class="card">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="Name">
          <el-input
            v-model="searchForm.name"
            placeholder="Image name"
          ></el-input>
        </el-form-item>
        <el-form-item label="Category">
          <el-input
            v-model="searchForm.category"
            placeholder="Category"
          ></el-input>
        </el-form-item>
        <el-form-item label="Remark">
          <el-input v-model="searchForm.remark" placeholder="Remark"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchImages">Search</el-button>
          <el-button @click="resetSearch">Reset</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Single Image Form Dialog -->
    <image-form-dialog
      v-model="showAddForm"
      :edit-mode="editMode"
      :image-data="currentImageData"
      @save="handleSaveImage"
    />

    <!-- Batch Upload Dialog -->
    <batch-upload-dialog
      v-model="showBatchAddForm"
      @upload="handleBatchUpload"
    />

    <!-- Image Preview Dialog -->
    <image-preview-dialog
      v-model="showPreviewDialog"
      :image-data="previewImageData"
    />

    <!-- Image List -->
    <div class="image-grid">
      <div class="image-card" v-for="image in images" :key="image.id" :class="{ selected: selectedImages.includes(image.id) }" @click="previewImage(image)">
        <div class="selection-overlay">
          <el-checkbox 
            :model-value="selectedImages.includes(image.id)" 
            @click.stop="toggleImageSelection(image.id)"
            class="selection-checkbox"
          />
        </div>
        <img :src="image.imagePath" :alt="image.name" class="image-preview" />
        <div class="image-info">
          <p><strong>Name:</strong> {{ image.name || "" }}</p>
          <p><strong>Category:</strong> {{ image.category || "" }}</p>
          <p><strong>remark:</strong> {{ image.remark || "" }}</p>
          <p>
            <strong>Created:</strong> {{ formatDate(image.createdAt) || "" }}
          </p>
          <p>
            <strong>Updated:</strong> {{ formatDate(image.updatedAt) || "" }}
          </p>
        </div>
        <div class="actions">
          <el-button size="small" @click.stop="editImage(image)">Edit</el-button>
          <el-button size="small" type="danger" @click.stop="deleteImage(image.id)">Delete</el-button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination-container">
      <el-pagination
        @current-change="handlePageChange"
        :current-page="pagination.currentPage"
        :page-size="pagination.pageSize"
        :total="pagination.totalCount"
        layout="prev, pager, next, jumper, ->, total"
        background
      />
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Check } from "@element-plus/icons-vue";
import imageService, { FILE_SERVER_URL } from "../services/imageService";
import ImageFormDialog from "./ImageFormDialog.vue";
import BatchUploadDialog from "./BatchUploadDialog.vue";
import ImagePreviewDialog from "./ImagePreviewDialog.vue";

export default {
  name: "ImageViewer",
  components: {
    ImageFormDialog,
    BatchUploadDialog,
    ImagePreviewDialog,
    Check
  },
  setup() {
    // State
    const images = ref([]);
    const showAddForm = ref(false);
    const showBatchAddForm = ref(false);
    const showPreviewDialog = ref(false);
    const editMode = ref(false);
    const currentImageData = ref({});
    const previewImageData = ref({});
    const selectedImages = ref([]);

    // 分页状态
    const pagination = reactive({
      currentPage: 1,
      pageSize: 8,
      totalCount: 0,
      totalPages: 0,
    });

    // Forms
    const searchForm = reactive({
      name: "",
      category: "",
      remark: "",
    });

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    };

    const toggleImageSelection = (id) => {
      const index = selectedImages.value.indexOf(id);
      if (index === -1) {
        selectedImages.value.push(id);
      } else {
        selectedImages.value.splice(index, 1);
      }
    };

    const batchAddImages = () => {
      showBatchAddForm.value = true;
    };

    const batchDeleteImages = async () => {
      if (selectedImages.value.length === 0) {
        ElMessage.warning("Please select at least one image to delete");
        return;
      }

      try {
        await ElMessageBox.confirm(
          `Are you sure you want to delete ${selectedImages.value.length} selected images?`,
          "Warning",
          {
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            type: "warning",
          }
        );

        await imageService.deleteImages(selectedImages.value);
        ElMessage.success(`${selectedImages.value.length} images deleted successfully`);
        selectedImages.value = [];
        searchImages();
      } catch (error) {
        if (error !== "cancel") {
          console.error("Error deleting images:", error);
          ElMessage.error("Failed to delete images");
        }
      }
    };

    // Handle save image (add or update)
    const handleSaveImage = async ({ id, formData, isEditMode }) => {
      try {
        if (isEditMode) {
          // Edit mode
          await imageService.updateImage(id, formData);
          ElMessage.success("Image updated successfully");
        } else {
          // Add mode
          await imageService.createImage(formData);
          ElMessage.success("Image added successfully");
        }

        // Close form and reload images
        showAddForm.value = false;
        searchImages();
      } catch (error) {
        console.error("Error saving image:", error);
        ElMessage.error("Failed to save image");
      }
    };

    const handleBatchUpload = async ({ files, category, remark }) => {
      let successCount = 0;
      let failCount = 0;

      try {
        // Process each file sequentially
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          try {
            const formData = new FormData();
            formData.append("image", file.file);
            formData.append("name", file.name);
            formData.append("category", category);
            formData.append("remark", remark);

            await imageService.createImage(formData);
            successCount++;
            
            // Update progress (optional)
            ElMessage.success(`Uploaded: ${file.name}`);
          } catch (error) {
            console.error(`Error uploading ${file.name}:`, error);
            failCount++;
            ElMessage.error(`Failed to upload: ${file.name}`);
          }
        }

        // Show final result
        if (failCount === 0) {
          ElMessage.success(`Successfully uploaded all ${successCount} images`);
        } else {
          ElMessage.warning(`Uploaded ${successCount} images, ${failCount} failed`);
        }

        // Close dialog and refresh image list
        showBatchAddForm.value = false;
        searchImages();
      } catch (error) {
        console.error("Error in batch upload:", error);
        ElMessage.error("Batch upload failed");
      }
    };

    const addImage = () => {
      editMode.value = false;
      currentImageData.value = {};
      showAddForm.value = true;
    };

    // Edit image
    const editImage = (image) => {
      editMode.value = true;
      currentImageData.value = {
        ...image,
        imagePath: image.url ? `${FILE_SERVER_URL}${image.url}` : ""
      };
      showAddForm.value = true;
    };

    // Preview image
    const previewImage = (image) => {
      console.log("Preview image:", image);
      previewImageData.value = image;
      showPreviewDialog.value = true;
    };

    // Delete image
    const deleteImage = async (id) => {
      try {
        await ElMessageBox.confirm(
          "Are you sure you want to delete this image?",
          "Warning",
          {
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            type: "warning",
          }
        );

        await imageService.deleteImage(id);
        ElMessage.success("Image deleted successfully");
        searchImages();
      } catch (error) {
        if (error !== "cancel") {
          console.error("Error deleting image:", error);
          ElMessage.error("Failed to delete image");
        }
      }
    };

    // 处理页面变化
    const handlePageChange = (page) => {
      pagination.currentPage = page;
      searchImages();
    };

    // Search images with pagination
    const searchImages = async () => {
      try {
        const params = {
          page: pagination.currentPage,
          limit: pagination.pageSize,
        };

        if (searchForm.name) params.name = searchForm.name;
        if (searchForm.category) params.category = searchForm.category;
        if (searchForm.remark) params.remark = searchForm.remark;

        const response = await imageService.getAllImages(params);

        // 处理分页数据
        if (response.data && response.data.data) {
          images.value = response.data.data.map((v) => {
            return {
              ...v,
              imagePath: v.url ? `${FILE_SERVER_URL}${v.url}` : "",
            };
          });

          // 更新分页信息
          if (response.data.pagination) {
            pagination.currentPage = response.data.pagination.currentPage;
            pagination.pageSize = response.data.pagination.pageSize;
            pagination.totalCount = response.data.pagination.totalCount;
            pagination.totalPages = response.data.pagination.totalPages;
          }
        } else {
          images.value = [];
          // 重置分页信息
          pagination.currentPage = 1;
          pagination.totalCount = 0;
          pagination.totalPages = 0;
        }
      } catch (error) {
        console.error("Error searching images:", error);
        ElMessage.error("Failed to search images");
      }
    };

    // Reset search
    const resetSearch = () => {
      searchForm.name = "";
      searchForm.category = "";
      searchForm.remark = "";
      pagination.currentPage = 1;
      searchImages();
    };

    // Lifecycle
    onMounted(() => {
      searchImages();
    });

    return {
      images,
      showAddForm,
      showBatchAddForm,
      showPreviewDialog,
      editMode,
      currentImageData,
      previewImageData,
      selectedImages,
      searchForm,
      pagination,
      batchAddImages,
      batchDeleteImages,
      toggleImageSelection,
      previewImage,
      handleSaveImage,
      handleBatchUpload,
      addImage,
      editImage,
      deleteImage,
      searchImages,
      resetSearch,
      handlePageChange,
      formatDate,
    };
  },
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.card {
  background: white;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}
.image-card {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  position: relative;
  cursor: pointer;
}
.image-card.selected {
  border-color: #409eff;
  box-shadow: 0 0 0 2px #409eff;
}
.image-preview {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
.image-info {
  padding: 10px;
}
.actions {
  display: flex;
  justify-content: space-between;
  padding: 10px;
}
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.selection-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  padding: 5px;
}

.selection-checkbox {
  zoom: 1.5;
}

.image-card:hover .selection-overlay {
  background-color: rgba(255, 255, 255, 1);
}
</style>
