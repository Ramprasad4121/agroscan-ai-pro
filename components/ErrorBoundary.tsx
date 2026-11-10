
import React from 'react';
import { Sprout, RefreshCw, AlertTriangle } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

/**
 * Catches render-time crashes anywhere in the tree so a single broken component
 * shows a friendly recovery screen instead of unmounting the whole app
 * (previously symptom: blank/black screen with a console-only error).
 */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : String(error ?? 'Unknown error'),
    };
  }

  componentDidCatch(error: any, info: React.ErrorInfo) {
    // Surface details for debugging without breaking the UI
    console.error('[ErrorBoundary] Caught render error:', error, info?.componentStack);
  }

  handleReload = () => {
    // Fresh load restarts the app; the persisted session (if any) is restored.
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-tech-bg flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-tech-card border border-tech-border rounded-2xl p-8 text-center shadow-2xl animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-tech-bg border border-tech-amber/40 flex items-center justify-center">
            <AlertTriangle size={32} className="text-tech-amber" />
          </div>
          <h2 className="text-xl font-display font-bold text-tech-primary mb-2 uppercase tracking-wide">
            Something went wrong
          </h2>
          <p className="text-sm text-tech-secondary leading-relaxed mb-1">
            A part of the app stopped working unexpectedly. Your data is safe.
          </p>
          <p className="text-[10px] text-tech-secondary/70 mb-6 break-words max-h-16 overflow-hidden">
            {this.state.message.slice(0, 180)}
          </p>
          <button
            onClick={this.handleReload}
            className="btn-primary w-full py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} /> Restart App
          </button>
          <div className="mt-5 flex items-center justify-center gap-2 text-tech-secondary/50 text-[10px] uppercase tracking-widest">
            <Sprout size={12} /> Agro AI
          </div>
        </div>
      </div>
    );
  }
}
