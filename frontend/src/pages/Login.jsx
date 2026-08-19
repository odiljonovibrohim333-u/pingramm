import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')   // 'login' yoki 'signup'
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')       // 🆕 faqat signup uchun
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 🔐 Login
  const handleLogin = async (e) => {
  e.preventDefault()
  setError('')
  try {
    const res = await api.post('/api/login/', { username, password })
    localStorage.setItem('access', res.data.access)
    localStorage.setItem('refresh', res.data.refresh)

    const me = await api.get('/api/profile/')
    localStorage.setItem('userId', me.data.id)
    localStorage.setItem('username', me.data.username)
    localStorage.setItem('avatar', me.data.avatar || '')

    navigate('/')
  } catch (err) {
    // 🆕 Backend'dan kelgan HAQIQIY xatoni ko'rsatamiz
    const backendError = err.response?.data
    console.log('Backend xatosi:', backendError)   // F12 console'da ko'rinadi

    if (backendError?.non_field_errors) {
      setError(backendError.non_field_errors[0])
    } else if (backendError?.username) {
      setError(backendError.username[0])
    } else if (backendError?.password) {
      setError(backendError.password[0])
    } else {
      setError("Username yoki parol noto'g'ri! ❌")
    }
  }
}

  // ✨ Signup
  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await api.post('/api/signup/', { username, email, password })
      setSuccess('Akkaunt yaratildi! Endi login qiling ✅')
      setMode('login')
      setPassword('')
    } catch (err) {
      const data = err.response?.data
      if (data?.username) setError("Bu username band! 😕")
      else if (data?.email) setError("Bu email band! 😕")
      else if (data?.password) setError("Parol kamida 8 belgi bo'lsin! 🔑")
      else setError("Nimadir xato ketdi. Qayta urinib ko'ring!")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <form
        onSubmit={mode === 'login' ? handleLogin : handleSignup}
        className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md"
      >
        {/* Logo */}
        <h1 className="text-4xl font-extrabold text-center text-red-500 mb-1">
          📸 PinGram
        </h1>
        <p className="text-center text-gray-500 text-sm mb-6">
          {mode === 'login' ? 'Akkauntingga kirish 🔐' : 'Yangi akkaunt yaratish ✨'}
        </p>

        {/* Tab'lar */}
        <div className="flex gap-2 mb-6 bg-gray-100 rounded-full p-1">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccess('') }}
            className={
              'flex-1 py-2 rounded-full text-sm font-bold transition ' +
              (mode === 'login' ? 'bg-white text-red-500 shadow' : 'text-gray-500')
            }
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); setSuccess('') }}
            className={
              'flex-1 py-2 rounded-full text-sm font-bold transition ' +
              (mode === 'signup' ? 'bg-white text-red-500 shadow' : 'text-gray-500')
            }
          >
            Ro'yxatdan o'tish
          </button>
        </div>

        {/* Xato yoki muvaffaqiyat */}
        {error && (
          <p className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm text-center">
            {error}
          </p>
        )}
        {success && (
          <p className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-xl mb-4 text-sm text-center">
            {success}
          </p>
        )}

        {/* Username */}
        <input
          className="w-full bg-gray-100 p-3 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-red-400"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        {/* Email — FAQAT signup'da */}
        {mode === 'signup' && (
          <input
            className="w-full bg-gray-100 p-3 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-red-400"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}

        {/* Parol */}
        <input
          className="w-full bg-gray-100 p-3 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-red-400"
          type="password"
          placeholder="Parol"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={mode === 'signup' ? 8 : undefined}
        />

        <button
          className="w-full bg-red-500 text-white p-3 rounded-xl font-bold hover:bg-red-600 transition"
          type="submit"
        >
          {mode === 'login' ? 'Kirish' : 'Akkaunt yaratish'}
        </button>

        {/* Parolni unutdim (login'da) */}
        {mode === 'login' && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Parolni unutdingizmi? Admin bilan bog'laning 📩
          </p>
        )}

        {/* Signup'da ogohlantirish */}
        {mode === 'signup' && (
          <p className="text-center text-xs text-gray-400 mt-4">
            🔑 Parol kamida 8 belgi bo'lishi kerak
          </p>
        )}
      </form>
    </div>
  )
}

export default Login