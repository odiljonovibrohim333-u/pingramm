import axios from 'axios'

const API_URL = 'https://pingramm-backen.onrender.com'

const api = axios.create({
  baseURL: API_URL,
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

    // 1. URL ni xavfsiz olish (undefined bo'lsa, bo'sh string)
    const url = originalRequest.url || ''
    
    // 2. Login/signup/refresh so'rovlarida refresh qilmaymiz!
    // '/login/' o'rniga 'login' ishlatamiz, shunda '/login' va '/login/' ikkalasi ham to'g'ri ishlaydi
    const authUrl = url.includes('login') || url.includes('signup') || url.includes('refresh')

    if (error.response?.status === 401 && !originalRequest._retry && !authUrl) {
      originalRequest._retry = true
      
      try {
        const refresh = localStorage.getItem('refresh')
        
        // Refresh token so'rovini yuborish
        const res = await axios.post(`${API_URL}/api/token/refresh/`, {
          refresh: refresh,
        })
        
        localStorage.setItem('access', res.data.access)
        
        // 3. Header mavjudligini tekshirib, keyin yozamiz (xatolikning oldini oladi)
        if (!originalRequest.headers) {
          originalRequest.headers = {}
        }
        originalRequest.headers.Authorization = 'Bearer ' + res.data.access
        
        // Asl so'rovni qayta yuborish
        return api(originalRequest)
        
      } catch (refreshError) {
        // Refresh ham eskirgan yoki xato bo'lsa → tozalab, login'ga haydash
        localStorage.clear()
        window.location.href = '/login'
        
        // Interceptor zanjirini to'g'ri to'xtatish uchun
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

export default api