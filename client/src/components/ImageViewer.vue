<template>
  <div class="container">
    <div class="header">
      <h1>Image Management System</h1>
      <el-button type="primary" @click="addImage">Add Image</el-button>
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

    <!-- Add/Edit Form Dialog -->
    <el-dialog
      :title="editMode ? 'Edit Image' : 'Add Image'"
      v-model="showAddForm"
      width="500px"
    >
      <el-form :model="imageForm" ref="imageFormRef" label-width="100px">
        <el-form-item label="Image" prop="image">
          <input  type="file" @change="handleFileUpload" accept="image/*" />
          <div v-if="imagePreview">
            <img
              :src="imagePreview"
              style="width: 100px; height: 100px; object-fit: cover"
            />
          </div>
        </el-form-item>
        <el-form-item label="Category" prop="category">
          <el-input
            v-model="imageForm.category"
            placeholder="Enter category"
          ></el-input>
        </el-form-item>
        <el-form-item label="Remark" prop="remark">
          <el-input
            v-model="imageForm.remark"
            type="textarea"
            placeholder="Enter remark"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddForm = false">Cancel</el-button>
          <el-button type="primary" @click="saveImage">{{
            editMode ? "Update" : "Add"
          }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Image List -->
    <div class="image-grid">
      <div class="image-card" v-for="image in images" :key="image.id">
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
          <el-button size="small" @click="editImage(image)">Edit</el-button>
          <el-button size="small" type="danger" @click="deleteImage(image.id)"
            >Delete</el-button
          >
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
import imageService, { FILE_SERVER_URL } from "../services/imageService";

export default {
  name: "ImageViewer",
  setup() {
    // State
    const images = ref([]);
    const showAddForm = ref(false);
    const editMode = ref(false);
    const imagePreview = ref("");
    const currentImageId = ref("");

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

    const imageForm = reactive({
      image: null,
      category: "",
      name: "",
      remark: "",
    });

    // Handle file upload
    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if(!file) {
        return
      }
      imageForm.image = file;
      imageForm.name = file.name;
      // imageForm.remark = file.name;
      // imageForm.category = file.name;

      // Preview image
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.value = e.target.result;
      };
      reader.readAsDataURL(file);
    };

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    };

    // Save image (add or update)
    const saveImage = async () => {
      try {
        const formData = new FormData();
        // Only append image if it exists (not null)
        if (imageForm.image instanceof File) {
          formData.append("image", imageForm.image);
        }
        formData.append("name", imageForm.name);
        formData.append("category", imageForm.category);
        formData.append("remark", imageForm.remark);
        if (editMode.value) {
          // Edit mode
          await imageService.updateImage(currentImageId.value, formData);
          ElMessage.success("Image updated successfully");
        } else {
          // Add mode
          await imageService.createImage(formData);
          ElMessage.success("Image added successfully");
        }

        // Reset form and reload images
        resetForm();
        searchImages();
      } catch (error) {
        console.error("Error saving image:", error);
        ElMessage.error("Failed to save image");
      }
    };

    const addImage = () => {
      editMode.value = false;
      currentImageId.value = "";
      imageForm.name = "";
      imageForm.category = "";
      imageForm.remark = "";
      imageForm.image = null;
      imagePreview.value = "";
      showAddForm.value = true;
    };

    // Edit image
    const editImage = (image) => {
      editMode.value = true;
      currentImageId.value = image.id;
      imageForm.name = image.name || "";
      imageForm.category = image.category;
      imageForm.remark = image.remark;
      imageForm.image = null; // Don't send image file when editing unless a new one is selected
      imagePreview.value = image.imagePath;
      showAddForm.value = true;
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

    // Reset form
    const resetForm = () => {
      showAddForm.value = false;
      editMode.value = false;
      currentImageId.value = "";
      imageForm.image = null;
      imageForm.name = "";
      imageForm.category = "";
      imageForm.remark = "";
      imagePreview.value = "";
    };

    // Lifecycle
    onMounted(() => {
      searchImages();
    });

    return {
      images,
      showAddForm,
      editMode,
      imagePreview,
      searchForm,
      imageForm,
      pagination,
      handleFileUpload,
      saveImage,
      addImage,
      editImage,
      deleteImage,
      searchImages,
      resetSearch,
      resetForm,
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
</style>
