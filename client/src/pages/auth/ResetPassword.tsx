import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert } from '../../components/ui/alert';
import { AuthPanel } from '../../components/auth/AuthPanel';
import { CheckCircle2 } from 'lucide-react';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }
    try {
      setError(null);
      await authApi.resetPassword({ token, password: data.password });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to reset password. The link might be expired.');
    }
  };

  if (!token) {
    return (
      <AuthPanel title="Invalid request" description="The password reset link is missing or malformed.">
          <Link to="/forgot-password" className="block w-full">
            <Button className="w-full">Request new link</Button>
          </Link>
      </AuthPanel>
    );
  }

  if (success) {
    return (
      <AuthPanel title="Password reset">
          <div className="mx-auto flex size-12 items-center justify-center rounded-lg border bg-success/8 text-success-foreground">
            <CheckCircle2 aria-hidden="true" />
          </div>
          <p className="text-center text-muted-foreground">Your password has been successfully reset.</p>
          <Link to="/login" className="block w-full">
            <Button className="w-full">Continue to login</Button>
          </Link>
      </AuthPanel>
    );
  }

  return (
    <AuthPanel title="Create new password" description="Please enter your new password below.">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register('password')}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Resetting password...' : 'Reset password'}
          </Button>
        </form>
    </AuthPanel>
  );
}
