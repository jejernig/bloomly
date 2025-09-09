# Coding Standards & Conventions

## TypeScript Standards
- **Strict Mode**: All TypeScript files use strict mode
- **Type Safety**: No `any` types, prefer explicit typing
- **Interface Naming**: Use PascalCase (e.g., `CanvasObject`, `TouchGesture`)
- **Component Props**: Always define interface for component props

## React/Next.js Conventions
- **'use client'**: Required for client components using hooks/events
- **File Naming**: PascalCase for components (e.g., `CanvasEditor.tsx`)
- **Hook Naming**: Custom hooks start with `use` (e.g., `useCanvasStore`)
- **Import Order**: External libraries → internal modules → relative imports

## Atomic Design Structure
```
src/components/
├── ui/           # Atoms (Button, Input, Progress)
├── canvas/       # Canvas-specific molecules
├── editor/       # Editor organisms
├── dashboard/    # Dashboard organisms
└── auth/         # Auth organisms
```

## Mobile-First Approach
- Always design for mobile first (320px breakpoint)
- Use Tailwind responsive classes (`sm:`, `md:`, `lg:`)
- Canvas touch gestures must work on mobile
- Test on iOS Safari and Chrome mobile

## State Management
- **Zustand**: Primary state management (stores in `/src/stores/`)
- **React Query**: Server state and caching
- **No Redux**: Use Zustand for simplicity and performance

## Canvas Specific
- **Fabric.js v6.0.2**: Latest version with TypeScript support
- **Touch Optimization**: All canvas interactions must work on mobile
- **Performance**: Optimize for low-end devices
- **Layer Management**: Z-index controls, lock/unlock functionality