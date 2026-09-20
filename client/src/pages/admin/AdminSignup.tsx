import { useState } from 'react';
import { apiErrorMessage } from '../../lib/api-error';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert } from '../../components/ui/alert';
import { AdminAuthPanel } from '../../components/auth/AdminAuthPanel';
import { CheckCircle2, KeyRound, UserPlus } from 'lucide-react';

const adminSignupSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50),
    email: z.string().trim().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters').refine(value => new TextEncoder().encode(value).length <= 72, 'Password must be at most 72 UTF-8 bytes'),
    confirmPassword: z.string(),
    adminSecret: z.string().min(1, 'Admin secret key is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type AdminSignupValues = z.infer<typeof adminSignupSchema>;

export default function AdminSignup() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminSignupValues>({
    resolver: zodResolver(adminSignupSchema),
  });

  const onSubmit = async (data: AdminSignupValues) => {
    try {
      setError(null);
      await authApi.adminRegister({
        name: data.name,
        email: data.email,
        password: data.password,
        adminSecret: data.adminSecret,
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(apiErrorMessage(err, 'Failed to create admin account'));
    }
  };

  if (success) {
    return (
      <AdminAuthPanel title="Admin Created">
          <div className="mx-auto flex size-12 items-center justify-center rounded-lg border bg-success/8 text-success-foreground">
            <CheckCircle2 aria-hidden="true" />
          </div>
          <p className="text-center text-muted-foreground">
            Your admin account has been created successfully. You can now sign in.
          </p>
          <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white" render={<Link to="/admin/login" />}>
            Continue to admin login
          </Button>
      </AdminAuthPanel>
    );
  }

  return (
    <AdminAuthPanel title="Create Admin Account" description="Register a new admin account with your secret key.">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-name">Full Name</Label>
              <Input id="admin-name" autoComplete="name" placeholder="Admin Name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'admin-name-error' : undefined} {...register('name')} />
              {errors.name && <p id="admin-name-error" role="alert" className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

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
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.password} aria-describedby={errors.password ? 'admin-password-error' : undefined} {...register('password')}
              />
              {errors.password && <p id="admin-password-error" role="alert" className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-confirmPassword">Confirm Password</Label>
              <Input
                id="admin-confirmPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword} aria-describedby={errors.confirmPassword ? 'admin-confirmPassword-error' : undefined} {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p id="admin-confirmPassword-error" role="alert" className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-secret" className="flex items-center gap-1.5">
                <KeyRound className="size-3.5 text-violet-500" aria-hidden="true" />
                Admin Secret Key
              </Label>
              <Input
                id="admin-secret"
                type="password"
                autoComplete="off"
                placeholder="Enter admin secret key"
                aria-invalid={!!errors.adminSecret} aria-describedby={errors.adminSecret ? 'admin-secret-error' : undefined} {...register('adminSecret')}
              />
              {errors.adminSecret && <p id="admin-secret-error" role="alert" className="text-sm text-destructive">{errors.adminSecret.message}</p>}
              <p className="text-xs text-muted-foreground">Contact your system administrator for the secret key.</p>
            </div>
          </div>

          <Button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/20" disabled={isSubmitting}>
            <UserPlus className="mr-2 size-4" aria-hidden="true" />
            {isSubmitting ? 'Creating admin account...' : 'Create admin account'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an admin account?{' '}
          <Link to="/admin/login" className="font-semibold text-violet-500 hover:text-violet-400 hover:underline">
            Sign in
          </Link>
        </p>
    </AdminAuthPanel>
  );
}
