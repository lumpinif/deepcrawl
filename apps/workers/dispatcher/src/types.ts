import type { AuthType, Session } from './lib/better-auth';

export interface AppVariables {
  /** Better Auth Instance */
  betterAuth: AuthType;
  /** Current User */
  user: Session['user'] | null;
  /** Current Session */
  session: Session['session'] | null;
}

export interface AppBindings {
  /** Cloudflare Bindings */
  Bindings: CloudflareBindings;
  /** App Variables */
  Variables: AppVariables;
}
