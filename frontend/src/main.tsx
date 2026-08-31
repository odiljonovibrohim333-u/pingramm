import React, { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router';
import { AuthProvider } from './hooks';
import RequireAuth from './components/RequireAuth';
import './index.css';

// Lazy load route components for better code splitting
const Feed = lazy(() => import('./pages/Feed'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Profile = lazy(() => import('./pages/Profile'));
const PinDetail = lazy(() => import('./pages/PinDetail'));
const Upload = lazy(() => import('./pages/Upload'));
const Search = lazy(() => import('./pages/Search'));
const Saved = lazy(() => import('./pages/Saved'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Layout
const MainLayout = lazy(() => import('./layouts/MainLayout'));

// Simple loading fallback for route transitions
function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
    </div>
  );
}

// Auth layout (no navbar)
const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Route syncer for iframe
function RouteSyncer() {
  const location = useLocation();
  React.useEffect(() => {
    window.parent.postMessage(
      { type: 'iframe-route-change', path: location.pathname },
      '*'
    );
  }, [location.pathname]);

  React.useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === 'navigate') {
        if (event.data.direction === 'back') window.history.back();
        if (event.data.direction === 'forward') window.history.forward();
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return null;
}

/** Error boundary for toolbar */
class ToolbarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    console.warn('[Toolbar] Caught error:', err.message);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/** Root error boundary */
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string; stack: string }
> {
  state = { hasError: false, message: '', stack: '' };
  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error.message || 'Unknown runtime error',
      stack: error.stack || '',
    };
  }
  componentDidCatch(err: Error) {
    console.error('[App] Root crash:', err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white text-black p-6">
          <div className="max-w-lg text-center">
            <p className="text-sm font-semibold">Xatolik yuz berdi</p>
            <p className="mt-2 text-xs text-gray-500 break-words">
              {this.state.message}
            </p>
            {this.state.stack && (
              <pre className="mt-3 text-left text-[10px] leading-4 text-gray-400 max-h-40 overflow-auto rounded border border-gray-200 p-2">
                {this.state.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
        <RouteSyncer />
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            {/* Auth routes without navbar */}
            <Route
              path="/login"
              element={
                <AuthLayout>
                  <Login />
                </AuthLayout>
              }
            />
            <Route
              path="/signup"
              element={
                <AuthLayout>
                  <Signup />
                </AuthLayout>
              }
            />

            {/* Main routes with navbar */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Feed />} />
              <Route path="/pin/:id" element={<PinDetail />} />
              <Route path="/upload" element={<RequireAuth><Upload /></RequireAuth>} />
              <Route path="/profile/:id" element={<RequireAuth><Profile /></RequireAuth>} />
              <Route path="/saved" element={<RequireAuth><Saved /></RequireAuth>} />
              <Route path="/search" element={<Search />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </RootErrorBoundary>
  </StrictMode>
);
