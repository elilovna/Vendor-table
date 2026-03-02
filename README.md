# Trusted Vendors Portal

A full-stack vendor management application built with Vue.js 3, TypeScript, and Bun/SQLite. Users can register, browse, edit, and delete vendors with a responsive, accessible UI that supports dark/light themes.

**Live demo:** https://vendor-table-frontend.onrender.com/

---

## Setup Instructions

### Prerequisites

- [Bun](https://bun.sh/) v1.3+ (used as runtime and package manager for both frontend and backend)
- Node.js 18+ (fallback, if not using Bun)

### Local Development

**Backend (Node.js/TypeScript + SQLite):**

```bash
cd backend-node
bun install
bun run dev        # starts Express on http://localhost:3000
```

The SQLite database is created automatically in `backend-node/data/vendors.db` with sample seed data on first run.

**Frontend (Vue 3 + Vite):**

```bash
cd frontend
bun install
bun run dev        # starts Vite on http://localhost:5173
```

The frontend proxies API requests to `http://localhost:3000` during development.

### Running Tests

```bash
# Frontend (Vitest + Vue Test Utils)
cd frontend && bun run test

# Backend (Bun test)
cd backend-node && bun test
```

### Docker Compose (full stack)

```bash
docker compose up --build
```

- Frontend: http://localhost:8080 (Nginx serving the Vite build, proxying `/api` to the backend)
- Backend: http://localhost:3000 (Express + SQLite, data persisted via Docker volume)

### CI Pipeline

GitHub Actions runs on every push/PR to `main`: lint, type-check, test, and build for both frontend and backend.

---

## Task Solutions

### Task 1 — Frontend UI Polish

**Layout approach:**

The layout uses CSS Grid for page-level structure and Flexbox inside components. The design follows a mobile-first approach: base styles target mobile, then a single `min-width: 768px` breakpoint adapts the layout for desktop.

- Mobile: single-column layout, toolbar controls stacked vertically, dialogs render as bottom sheets
- Desktop (768px+): toolbar controls align horizontally, vendor table reveals additional columns (contact person, partner type, action buttons), dialogs render as centered modals

**Design tokens:**

All visual values are defined as CSS custom properties in `src/style.css` — no hardcoded colours, spacing, or font sizes anywhere in component styles:

| Category   | Tokens |
|------------|--------|
| Colours    | `--color-primary`, `--color-surface`, `--color-text`, `--color-border`, `--color-danger`, `--color-success` + hover/foreground/subtle variants |
| Spacing    | `--spacing-xs` (0.25rem) through `--spacing-2xl` (3rem) |
| Typography | `--font-family-base` (Inter + system fallbacks), `--font-size-xs` through `--font-size-xl` |
| Radius     | `--radius-sm` (0.375rem), `--radius-md` (0.5rem) |
| Transitions| `--transition-fast` (150ms), `--transition-normal` (250ms) |
| Shadows    | `--shadow-sm`, `--shadow-md`, `--shadow-lg` |

**Dark/light theme:**

Toggled via `data-theme="dark"` on `<html>`. The dark theme only overrides colour and shadow tokens — layout and spacing remain unchanged. The `useDarkMode` composable reads from `localStorage` on init (falling back to `prefers-color-scheme`), and a `watchEffect` keeps the DOM attribute and storage in sync. Smooth transitions are applied to `background-color` and `color` on `body`.

**Accessibility:**

- Semantic HTML throughout: `<header>`, `<main>`, `<section>`, `<table>`, `<form>`, `<dialog>`, `<dl>`
- Every `<input>` has a `<label>` (visible or `.sr-only` for search/filter)
- All icon-only buttons have `aria-label` attributes
- Invalid form fields are marked with `aria-invalid` and errors are linked via `aria-describedby`
- Error messages use `role="alert"` for screen reader announcements
- `useDialog` composable captures focus on open and restores it to the trigger element on close
- Global `:focus-visible` outline on all interactive elements, with a custom focus ring on inputs

**Table enhancements:**

- TanStack Vue Table with typed column definitions in a separate file (`vendorColumns.ts`)
- Sortable columns with visual indicators (ascending/descending/idle)
- Global search filtering
- Partner type filter dropdown
- Zebra striping via `--color-surface-alt`
- Row hover state via `--color-row-hover`
- Table state (search, sort, filter) persisted in URL query params for bookmarking

### Task 2 — Delete Vendor

Implemented full delete flow across the stack:

- **Backend:** `DELETE /api/vendors/:id` endpoint with parameterised query. Returns `204` on success, `404` if vendor not found, `400` for invalid ID format.
- **Frontend:** Delete button rendered as a cell in the TanStack Table actions column. Clicking it opens a `ConfirmDialog` component that shows the vendor name and asks for confirmation. The dialog displays a loading state while the mutation is in flight and shows server errors inline if the delete fails.
- **State:** Uses TanStack Query's `useMutation` + automatic cache invalidation — the vendor list refreshes after a successful delete without a full refetch.

### Task 3 — Fix Duplicate Submit Bug

The original issue: clicking "Add" multiple times before the form resets created duplicate vendor entries.

**Solution:** The submit button is disabled while the create/update mutation is pending. A computed `isBusy` ref derived from `createVendor.isPending` and `updateVendor.isPending` controls the `:disabled` attribute. The form only closes and resets after `mutateAsync` resolves successfully — if the request fails, the form stays open with the error displayed inline. This prevents both duplicate submissions and premature form resets.

### Task 4 — Unique Emails

**Where the constraint is enforced and why:**

Email uniqueness is enforced at **three layers**:

1. **Database (SQLite):** `UNIQUE` constraint on the `email` column. This is the authoritative source of truth — it prevents duplicates even if the application layer has a bug, a race condition, or concurrent requests. Database constraints are the only reliable way to guarantee uniqueness in a concurrent system.

2. **Backend (Express route):** The route handler catches the SQLite `UNIQUE constraint failed` error and translates it into a `409 Conflict` response with a clear message: `"A vendor with this email already exists"`. This is where the constraint becomes a user-facing error rather than a raw database exception.

3. **Frontend (VendorForm):** The form displays the 409 error message inline next to the email field. The email input is marked `aria-invalid` and linked to the error via `aria-describedby`. This gives the user immediate, accessible feedback without requiring a page reload.

**Why not frontend-only validation?** Client-side checks can always be bypassed (browser devtools, direct API calls). They also can't handle race conditions — two users submitting the same email simultaneously would both pass a frontend check but one would fail at the database level.

**Why not just the database?** A raw constraint violation returns a cryptic error. The backend layer translates it into a meaningful HTTP status code (409) and message. The frontend layer presents it in the UI context where the user can act on it.

### Task 5 — Containerisation (Docker Compose)

**Approach:**

Both frontend and backend use multi-stage Docker builds with Bun:

- **Frontend:** Stage 1 installs dependencies and runs `vite build`. Stage 2 copies the built assets into an Nginx Alpine image with a custom `nginx.conf` that serves the SPA and proxies `/api` requests to the backend.
- **Backend:** Stage 1 installs dependencies and compiles TypeScript. Stage 2 runs the compiled JS with Bun runtime.
- **Compose:** Defines two services (`frontend` on port 8080, `backend` on port 3000) with a named volume for SQLite persistence and a health check on the backend's `/health` endpoint.

---

## Assumptions, Trade-offs, and Challenges

**Assumptions:**

- The assignment targets a single-user or low-concurrency scenario. SQLite is sufficient — no need for PostgreSQL or a connection pool.
- "Responsive layout" means a practical mobile/desktop split at one breakpoint (768px), not a full adaptive design across every device size.
- The Java backend is left as-is since only one backend needs to be enhanced.

**Trade-offs:**

- **TanStack Table over a simpler approach:** Adds bundle weight (~15 KB gzipped) but provides type-safe column definitions, built-in sorting/filtering, and a clean separation of table logic from template markup. For a vendor list that could grow to hundreds of rows, the trade-off is worth it.
- **TanStack Query over manual fetch:** Adds another dependency but eliminates manual loading/error state management, provides automatic cache invalidation after mutations, and makes optimistic updates possible in the future.
- **vee-validate for forms:** The vendor form is simple enough for manual validation, but vee-validate gives per-field validation on blur, proper dirty/touched tracking, and integrates cleanly with the composable pattern.
- **BEM over scoped CSS alone:** Scoped styles in Vue already prevent conflicts, but BEM gives predictable, greppable class names that are easier to debug in DevTools and maintain across a team.
- **No pagination:** The current dataset is small. If the vendor list grows to thousands of rows, server-side pagination would be the next step.

**Challenges:**

- **TanStack Table column typing:** Mixed column types (accessor + display) in a single array require an `any` type assertion due to TanStack's generic inference limitations. This is documented inline with an eslint-disable comment.
- **URL state synchronisation:** Persisting table state (search, sort, filter) in URL query parameters required careful handling to avoid infinite update loops between the router and TanStack Table's state callbacks.

---

## Future Improvements

- **Toast notifications:** Add non-blocking toast messages for successful vendor add/edit/delete actions, giving users immediate visual feedback without modal interruptions.
- **Skeleton loading animation:** Replace the plain loading state with skeleton placeholders that mirror the table layout, providing a smoother perceived loading experience.
- **Server-side pagination:** Move pagination to the backend with cursor-based queries to handle large vendor lists without loading everything into memory.
- **Server-side filtering:** Offload search and partner type filtering to the backend API so the client doesn't need the full dataset to filter results.

---

## About Me

**What do I love most about being a software engineer?**

I enjoy working with talented people, solving problems, and getting better through the process. Every bug feels like a puzzle, every feature is a challenge to design well, and every code review is a chance to learn. Doing all of this with people who think differently from me makes it even more interesting.

**What is most important to me when it comes to working in a team?**

Communication. The best code does not matter if the team is not aligned on what we are building and why. Clear communication in PRs, messages, and meetings prevents more bugs than any linter ever will.

**What is the worst part of being a software engineer?**

Trying to explain to my family what my job really is.