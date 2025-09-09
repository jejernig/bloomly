# Suggested Commands for Taylor Collection

## Development Commands
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint checking
npm run type-check   # TypeScript type checking
```

## Testing Commands
```bash
npm run test         # Jest unit tests
npm run test:watch   # Jest in watch mode
npm run test:e2e     # Playwright E2E tests
```

## Supabase Commands
```bash
npm run generate-types  # Generate TypeScript types from Supabase
```

## Useful System Commands (macOS)
```bash
# File operations
ls -la                  # List files with details
find . -name "*.tsx"    # Find TypeScript React files
grep -r "useCanvas" src # Search for text in files

# Git operations
git status              # Check git status
git add .               # Stage all changes
git commit -m "message" # Commit with message
git push origin main    # Push to main branch

# Node/npm operations
npm install             # Install dependencies
npm list                # List installed packages
npx next info          # Next.js environment info
```

## Development Workflow
1. Always check `git status` before starting
2. Run `npm run type-check` before committing
3. Use `npm run lint` for code quality
4. Test on mobile-first (responsive design)
5. Ensure Fabric.js canvas works on touch devices