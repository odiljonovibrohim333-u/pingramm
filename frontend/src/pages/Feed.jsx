import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import useInfiniteScroll from '../hooks/useInfiniteScroll'
import Navbar from '../components/Navbar'
import MasonryGrid from '../components/MasonryGrid'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import ErrorBanner from '../components/ErrorBanner'

function Feed() {
  const navigate = useNavigate()

  const fetchPage = useCallback(async (pageNum) => {
    const res = await api.get('/api/images/?page=' + pageNum)
    return { items: res.data.results, hasMore: res.data.next !== null }
  }, [])

  const { items: images, setItems: setImages, loading, initialLoading, hasMore, error } =
    useInfiniteScroll(fetchPage)

  const handleDelete = async (id) => {
    if (!window.confirm("Rasmni o'chirasizmi? Bu amalni qaytarib bo'lmaydi!")) return
    try {
      await api.delete('/api/images/' + id + '/')
      setImages(images.filter((i) => i.id !== id))
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {error && images.length === 0 ? (
        <ErrorBanner message={error} onRetry={() => window.location.reload()} />
      ) : initialLoading ? (
        <Loader />
      ) : images.length === 0 ? (
        <EmptyState
          emoji="📷"
          title="Hali rasmlar yo'q"
          text="Birinchi rasmni yuklang va lentani boshlang!"
          button={
            <button
              onClick={() => navigate('/upload')}
              className="bg-red-500 text-white px-6 py-3 rounded-full font-bold hover:bg-red-600"
            >
              + Rasm yuklash
            </button>
          }
        />
      ) : (
        <>
          <MasonryGrid images={images} onDelete={handleDelete} />
          {loading && <Loader />}
          {!hasMore && <p className="text-center text-gray-400 py-8">Hammasi ko'rildi ✅</p>}
        </>
      )}
    </div>
  )
}

export default Feed