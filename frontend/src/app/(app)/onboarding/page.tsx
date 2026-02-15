'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Code,
  BookOpen,
  Shield,
  Palette,
  Rocket,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useUserStore } from '@/stores/user-store';
import { TRACK_INFO } from '@/config/constants';
import type { LearningTrack } from '@/types';

// ============================================
// Quiz Data
// ============================================

interface QuizQuestion {
  id: string;
  question: string;
  description: string;
  options: {
    id: string;
    label: string;
    icon: string;
    tracks: LearningTrack[];
    weight: number;
  }[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'experience',
    question: 'What is your development experience?',
    description: 'Help us calibrate your starting point.',
    options: [
      {
        id: 'beginner',
        label: 'New to programming',
        icon: '🌱',
        tracks: ['solana-fundamentals'],
        weight: 3,
      },
      {
        id: 'web2',
        label: 'Web2 developer (JS/Python/etc)',
        icon: '💻',
        tracks: ['solana-fundamentals', 'fullstack-solana'],
        weight: 2,
      },
      {
        id: 'web3',
        label: 'Some blockchain experience',
        icon: '⛓️',
        tracks: ['anchor-development', 'defi-builder'],
        weight: 2,
      },
      {
        id: 'solana',
        label: 'Already building on Solana',
        icon: '🚀',
        tracks: ['security-auditor', 'defi-builder'],
        weight: 3,
      },
    ],
  },
  {
    id: 'language',
    question: 'Which language are you most comfortable with?',
    description: 'This helps us recommend the right starting track.',
    options: [
      {
        id: 'js-ts',
        label: 'JavaScript / TypeScript',
        icon: '🟨',
        tracks: ['fullstack-solana', 'solana-fundamentals'],
        weight: 2,
      },
      {
        id: 'rust',
        label: 'Rust',
        icon: '🦀',
        tracks: ['rust-mastery', 'anchor-development'],
        weight: 3,
      },
      {
        id: 'python',
        label: 'Python / Other',
        icon: '🐍',
        tracks: ['solana-fundamentals'],
        weight: 1,
      },
      {
        id: 'none',
        label: "I'm just getting started",
        icon: '📖',
        tracks: ['solana-fundamentals'],
        weight: 2,
      },
    ],
  },
  {
    id: 'interest',
    question: 'What excites you most about Solana?',
    description: 'We\'ll recommend a learning path based on your interests.',
    options: [
      {
        id: 'defi',
        label: 'DeFi & Financial protocols',
        icon: '💰',
        tracks: ['defi-builder'],
        weight: 3,
      },
      {
        id: 'nft',
        label: 'NFTs & Digital collectibles',
        icon: '🎨',
        tracks: ['nft-creator'],
        weight: 3,
      },
      {
        id: 'infra',
        label: 'Infrastructure & Tools',
        icon: '🔧',
        tracks: ['anchor-development', 'rust-mastery'],
        weight: 2,
      },
      {
        id: 'security',
        label: 'Security & Auditing',
        icon: '🛡️',
        tracks: ['security-auditor'],
        weight: 3,
      },
    ],
  },
  {
    id: 'goal',
    question: 'What is your primary goal?',
    description: 'This shapes the pace and depth of your quest.',
    options: [
      {
        id: 'learn',
        label: 'Learn blockchain fundamentals',
        icon: '📚',
        tracks: ['solana-fundamentals'],
        weight: 2,
      },
      {
        id: 'build',
        label: 'Build and ship a dApp',
        icon: '🚀',
        tracks: ['fullstack-solana', 'anchor-development'],
        weight: 2,
      },
      {
        id: 'career',
        label: 'Level up my career',
        icon: '💼',
        tracks: ['rust-mastery', 'anchor-development'],
        weight: 2,
      },
      {
        id: 'fun',
        label: 'Earn credentials & have fun',
        icon: '🏆',
        tracks: ['solana-fundamentals', 'nft-creator'],
        weight: 1,
      },
    ],
  },
];

