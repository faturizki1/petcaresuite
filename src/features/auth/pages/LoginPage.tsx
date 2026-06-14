import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Card, Input } from '@/components/ui';
import { useAuthActions } from '../auth.hooks';

export function LoginPage() {
  const location = useLocation();
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fromPath = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const handleSubmit = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await signIn(email, password, fromPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto w-full max-w-md">
        <Card className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Sign in to access your PetCare Suite workspace.</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Email</label>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="pr-20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-3 text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" onClick={handleSubmit} className="w-full sm:w-auto" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
              <Link to="/forgot-password" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
                Forgot password?
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
