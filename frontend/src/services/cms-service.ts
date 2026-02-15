/**
 * CMS Service — Unified content fetching layer
 *
 * This service provides a single interface for fetching course content.
 * It tries Sanity CMS first, then falls back to mock data.
 *
 * This implements the CourseService interface from @/types/index.ts
 * and can be swapped between CMS providers without changing UI code.
 */

import { sanityClient, isSanityConfigured } from '@/sanity/client';
import {
  COURSES_QUERY,
  COURSE_BY_SLUG_QUERY,
  SEARCH_COURSES_QUERY,
} from '@/sanity/queries';
import { MOCK_COURSES } from '@/services/mock-data';
import type { Course, CourseFilters, CourseService, Lesson } from '@/types';

// ============================================
// Sanity → App Type Mappers
// ============================================

interface SanityCourse {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string | null;
  difficulty: Course['difficulty'];
  duration: string;
  totalXP: number;
  track: Course['track'];
  tags: string[];
  language: string;
  prerequisites: string[];
  enrollmentCount: number;
  rating: number;
  instructor: {
    name: string;
    avatar: string | null;
    bio: string;
    title: string;
    socialLinks: {
      twitter?: string;
      github?: string;
      website?: string;
    };
  };
  modules: Array<{
    title: string;
    description: string;
    order: number;
    xpReward: number;
    lessons: Array<{
      title: string;
      description: string;
      type: Lesson['type'];
      order: number;
      markdownContent: string;
      duration: string;
      xpReward: number;
      challenge?: {
        title: string;
        prompt: string;
        language: 'typescript' | 'rust' | 'json';
        starterCode: string;
        solution: string;
        hints: string[];
        difficulty: 'easy' | 'medium' | 'hard' | 'boss';
        testCases: Array<{
          name: string;
          input: string;
          expectedOutput: string;
          isHidden: boolean;
        }>;
      };
    }>;
  }>;
  _createdAt: string;
  _updatedAt: string;
}

function mapSanityCourse(sanity: SanityCourse): Course {
  let lessonCounter = 0;
  let moduleCounter = 0;

  return {
    id: sanity._id,
    slug: sanity.slug,
    title: sanity.title,
    description: sanity.description || '',
    shortDescription: sanity.shortDescription || '',
    thumbnail: sanity.thumbnail || '/placeholder-course.png',
    difficulty: sanity.difficulty,
    duration: sanity.duration || '1 hour',
    totalXP: sanity.totalXP || 0,
    track: sanity.track,
    modules: (sanity.modules || []).map((mod, mi) => {
      moduleCounter = mi + 1;
      return {
        id: `module-${moduleCounter}`,
        title: mod.title,
        description: mod.description || '',
        order: mod.order || moduleCounter,
        xpReward: mod.xpReward || 100,
        lessons: (mod.lessons || []).map((les, li) => {
          lessonCounter++;
          return {
            id: `lesson-${moduleCounter}-${li + 1}`,
            title: les.title,
            description: les.description || '',
            type: les.type,
            order: les.order || li + 1,
            content: les.markdownContent || '',
            xpReward: les.xpReward || 25,
            duration: les.duration || '10 min',
            challenge: les.challenge
              ? {
                  id: `challenge-${lessonCounter}`,
                  title: les.challenge.title || les.title,
                  description: les.challenge.prompt || '',
                  prompt: les.challenge.prompt || '',
                  starterCode: les.challenge.starterCode || '',
                  solution: les.challenge.solution || '',
                  language: les.challenge.language || 'typescript',
                  hints: les.challenge.hints || [],
                  difficulty: les.challenge.difficulty || 'medium',
                  xpReward: les.xpReward || 50,
                  testCases: (les.challenge.testCases || []).map((tc, i) => ({
                    id: `test-${lessonCounter}-${i}`,
                    name: tc.name,
                    input: tc.input || '',
                    expectedOutput: tc.expectedOutput || '',
                    isHidden: tc.isHidden || false,
                  })),
                }
              : undefined,
          };
        }),
      };
    }),
    instructor: {
      id: 'instructor-1',
      name: sanity.instructor?.name || 'Superteam Brazil',
      avatar: sanity.instructor?.avatar || '',
      bio: sanity.instructor?.bio || '',
      title: sanity.instructor?.title || 'Instructor',
      socialLinks: sanity.instructor?.socialLinks || {},
    },
    tags: sanity.tags || [],
    enrollmentCount: sanity.enrollmentCount || 0,
    rating: sanity.rating || 4.5,
    language: sanity.language || 'en',
    prerequisites: sanity.prerequisites || [],
    createdAt: sanity._createdAt,
    updatedAt: sanity._updatedAt,
  };
}

// ============================================
// CMS Service Implementation
// ============================================

class CMSServiceImpl implements CourseService {
  private useSanity: boolean;

  constructor() {
    this.useSanity = isSanityConfigured();
  }

  async getCourses(filters?: CourseFilters): Promise<Course[]> {
    if (this.useSanity) {
      try {
        const sanityCourses: SanityCourse[] = await sanityClient.fetch(COURSES_QUERY as string);
        let courses = sanityCourses.map(mapSanityCourse);

        // Apply client-side filters
        if (filters?.difficulty) {
          courses = courses.filter((c) => c.difficulty === filters.difficulty);
        }
        if (filters?.track) {
          courses = courses.filter((c) => c.track === filters.track);
        }
        if (filters?.search) {
          const q = filters.search.toLowerCase();
          courses = courses.filter(
            (c) =>
              c.title.toLowerCase().includes(q) ||
              c.description.toLowerCase().includes(q)
          );
        }

        return courses;
      } catch (error) {
        console.error('Sanity fetch failed, falling back to mock data:', error);
      }
    }

    // Fallback to mock data
    return this.filterMockCourses(filters);
  }

  async getCourseBySlug(slug: string): Promise<Course | null> {
    if (this.useSanity) {
      try {
        const result: SanityCourse | null = await sanityClient.fetch(
          COURSE_BY_SLUG_QUERY as string,
          { slug } as Record<string, string>
        );
        return result ? mapSanityCourse(result) : null;
      } catch (error) {
        console.error('Sanity fetch failed, falling back to mock data:', error);
      }
    }

    return MOCK_COURSES.find((c) => c.slug === slug) || null;
  }

  async getLesson(courseSlug: string, lessonId: string): Promise<Lesson | null> {
    const course = await this.getCourseBySlug(courseSlug);
    if (!course) return null;

    for (const mod of course.modules) {
      const lesson = mod.lessons.find((l) => l.id === lessonId);
      if (lesson) return lesson;
    }

    return null;
  }

  async searchCourses(query: string): Promise<Course[]> {
    if (this.useSanity) {
      try {
        const results: SanityCourse[] = await sanityClient.fetch(
          SEARCH_COURSES_QUERY as string,
          { query } as Record<string, string>
        );
        return results.map(mapSanityCourse);
      } catch (error) {
        console.error('Sanity search failed:', error);
      }
    }

    const q = query.toLowerCase();
    return MOCK_COURSES.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  private filterMockCourses(filters?: CourseFilters): Course[] {
    let courses = [...MOCK_COURSES];

    if (filters?.difficulty) {
      courses = courses.filter((c) => c.difficulty === filters.difficulty);
    }
    if (filters?.track) {
      courses = courses.filter((c) => c.track === filters.track);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      courses = courses.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }
    if (filters?.sortBy === 'popular') {
      courses.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
    } else if (filters?.sortBy === 'rating') {
      courses.sort((a, b) => b.rating - a.rating);
    }

    return courses;
  }
}

// Singleton
export const cmsService = new CMSServiceImpl();