// ============================================
// Component
// ============================================

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, initDemoUser } = useUserStore();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const totalSteps = QUESTIONS.length;
  const progress = ((step + 1) / (totalSteps + 1)) * 100;

  const handleSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));

    // Auto-advance after a short delay
    setTimeout(() => {
      if (step < totalSteps - 1) {
        setStep(step + 1);
      } else {
        setShowResults(true);
      }
    }, 300);
  };

  // Calculate recommended tracks based on answers
  const getRecommendedTracks = (): { track: LearningTrack; score: number }[] => {
    const scores: Record<string, number> = {};

    QUESTIONS.forEach((q) => {
      const answerId = answers[q.id];
      if (!answerId) return;
      const option = q.options.find((o) => o.id === answerId);
      if (!option) return;

      option.tracks.forEach((track) => {
        scores[track] = (scores[track] || 0) + option.weight;
      });
    });

    return Object.entries(scores)
      .map(([track, score]) => ({ track: track as LearningTrack, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  const handleStartQuest = () => {
    if (!isAuthenticated) {
      initDemoUser();
    }
    const recommended = getRecommendedTracks();
    if (recommended.length > 0) {
      // Navigate to courses filtered by the top track
      router.push('/courses');
    } else {
      router.push('/courses');
    }
  };

  if (showResults) {
    const recommended = getRecommendedTracks();

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          className="max-w-2xl w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-border/50 overflow-hidden">
            {/* Header glow */}
            <div className="h-2 bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#00D1FF]" />

            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center mb-6"
              >
                <Sparkles className="h-10 w-10 text-white" />
              </motion.div>

              <h1 className="text-2xl font-bold mb-2">Your Quest Path is Ready!</h1>
              <p className="text-muted-foreground mb-8">
                Based on your answers, here are the recommended tracks for you.
              </p>

              <div className="space-y-4 mb-8">
                {recommended.map((rec, index) => {
                  const info = TRACK_INFO[rec.track];
                  return (
                    <motion.div
                      key={rec.track}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.15 }}
                    >
                      <div
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                          index === 0
                            ? 'border-primary/30 bg-primary/5'
                            : 'border-border/50 hover:border-border'
                        }`}
                      >
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                          style={{ backgroundColor: `${info.color}15` }}
                        >
                          {info.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <p className="font-bold">{info.name}</p>
                            {index === 0 && (
                              <Badge className="bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white text-[10px] border-0">
                                Best Match
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {info.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className="text-lg font-bold"
                            style={{ color: info.color }}
                          >
                            {Math.round((rec.score / (totalSteps * 3)) * 100)}%
                          </p>
                          <p className="text-[10px] text-muted-foreground">match</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowResults(false);
                    setStep(0);
                    setAnswers({});
                  }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retake Quiz
                </Button>
                <Button
                  onClick={handleStartQuest}
                  className="gap-2 bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white hover:opacity-90 border-0 px-8"
                >
                  <Rocket className="h-4 w-4" />
                  Begin Your Quest
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = QUESTIONS[step];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Step {step + 1} of {totalSteps}
            </span>
            <span className="text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-2">
                  {currentQuestion.question}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {currentQuestion.description}
                </p>

                <div className="grid sm:grid-cols-2 gap-3">
                  {currentQuestion.options.map((option) => {
                    const isSelected = answers[currentQuestion.id] === option.id;
                    return (
                      <motion.button
                        key={option.id}
                        onClick={() => handleSelect(currentQuestion.id, option.id)}
                        className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                            : 'border-border/50 hover:border-primary/30 hover:bg-muted/30'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="text-2xl flex-shrink-0">{option.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{option.label}</p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Button
            variant="ghost"
            onClick={() => router.push('/courses')}
            className="text-muted-foreground"
          >
            Skip Assessment
          </Button>
        </div>
      </div>
    </div>
  );
}
