import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function Navbar() {
  const navigate = useNavigate()
  const username = localStorage.getItem('username') || 'Mehmon'
  const userId = localStorage.getItem('userId')
  const [searchText, setSearchText] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showDrop, setShowDrop] = useState(false)

  // 🔮 AUTOCOMPLETE: yozayotganda takliflar (debounce 300ms)
  useEffect(() => {
    if (searchText.trim().length < 2) {
      setSuggestions([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/api/images/?search=' + encodeURIComponent(searchText))
        setSuggestions(res.data.results.slice(0, 5))
      } catch {}
    }, 300)
    return () => clearTimeout(timer)   // 🧹 eski so'rovni bekor qilish
  }, [searchText])

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchText.trim()) return
    setShowDrop(false)
    navigate('/search?q=' + encodeURIComponent(searchText.trim()))
  }

  return (
    <nav className="sticky top-0 z-20 bg-white shadow-sm px-6 py-3 flex items-center gap-3">
      <button onClick={() => navigate('/')} className="text-2xl font-extrabold text-red-500">
        📸 PinGram
      </button>

      {/* 🔍 Qidiruv + takliflar dropdown */}
      <form onSubmit={handleSearch} className="flex-1 relative">
        <input
          className="w-full bg-gray-100 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          placeholder="Qidirish..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onFocus={() => setShowDrop(true)}
          onBlur={() => setTimeout(() => setShowDrop(false), 150)}
        />

        {/* 🔮 Takliflar oynasi */}
        {showDrop && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-30">
            {suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onMouseDown={() => {
                  setShowDrop(false)
                  setSearchText('')
                  navigate('/pin/' + s.id)
                }}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left"
              >
                <img src={s.image} alt={s.title} className="w-10 h-10 rounded-lg object-cover" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                  <p className="text-xs text-gray-400">👤 {s.author}</p>
                </div>
              </button>
            ))}

            <button
              type="button"
              onMouseDown={() => {
                setShowDrop(false)
                navigate('/search?q=' + encodeURIComponent(searchText.trim()))
              }}
              className="w-full px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 text-left"
            >
              🔍 "{searchText}" ni qidirish
            </button>
          </div>
        )}
      </form>

      <button
        onClick={() => navigate('/upload')}
        className="bg-red-500 text-white rounded-full px-4 py-2 font-bold hover:bg-red-600"
      >
        +
      </button>

      <button
        onClick={() => navigate('/user/' + userId)}
        className="w-9 h-9 rounded-full bg-red-500 text-white font-bold hover:opacity-90"
      >
        {username.charAt(0).toUpperCase()}
      </button>

      <button onClick={handleLogout} title="Chiqish" className="text-xl hover:scale-110">
        🚪
      </button>
    </nav>
  )
}

export default Navbar