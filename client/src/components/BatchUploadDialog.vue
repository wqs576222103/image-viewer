<template>
  <el-dialog
    title="Batch Add Images"
    v-model="visible"
    width="700px"
    @close="handleClose"
  >
    <el-form :model="form" label-width="120px">
      <el-form-item label="Category">
        <el-input
          v-model="form.category"
          placeholder="Enter category for all images"
        ></el-input>
      </el-form-item>
      <el-form-item label="Remark">
        <el-input
          v-model="form.remark"
          type="textarea"
          placeholder="Enter remark for all images"
        ></el-input>
      </el-form-item>
      
      <el-form-item label="Images">
        <div class="batch-upload-section">
          <el-button type="primary" @click="triggerFileSelect">
            Select Images
          </el-button>
          <input 
            ref="fileInput"
            type="file" 
            @change="handleFileSelection" 
            accept="image/*" 
            multiple
            style="display: none;"
          />
          
          <div class="preview-grid" v-if="files.length > 0">
            <div 
              v-for="(file, index) in files" 
              :key="index"
              class="preview-item"
            >
              <img 
                :src="file.previewUrl" 
                :alt="file.name"
                class="preview-image"
              />
              <div class="file-info">
                <p class="file-name">{{ truncateFileName(file.name, 20) }}</p>
                <el-button 
                  type="danger" 
                  :icon="Delete" 
                  circle
                  size="small"
                  @click="removeFile(index)"
                ></el-button>
              </div>
            </div>
          </div>
          
          <div v-else class="no-files">
            <p>No images selected</p>
          </div>
        </div>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">Cancel</el-button>
        <el-button 
          type="primary" 
          @click="upload"
          :disabled="files.length === 0"
          :loading="uploading"
        >
          Upload {{ files.length }} Images
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>


<script>
import { ref, reactive, watch } from "vue";
import { ElMessage } from "element-plus";
import { Delete } from "@element-plus/icons-vue";

export default {
  name: "BatchUploadDialog",
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ["update:modelValue", "upload"],
  setup(props, { emit }) {
    // State
    const visible = ref(false);
    const fileInput = ref(null);
    const uploading = ref(false);
    
    const form = reactive({
      category: "",
      remark: ""
    });

    const files = ref([]);

    // Watch for modelValue changes
    watch(
      () => props.modelValue,
      (newValue) => {
        visible.value = newValue;
        if (newValue) {
          resetForm();
        }
      }
    );

    // Watch for visible changes
    watch(visible, (newValue) => {
      emit("update:modelValue", newValue);
    });

    // Methods
    const triggerFileSelect = () => {
      fileInput.value.click();
    };

    const handleFileSelection = (event) => {
      const selectedFiles = Array.from(event.target.files);
      if (!selectedFiles.length) return;

      // Process each selected file
      selectedFiles.forEach(file => {
        // Check if file is an image
        if (!file.type.startsWith('image/')) {
          ElMessage.warning(`${file.name} is not an image file and was skipped.`);
          return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          files.value.push({
            file: file,
            name: file.name,
            previewUrl: e.target.result
          });
        };
        reader.readAsDataURL(file);
      });

      // Clear the input to allow selecting the same files again
      event.target.value = '';
    };

    const removeFile = (index) => {
      files.value.splice(index, 1);
    };

    const truncateFileName = (name, maxLength) => {
      if (name.length <= maxLength) return name;
      return name.substr(0, maxLength) + '...';
    };

    const upload = async () => {
      if (files.value.length === 0) {
        ElMessage.warning("Please select at least one image");
        return;
      }

      uploading.value = true;
      
      try {
        emit("upload", {
          files: [...files.value],
          category: form.category,
          remark: form.remark
        });
      } catch (error) {
        console.error("Error in batch upload:", error);
        ElMessage.error("Batch upload failed");
        uploading.value = false;
      }
    };

    const resetForm = () => {
      form.category = "";
      form.remark = "";
      files.value = [];
    };

    const close = () => {
      visible.value = false;
    };

    const handleClose = () => {
      resetForm();
    };

    // Expose method to parent to stop loading state
    const finishUpload = () => {
      uploading.value = false;
    };

    return {
      visible,
      fileInput,
      uploading,
      form,
      files,
      Delete,
      triggerFileSelect,
      handleFileSelection,
      removeFile,
      truncateFileName,
      upload,
      close,
      handleClose,
      finishUpload
    };
  }
};
</script>

<style scoped>
.batch-upload-section {
  margin-top: 10px;
  width: 100%;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  margin-top: 15px;
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}

.preview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.file-info {
  display: flex;
  align-items: center;
  margin-top: 5px;
  width: 100%;
}

.file-name {
  font-size: 12px;
  margin: 0;
  flex: 1;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-files {
  text-align: center;
  color: #909399;
  padding: 20px;
}
</style>
