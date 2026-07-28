'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Copy, Eye, EyeOff } from 'lucide-react';

const STATUS_MESSAGES: Record<string, { tone: 'pending' | 'rejected'; text: string }> = {
  pending: {
    tone: 'pending',
    text: 'Your organization signup is still awaiting approval. We will email you once a Super Admin reviews it.',
  },
  rejected: {
    tone: 'rejected',
    text: 'Your organization signup was not approved. Contact your Super Admin for details.',
  },
};

function StatusBanner() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const message = status ? STATUS_MESSAGES[status] : undefined;
  if (!message) return null;

  return (
    <div
      className={`mb-6 rounded-lg border px-4 py-3 text-sm leading-relaxed ${
        message.tone === 'pending'
          ? 'border-border bg-muted text-muted-foreground'
          : 'border-red-200 bg-red-50 text-red-700'
      }`}
    >
      {message.text}
    </div>
  );
}

const DEMO_ACCOUNTS = [
  {
    role: 'ADMIN',
    roleClasses: 'bg-accent text-accent-foreground',
    name: 'Ava Shah',
    description: 'Full org access — users, templates, workflows, all SOWs',
    email: 'ava@acme-consulting.example',
  },
  {
    role: 'CREATOR',
    roleClasses: 'bg-emerald-50 text-emerald-700',
    name: 'Marcus Osei',
    description: 'Creates and submits SOWs, manages clients & projects',
    email: 'marcus@acme-consulting.example',
  },
  {
    role: 'APPROVER',
    roleClasses: 'bg-amber-50 text-amber-700',
    name: 'Priya Nair',
    description: 'Reviews approval queue, approves or rejects SOWs',
    email: 'priya@acme-consulting.example',
  },
  {
    role: 'VIEWER',
    roleClasses: 'bg-muted text-muted-foreground',
    name: 'Liam Okafor',
    description: 'Read-only access to SOWs and reports',
    email: 'liam@acme-consulting.example',
  },
];

const DEMO_PASSWORD = 'demo1234';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  }



  return (
    <div className="fade-up">
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fade-up 0.7s cubic-bezier(0.4,0,0.2,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .fade-up { animation: none; }
        }
      `}</style>

      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Welcome back</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your organization&rsquo;s workspace</p>

      <Suspense fallback={null}>
        <StatusBanner />
      </Suspense>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@yourorg.example"
            className="mt-2 w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground">
            Password
          </label>
          <div className="relative mt-2">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 pr-11 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
            />
            Remember me
          </label>
          <button type="button" className="text-sm font-medium text-primary hover:text-primary-hover">
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className="press-scale flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
        >
          Sign In
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
