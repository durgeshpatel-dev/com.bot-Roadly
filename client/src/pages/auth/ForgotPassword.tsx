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
import { AuthPanel } from '../../components/auth/AuthPanel';
import { MailCheck } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    try {
      setError(null);
      await authApi.forgotPassword(data.email);
      setSuccess(true);
    } catch (err: unknown) {
      setError(apiErrorMessage(err, 'An error occurred while requesting the password reset.'));
    }
  };

  if (success) {
    return (
      <AuthPanel title="Check your email">
          <div className="mx-auto flex size-12 items-center justify-center rounded-lg border bg-info/8 text-info-foreground">
            <MailCheck aria-hidden="true" />
          </div>
          <p className="text-center text-muted-foreground">
            If an account exists with that email, we have sent a password reset link.
          </p>
          <Button className="w-full" render={<Link to="/login" />}>Return to login</Button>
      </AuthPanel>
    );
  }

  return (
    <AuthPanel title="Reset password" description="Enter your email and we'll send you a link to reset your password.">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} {...register('email')}
              />
              {errors.email && <p id="email-error" role="alert" className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Sending link...' : 'Send reset link'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Back to login
          </Link>
        </p>
    </AuthPanel>
  );
}
