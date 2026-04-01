# Website Roadmap

## Done
- Projects page: timeline, tag filtering, search, hover effects, project detail pages
- Curations page: collection of things I find interesting, built but nav link hidden
- Image optimization: local PNGs + remote URLs compressed at build time via sharp (960px, JPEG q82)
- Codebase cleanup: removed dead scripts, simplified ProjectCard, image-loader, next.config.js

---

## Near-term

### Curations page
- Uncomment nav link in `app/layout.tsx`
- Add categories / grouped tag filtering (similar to projects page)
- UI improvements — better layout, more visual

### Graphics / UI Overhaul (1)
- More dynamic and interactive overall feel
- Creative but not over the top
- Ideas TBD — revisit when ready to design

---

## Longer-term

### Hosting migration (2)
- GitHub Pages static export is too limiting for dynamic features
- Migrate to a hosted server (Vercel most likely — free, zero-config Next.js)
- Unlocks: API routes, server-side rendering, database, auth, image optimization

### Direct upload from the website (2)
- Add/edit entries (projects, curations, etc.) directly from the site
- Requires hosted backend + auth
- Depends on hosting migration

### Site as a personal hub (3)
- Central place for everything, not just projects
- Migrate stuff currently stored in personal Discord server
- Sections: ideas, interesting finds, websites, books, quotes, etc.

### Random recommendation generator (4)
- Pool of project ideas, books, quotes
- Surfaces one randomly per day (or on demand)
- Quotes: store personal collection, display randomly

### Unique interest sections (5)
- F1, fragrances, cars, YouTube, blogs, etc.
- Added on a case-by-case basis as interest develops
- Each section gets its own design treatment

### Current scope / focus section (6)
- Things I'm actively thinking about
- Projects I want to do in the near future
- Running list of stuff on my mind

### Custom YouTube homepage (7)
- Personal feed of only videos I've liked or find genuinely interesting
- Not algorithm-driven — fully curated
- Likely needs YouTube API integration

### Custom social media feed (8)
- Aggregates all curated content in one place
- Everything I've already collected — surfaced as a personal feed
- Combines: curations, YouTube, links, quotes, recommendations, etc.
- The unifying layer across all the other sections
