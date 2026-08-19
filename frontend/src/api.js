import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
})

// 🛡️ 1-QALQON (REQUEST): har bir so'rovga token'ni AVTOMATIK qo'shadi
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access')
  if (token) {
    config.headers.Authorization = 'Bearer ' + token
  }
  return config
})

// 🛡️ 2-QALQON (RESPONSE): 401 kelsa → refresh qilib, qayta urinish
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Login/signup so'rovlarida refresh qilmaymiz!
    const authUrl =
      originalRequest.url.includes('/login/') ||
      originalRequest.url.includes('/signup/') ||
      originalRequest.url.includes('/refresh/')

    if (error.response?.status === 401 && !originalRequest._retry && !authUrl) {
      originalRequest._retry = true
      try {
        const refresh = localStorage.getItem('refresh')
        const res = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
          refresh,
        })
        localStorage.setItem('access', res.data.access)
        originalRequest.headers.Authorization = 'Bearer ' + res.data.access
        return api(originalRequest) // 🔄 asl so'rovni qayta yuborish
      } catch {
        // Refresh ham eskirgan → tozalab, login'ga haydash
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api