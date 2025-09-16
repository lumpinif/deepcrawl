import { env as envWorker } from 'cloudflare:workers';
import { createAuth } from './better-auth';

const auth = createAuth({ ...envWorker });

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;

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
