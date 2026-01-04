<template>
  <div class="container">
    <div class="header">
      <h1>Category Management</h1>
      <el-button type="primary" @click="openCategoryForm">Add Category</el-button>
    </div>

    <!-- Category Form Dialog -->
    <el-dialog 
      :title="(isEditing ? 'Edit' : 'Add') + ' Category'" 
      v-model="showCategoryForm" 
      width="500px"
      :fullscreen="isMobile"
      @close="resetForm"
    >
      <el-form 
        :model="categoryForm" 
        :rules="categoryRules" 
        ref="categoryFormRef"
        label-width="100px"
        :label-position="isMobile ? 'top' : 'right'"
      >
        <el-form-item label="Name" prop="name">
          <el-input v-model="categoryForm.name" />
        </el-form-item>
        <el-form-item label="Code" prop="code">
          <el-input v-model="categoryForm.code" :disabled="isEditing" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCategoryForm = false">Cancel</el-button>
          <el-button type="primary" @click="saveCategory">Confirm</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Category List -->
    <div class="category-list">
      <el-table :data="categories" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="Name" />
        <el-table-column prop="code" label="Code" />
        <el-table-column prop="createTime" label="Create Time">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="Update Time">
          <template #default="scope">
            {{ formatDate(scope.row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" :width="isMobile ? 120 : 150">
          <template #default="scope">
            <el-button size="small" @click="editCategory(scope.row)">Edit</el-button>
            <el-button size="small" type="danger" @click="deleteCategory(scope.row)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, getCurrentInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import categoryService from '../services/categoryService';
import { isMobile } from '@/utils/index';

export default {
  name: 'CategoryManager',
  setup() {
    const { proxy } = getCurrentInstance();
    
    // State
    const categories = ref([]);
    const showCategoryForm = ref(false);
    const isEditing = ref(false);
    const loading = ref(false);
    const currentCategoryId = ref('');

    // Form
    const categoryForm = reactive({
      name: '',
      code: ''
    });

    const categoryFormRef = ref(null);

    // Validation rules
    const categoryRules = {
      name: [
        { required: true, message: 'Please enter category name', trigger: 'blur' }
      ],
      code: [
        { required: true, message: 'Please enter category code', trigger: 'blur' }
      ]
    };

    // 监听窗口大小变化
    const handleResize = () => {
      isMobile.value = window.innerWidth <= 768;
    };
    
    // Format date
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    // Load categories
    const loadCategories = async () => {
      try {
        loading.value = true;
        const response = await categoryService.getAllCategories();
        categories.value = response.data;
      } catch (error) {
        console.error('Error loading categories:', error);
        ElMessage.error('Failed to load categories');
      } finally {
        loading.value = false;
      }
    };

    // Open category form
    const openCategoryForm = () => {
      isEditing.value = false;
      showCategoryForm.value = true;
    };

    // Edit category
    const editCategory = (category) => {
      isEditing.value = true;
      currentCategoryId.value = category.id;
      categoryForm.name = category.name;
      categoryForm.code = category.code;
      showCategoryForm.value = true;
    };

    // Save category
    const saveCategory = async () => {
      proxy.$refs.categoryFormRef.validate(async (valid) => {
        if (!valid) return;
        
        try {
          if (isEditing.value) {
            // Update category
            await categoryService.updateCategory(currentCategoryId.value, {
              name: categoryForm.name,
              code: categoryForm.code
            });
            ElMessage.success('Category updated successfully');
          } else {
            // Create category
            await categoryService.createCategory({
              name: categoryForm.name,
              code: categoryForm.code
            });
            ElMessage.success('Category created successfully');
          }
          
          showCategoryForm.value = false;
          resetForm();
          loadCategories();
        } catch (error) {
          console.error('Error saving category:', error);
          ElMessage.error(error.response?.data?.error || 'Failed to save category');
        }
      });
    };

    // Delete category
    const deleteCategory = async (category) => {
      try {
        await ElMessageBox.confirm(
          'Are you sure you want to delete this category?',
          'Warning',
          {
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            type: 'warning'
          }
        );
        
        await categoryService.deleteCategory(category.id);
        ElMessage.success('Category deleted successfully');
        loadCategories();
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Error deleting category:', error);
          ElMessage.error(error.response?.data?.error || 'Failed to delete category');
        }
      }
    };

    // Reset form
    const resetForm = () => {
      proxy.$refs.categoryFormRef.resetFields();
      categoryForm.name = '';
      categoryForm.code = '';
      currentCategoryId.value = '';
    };

    // Lifecycle
    onMounted(() => {
      loadCategories();
      window.addEventListener('resize', handleResize);
    });
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
    });

    return {
      categories,
      showCategoryForm,
      isEditing,
      loading,
      categoryForm,
      categoryFormRef,
      categoryRules,
         isMobile: isMobile(),
      formatDate,
      openCategoryForm,
      editCategory,
      saveCategory,
      deleteCategory,
      resetForm,
      loadCategories
    };
  }
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.header h1 {
  margin: 0;
}

.category-list {
  background: white;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  
  .header {
    flex-direction: column;
    align-items: stretch;
  }
  
  :deep(.el-dialog) {
    width: 90% !important;
    max-width: none;
    margin: 0 auto;
  }
  
  :deep(.el-dialog__body) {
    padding: 15px;
  }
  
  :deep(.el-form-item__label) {
    padding-bottom: 5px;
  }
}
</style>