import type { Session } from './lib/better-auth';

export interface AppVariables {
  user: Session['user'] | null;
  session: Session['session'] | null;
}

export interface AppBindings {
  Bindings: CloudflareBindings;
  Variables: AppVariables;
}
