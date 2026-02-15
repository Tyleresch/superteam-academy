/**
 * Sanity Schema: Course
 *
 * This defines the content model for courses in the CMS.
 * Import this into your Sanity Studio's schema configuration.
 *
 * Usage in sanity.config.ts:
 *   import { courseSchema, moduleSchema, lessonSchema } from './schemas/course'
 *   schema: { types: [courseSchema, moduleSchema, lessonSchema] }
 */

export const courseSchema = {
  name: 'course',
  title: 'Course',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    },
    {
      name: 'shortDescription',
      title: 'Short Description',
      type: 'string',
      description: 'Brief summary for course cards (max 120 chars)',
      validation: (Rule: { max: (n: number) => unknown }) => Rule.max(120),
    },
    {
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'difficulty',
      title: 'Difficulty',
      type: 'string',
      options: {
        list: [
          { title: 'Beginner', value: 'beginner' },
          { title: 'Intermediate', value: 'intermediate' },
          { title: 'Advanced', value: 'advanced' },
          { title: 'Legendary', value: 'legendary' },
        ],
        layout: 'radio',
      },
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'e.g., "6 hours", "2 weeks"',
    },
    {
      name: 'totalXP',
      title: 'Total XP',
      type: 'number',
      validation: (Rule: { min: (n: number) => unknown }) => Rule.min(0),
    },
    {
      name: 'track',
      title: 'Learning Track',
      type: 'string',
      options: {
        list: [
          { title: 'Solana Fundamentals', value: 'solana-fundamentals' },
          { title: 'Rust Mastery', value: 'rust-mastery' },
          { title: 'Anchor Development', value: 'anchor-development' },
          { title: 'DeFi Builder', value: 'defi-builder' },
          { title: 'NFT Creator', value: 'nft-creator' },
          { title: 'Security Auditor', value: 'security-auditor' },
          { title: 'Full Stack Solana', value: 'fullstack-solana' },
        ],
      },
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    },
    {
      name: 'language',
      title: 'Language',
      type: 'string',
      options: {
        list: [
          { title: 'English', value: 'en' },
          { title: 'Portuguese (BR)', value: 'pt-BR' },
          { title: 'Spanish', value: 'es' },
        ],
      },
      initialValue: 'en',
    },
    {
      name: 'prerequisites',
      title: 'Prerequisites',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'instructor',
      title: 'Instructor',
      type: 'object',
      fields: [
        { name: 'name', title: 'Name', type: 'string' },
        { name: 'avatar', title: 'Avatar', type: 'image' },
        { name: 'bio', title: 'Bio', type: 'text', rows: 2 },
        { name: 'title', title: 'Title', type: 'string' },
        {
          name: 'socialLinks',
          title: 'Social Links',
          type: 'object',
          fields: [
            { name: 'twitter', title: 'Twitter', type: 'url' },
            { name: 'github', title: 'GitHub', type: 'url' },
            { name: 'website', title: 'Website', type: 'url' },
          ],
        },
      ],
    },
    {
      name: 'modules',
      title: 'Modules',
      type: 'array',
      of: [{ type: 'module' }],
    },
    {
      name: 'published',
      title: 'Published',
      type: 'boolean',
      initialValue: false,
    },
  ],
  preview: {
    select: {
      title: 'title',
      difficulty: 'difficulty',
      track: 'track',
      media: 'thumbnail',
    },
    prepare({ title, difficulty, track }: { title: string; difficulty: string; track: string }) {
      return {
        title,
        subtitle: `${difficulty} · ${track}`,
      };
    },
  },
};

export const moduleSchema = {
  name: 'module',
  title: 'Module',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
    },
    {
      name: 'order',
      title: 'Order',
      type: 'number',
    },
    {
      name: 'xpReward',
      title: 'XP Reward',
      type: 'number',
      initialValue: 100,
    },
    {
      name: 'lessons',
      title: 'Lessons',
      type: 'array',
      of: [{ type: 'lesson' }],
    },
  ],
};

export const lessonSchema = {
  name: 'lesson',
  title: 'Lesson',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
    },
    {
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Content (Reading)', value: 'content' },
          { title: 'Challenge (Coding)', value: 'challenge' },
          { title: 'Video', value: 'video' },
          { title: 'Quiz', value: 'quiz' },
        ],
      },
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: 'order',
      title: 'Order',
      type: 'number',
    },
    {
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Code', value: 'code' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  { name: 'href', type: 'url', title: 'URL' },
                ],
              },
            ],
          },
        },
        {
          type: 'code',
          title: 'Code Block',
          options: {
            language: 'typescript',
            languageAlternatives: [
              { title: 'TypeScript', value: 'typescript' },
              { title: 'Rust', value: 'rust' },
              { title: 'JSON', value: 'json' },
              { title: 'Bash', value: 'bash' },
              { title: 'JavaScript', value: 'javascript' },
            ],
            withFilename: true,
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
            {
              name: 'alt',
              type: 'string',
              title: 'Alt Text',
            },
          ],
        },
      ],
      description: 'Rich lesson content — use blocks, code, and images',
    },
    {
      name: 'markdownContent',
      title: 'Markdown Content (Alternative)',
      type: 'text',
      rows: 20,
      description:
        'If you prefer writing in Markdown instead of the rich text editor above',
    },
    {
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'e.g., "15 min"',
    },
    {
      name: 'xpReward',
      title: 'XP Reward',
      type: 'number',
      initialValue: 25,
    },
    {
      name: 'challenge',
      title: 'Code Challenge',
      type: 'object',
      hidden: ({ parent }: { parent: { type: string } }) => parent?.type !== 'challenge',
      fields: [
        { name: 'title', title: 'Title', type: 'string' },
        { name: 'prompt', title: 'Prompt', type: 'text', rows: 4 },
        {
          name: 'language',
          title: 'Language',
          type: 'string',
          options: {
            list: ['typescript', 'rust', 'json'],
          },
          initialValue: 'typescript',
        },
        {
          name: 'starterCode',
          title: 'Starter Code',
          type: 'text',
          rows: 10,
        },
        { name: 'solution', title: 'Solution', type: 'text', rows: 10 },
        {
          name: 'hints',
          title: 'Hints',
          type: 'array',
          of: [{ type: 'string' }],
        },
        {
          name: 'difficulty',
          title: 'Difficulty',
          type: 'string',
          options: {
            list: ['easy', 'medium', 'hard', 'boss'],
          },
        },
        {
          name: 'testCases',
          title: 'Test Cases',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                { name: 'name', title: 'Name', type: 'string' },
                { name: 'input', title: 'Input', type: 'string' },
                {
                  name: 'expectedOutput',
                  title: 'Expected Output',
                  type: 'string',
                },
                {
                  name: 'isHidden',
                  title: 'Hidden',
                  type: 'boolean',
                  initialValue: false,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      type: 'type',
    },
    prepare({ title, type }: { title: string; type: string }) {
      const icons: Record<string, string> = {
        content: '📖',
        challenge: '⚔️',
        video: '🎬',
        quiz: '❓',
      };
      return {
        title: `${icons[type] || '📄'} ${title}`,
        subtitle: type,
      };
    },
  },
};
