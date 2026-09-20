import { useState, useMemo } from 'react';
import { apiErrorMessage } from '../../lib/api-error';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert } from '../../components/ui/alert';
import { AuthPanel } from '../../components/auth/AuthPanel';

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
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
  });

  const passwordValue = watch('password', '');

  const passwordStrength = useMemo(() => {
    if (!passwordValue) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (passwordValue.length >= 8) score += 1;
    if (/[A-Z]/.test(passwordValue)) score += 1;
    if (/[0-9]/.test(passwordValue)) score += 1;
    if (/[^A-Za-z0-9]/.test(passwordValue)) score += 1;

    if (score <= 1) return { score, label: 'Weak', color: 'bg-destructive' };
    if (score === 2) return { score, label: 'Fair', color: 'bg-warning' };
    if (score === 3) return { score, label: 'Good', color: 'bg-success/70' };
    return { score, label: 'Strong', color: 'bg-success' };
  }, [passwordValue]);

  const onSubmit = async (data: SignupValues) => {
    try {
      setError(null);
      await signup({ name: data.name, email: data.email, password: data.password });
      // Go directly to login upon successful registration
      navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
    } catch (err: unknown) {
      setError(apiErrorMessage(err, 'Failed to sign up'));
    }
  };

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
              {passwordValue && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div 
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`} 
                      style={{ width: `${(passwordStrength.score / 4) * 100}%` }} 
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{passwordStrength.label}</span>
                    <span>Includes: A-Z, 0-9, !@#</span>
                  </div>
                </div>
              )}
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

        <div className="space-y-3">
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Need an admin account?{' '}
            <Link to="/admin/signup" className="font-medium text-violet-500 hover:text-violet-400 hover:underline">
              Register here
            </Link>
          </p>
        </div>
    </AuthPanel>
  );
}
