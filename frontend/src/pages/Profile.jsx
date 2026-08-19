import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import Navbar from '../components/Navbar'
import Loader from '../components/Loader'
import ErrorBanner from '../components/ErrorBanner'
import EmptyState from '../components/EmptyState'
import MasonryGrid from '../components/MasonryGrid'

function Profile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const myId = localStorage.getItem('userId')
  const isMe = String(myId) === String(id)

  const [profile, setProfile] = useState(null)
  const [images, setImages] = useState([])
  const [saved, setSaved] = useState([])
  const [tab, setTab] = useState('images')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // ✏️ Avatar tahrirlash
  const [showEditModal, setShowEditModal] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setTab('images')
      try {
        const profRes = await api.get('/api/users/' + id + '/')
        setProfile(profRes.data)

        const imgRes = await api.get('/api/users/' + id + '/images/')
        setImages(imgRes.data.results)

        if (String(myId) === String(id)) {
          const savedRes = await api.get('/api/saved/')
          setSaved(savedRes.data.results)
        }
      } catch (err) {
        setError(
          err.response?.status === 404
            ? 'Foydalanuvchi topilmadi 😕'
            : "Server bilan aloqa yo'q 📡"
        )
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  const handleFollow = async () => {
    if (busy) return
    setBusy(true)
    try {
      const res = await api.post('/api/users/' + id + '/follow/')
      setProfile({
        ...profile,
        is_followed: res.data.followed,
        followers_count: res.data.followers_count,
      })
    } catch {}
    setBusy(false)
  }

  const handleDelete = async (imageId) => {
    if (!window.confirm("Rasmni o'chirasizmi? Bu amalni qaytarib bo'lmaydi!")) return
    try {
      await api.delete('/api/images/' + imageId + '/')
      setImages(images.filter((i) => i.id !== imageId))
    } catch (err) {
      console.log(err)
    }
  }

  // ✏️ Avatar tanlash
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Faqat rasm fayllari mumkin! 🖼️')
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      alert("Avatar 3MB dan kichik bo'lsin! ⚖️")
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  // ✏️ Avatar yuklash
  const handleAvatarUpload = async () => {
    if (!avatarFile) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', avatarFile)
      const res = await api.patch('/api/profile/update/', formData)
      setProfile({ ...profile, avatar: res.data.avatar })
      localStorage.setItem('avatar', res.data.avatar || '')
      setShowEditModal(false)
      setAvatarFile(null)
      setAvatarPreview(null)
    } catch (err) {
      console.log(err)
    }
    setUploading(false)
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

      <div className="max-w-7xl mx-auto px-6 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="w-12 h-12 rounded-full bg-gray-900 text-white shadow-lg flex items-center justify-center hover:bg-red-500 hover:scale-110 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col items-center pt-4 pb-8 px-4">
        {/* 👤 Avatar yoki bosh harf */}
        {profile.avatar ? (
          <img
            src={profile.avatar}
            alt={profile.username}
            className="w-24 h-24 rounded-full object-cover shadow-lg"
          />
        ) : (
          <span className="w-24 h-24 rounded-full bg-red-500 text-white flex items-center justify-center text-4xl font-extrabold shadow-lg">
            {profile.username.charAt(0).toUpperCase()}
          </span>
        )}

        <h1 className="text-2xl font-extrabold text-gray-900 mt-4">{profile.username}</h1>

        <div className="flex gap-10 mt-5 text-center">
          <div>
            <p className="font-extrabold text-lg text-gray-900">{profile.images_count}</p>
            <p className="text-gray-500 text-sm">Rasmlar</p>
          </div>
          <div>
            <p className="font-extrabold text-lg text-gray-900">{profile.followers_count}</p>
            <p className="text-gray-500 text-sm">Obunachilar</p>
          </div>
          <div>
            <p className="font-extrabold text-lg text-gray-900">{profile.following_count}</p>
            <p className="text-gray-500 text-sm">Obunalar</p>
          </div>
        </div>

        {/* ✏️ O'z profilida — tahrirlash yoki Follow */}
        {isMe ? (
          <button
            onClick={() => setShowEditModal(true)}
            className="mt-5 rounded-full px-6 py-2 font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            ✏️ Profilni tahrirlash
          </button>
        ) : (
          <button
            onClick={handleFollow}
            className={
              'mt-5 rounded-full px-8 py-3 font-bold transition ' +
              (profile.is_followed
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-red-500 text-white hover:bg-red-600')
            }
          >
            {profile.is_followed ? '✓ Obunadasan' : "+ Obuna bo'lish"}
          </button>
        )}

        <div className="flex gap-2 mt-7">
          <button
            onClick={() => setTab('images')}
            className={
              'rounded-full px-6 py-2 font-bold text-sm transition ' +
              (tab === 'images' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
            }
          >
            📸 Rasmlar
          </button>

          {isMe && (
            <button
              onClick={() => setTab('saved')}
              className={
                'rounded-full px-6 py-2 font-bold text-sm transition ' +
                (tab === 'saved' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
              }
            >
              🔖 Saqlangan
            </button>
          )}
        </div>
      </div>

      {tab === 'images' ? (
        images.length === 0 ? (
          <EmptyState
            emoji="📷"
            title="Hali rasmlar yo'q"
            text={isMe ? 'Birinchi rasmingni yukla!' : 'Bu foydalanuvchi hali rasm yuklamagan'}
          />
        ) : (
          <MasonryGrid images={images} onDelete={handleDelete} />
        )
      ) : saved.length === 0 ? (
        <EmptyState
          emoji="🔖"
          title="Saqlangan rasmlar yo'q"
          text="Feed'da yoqqan rasmlaringni saqlab qo'y!"
        />
      ) : (
        <MasonryGrid images={saved} />
      )}

      {/* ✏️ AVATAR MODAL */}
      {showEditModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">✏️ Avatar tanlash</h2>

            <div className="flex justify-center mb-4">
              {avatarPreview ? (
                <img src={avatarPreview} alt="preview" className="w-32 h-32 rounded-full object-cover" />
              ) : profile.avatar ? (
                <img src={profile.avatar} alt={profile.username} className="w-32 h-32 rounded-full object-cover" />
              ) : (
                <span className="w-32 h-32 rounded-full bg-red-500 text-white flex items-center justify-center text-5xl font-extrabold">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="w-full mb-4 text-sm"
            />

            <div className="flex gap-2">
              <button
                onClick={handleAvatarUpload}
                disabled={!avatarFile || uploading}
                className="flex-1 bg-red-500 text-white rounded-full py-3 font-bold disabled:opacity-40 hover:bg-red-600"
              >
                {uploading ? 'Yuklanmoqda... ⏳' : 'Saqlash'}
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 rounded-full py-3 font-bold hover:bg-gray-300"
              >
                Bekor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile