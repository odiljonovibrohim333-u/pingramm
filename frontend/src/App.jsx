import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Feed from './pages/Feed'
import PinDetail from './pages/PinDetail'
import Profile from './pages/Profile'
import Upload from './pages/Upload'
import NotFound from './pages/NotFound'
import Search from './pages/Search'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Feed />} />
        <Route path="/pin/:id" element={<PinDetail />} />
        <Route path="/user/:id" element={<Profile />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/search" element={<Search />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App