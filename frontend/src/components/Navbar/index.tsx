import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { Home, Search, Plus, User, Bookmark, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks';
import Avatar from '../Avatar';
import { imagesApi } from '../../api/images';
import { Image } from '../../types';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Image[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const response = await imagesApi.getImages(1, searchQuery);
          setSearchResults(response.results.slice(0, 5));
          setIsSearchOpen(true);
        } catch {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setIsSearchOpen(false);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleSearchResultClick = (imageId: number) => {
    navigate(`/pin/${imageId}`);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight">PinGram</span>
          </Link>

          {/* Search - Desktop */}
          {isAuthenticated && (
            <div ref={searchRef} className="hidden md:flex flex-1 max-w-xl mx-8 relative">
              <form onSubmit={handleSearchSubmit} className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Qidirish..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setIsSearchOpen(true)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                  />
                </div>
              </form>

              {/* Search Results Dropdown */}
              {isSearchOpen && (searchResults.length > 0 || isSearching) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  {isSearching ? (
                    <div className="p-4 text-center text-sm text-gray-500">Qidirilmoqda...</div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      {searchResults.map((image) => (
                        <button
                          key={image.id}
                          onClick={() => handleSearchResultClick(image.id)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                        >
                          <img
                            src={image.image}
                            alt={image.title}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {image.title || 'Untitled'}
                            </p>
                            <p className="text-xs text-gray-500">@{image.author}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Navigation - Desktop */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`p-2 rounded-lg transition-colors ${
                  isActive('/') ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                <Home className="w-5 h-5 text-gray-600" />
              </Link>
              <Link
                to="/upload"
                className={`p-2 rounded-lg transition-colors ${
                  isActive('/upload') ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                <Plus className="w-5 h-5 text-gray-600" />
              </Link>
              <Link
                to={`/profile/${user?.id}`}
                className={`p-2 rounded-lg transition-colors ${
                  location.pathname.startsWith('/profile') ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                <User className="w-5 h-5 text-gray-600" />
              </Link>
              <Link
                to="/saved"
                className={`p-2 rounded-lg transition-colors ${
                  isActive('/saved') ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                <Bookmark className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="w-px h-6 bg-gray-200 mx-2" />
              <Avatar src={user?.avatar} size="sm" />
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Kirish
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Ro'yxatdan o'tish
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-600" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3">
            {isAuthenticated ? (
              <>
                {/* Mobile search */}
                <form onSubmit={handleSearchSubmit} className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Qidirish..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                  </div>
                </form>

                <div className="space-y-1">
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Home className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium">Bosh sahifa</span>
                  </Link>
                  <Link
                    to="/upload"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium">Yuklash</span>
                  </Link>
                  <Link
                    to={`/profile/${user?.id}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium">Profil</span>
                  </Link>
                  <Link
                    to="/saved"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Bookmark className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium">Saqlanganlar</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <LogOut className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium">Chiqish</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Kirish
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Ro'yxatdan o'tish
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
