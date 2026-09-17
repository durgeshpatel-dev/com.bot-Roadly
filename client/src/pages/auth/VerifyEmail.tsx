import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { Button } from '../../components/ui/button';
import { AuthPanel } from '../../components/auth/AuthPanel';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Spinner } from '../../components/ui/spinner';
import { apiErrorMessage } from '../../lib/api-error';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [result, setResult] = useState<{ token: string; status: 'success' | 'error'; message: string }>();
  const pending = useRef<{ token: string; request: ReturnType<typeof authApi.verifyEmail> } | null>(null);
  const status = !token ? 'error' : result?.token === token ? result.status : 'loading';
  const message = !token ? 'No verification token provided' : result?.message;

  useEffect(() => {
    if (!token) return;
    let active = true;
    // React StrictMode replays effects; the same one-use token must be sent only once.
    if (pending.current?.token !== token) pending.current = { token, request: authApi.verifyEmail(token) };
    pending.current.request
      .then(() => {
        if (active) setResult({ token, status: 'success', message: 'Your email has been successfully verified!' });
      })
      .catch((error: unknown) => {
        if (active) setResult({ token, status: 'error', message: apiErrorMessage(error, 'Verification failed. The token may be invalid or expired.') });
      });
    return () => { active = false; };
  }, [token]);

  return (
    <AuthPanel title={status === 'loading' ? 'Verifying email' : status === 'success' ? 'Verification successful' : 'Verification failed'}>
        {status === 'loading' && (
          <>
            <Spinner className="mx-auto size-10 text-primary" />
            <p className="text-center text-muted-foreground">Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto flex size-12 items-center justify-center rounded-lg border bg-success/8 text-success-foreground">
              <CheckCircle2 aria-hidden="true" />
            </div>
            <p className="text-center text-muted-foreground">{message}</p>
            <Button className="w-full" render={<Link to="/login" />}>Continue to login</Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto flex size-12 items-center justify-center rounded-lg border bg-destructive/8 text-destructive">
              <XCircle aria-hidden="true" />
            </div>
            <p className="text-center text-muted-foreground">{message}</p>
            <Button variant="outline" className="w-full" render={<Link to="/login" />}>Return to login</Button>
          </>
        )}
    </AuthPanel>
  );
}
