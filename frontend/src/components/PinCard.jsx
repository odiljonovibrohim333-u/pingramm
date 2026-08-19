import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function PinCard({ img, onDelete }) {
  const navigate = useNavigate()
  const [liked, setLiked] = useState(img.is_liked)
  const [likesCount, setLikesCount] = useState(img.likes_count)
  const [saved, setSaved] = useState(img.is_saved)
  const [busy, setBusy] = useState(false)
  const [imgError, setImgError] = useState(false)

  const handleLike = async (e) => {
    e.stopPropagation()
    if (busy) return
    setBusy(true)
    try {
      const res = await api.post('/api/images/' + img.id + '/like/')
      setLiked(res.data.liked)
      setLikesCount(res.data.likes_count)
    } catch (err) {
      console.log(err)
    }
    setBusy(false)
  }

  const handleSave = async (e) => {
    e.stopPropagation()
    if (busy) return
    setBusy(true)
    try {
      const res = await api.post('/api/images/' + img.id + '/save/')
      setSaved(res.data.saved)
    } catch (err) {
      console.log(err)
    }
    setBusy(false)
  }

  return (
    <div
      className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white shadow-sm hover:shadow-lg transition"
      onClick={() => navigate('/pin/' + img.id)}
    >
      {imgError ? (
        <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-4xl">
          🖼️
        </div>
      ) : (
        <img
          src={img.image}
          alt={img.title}
          className="w-full"
          onError={() => setImgError(true)}
        />
      )}

      {/* 🎭 Hover overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-200">
        {/* 🗑️ O'chirish — faqat o'z rasmi uchun */}
        {String(img.author_id) === String(localStorage.getItem('userId')) && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(img.id)
            }}
            title="O'chirish"
            className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition"
          >
            🗑️
          </button>
        )}

        {/* 🔖 Saqlash */}
        <button
          onClick={handleSave}
          className={
            'absolute top-3 right-3 rounded-full px-4 py-2 text-sm font-bold ' +
            (saved ? 'bg-black text-white' : 'bg-red-500 text-white hover:bg-red-600')
          }
        >
          {saved ? '✓ Saqlangan' : 'Saqlash'}
        </button>

        {/* ❤️ Like */}
        <button
          onClick={handleLike}
          className="absolute bottom-3 left-3 bg-white rounded-full px-3 py-2 text-sm font-bold hover:scale-110 transition"
        >
          {liked ? '❤️' : '🤍'} {likesCount}
        </button>
      </div>

      {/* Karta osti */}
      <div className="p-3">
        <p className="font-semibold text-sm text-gray-800 truncate">{img.title}</p>
        <button
          onClick={(e) => {
            e.stopPropagation()
            navigate('/user/' + img.author_id)
          }}
          className="flex items-center gap-2 mt-1 text-xs text-gray-500 hover:text-red-500"
        >
          <span className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center font-bold">
            {img.author.charAt(0).toUpperCase()}
          </span>
          {img.author}
        </button>
      </div>
    </div>
  )
}

export default PinCard