import type { authClient } from './auth.client';

// Core Better Auth types
export type ClientSession = typeof authClient.$Infer.Session;
export type ActiveOrganization = typeof authClient.$Infer.ActiveOrganization;
export type Invitation = typeof authClient.$Infer.Invitation;
