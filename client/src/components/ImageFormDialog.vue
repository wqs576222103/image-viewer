<template>
  <el-dialog 
    :title="(editMode ? 'Edit' : 'Add') + ' Image'" 
    v-model="visible" 
    width="500px"
    :fullscreen="isMobile"
    @close="handleClose"
  >
    <el-form 
      :model="form" 
      :rules="rules" 
      ref="formRef"
      label-width="100px"
      :label-position="isMobile ? 'top' : 'right'"
      enctype="multipart/form-data"
    >
      <el-form-item label="Name" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      
      <el-form-item label="Image" prop="image" :required="!editMode">
        <input 
          type="file" 
          ref="fileInput" 
          @change="handleFileChange" 
          accept="image/*"
          :disabled="editMode && !form.image"
        />
        <div v-if="editMode && imageData.imagePath" class="image-preview-small">
          <img :src="imageData.imagePath" alt="Current image" />
        </div>
        <div v-if="editMode">
          <el-checkbox v-model="removeImage">Remove current image</el-checkbox>
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
        <el-button type="primary" @click="submitForm">Confirm</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { ref, reactive, watch, getCurrentInstance, nextTick, onMounted, onUnmounted,  } from 'vue';
import { ElMessage } from 'element-plus';

export default {
  name: 'ImageFormDialog',
  props: {
    modelValue: Boolean,
    editMode: Boolean,
    imageData: Object,
    categories: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'save'],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    
    // State
    const visible = ref(false);
    const removeImage = ref(false);
    const fileInput = ref(null);
    
    // 检测是否为移动端
    const isMobile = ref(window.innerWidth <= 768);
    
    // Form
    const form = reactive({
      name: '',
      image: null,
      category: '',
      remark: ''
    });
    
    const formRef = ref(null);
    
    // Validation rules
    const rules = {
      name: [
        { required: true, message: 'Please enter image name', trigger: 'blur' }
      ],
      image: [
        { 
          required: true, 
          validator: (rule, value, callback) => {
            if (!props.editMode && !form.image) {
              callback(new Error('Please select an image'));
            } else {
              callback();
            }
          },
          trigger: 'change' 
        }
      ]
    };
    
    // 监听窗口大小变化
    const handleResize = () => {
      isMobile.value = window.innerWidth <= 768;
    };
    
    // Watch for visibility changes
    watch(() => props.modelValue, (newValue) => {
      visible.value = newValue;
      if (newValue) {
        nextTick(() => {
          resetForm();
          if (props.editMode && props.imageData) {
            form.name = props.imageData.name || '';
            form.category = props.imageData.category || '';
            form.remark = props.imageData.remark || '';
          }
        });
      }
    });
    
    // Watch for edit mode changes
    watch(() => props.editMode, () => {
      if (props.editMode) {
        // 编辑模式下不需要强制上传图片
        rules.image[0].required = false;
      } else {
        // 新增模式下需要强制上传图片
        rules.image[0].required = true;
      }
    });
    
    // Handle file change
    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        form.image = file;
      } else {
        form.image = null;
      }
    };
    
    // Reset form
    const resetForm = () => {
      proxy.$refs.formRef.resetFields();
      form.name = '';
      form.image = null;
      form.category = '';
      form.remark = '';
      removeImage.value = false;
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
    const submitForm = async () => {
      proxy.$refs.formRef.validate(async (valid) => {
        if (!valid) return;
        
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('category', form.category);
        formData.append('remark', form.remark);
        
        if (form.image) {
          formData.append('image', form.image);
        }
        
        if (props.editMode) {
          // 编辑模式
          if (removeImage.value) {
            formData.append('removeImage', 'true');
          }
          emit('save', {
            id: props.imageData.id,
            formData,
            isEditMode: true
          });
        } else {
          // 新增模式
          emit('save', {
            formData,
            isEditMode: false
          });
        }
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
      removeImage,
      isMobile,
      handleFileChange,
      handleClose,
      submitForm
    };
  }
};
</script>

<style scoped>
.image-preview-small img {
  max-width: 100px;
  max-height: 100px;
  margin-top: 10px;
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
}
</style>