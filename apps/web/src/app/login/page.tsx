'use client';

import Link from 'next/link';
import { FileCheck2 } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Label,
  Separator,
} from '@sow-platform/ui';

const PERSONA_SHORTCUTS = [
  { label: 'Participant', href: '/participant' },
  { label: 'Tenant Admin', href: '/tenant-admin' },
  { label: 'Super Admin', href: '/superadmin' },
];

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4 sm:p-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <FileCheck2 className="size-5" />
          </span>
          <div className="font-display text-xl font-semibold tracking-tight">
            Statement<span className="text-primary">OS</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Sign in to manage your statements of work.
          </p>
        </div>

        <Card>
          <CardHeader>
            <h1 className="font-display text-lg font-semibold tracking-tight">
              Sign in
            </h1>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="mt-1 w-full">
                Sign in
              </Button>
            </form>

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">
                or preview as
              </span>
              <Separator className="flex-1" />
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {PERSONA_SHORTCUTS.map((persona) => (
                <Button
                  key={persona.href}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  render={<Link href={persona.href} />}
                >
                  {persona.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
