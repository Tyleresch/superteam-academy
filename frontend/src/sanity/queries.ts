/**
 * GROQ Queries for Sanity CMS
 *
 * These queries fetch course, module, and lesson data from Sanity.
 * They're designed to match the TypeScript types in @/types/index.ts.
 */

// Fetch all published courses
export const COURSES_QUERY = `*[_type == "course" && published == true] | order(_createdAt desc) {
  _id,
  title,
  "slug": slug.current,
  description,
  shortDescription,
  "thumbnail": thumbnail.asset->url,
  difficulty,
  duration,
  totalXP,
  track,
  tags,
  language,
  prerequisites,
  "enrollmentCount": coalesce(enrollmentCount, 0),
  "rating": coalesce(rating, 4.5),
  instructor {
    name,
    "avatar": avatar.asset->url,
    bio,
    title,
    socialLinks
  },
  modules[] {
    title,
    description,
    order,
    xpReward,
    lessons[] {
      title,
      description,
      type,
      order,
      markdownContent,
      duration,
      xpReward,
      challenge
    }
  },
  _createdAt,
  _updatedAt
}`;

// Fetch a single course by slug
export const COURSE_BY_SLUG_QUERY = `*[_type == "course" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  description,
  shortDescription,
  "thumbnail": thumbnail.asset->url,
  difficulty,
  duration,
  totalXP,
  track,
  tags,
  language,
  prerequisites,
  "enrollmentCount": coalesce(enrollmentCount, 0),
  "rating": coalesce(rating, 4.5),
  instructor {
    name,
    "avatar": avatar.asset->url,
    bio,
    title,
    socialLinks
  },
  modules[] {
    title,
    description,
    order,
    xpReward,
    lessons[] {
      title,
      description,
      type,
      order,
      markdownContent,
      duration,
      xpReward,
      challenge
    }
  },
  _createdAt,
  _updatedAt
}`;

// Fetch only course cards (lighter query for catalog)
export const COURSE_CARDS_QUERY = `*[_type == "course" && published == true] | order(_createdAt desc) {
  _id,
  title,
  "slug": slug.current,
  shortDescription,
  "thumbnail": thumbnail.asset->url,
  difficulty,
  duration,
  totalXP,
  track,
  tags,
  "enrollmentCount": coalesce(enrollmentCount, 0),
  "rating": coalesce(rating, 4.5),
  "lessonCount": count(modules[].lessons[]),
  "moduleCount": count(modules[])
}`;

// Search courses
export const SEARCH_COURSES_QUERY = `*[_type == "course" && published == true && (
  title match $query + "*" ||
  description match $query + "*" ||
  tags[] match $query + "*"
)] | order(_createdAt desc) {
  _id,
  title,
  "slug": slug.current,
  shortDescription,
  difficulty,
  track,
  totalXP,
  "lessonCount": count(modules[].lessons[])
}`;
