/**
 * JSON-LD Structured Data for SEO
 * Provides rich snippets for search engines (Google, Bing).
 */

export function StructuredData() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Solana Quest',
    alternateName: 'Superteam Academy',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://solana-quest.vercel.app',
    description:
      'An RPG-themed learning platform for Solana development. Interactive quests, on-chain credentials, and gamified progression.',
    publisher: {
      '@type': 'Organization',
      name: 'Superteam Brazil',
      url: 'https://superteam.fun',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate:
          (process.env.NEXT_PUBLIC_APP_URL || 'https://solana-quest.vercel.app') +
          '/courses?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: ['en', 'pt-BR', 'es'],
  };

  const educationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Solana Quest Academy',
    description:
      'Interactive Solana blockchain development education platform with gamified learning paths',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://solana-quest.vercel.app',
    sameAs: [
      'https://github.com/solanabr/superteam-academy',
      'https://twitter.com/SuperteamBR',
      'https://discord.gg/superteambrasil',
    ],
    areaServed: {
      '@type': 'Place',
      name: 'Global',
    },
    teaches: [
      'Solana Blockchain Development',
      'Rust Programming',
      'Anchor Framework',
      'DeFi Development',
      'NFT Development',
      'Smart Contract Security',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(educationJsonLd) }}
      />
    </>
  );
}
