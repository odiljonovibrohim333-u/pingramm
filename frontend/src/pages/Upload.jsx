import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import Navbar from '../components/Navbar'

function Upload() {
  const navigate = useNavigate()
  const inputRef = useRef(null)   // 🆕 yashirin input'ga "qo'l" uzatamiz

  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [commentsEnabled, setCommentsEnabled] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  // 📷 Faylni TEKSHIRIB qabul qilish
  const handleFile = (newFile) => {
    setError('')
    if (!newFile) return

    if (!newFile.type.startsWith('image/')) {
      setError('Faqat rasm fayllari mumkin! 🖼️')
      return
    }
    if (newFile.size > 5 * 1024 * 1024) {
      setError("Rasm 5MB dan kichik bo'lsin! ⚖️")
      return
    }

    setFile(newFile)
    setPreview(URL.createObjectURL(newFile))  // 🪄 yuklamasdan ko'rish
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  // 🖱️ Drag & Drop
  const onDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }
  const onDragLeave = () => setDragActive(false)
  const onDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    handleFile(e.dataTransfer.files[0])
  }

  // 🚀 Yuklash
  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file || !title.trim() || uploading) return

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('image', file)
    formData.append('title', title.trim())
    formData.append('description', description.trim())
    formData.append('comments_enabled', commentsEnabled)

    try {
      await api.post('/api/images/', formData)
      navigate('/')   // 🎉 feed'da yangi rasm ENG TEPADA!
    } catch {
      setError("Rasmni yuklab bo'lmadi. Qayta urinib ko'ring! 📡")
    } finally {
      setUploading(false)
    }
  }

  const canSubmit = file && title.trim() && !uploading

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* ⬅️ Orqaga */}
        <button
          onClick={() => navigate(-1)}
          className="w-12 h-12 rounded-full bg-gray-900 text-white shadow-lg flex items-center justify-center hover:bg-red-500 hover:scale-110 transition mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
          📤 Yangi rasm yuklash
        </h1>

        <form onSubmit={handleUpload} className="space-y-6">
          {/* 🖼️ Drag & Drop zona yoki Preview */}
          {preview ? (
            <div className="relative rounded-3xl overflow-hidden shadow-lg">
              <img src={preview} alt="Preview" className="w-full max-h-96 object-cover" />
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current.click()}
                  className="bg-white/90 rounded-full px-4 py-2 text-sm font-bold hover:bg-white"
                >
                  🔄 Almashtirish
                </button>
                <button
                  type="button"
                  onClick={clearFile}
                  className="bg-red-500 text-white rounded-full px-4 py-2 text-sm font-bold hover:bg-red-600"
                >
                  ✖
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => inputRef.current.click()}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={
                'border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition ' +
                (dragActive
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 bg-gray-50 hover:border-red-400')
              }
            >
              <div className="text-5xl mb-4">📤</div>
              <p className="font-bold text-gray-700">Rasmni shu yerga tashlang</p>
              <p className="text-gray-500 text-sm mt-1">yoki bosing va tanlang (PNG, JPG, 5MB gacha)</p>
            </div>
          )}

          {/* Yashirin fayl input */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleFile(e.target.files[0])}
          />

          {/* ✏️ Sarlavha + hisoblagich */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="font-bold text-sm text-gray-700">Sarlavha *</label>
              <span className="text-xs text-gray-400">{title.length}/100</span>
            </div>
            <input
              className="w-full bg-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="Masalan: Chiroyli quyosh botishi 🌅"
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* 📝 Tavsif */}
          <div>
            <label className="font-bold text-sm text-gray-700 block mb-1">Tavsif</label>
            <textarea
              className="w-full bg-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              rows={3}
              placeholder="Rasm haqida qisqacha..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* 💬 Komment toggle (Pinterest uslubida) */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <span className="font-bold text-sm text-gray-700">💬 Kommentlarga ruxsat</span>
            <button
              type="button"
              onClick={() => setCommentsEnabled(!commentsEnabled)}
              className={
                'w-12 h-7 rounded-full transition relative ' +
                (commentsEnabled ? 'bg-red-500' : 'bg-gray-300')
              }
            >
              <span
                className={
                  'absolute top-1 w-5 h-5 bg-white rounded-full transition-all ' +
                  (commentsEnabled ? 'left-6' : 'left-1')
                }
              />
            </button>
          </div>

          {/* ⚠️ Xato banneri */}
          {error && (
            <p className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm text-center">
              {error}
            </p>
          )}

          {/* 🚀 Yuborish tugmasi */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-red-500 text-white py-4 rounded-full font-extrabold text-lg hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {uploading ? 'Yuklanmoqda... ⏳' : '🚀 Yuklash'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Upload