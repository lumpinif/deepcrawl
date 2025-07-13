import type { Auth, Session } from '@deepcrawl/auth/types';

export interface AppVariables {
  /** Better Auth Instance */
  betterAuth: Auth;
  /** Current User */
  user: Session['user'] | null;
  /** Current Session */
  session: Session['session'] | null;
}

export interface AppContext {
  /** Cloudflare Bindings */
  Bindings: CloudflareBindings;
  /** App Variables */
  Variables: AppVariables;
}
