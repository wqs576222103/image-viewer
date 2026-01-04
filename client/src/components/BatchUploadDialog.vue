<template>
  <el-dialog 
    title="Batch Upload Images" 
    v-model="visible" 
    width="600px"
    :fullscreen="isMobile"
    @close="handleClose"
  >
    <el-form 
      :model="form" 
      :rules="rules" 
      ref="formRef"
      label-width="120px"
      :label-position="isMobile ? 'top' : 'right'"
    >
      <el-form-item label="Files" prop="files">
        <input 
          type="file" 
          ref="fileInput" 
          @change="handleFileChange" 
          accept="image/*"
          multiple
        />
        <div class="file-list" v-if="form.files.length > 0">
          <div 
            v-for="(file, index) in form.files" 
            :key="index" 
            class="file-item"
          >
            <span>{{ file.name }}</span>
            <el-input 
              v-model="file.name" 
              placeholder="Image Name"
              size="small"
              class="filename-input"
            />
            <el-button 
              type="danger" 
              circle 
              size="small" 
              @click="removeFile(index)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </el-form-item>
      
      <el-form-item label="Category" prop="category">
        <el-select 
          v-model="form.category" 
          placeholder="Select Category" 
          clearable 
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="category in categories"
            :key="category.code"
            :label="category.name"
            :value="category.code"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="Remark" prop="remark">
        <el-input v-model="form.remark" type="textarea" />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button type="primary" @click="submitForm" :disabled="form.files.length === 0">Upload</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { ref, reactive, watch, getCurrentInstance, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Delete } from '@element-plus/icons-vue'
import { isMobile } from '@/utils/index';

export default {
  name: 'BatchUploadDialog',
  components: {
    Delete
  },
  props: {
    modelValue: Boolean,
    categories: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'upload'],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    
    // State
    const visible = ref(false);
    const fileInput = ref(null);
    
    // Form
    const form = reactive({
      files: [],
      category: '',
      remark: ''
    });
    
    const formRef = ref(null);
    
    // Validation rules
    const rules = {
      files: [
        { required: true, message: 'Please select at least one file', trigger: 'change' }
      ]
    };
    
    // 监听窗口大小变化
    const handleResize = () => {
      isMobile.value = window.innerWidth <= 768;
    };
    
    // Watch for visibility changes
    watch(() => props.modelValue, (newValue) => {
      visible.value = newValue;
      if (!newValue) {
        resetForm();
      }
    });
    
    // Handle file change
    const handleFileChange = (event) => {
      const files = Array.from(event.target.files);
      form.files = files.map(file => ({
        file,
        name: file.name.split('.')[0] // Default name without extension
      }));
    };
    
    // Remove file
    const removeFile = (index) => {
      form.files.splice(index, 1);
    };
    
    // Reset form
    const resetForm = () => {
      proxy.$refs.formRef.resetFields();
      form.files = [];
      form.category = '';
      form.remark = '';
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    };
    
    // Handle close
    const handleClose = () => {
      visible.value = false;
      emit('update:modelValue', false);
    };
    
    // Submit form
    const submitForm = () => {
      proxy.$refs.formRef.validate((valid) => {
        if (!valid) return;
        
        emit('upload', {
          files: form.files,
          category: form.category,
          remark: form.remark
        });
      });
    };
    
    // 添加窗口大小监听
    onMounted(() => {
      window.addEventListener('resize', handleResize);
    });
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
    });
    
    return {
      visible,
      form,
      formRef,
      rules,
      fileInput,
           isMobile: isMobile(),
      handleFileChange,
      removeFile,
      handleClose,
      submitForm
    };
  }
};
</script>

<style scoped>
.file-list {
  margin-top: 10px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}

.file-item span {
  flex: 1;
  font-size: 12px;
  color: #666;
  min-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.filename-input {
  width: 180px;
}

@media (max-width: 768px) {
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
  
  .file-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
    padding: 10px 0;
  }
  
  .filename-input {
    width: 100%;
  }
}
</style>