import { useNavigate } from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-4">
      <p className="text-7xl mb-4">🧭</p>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2">404</h1>
      <p className="text-gray-500 mb-8">Bu sahifa mavjud emas yoki ko'chirilgan</p>
      <button
        onClick={() => navigate('/')}
        className="bg-red-500 text-white rounded-full px-8 py-3 font-bold hover:bg-red-600"
      >
        🏠 Bosh sahifaga qaytish
      </button>
    </div>
  )
}

export default NotFound