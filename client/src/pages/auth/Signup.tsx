import { useState } from 'react';
import { apiErrorMessage } from '../../lib/api-error';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert } from '../../components/ui/alert';
import { AuthPanel } from '../../components/auth/AuthPanel';
import { CheckCircle2 } from 'lucide-react';

const signupSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50),
    email: z.string().trim().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters').refine(value => new TextEncoder().encode(value).length <= 72, 'Password must be at most 72 UTF-8 bytes'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const { signup } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupValues) => {
    try {
      setError(null);
      await signup({ name: data.name, email: data.email, password: data.password });
      setSuccess(true);
    } catch (err: unknown) {
      setError(apiErrorMessage(err, 'Failed to sign up'));
    }
  };

  if (success) {
    return (
      <AuthPanel title="Registration successful">
          <div className="mx-auto flex size-12 items-center justify-center rounded-lg border bg-success/8 text-success-foreground">
            <CheckCircle2 aria-hidden="true" />
          </div>
          <p className="text-center text-muted-foreground">
            Please check your email (or server console) for the verification link.
          </p>
          <Button className="w-full" render={<Link to="/login" />}>Return to login</Button>
      </AuthPanel>
    );
  }

  return (
    <AuthPanel title="Create an account" description="Join Roadly to submit, vote, and discuss feature requests.">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" autoComplete="name" placeholder="John Doe" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} {...register('name')} />
              {errors.name && <p id="name-error" role="alert" className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password-error' : undefined} {...register('password')}
              />
              {errors.password && <p id="password-error" role="alert" className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword} aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined} {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p id="confirmPassword-error" role="alert" className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
    </AuthPanel>
  );
}
