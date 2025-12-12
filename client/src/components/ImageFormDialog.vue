<template>
  <el-dialog
    :title="editMode ? 'Edit Image' : 'Add Image'"
    v-model="visible"
    width="500px"
    @close="handleClose"
  >
    <el-form :model="form" ref="formRef" label-width="100px">
      <el-form-item label="Image" prop="image">
        <input type="file" @change="handleFileUpload" accept="image/*" />
        <div v-if="imagePreview">
          <img
            :src="imagePreview"
            style="width: 100px; height: 100px; object-fit: cover"
          />
        </div>
      </el-form-item>
      <el-form-item label="Category" prop="category">
        <el-input
          v-model="form.category"
          placeholder="Enter category"
        ></el-input>
      </el-form-item>
      <el-form-item label="Remark" prop="remark">
        <el-input
          v-model="form.remark"
          type="textarea"
          placeholder="Enter remark"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">Cancel</el-button>
        <el-button type="primary" @click="save">{{ editMode ? "Update" : "Add" }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { ref, reactive, watch } from "vue";
import { ElMessage } from "element-plus";

export default {
  name: "ImageFormDialog",
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    editMode: {
      type: Boolean,
      default: false
    },
    imageData: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ["update:modelValue", "save"],
  setup(props, { emit }) {
    // State
    const visible = ref(false);
    const formRef = ref(null);
    const imagePreview = ref("");
    
    const form = reactive({
      image: null,
      category: "",
      name: "",
      remark: ""
    });

    // Watch for modelValue changes
    watch(
      () => props.modelValue,
      (newValue) => {
        visible.value = newValue;
        if (newValue) {
          if (props.editMode && props.imageData) {
            form.name = props.imageData.name || "";
            form.category = props.imageData.category || "";
            form.remark = props.imageData.remark || "";
            form.image = null;
            imagePreview.value = props.imageData.imagePath || "";
          } else {
            resetForm();
          }
        }
      }
    );

    // Watch for visible changes
    watch(visible, (newValue) => {
      emit("update:modelValue", newValue);
    });

    // Handle file upload
    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (!file) {
        return;
      }
      form.image = file;
      form.name = file.name;

      // Preview image
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.value = e.target.result;
      };
      reader.readAsDataURL(file);
    };

    // Save image
    const save = async () => {
      try {
        const formData = new FormData();
        
        if (form.image instanceof File) {
          formData.append("image", form.image);
        }
        
        formData.append("name", form.name);
        formData.append("category", form.category);
        formData.append("remark", form.remark);
        
        emit("save", {
          id: props.editMode ? props.imageData.id : null,
          formData,
          isEditMode: props.editMode
        });
      } catch (error) {
        console.error("Error preparing image data:", error);
        ElMessage.error("Failed to prepare image data");
      }
    };

    // Reset form
    const resetForm = () => {
      form.image = null;
      form.name = "";
      form.category = "";
      form.remark = "";
      imagePreview.value = "";
    };

    // Close dialog
    const close = () => {
      visible.value = false;
    };

    const handleClose = () => {
      resetForm();
    };

    return {
      visible,
      formRef,
      imagePreview,
      form,
      handleFileUpload,
      save,
      close,
      handleClose
    };
  }
};
</script>

<style scoped>
/* Add any specific styles if needed */
</style>