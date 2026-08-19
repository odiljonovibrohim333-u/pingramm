import { useState, useEffect, useCallback } from 'react'

// 🌀 UNIVERSAL infinite scroll hook
// fetchPage: (pageNum) => Promise<{ items, hasMore }>
function useInfiniteScroll(fetchPage, enabled = true) {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async (pageNum, append = false) => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchPage(pageNum)
      setItems((prev) => (append ? [...prev, ...data.items] : data.items))
      setHasMore(data.hasMore)
      setPage(pageNum)
    } catch {
      setError("Server bilan aloqa yo'q 📡")
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [fetchPage])

  // Birinchi sahifa
  useEffect(() => {
    if (enabled) load(1)
  }, [load, enabled])

  // 🌀 Scroll listener
  useEffect(() => {
    const onScroll = () => {
      if (!enabled || loading || !hasMore) return
      const pastgaYetdi =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 300
      if (pastgaYetdi) load(page + 1, true)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [enabled, loading, hasMore, page, load])

  // 🆕 Avto-to'ldirish (ekran qisqa bo'lsa)
  useEffect(() => {
    if (!enabled || loading || !hasMore || initialLoading) return
    const qisqa = document.body.offsetHeight <= window.innerHeight + 300
    if (qisqa) load(page + 1, true)
  }, [enabled, items, loading, hasMore, page, initialLoading, load])

  return { items, setItems, loading, initialLoading, hasMore, error }
}

export default useInfiniteScroll