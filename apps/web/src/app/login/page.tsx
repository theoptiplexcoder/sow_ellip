'use client';

import Link from 'next/link';
import { ArrowRight, FileCheck2 } from 'lucide-react';
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
  { label: 'Client', href: '/client' },
];

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 sm:p-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-accent/45" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <FileCheck2 className="size-5" />
          </span>
          <div className="font-display text-2xl font-semibold tracking-tight">
            Statement<span className="text-primary">OS</span>
          </div>
          <p className="max-w-xs text-sm leading-6 text-muted-foreground">
            Sign in to manage your statements of work.
          </p>
        </div>

        <Card className="border-border/80 shadow-xl shadow-foreground/5">
          <CardHeader className="border-b pb-4">
            <h1 className="font-display text-xl font-semibold tracking-tight">
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
                Sign in <ArrowRight className="size-4" />
              </Button>
            </form>

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">
                or preview as
              </span>
              <Separator className="flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-2">
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
