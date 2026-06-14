import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Card, Input } from '@/components/ui';
import { supabase } from '@/lib/supabase';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const accessToken = searchParams.get('access_token');

  const handleSubmit = async () => {
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!accessToken) {
      setError('Reset link is invalid or expired.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        throw error;
      }
      setMessage('Your password has been reset. You can now sign in.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto w-full max-w-md">
        <Card className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold">Reset password</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Update your password to regain access to the application.</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">New password</label>
              <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Confirm new password</label>
              <Input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" required placeholder="••••••••" />
            </div>
            {message && <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p>}
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" onClick={handleSubmit} className="w-full sm:w-auto" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset password'}
              </Button>
              <Link to="/login" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
                Back to sign in
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
