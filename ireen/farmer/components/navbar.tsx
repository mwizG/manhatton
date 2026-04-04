'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState<string>('');
  const pathname = usePathname();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await apiClient.getProfile();
        setUsername(profile.user.username);
      } catch {
        setUsername('');
      }
    };

    loadProfile();
  }, []);

  const navLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/chemical-tracker', label: 'Tracker Home' },
    { href: '/chemical-tracker/chemicals', label: 'Chemicals' },
    { href: '/chemical-tracker/recommendations', label: 'Recommendations' },
    { href: '/chemical-tracker/treatments', label: 'Treatments' },
    { href: '/profile', label: 'Profile' },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-4 py-3">
          <Link href="/" className="shrink-0 text-lg font-semibold tracking-tight text-foreground">
            Farm Dashboard
          </Link>

          <div className="hidden flex-1 items-center justify-center md:flex">
            <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border bg-muted/30 px-2 py-1 scrollbar-none">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={[
                      'whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-background hover:text-foreground',
                    ].join(' ')}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-3 md:flex">
            {username ? (
              <>
                <span className="max-w-40 truncate text-sm text-muted-foreground">{username}</span>
                <Link href="/logout" className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors">
                  Logout
                </Link>
              </>
            ) : (
              <Link href="/login" className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors">
                Login
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-flex items-center justify-center rounded-md border border-border p-2 hover:bg-muted transition"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-border pt-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-4 py-2 text-sm text-foreground hover:bg-muted transition"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-4 py-2">
              {username ? (
                <>
                  <span className="mb-2 block text-sm text-muted-foreground">{username}</span>
                  <Link href="/logout" className="block w-full rounded-md border border-border px-3 py-2 text-center text-sm hover:bg-muted" onClick={() => setIsOpen(false)}>
                    Logout
                  </Link>
                </>
              ) : (
                <Link href="/login" className="block w-full rounded-md border border-border px-3 py-2 text-center text-sm hover:bg-muted" onClick={() => setIsOpen(false)}>
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
