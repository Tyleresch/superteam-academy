import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

/**
 * Sanity CMS Client Configuration
 *
 * Configure via environment variables:
 * - NEXT_PUBLIC_SANITY_PROJECT_ID: Your Sanity project ID
 * - NEXT_PUBLIC_SANITY_DATASET: Dataset name (default: "production")
 * - NEXT_PUBLIC_SANITY_API_VERSION: API version (default: "2026-02-15")
 *
 * To set up your own Sanity project:
 * 1. Run: npx sanity@latest init
 * 2. Copy the project ID from the output
 * 3. Set NEXT_PUBLIC_SANITY_PROJECT_ID in your .env.local
 */

export const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-02-15',
  useCdn: process.env.NODE_ENV === 'production',
};

export const sanityClient = createClient({
  ...sanityConfig,
  // If no project ID is configured, the client won't make requests
  // The app falls back to mock data gracefully
});

/**
 * Check if Sanity is configured and available
 */
export function isSanityConfigured(): boolean {
  return Boolean(sanityConfig.projectId && sanityConfig.projectId.length > 0);
}

/**
 * Image URL builder for Sanity image assets
 */
const builder = imageUrlBuilder(sanityClient);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
  return builder.image(source);
}
