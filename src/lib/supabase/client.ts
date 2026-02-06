import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Bypass navigator.locks to prevent deadlocks in React Strict Mode.
        // onAuthStateChange emits INITIAL_SESSION inside an exclusive lock,
        // and Strict Mode's double-mount causes two subscriptions competing
        // for the same lock, leading to timeout/deadlock.
        // This no-op lock is Supabase's own internal fallback (lockNoOp).
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
          return await fn();
        },
      },
    }
  );
}
