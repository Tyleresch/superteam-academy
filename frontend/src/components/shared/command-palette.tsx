'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  BookOpen,
  LayoutDashboard,
  Trophy,
  User,
  Settings,
  Sun,
  Moon,
  Globe,
  Scroll,
  Rocket,
  Search,
  Zap,
  Shield,
  Sparkles,
  Home,
} from 'lucide-react';
import { MOCK_COURSES } from '@/services/mock-data';
import { TRACK_INFO, SUPPORTED_LANGUAGES } from '@/config/constants';
import { useLocaleStore, Locale } from '@/stores/locale-store';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const { setLocale, locale } = useLocaleStore();

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const navigate = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  const courses = useMemo(
    () =>
      MOCK_COURSES.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        track: c.track,
        difficulty: c.difficulty,
        icon: TRACK_INFO[c.track]?.icon || '📚',
      })),
    []
  );

  return (
    <>
      {/* Trigger hint in header */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 h-9 px-3 rounded-lg border border-border/50 bg-muted/30 text-muted-foreground text-sm hover:bg-muted/50 transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="text-xs">Search...</span>
        <kbd className="pointer-events-none ml-2 inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search courses, navigate, or run a command..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Navigation */}
          <CommandGroup heading="Navigate">
            <CommandItem onSelect={() => navigate('/')}>
              <Home className="mr-2 h-4 w-4" />
              Home
            </CommandItem>
            <CommandItem onSelect={() => navigate('/courses')}>
              <Scroll className="mr-2 h-4 w-4" />
              Course Catalog
            </CommandItem>
            <CommandItem onSelect={() => navigate('/dashboard')}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </CommandItem>
            <CommandItem onSelect={() => navigate('/leaderboard')}>
              <Trophy className="mr-2 h-4 w-4" />
              Leaderboard
            </CommandItem>
            <CommandItem onSelect={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </CommandItem>
            <CommandItem onSelect={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </CommandItem>
            <CommandItem onSelect={() => navigate('/onboarding')}>
              <Sparkles className="mr-2 h-4 w-4" />
              Skill Assessment Quiz
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Courses */}
          <CommandGroup heading="Courses">
            {courses.map((course) => (
              <CommandItem
                key={course.id}
                onSelect={() => navigate(`/courses/${course.slug}`)}
              >
                <span className="mr-2">{course.icon}</span>
                <span className="flex-1">{course.title}</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {course.difficulty}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Actions */}
          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => {
                setTheme(theme === 'dark' ? 'light' : 'dark');
                setOpen(false);
              }}
            >
              {theme === 'dark' ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </CommandItem>

            {SUPPORTED_LANGUAGES.filter((l) => l.code !== locale).map((lang) => (
              <CommandItem
                key={lang.code}
                onSelect={() => {
                  setLocale(lang.code as Locale);
                  setOpen(false);
                }}
              >
                <Globe className="mr-2 h-4 w-4" />
                Switch to {lang.label} {lang.flag}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
