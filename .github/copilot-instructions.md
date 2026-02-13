# AI Agent Instructions - Condominios App

## Project Overview
This is a **Next.js 14+ (App Router)** condominium access control system in TypeScript with role-based interfaces for Admin, Vigilante (Guard), and Residente (Resident). Data persistence uses **Zustand + localStorage** (no backend). All UI text is in Spanish.

## Key Architecture Decisions



### State Management (Zustand)
- **Single source of truth**: [src/store/useStore.ts](../src/store/useStore.ts) manages all app state
- **Persistence**: All state auto-persists to `localStorage` via Zustand middleware
- **Session flow**: `login()` sets session, role-based routing happens in [src/app/page.tsx](../src/app/page.tsx)
- **Type-safe**: All state operations use types from [src/types/index.ts](../src/types/index.ts)

### Role-Based Routing
Three distinct user journeys with isolated routes:
- **Admin** (`/admin/*`): Dashboard metrics, user management, full access history
- **Vigilante** (`/vigilante/*`): Entry/exit registration, active visitors list
- **Residente** (`/residente/*`): Generate access codes, view personal visit history

Role is checked via `useStore().session.user.rol` - no middleware/auth guards exist.

### Data Model
- `User`: Three roles (`admin | vigilante | residente`), soft delete via `activo` flag
- `RegistroAcceso`: Entry/exit records with `activo: true` for visitors currently inside
- `CodigoAcceso`: Time-limited access codes residents generate for visitors

**Critical pattern**: Vehicle `placa` (license plate) is the primary identifier for tracking visitors. Always normalize with `formatearPlaca()` from [src/lib/utils.ts](../src/lib/utils.ts).

## Development Workflow

### Running the App
```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Production build
npm run lint         # ESLint check
```

### Test Credentials (hardcoded in [src/lib/mockData.ts](../src/lib/mockData.ts))
- Admin: `admin@condominio.com / admin123`
- Vigilante: `vigilante@condominio.com / vigilante123`
- Residente: `residente@condominio.com / residente123`

## Code Conventions

### Component Patterns
- **Client components**: All interactive components use `'use client'` directive (Next.js requirement)
- **Layout structure**: Each role has a layout wrapper at `src/app/{role}/layout.tsx` that includes [Sidebar](../src/components/layouts/Sidebar.tsx)
- **UI components**: Reusable primitives in `src/components/ui/` (Button, Card) - follow existing prop patterns

### Styling
- **Tailwind-first**: Use utility classes directly in JSX
- **No CSS modules**: [globals.css](../src/app/globals.css) only contains Tailwind directives
- **Class merging**: Use `cn()` helper from [src/lib/utils.ts](../src/lib/utils.ts) for conditional classes
- **Responsive**: Mobile-first design, vigilante UI uses large touch targets

### State Updates
```typescript
// ✅ Correct: Call Zustand actions directly
const { registrarEntrada } = useStore();
registrarEntrada({ placa: 'ABC123', ... });

// ❌ Avoid: Don't mutate state directly
const { registros } = useStore();
registros.push(newRecord); // Will not trigger re-render or persist
```

### Date Handling
- Store dates as `Date` objects in Zustand (serialized to ISO strings in localStorage)
- Use `formatearFecha()` from [src/lib/utils.ts](../src/lib/utils.ts) for display
- Access code validity: Use `validoHasta` timestamp comparison

## Key Integration Points

### Navigation
- Use Next.js `<Link>` from `next/link` for internal navigation
- Active route detection: `usePathname()` hook (see [Sidebar.tsx](../src/components/layouts/Sidebar.tsx#L24))
- Post-login redirect: Role-based switch in [src/app/page.tsx](../src/app/page.tsx#L24-L34)

### Icon System
- **Lucide React** for all icons - consistent naming (e.g., `Shield`, `Users`, `LogOut`)
- Size convention: `w-5 h-5` for nav items, `w-8 h-8` for stats cards

### Form Validation
- Libraries installed: `react-hook-form`, `zod`, `@hookform/resolvers`
- **Not yet implemented** - currently using basic controlled inputs
- When adding: Use Zod schemas in [src/types/index.ts](../src/types/index.ts), wrap forms with `useForm()`

## Common Tasks

### Adding a New User Role Feature
1. Add action to [src/store/useStore.ts](../src/store/useStore.ts) interface and implementation
2. Update UI in role-specific page under `src/app/{role}/`
3. Add nav item to `getNavItems()` in [Sidebar.tsx](../src/components/layouts/Sidebar.tsx#L35) if needed

### Modifying Data Types
1. Update type definition in [src/types/index.ts](../src/types/index.ts)
2. Update mock data in [src/lib/mockData.ts](../src/lib/mockData.ts) to match
3. Clear `localStorage` in browser DevTools (key: typically `condominio-store` or similar) to reset state

### Debugging State Issues
- Open browser DevTools → Application → Local Storage
- Find the Zustand persist key (check [useStore.ts](../src/store/useStore.ts) persist config)
- Delete key to reset to initial state from [mockData.ts](../src/lib/mockData.ts)

## Important Gotchas

1. **No middleware/route protection**: Pages don't verify authentication - assumes login flow forces correct routing
2. **Timestamps**: Stored dates become strings in localStorage - always construct `new Date(timestamp)` when reading
3. **Vehicle tracking**: `activo: true` on `RegistroAcceso` means visitor is currently inside - must flip to `false` on exit
4. **Soft deletes**: Users are never removed from array - set `activo: false` instead
5. **Path aliases**: `@/` maps to `src/` (configured in [tsconfig.json](../tsconfig.json#L20))



## Future Backend Integration
When replacing localStorage with API:
- Keep Zustand store structure intact
- Replace action implementations with `fetch()` calls
- Add loading/error states to store
- Consider adding optimistic updates for better UX
