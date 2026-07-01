// ─── Seed Dataset ────────────────────────────────────────────────────────────
// All seed-owned data is identified by:
//   • User emails starting with "seed-"
//   • Presentation titles starting with SEED_PRESENTATION_TITLE_PREFIX
// These two identifiers are what reset.ts uses to scope its deletes.

export const SEED_PRESENTATION_TITLE_PREFIX = "Seed:" as const;

// ─── Users ───────────────────────────────────────────────────────────────────

export type SeedUser = {
  /** Short label used in log output and as the reset key. */
  key: string;
  username: string;
  /** Must start with "seed-" so reset.ts can locate them reliably. */
  email: string;
  /** Plaintext — hashed at insert time inside mysql.ts. */
  password: string;
};

export const SEED_USERS: SeedUser[] = [
  {
    key: "mohsen",
    username: "mohsen",
    email: "mohsen.khouaja@supcom.tn",
    password: "123456",
  },
  {
    key: "mohsenn",
    username: "mohsenn",
    email: "mohsen.khouaja@supcom.tnn",
    password: "123456",
  },
  {
    key: "carol",
    username: "seed-carol",
    email: "seed-carol@example.com",
    password: "SeedCarol123!",
  },
];

// ─── Slides ───────────────────────────────────────────────────────────────────

export type SeedSlide = {
  /** 1-based display order, maps to slides.slide_order in MySQL. */
  order: number;
  /** Hardcoded Markdown stored in MongoDB slides_content. */
  markdown: string;
};

// ─── Files ────────────────────────────────────────────────────────────────────

export type SeedFile = {
  /** Display name for the file. */
  originalName: string;
  /** MIME type (e.g. image/png, text/plain). */
  mimeType: string;
  /** Base64-encoded file content. */
  base64Content: string;
};

// ─── Presentations ────────────────────────────────────────────────────────────

export type SeedPresentation = {
  /** Short stable label used in log output and as the reset key. */
  key: string;
  /** Must start with SEED_PRESENTATION_TITLE_PREFIX. */
  title: string;
  /** Index into SEED_USERS — determines the owning user. */
  ownerIndex: number;
  /** Optional freeform context prompt attached to the presentation. */
  contextPrompt: string;
  slides: SeedSlide[];
  /** Optional files to attach to the presentation's context. */
  files?: SeedFile[];
};

