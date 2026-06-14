import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui';
import { Link } from 'react-router-dom';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
    // Error is displayed in the UI; no logging needed.
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center w-full max-w-2xl">
            <div className="flex items-center justify-center">
              <AlertTriangle className="h-12 w-12 text-amber-500" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">Something went wrong</h2>
            <p className="mt-2 text-sm text-slate-500">
              An unexpected error occurred. Please try again or contact support if the
              problem persists.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-4 text-xs text-left overflow-auto rounded bg-slate-50 p-3 max-h-40">
                <code>{this.state.error.message}</code>
              </pre>
            )}
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button onClick={this.handleReset}>Try Again</Button>
              <Link
                to="/dashboard"
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return <>{this.props.children}</>;
  }
}