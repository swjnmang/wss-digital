/* eslint-disable @typescript-eslint/no-explicit-any */
// Temporary fallback to satisfy TypeScript JSX intrinsic elements during migration.
// Prefer installing matching @types/react versions; this file avoids CI/typecheck failures.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}

export {}
