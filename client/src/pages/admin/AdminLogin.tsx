import { useState } from 'react';
import { apiErrorMessage } from '../../lib/api-error';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert } from '../../components/ui/alert';
import { AdminAuthPanel } from '../../components/auth/AdminAuthPanel';
import { LogIn } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginValues) => {
    try {
      setError(null);
      await login(data);
    } catch (err: unknown) {
      setError(apiErrorMessage(err, 'Failed to login'));
      return;
    }

    // After successful login, check if user is admin
    // We need to read the user from the auth state — but login() already set it.
    // The simplest approach: read the access token or rely on the redirect guard.
    // Since login succeeded, navigate to /admin — the AdminRoute guard will
    // bounce non-admins back.
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/admin';
    navigate(from, { replace: true });
  };

  return (
    <AdminAuthPanel title="Admin Sign In" description="Sign in to the admin dashboard.">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="email"
                placeholder="admin@example.com"
                aria-invalid={!!errors.email} aria-describedby={errors.email ? 'admin-email-error' : undefined} {...register('email')}
              />
              {errors.email && <p id="admin-email-error" role="alert" className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="admin-password">Password</Label>
                <Link to="/forgot-password" className="text-sm font-medium text-violet-500 hover:text-violet-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password} aria-describedby={errors.password ? 'admin-password-error' : undefined} {...register('password')}
              />
              {errors.password && <p id="admin-password-error" role="alert" className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
          </div>

          <Button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/20" disabled={isSubmitting}>
            <LogIn className="mr-2 size-4" aria-hidden="true" />
            {isSubmitting ? 'Signing in...' : 'Sign in to Admin'}
          </Button>
        </form>

        <div className="space-y-3">
          <p className="text-center text-sm text-muted-foreground">
            Need an admin account?{' '}
            <Link to="/admin/signup" className="font-semibold text-violet-500 hover:text-violet-400 hover:underline">
              Register as admin
            </Link>
          </p>
          <p className="text-center text-sm text-muted-foreground">
            <Link to="/login" className="font-medium hover:underline">
              ← Back to user login
            </Link>
          </p>
        </div>
    </AdminAuthPanel>
  );
}
