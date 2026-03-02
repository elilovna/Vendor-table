# CLAUDE.md — Coding Standards & Rules

## Project

Trusted Vendors Portal — Vue.js 3 + Bun/TypeScript full-stack app.
Frontend is the primary showcase. Backend should be correct but not over-engineered.

**Stack:** Vue.js 3 (Composition API) · TypeScript strict · TanStack Table · BEM CSS · Bun runtime · SQLite

**Runtime:** Always use `bun` — never npm, yarn, or node.

---
## Reuse Before Creating
**Before writing ANY new component, composable, type, or utility:**
1. Search the codebase for existing implementations
2. Check `src/components/` for reusable UI components
3. Check `src/composables/` for existing composables and shared logic
4. Check existing components for established patterns (BEM classes, form patterns, table column definitions)

## TypeScript

- `"strict": true` — never use `any`, use `unknown` + type guards
- Prefer `interface` over `type` for object shapes
- Shared types (e.g. `Vendor`) in a `types/` directory, imported everywhere
- Explicit return types on all exported functions
- No type assertions (`as`) unless commented why

---

## Vue.js 3

- Always `<script setup lang="ts">` — never Options API
- Props: `defineProps<{}>()` with TS interface. Emits: `defineEmits<{}>()`
- `ref()` for primitives, `reactive()` for objects
- `computed()` for derived state — never calculate in templates
- `v-for` keys: stable IDs only, never array index
- `v-if` and `v-for` never on the same element
- Components under 150 lines — extract to composables if larger
- Every component handles loading, error, and empty states

### Composables
- Prefix `use`: `useVendors`, `useTheme`
- Own the data fetching and state — components only consume and render
- Return typed objects: `return { vendors, isLoading, addVendor, deleteVendor }`

### Forms
- Disable submit button while request is in flight (`isSubmitting` ref)
- Reset form only after confirmed successful response
- Display server errors (e.g. 409) inline next to the relevant field

### Accessibility
- Semantic HTML: `<main>`, `<section>`, `<form>`, `<table>`, `<button>`, `<label>`
- Every `<input>` has a `<label>`. Icon-only buttons have `aria-label`
- Error messages linked with `aria-describedby`, fields marked `aria-invalid`
- Focus management: return focus to trigger after modal close
- Visible `:focus-visible` styles on all interactive elements

---

## CSS — BEM Methodology

### Naming
- `.block__element--modifier` — never nest deeper than one level
- No `#id` selectors. No `!important`. No inline styles. No tag selectors (except reset)

### Architecture
- `src/style.css` — reset, design tokens, global typography
- Component styles in `<style scoped>` using BEM classes

### Design Tokens
All visual values MUST use CSS custom properties. Never hardcode colors, spacing, or font sizes.

```css
:root {
  --color-primary: ; --color-primary-hover: ;
  --color-surface: ; --color-surface-alt: ;    /* zebra striping */
  --color-text: ; --color-text-secondary: ;
  --color-border: ; --color-danger: ; --color-success: ;
  --color-focus-ring: ;

  --spacing-xs: 0.25rem; --spacing-sm: 0.5rem; --spacing-md: 1rem;
  --spacing-lg: 1.5rem; --spacing-xl: 2rem; --spacing-2xl: 3rem;

  --font-family-base: ; --font-size-sm: ; --font-size-base: ;
  --font-size-lg: ; --font-size-xl: ;

  --radius-sm: ; --radius-md: ;
  --transition-fast: 150ms ease; --transition-normal: 250ms ease;
  --shadow-sm: ; --shadow-md: ;
}
```

### Dark/Light Theme
- `data-theme="dark"` on `<html>` — override only color tokens
- CSS-first: no JS toggling individual styles
- Smooth transition on `background-color` and `color`

### Responsive
- Mobile-first: base = mobile, scale up with `min-width`
- `≥ 768px` two-column grid · `≥ 1200px` max-width container
- CSS Grid for layout, Flexbox inside components

### Interactive States
Every element: Default → Hover → Active → Focus-visible → Disabled

---

## TanStack Table

- `@tanstack/vue-table` with `createColumnHelper<Vendor>()` — fully typed
- Column definitions outside the template (separate file or top of `<script setup>`)
- Render with manual `<table>` markup + BEM classes
- Delete button as a cell renderer in a column definition

---

## Backend (Bun / TypeScript)

- REST + JSON. Status codes: 200, 201, 204, 400, 404, 409, 500
- Error response shape: `{ error: string }`
- SQLite with parameterized queries. `UNIQUE` constraint on email column
- Validate inputs at API layer: required fields, email format, partner_type enum
- Never expose stack traces to client

---

## Testing

- **Frontend priority**: Vitest + Vue Test Utils. Backend: `bun test`
- Test behavior, not implementation
- Mock API calls in frontend tests
- Descriptive names: `"should disable submit button while request is pending"`

---

## Git

- Conventional commits: `feat:`, `fix:`, `style:`, `docs:`, `test:`
- Never commit: `node_modules/`, `dist/`, `.env`, `*.db`

## Naming

- Components: `PascalCase.vue` · Composables: `use*.ts` · CSS: `.kebab-case__bem--modifier`
- Tests: `*.test.ts` or `*.spec.ts`