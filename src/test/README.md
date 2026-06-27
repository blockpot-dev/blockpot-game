# Test stack

`vitest` runs under `happy-dom` against `src/**/*.test.{ts,tsx}`. Invoke with
`bun run test` (the canonical command — `bun test` resolves to Bun's built-in
runner, which is **not** what we want here). For watch mode, `bun run test:watch`.

`@testing-library/jest-dom` matchers are registered globally by
`src/test/setup.ts`, so `expect(node).toBeInTheDocument()` works without
per-file imports.

## When to use `renderWithProviders` vs plain `render()`

Use `renderWithProviders` (this directory) when the component under test calls
into `@tanstack/react-router` (`<Link>`, `useNavigate`, `useRouter`) or
`@tanstack/react-query` (`useQuery`, `useMutation`). It wraps a fresh
`QueryClient` and an in-memory `createMemoryHistory` router around `ui`.

Use the bare `render()` from `@testing-library/react` for everything else —
prop-only components, components whose hooks are fully mocked, etc.

`renderWithProviders` deliberately omits `Web3Provider`,
`Web3ConnectionProvider`, `BlockpotEventsProvider`, and friends. Don't add
them. Mock the hooks they back at the import boundary instead (see below).

## Mocking convention: `vi.mock` at the hook boundary

We mock at the hook module path, not by wrapping providers. Two reasons:

1. The provider stack is wagmi / RPC / persisted cache heavy — booting it in
   `happy-dom` is slow and brittle.
2. Hook mocks make the "given hook returns X, the UI shows Y" contract
   explicit at the top of the test.

Example: mock `@/hooks/utilities/useDisplayCurrency` to return a fixed
currency before asserting on the rendered badge. See
`src/components/blockpot/entries/EntryOptions/EntryCost/EntryCost.test.tsx`
for the reference pattern. The operator console's
`RoleGate.test.tsx` follows the same shape against `useOperatorSession`.

## Fixtures

Inline ad-hoc factories next to the test for now. If a fixture grows reusable
across files, lift it to `src/test/fixtures/` and import.

## Minimal example

```tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyComponent from './MyComponent'

vi.mock('@/hooks/useSomething', () => ({
    default: () => ({ value: 42 }),
}))

describe('<MyComponent>', () => {
    it('renders the value from the hook', () => {
        render(<MyComponent />)
        expect(screen.getByText('42')).toBeInTheDocument()
    })
})
```
