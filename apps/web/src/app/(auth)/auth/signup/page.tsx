'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const inputClasses =
  'mt-2 w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15';

export default function SignUpPage() {
  const [orgName, setOrgName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const displaySlug = useMemo(() => (slugTouched ? slug : slugify(orgName)), [slug, slugTouched, orgName]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
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
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
          <Check className="h-6 w-6" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight text-foreground">
          Request submitted
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Your organization &ldquo;{orgName}&rdquo; is awaiting Super Admin approval. We&rsquo;ll email{' '}
          <span className="font-medium text-foreground">{email}</span> once it&rsquo;s reviewed &mdash; there&rsquo;s
          nothing else to do in the meantime.
        </p>
        <Link
          href="/auth/signin"
          className="press-scale mt-8 inline-flex items-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Back to sign in
        </Link>
      </div>
    );
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

      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Set up your organization</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        You&rsquo;ll be the Admin. A Super Admin reviews new organizations before anyone can sign in.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="orgName" className="block text-sm font-medium text-foreground">
            Organization name
          </label>
          <input
            id="orgName"
            type="text"
            required
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Acme Consulting"
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-foreground">
            Organization slug
          </label>
          <div className="mt-2 flex items-center rounded-lg border border-border bg-card pl-4 text-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
            <span className="font-mono text-muted-foreground">/</span>
            <input
              id="slug"
              type="text"
              required
              value={displaySlug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="acme-consulting"
              className="w-full bg-transparent px-1 py-2.5 font-mono outline-none"
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">Used in tenant-aware links. Auto-generated, editable.</p>
        </div>

        <div className="h-px bg-border" />

        <div>
          <label htmlFor="adminName" className="block text-sm font-medium text-foreground">
            Your name
          </label>
          <input
            id="adminName"
            type="text"
            required
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            placeholder="Jordan Reyes"
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-foreground">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 000 0000"
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={inputClasses}
          />
        </div>

        <button
          type="submit"
          className="press-scale flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
        >
          Submit for approval
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
