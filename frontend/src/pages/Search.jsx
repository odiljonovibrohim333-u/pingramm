import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api'
import Navbar from '../components/Navbar'
import MasonryGrid from '../components/MasonryGrid'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'

function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const doSearch = async () => {
      setLoading(true)
      try {
        const res = await api.get('/api/images/?search=' + encodeURIComponent(query))
        setResults(res.data.results)
      } catch {}
      setLoading(false)
    }
    if (query) doSearch()
  }, [query])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {loading ? (
        <Loader />
      ) : results.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="Hech narsa topilmadi"
          text={'"' + query + '" bo\'yicha natija yo\'q. Boshqa so\'z bilan urinib ko\'r!'}
        />
      ) : (
        <>
          <p className="text-center text-gray-500 pt-6 text-sm">
            🔍 "{query}" bo'yicha <b>{results.length}</b> ta natija
          </p>
          <MasonryGrid images={results} />
        </>
      )}
    </div>
  )
}

export default Search