import axios from 'axios'
import AuthService from './authService'
import router from '../router'

// 使用环境变量配置API基础URL
export const API_BASE_URL = process.env.VUE_APP_API_BASE_URL
export const FILE_SERVER_URL = process.env.VUE_APP_API_FILE_SERVER_URL

// 请求拦截器 - 添加认证token
axios.interceptors.request.use(
  config => {
    const token = AuthService.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理401错误
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      AuthService.logout()
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

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

  // 批量删除图片
  deleteImages(ids) {
    return axios.delete(`${API_BASE_URL}/images`, {
      data: { ids }
    })
  }
}

export default new ImageService()