import betterAuth from '../configs/auth.next';

export type Session = ReturnType<typeof betterAuth>['$Infer']['Session'];