# TODO

## Migrate to Next.js

**Priority:** Medium
**Complexity:** Moderate (30-60 min)

### Why migrate?
- Fix remaining security vulnerabilities locked in react-scripts
- Create React App is deprecated and no longer maintained
- Better performance with Next.js optimizations
- Modern tooling and active development

### What needs to change:
- [ ] Set up new Next.js project with App Router
- [ ] Move components (mostly copy-paste)
- [ ] Add `"use client"` directive to components using hooks/browser APIs
- [ ] Remove react-router-dom (not needed for single page)
- [ ] Update Tailwind config for Next.js
- [ ] Update import paths

### What stays the same:
- All UI components
- Radix UI / shadcn components
- Tailwind styles
- @dnd-kit drag and drop
- localStorage logic
