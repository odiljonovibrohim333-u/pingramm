import { Link } from 'react-router';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">
          Sahifa topilmadi
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Home className="w-5 h-5" />
          Bosh sahifaga qaytish
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
