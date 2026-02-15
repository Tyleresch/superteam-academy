'use client';

import { useMemo, ReactNode, useEffect, useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { NextIntlClientProvider } from 'next-intl';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { SOLANA_CONFIG } from '@/config/constants';
import { Toaster } from 'react-hot-toast';
import { TooltipProvider } from '@/components/ui/tooltip';
import { WalletAuthBridge } from '@/components/shared/wallet-auth-bridge';
import { PWARegister } from '@/components/shared/pwa-register';
import { useLocaleStore, Locale } from '@/stores/locale-store';

import '@solana/wallet-adapter-react-ui/styles.css';

// Import all message files statically
import enMessages from '@/i18n/messages/en.json';
import ptBRMessages from '@/i18n/messages/pt-BR.json';
import esMessages from '@/i18n/messages/es.json';

const messagesMap: Record<Locale, typeof enMessages> = {
  en: enMessages,
  'pt-BR': ptBRMessages,
  es: esMessages,
};

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  const locale = useLocaleStore((s) => s.locale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const messages = messagesMap[locale] || enMessages;

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <NextIntlClientProvider
        locale={mounted ? locale : 'en'}
        messages={mounted ? messages : enMessages}
      >
        <ConnectionProvider endpoint={SOLANA_CONFIG.rpcUrl}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <TooltipProvider>
                <WalletAuthBridge />
                <PWARegister />
                {children}
                <Toaster
                  position="bottom-right"
                  toastOptions={{
                    style: {
                      background: 'hsl(var(--card))',
                      color: 'hsl(var(--card-foreground))',
                      border: '1px solid hsl(var(--border))',
                    },
                  }}
                />
              </TooltipProvider>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
