import axios from 'axios'

// 使用环境变量配置API基础URL
export const API_BASE_URL = process.env.VUE_APP_API_BASE_URL

class AuthService {
  login(username, password) {
    return axios.post(`${API_BASE_URL}/login`, { username, password })
  }

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  saveTokenAndUser(token, user) {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  }

  getToken() {
    return localStorage.getItem('token')
  }

  getUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  isAuthenticated() {
    const token = this.getToken()
    if (!token) return false
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || token)) // 如果是JWT格式，否则解析base64
      return payload.exp > Date.now()
    } catch (e) {
      // 尝试解析我们后端的base64 token格式
      try {
        const payload = JSON.parse(Buffer.from(token, 'base64').toString())
        return payload.exp > Date.now()
      } catch (err) {
        return false
      }
    }
  }
}

export default new AuthService()