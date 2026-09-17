import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { Button } from '../../components/ui/button';
import { AuthPanel } from '../../components/auth/AuthPanel';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Spinner } from '../../components/ui/spinner';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    authApi
      .verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('Your email has been successfully verified!');
      })
      .catch((err: any) => {
        setStatus('error');
        setMessage(err.response?.data?.error?.message || 'Verification failed. The token may be invalid or expired.');
      });
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
            <Link to="/login" className="block w-full">
              <Button className="w-full">Continue to login</Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto flex size-12 items-center justify-center rounded-lg border bg-destructive/8 text-destructive">
              <XCircle aria-hidden="true" />
            </div>
            <p className="text-center text-muted-foreground">{message}</p>
            <Link to="/login" className="block w-full">
              <Button variant="outline" className="w-full">Return to login</Button>
            </Link>
          </>
        )}
    </AuthPanel>
  );
}
