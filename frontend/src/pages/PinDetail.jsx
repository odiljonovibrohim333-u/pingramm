import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import useInfiniteScroll from '../hooks/useInfiniteScroll'
import Navbar from '../components/Navbar'
import Loader from '../components/Loader'
import ErrorBanner from '../components/ErrorBanner'
import MasonryGrid from '../components/MasonryGrid'

const formatDate = (dateStr) => {
  const diff = (new Date() - new Date(dateStr)) / 1000
  if (diff < 60) return 'hozirgina'
  if (diff < 3600) return Math.floor(diff / 60) + ' daqiqa oldin'
  if (diff < 86400) return Math.floor(diff / 3600) + ' soat oldin'
  if (diff < 604800) return Math.floor(diff / 86400) + ' kun oldin'
  return new Date(dateStr).toLocaleDateString()
}

function PinDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const username = localStorage.getItem('username')
  const myId = localStorage.getItem('userId')

  const [pin, setPin] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [commentText, setCommentText] = useState('')
  const [sending, setSending] = useState(false)
  const [busy, setBusy] = useState(false)
  const [zoomed, setZoomed] = useState(false)

  // 🌀 Related rasmlar uchun infinite scroll hook
  const fetchRelated = useCallback(async (pageNum) => {
    const res = await api.get('/api/images/?page=' + pageNum)
    return {
      items: res.data.results.filter((r) => r.id !== Number(id)),
      hasMore: res.data.next !== null,
    }
  }, [id])

  const {
    items: related,
    setItems: setRelated,
    loading: relatedLoading,
    hasMore: relatedHasMore,
  } = useInfiniteScroll(fetchRelated)

  useEffect(() => {
    window.scrollTo(0, 0)
    const loadData = async () => {
      setLoading(true)
      try {
        const pinRes = await api.get('/api/images/' + id + '/')
        setPin(pinRes.data)

        const comRes = await api.get('/api/images/' + id + '/comments/')
        setComments(comRes.data)
      } catch (err) {
        setError(err.response?.status === 404 ? 'Rasm topilmadi 😕' : "Server bilan aloqa yo'q 📡")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  const handleLike = async () => {
    if (busy) return
    setBusy(true)
    try {
      const res = await api.post('/api/images/' + id + '/like/')
      setPin({ ...pin, is_liked: res.data.liked, likes_count: res.data.likes_count })
    } catch {}
    setBusy(false)
  }

  const handleSave = async () => {
    if (busy) return
    setBusy(true)
    try {
      const res = await api.post('/api/images/' + id + '/save/')
      setPin({ ...pin, is_saved: res.data.saved, saves_count: res.data.saves_count })
    } catch {}
    setBusy(false)
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || sending) return
    setSending(true)
    try {
      const res = await api.post('/api/images/' + id + '/comments/', { text: commentText })
      setComments([...comments, res.data])
      setCommentText('')
    } catch {}
    setSending(false)
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete('/api/comments/' + commentId + '/')
      setComments(comments.filter((c) => c.id !== commentId))
    } catch (err) {
      console.log(err)
    }
  }

  const handleDeletePin = async (pinId) => {
    const targetId = pinId || id
    if (!window.confirm("Rasmni o'chirasizmi? Bu amalni qaytarib bo'lmaydi!")) return
    try {
      await api.delete('/api/images/' + targetId + '/')
      if (targetId === id) {
        navigate('/')
      } else {
        setRelated(related.filter((r) => r.id !== targetId))
      }
    } catch (err) {
      console.log(err)
    }
  }

  // ⬇️ Rasmni yuklab olish
  const handleDownload = async () => {
    try {
      const res = await fetch(pin.image)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = pin.title + '.jpg'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.log(err)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-white"><Navbar /><Loader /></div>
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <ErrorBanner message={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="w-12 h-12 rounded-full bg-gray-900 text-white shadow-lg flex items-center justify-center hover:bg-red-500 hover:scale-110 transition mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden md:flex">
          <div className="md:w-1/2 bg-gray-100 relative group">
            <img
              src={pin.image}
              alt={pin.title}
              className="w-full h-full object-cover cursor-zoom-in"
              onClick={() => setZoomed(true)}
            />

            {/* 🔍⬇️ Hover tugmalar */}
            <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={() => setZoomed(true)}
                title="Kattalashtirish"
                className="w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black"
              >
                🔍
              </button>
              <button
                onClick={handleDownload}
                title="Yuklab olish"
                className="w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black"
              >
                ⬇️
              </button>
            </div>
          </div>

          <div className="md:w-1/2 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigate('/user/' + pin.author_id)}
                className="flex items-center gap-3 hover:opacity-80"
              >
                <span className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
                  {pin.author.charAt(0).toUpperCase()}
                </span>
                <span className="font-bold text-gray-800">{pin.author}</span>
              </button>

              <div className="flex items-center gap-2">
                {String(pin.author_id) === String(myId) && (
                  <button
                    onClick={() => handleDeletePin()}
                    title="O'chirish"
                    className="rounded-full px-4 py-2 font-bold bg-gray-200 text-red-500 hover:bg-red-500 hover:text-white transition"
                  >
                    🗑️
                  </button>
                )}

                <button
                  onClick={handleSave}
                  className={
                    'rounded-full px-5 py-2 font-bold ' +
                    (pin.is_saved ? 'bg-black text-white' : 'bg-red-500 text-white hover:bg-red-600')
                  }
                >
                  {pin.is_saved ? '✓ Saqlangan' : 'Saqlash'}
                </button>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">{pin.title}</h1>
            {pin.description && <p className="text-gray-600 mb-4">{pin.description}</p>}

            <div className="flex items-center gap-4 mb-6">
              <button onClick={handleLike} className="text-lg font-bold hover:scale-110 transition">
                {pin.is_liked ? '❤️' : '🤍'} {pin.likes_count}
              </button>
              <span className="text-gray-500">💬 {comments.length}</span>
            </div>

            <div className="flex-1 border-t pt-4 overflow-y-auto max-h-64">
              {comments.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  Birinchi kommentni yozing! 💬
                </p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2 mb-4 group">
                    <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm">
                      {c.author.charAt(0).toUpperCase()}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-bold mr-2">{c.author}</span>
                        {c.text}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">🕐 {formatDate(c.created_at)}</p>
                    </div>
                    {c.author === username && (
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        title="O'chirish"
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {pin.comments_enabled ? (
              <form onSubmit={handleComment} className="flex gap-2 mt-4">
                <input
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  placeholder="Komment yozish..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || sending}
                  className="bg-red-500 text-white rounded-full px-5 py-2 text-sm font-bold disabled:opacity-40 hover:bg-red-600"
                >
                  Yuborish
                </button>
              </form>
            ) : (
              <p className="text-center text-gray-400 text-sm mt-4">Kommentlar o'chirilgan 🔒</p>
            )}
          </div>
        </div>

        {/* ✨ Yana g'oyalar — ENDI CHEKSIZ! */}
        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Yana ko'proq g'oyalar ✨</h2>
            <MasonryGrid images={related} onDelete={handleDeletePin} />
            {relatedLoading && <Loader />}
            {!relatedHasMore && <p className="text-center text-gray-400 py-8">Hammasi ko'rildi ✅</p>}
          </div>
        )}
      </div>

      {/* 🔍 ZOOM overlay */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 cursor-zoom-out"
          onClick={() => setZoomed(false)}
        >
          <img
            src={pin.image}
            alt={pin.title}
            className="max-w-full max-h-full object-contain rounded-xl"
          />
          <button className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white text-black text-xl font-bold hover:bg-red-500 hover:text-white">
            ✖
          </button>
        </div>
      )}
    </div>
  )
}

export default PinDetail