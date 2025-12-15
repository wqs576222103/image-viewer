import axios from 'axios';

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || '/api';

const categoryService = {
  // 获取所有分类
  getAllCategories() {
    return axios.get(`${API_BASE_URL}/categories`);
  },

  // 创建分类
  createCategory(categoryData) {
    return axios.post(`${API_BASE_URL}/categories`, categoryData);
  },

  // 更新分类
  updateCategory(id, categoryData) {
    return axios.put(`${API_BASE_URL}/categories/${id}`, categoryData);
  },

  // 删除分类
  deleteCategory(id) {
    return axios.delete(`${API_BASE_URL}/categories/${id}`);
  }
};

export default categoryService;