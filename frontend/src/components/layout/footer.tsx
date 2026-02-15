'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Github, Twitter, MessageCircle, ExternalLink, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { APP_CONFIG } from '@/config/constants';
import toast from 'react-hot-toast';

const footerLinks = {
  platform: [
    { label: 'Courses', href: '/courses' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Certificates', href: '/profile' },
  ],
  resources: [
    { label: 'Solana Docs', href: 'https://solana.com/docs', external: true },
    { label: 'Anchor Book', href: 'https://www.anchor-lang.com/', external: true },
    { label: 'Metaplex Docs', href: 'https://developers.metaplex.com/', external: true },
    { label: 'Solana Cookbook', href: 'https://solanacookbook.com/', external: true },
  ],
  community: [
    { label: 'GitHub', href: APP_CONFIG.github, external: true },
    { label: 'Discord', href: APP_CONFIG.discord, external: true },
    { label: 'Twitter', href: `https://twitter.com/${APP_CONFIG.twitter}`, external: true },
    { label: 'Superteam Brazil', href: 'https://superteam.fun', external: true },
  ],
};

export function Footer() {
  const t = useTranslations('footer');
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success('Thanks for subscribing! We\'ll keep you updated.');
      setEmail('');
    }
  };

  return (
    <footer className="border-t border-border/40 bg-background">
      {/* Newsletter Section */}
      <div className="border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold mb-1">{t('newsletter')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('newsletterSubtitle')}
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2 w-full sm:w-auto">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full sm:w-64"
                required
              />
              <Button
                type="submit"
                className="gap-2 bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white hover:opacity-90 border-0 flex-shrink-0"
              >
                <Mail className="h-4 w-4" />
                {t('subscribe')}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#9945FF] to-[#14F195] text-white font-bold">
                Q
              </div>
              <span className="text-lg font-bold">
                <span className="text-foreground">Solana</span>
                <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">
                  Quest
                </span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-[240px]">
              {t('description')}
            </p>
            <div className="flex gap-3">
              <a
                href={APP_CONFIG.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href={`https://twitter.com/${APP_CONFIG.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href={APP_CONFIG.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-sm font-semibold mb-3">{t('platform')}</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold mb-3">{t('resources')}</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-sm font-semibold mb-3">{t('community')}</h3>
            <ul className="space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/40 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {t('copyright')}
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{t('poweredBy')}</span>
            <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent font-semibold">
              Solana
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
