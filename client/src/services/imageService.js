import axios from 'axios'

// 使用环境变量配置API基础URL
export const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || '/api'
export const FILE_SERVER_URL = process.env.VUE_APP_API_FILE_SERVER_URL || ''

class ImageService {
  getAllImages(params) {
    return axios.get(`${API_BASE_URL}/images`, { params })
  }

  getImageById(id) {
    return axios.get(`${API_BASE_URL}/images/${id}`)
  }

  createImage(imageData) {
    return axios.post(`${API_BASE_URL}/images`, imageData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  updateImage(id, imageData) {
    return axios.put(`${API_BASE_URL}/images/${id}`, imageData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  deleteImage(id) {
    return axios.delete(`${API_BASE_URL}/images/${id}`)
  }
}

export default new ImageService()