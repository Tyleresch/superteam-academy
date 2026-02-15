/**
 * Sanity Schema Index
 *
 * All content types used by the Solana Quest CMS.
 * Import into your Sanity Studio configuration:
 *
 * ```ts
 * // sanity.config.ts
 * import { schemaTypes } from './src/sanity/schemas'
 *
 * export default defineConfig({
 *   schema: { types: schemaTypes },
 * })
 * ```
 */

export { courseSchema, moduleSchema, lessonSchema } from './course';

// Schema types array for Sanity Studio configuration
export const schemaTypes = [
  // Lazy import to avoid Sanity Studio dependency in Next.js builds
];
