'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import {
  Wallet,
  Chrome,
  Github,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useUserStore } from '@/stores/user-store';
import toast from 'react-hot-toast';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const router = useRouter();
  const { setVisible } = useWalletModal();
  const { initDemoUser } = useUserStore();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleWalletConnect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenChange(false);
    setTimeout(() => {
      setVisible(true);
    }, 300);
  };

  const handleGoogleSignIn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading('google');
    try {
      initDemoUser();
      onOpenChange(false);
      toast.success('Signed in with Google (Demo Mode)');
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Failed to sign in');
    } finally {
      setIsLoading(null);
    }
  };

  const handleGithubSignIn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading('github');
    try {
      initDemoUser();
      onOpenChange(false);
      toast.success('Signed in with GitHub (Demo Mode)');
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (error) {
      console.error('GitHub sign-in error:', error);
      toast.error('Failed to sign in');
    } finally {
      setIsLoading(null);
    }
  };

  const handleDemoMode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      initDemoUser();
      onOpenChange(false);
      toast.success('Welcome to Demo Mode! Explore freely.');
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (error) {
      console.error('Demo mode error:', error);
      toast.error('Something went wrong');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-[#9945FF]/10 via-transparent to-[#14F195]/10 p-6 pb-4">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#9945FF] to-[#14F195] text-white font-bold text-lg">
                Q
              </div>
              <div>
                <DialogTitle className="text-xl">Begin Your Quest</DialogTitle>
                <DialogDescription className="text-sm">
                  Choose how you want to sign in
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 pt-2 space-y-4">
          {/* Wallet Connect - Primary */}
          <button
            type="button"
            className="w-full h-14 flex items-center justify-between gap-3 px-4 rounded-md border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer"
            onClick={handleWalletConnect}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center">
                <Wallet className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">Connect Wallet</p>
                <p className="text-xs text-muted-foreground">Phantom, Solflare, & more</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </button>

          <div className="relative">
            <Separator />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
              or continue with
            </span>
          </div>

          {/* Social Sign-In */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-11 gap-2"
              onClick={handleGoogleSignIn}
              disabled={isLoading !== null}
            >
              {isLoading === 'google' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Chrome className="h-4 w-4" />
              )}
              {isLoading === 'google' ? 'Signing in...' : 'Google'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 gap-2"
              onClick={handleGithubSignIn}
              disabled={isLoading !== null}
            >
              {isLoading === 'github' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Github className="h-4 w-4" />
              )}
              {isLoading === 'github' ? 'Signing in...' : 'GitHub'}
            </Button>
          </div>

          <Separator />

          {/* Demo Mode */}
          <Button
            type="button"
            variant="ghost"
            className="w-full h-11 gap-2 text-muted-foreground hover:text-foreground"
            onClick={handleDemoMode}
          >
            <Sparkles className="h-4 w-4" />
            Try Demo Mode (No sign-in required)
          </Button>

          {/* Features list */}
          <div className="rounded-lg bg-muted/30 p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="h-3 w-3 text-quest-gold" />
              Earn XP and level up by completing quests
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3 w-3 text-quest-health" />
              Collect on-chain credentials as compressed NFTs
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