export const SEED_PRESENTATIONS: SeedPresentation[] = [
  {
    key: "intro-to-ai",
    title: `${SEED_PRESENTATION_TITLE_PREFIX} Introduction to AI`,
    ownerIndex: 0,
    contextPrompt:
      "A beginner-friendly overview of artificial intelligence concepts.",
    files: [
      {
        originalName: "ai-brain.png",
        mimeType: "image/png",
        base64Content:
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      },
      {
        originalName: "notes.txt",
        mimeType: "text/plain",
        base64Content:
          "VGhpcyBpcyBhIHNlZWQgZmlsZSBhdHRhY2hlZCB0byB0aGUgQ29udGV4dCBvZiB0aGUgIEludHJvZHVjdGlvbiB0byBBSSBwcmVzZW50YXRpb24uCg==",
      },
    ],
    slides: [
      {
        order: 1,
        markdown: `# What Is Artificial Intelligence?\n\nAI is the simulation of human intelligence processes by machines, especially computer systems.\n\n- **Machine Learning** – systems that learn from data\n- **Natural Language Processing** – understanding human language\n- **Computer Vision** – interpreting images and video`,
      },
      {
        order: 2,
        markdown: `# A Brief History of AI\n\n| Year | Milestone |\n|------|-----------|\n| 1950 | Turing Test proposed |\n| 1956 | Dartmouth Conference coins "AI" |\n| 1997 | Deep Blue defeats Kasparov |\n| 2012 | Deep learning ImageNet breakthrough |\n| 2022 | Large language models go mainstream |`,
      },
      {
        order: 3,
        markdown: `# Key AI Concepts\n\n## Supervised Learning\nTrain on labelled examples to predict outputs.\n\n## Unsupervised Learning\nDiscover hidden patterns without labels.\n\n## Reinforcement Learning\nLearn by interacting with an environment and receiving rewards.`,
      },
      {
        order: 4,
        markdown: `# Real-World Applications\n\n- 🏥 Medical diagnosis and drug discovery\n- 🚗 Self-driving vehicles\n- 💬 Conversational assistants\n- 🎨 Generative art and music\n- 📈 Financial forecasting`,
      },
    ],
  },
  {
    key: "web-performance",
    title: `${SEED_PRESENTATION_TITLE_PREFIX} Web Performance Fundamentals`,
    ownerIndex: 1,
    contextPrompt:
      "Core techniques for measuring and improving web application performance.",
    slides: [
      {
        order: 1,
        markdown: `# Why Performance Matters\n\n> "53% of mobile users abandon a page that takes longer than 3 seconds to load."\n\nPerformance is a **feature**. It directly impacts:\n- Conversion rates\n- SEO rankings\n- User satisfaction`,
      },
      {
        order: 2,
        markdown: `# Core Web Vitals\n\n| Metric | Measures | Good threshold |\n|--------|----------|----------------|\n| LCP | Loading | ≤ 2.5 s |\n| FID / INP | Interactivity | ≤ 200 ms |\n| CLS | Visual stability | ≤ 0.1 |`,
      },
      {
        order: 3,
        markdown: `# Optimising the Critical Rendering Path\n\n1. Minimise render-blocking resources\n2. Inline critical CSS\n3. Defer non-critical JavaScript\n4. Preload key assets with \`<link rel="preload">\`\n5. Use \`font-display: swap\` for web fonts`,
      },
      {
        order: 4,
        markdown: `# Image Optimisation\n\n- Use **WebP / AVIF** for significant size savings\n- Always specify \`width\` and \`height\` to prevent layout shift\n- Lazy-load below-the-fold images\n- Serve responsive images with \`srcset\``,
      },
      {
        order: 5,
        markdown: `# Caching Strategy\n\n\`\`\`\nCache-Control: public, max-age=31536000, immutable  ← hashed assets\nCache-Control: no-cache                              ← HTML documents\n\`\`\`\n\nUse a **CDN** to serve static assets from the edge closest to the user.`,
      },
    ],
  },
  {
    key: "product-design",
    title: `${SEED_PRESENTATION_TITLE_PREFIX} Product Design Principles`,
    ownerIndex: 2,
    contextPrompt: "Foundational principles for designing products users love.",
    slides: [
      {
        order: 1,
        markdown: `# The Double Diamond\n\n**Discover → Define → Develop → Deliver**\n\nThe double-diamond model keeps teams from jumping to solutions before fully understanding the problem space.`,
      },
      {
        order: 2,
        markdown: `# Know Your User\n\n- Conduct **user interviews** before writing a single line of code\n- Build **personas** to represent real behaviour patterns\n- Map **jobs-to-be-done**: what outcome is the user hiring your product to achieve?\n- Validate with **usability testing** early and often`,
      },
      {
        order: 3,
        markdown: `# Design Principles at a Glance\n\n| Principle | In Practice |\n|-----------|-------------|\n| Visibility | Show system status clearly |\n| Feedback | Acknowledge every action |\n| Consistency | Same pattern, same result |\n| Error prevention | Constrain bad inputs |\n| Flexibility | Support both novices and experts |`,
      },
      {
        order: 4,
        markdown: `# Accessibility Is Not Optional\n\n- Target **WCAG 2.1 AA** as a minimum\n- Colour contrast ratio ≥ 4.5 : 1 for body text\n- All interactive elements must be keyboard-reachable\n- Provide meaningful \`alt\` text for images\n- Test with a screen reader (VoiceOver, NVDA)`,
      },
    ],
  },
];
