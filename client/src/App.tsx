import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { AdminRoute, GuestRoute } from './components/auth/RouteGuards';
import Home from './pages/Home';
import PostDetailPage from './pages/PostDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import RoadmapPage from './pages/RoadmapPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPostsPage from './pages/admin/AdminPostsPage';
import { AdminLayout } from './components/layout/AdminLayout';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import { ToastProvider } from './components/ui/toast';
import { ThemeProvider } from './context/ThemeContext';
import { SiteHeader } from './components/layout/SiteHeader';
import { FeatureSubmissionProvider } from './context/FeatureSubmissionContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  return (
    <div className="app-shell">
      <SiteHeader />
      <main id="main-content" className="site-container page-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="posts" element={<AdminPostsPage />} />
            </Route>
          </Route>

          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <FeatureSubmissionProvider>
              <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow-md">Skip to content</a>
              <AppContent />
            </FeatureSubmissionProvider>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
