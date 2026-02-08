import type { Session } from '@deepcrawl/auth/types';
import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
import type { AppBindings } from '@/lib/context';
import { resolveAuthMode } from '@/utils/auth-mode';
import { logDebug, logError, logWarn } from '@/utils/loggers';

interface JwtPayload {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
  exp?: number;
  iat?: number;
  jti?: string;
  iss?: string;
  aud?: string | string[];
}

const getBearerToken = (authHeader?: string | null) => {
  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
};

const resolveJwtSession = (
  payload: JwtPayload,
  context: {
    userAgent?: string | null;
    ipAddress?: string | null;
  },
): Session | null => {
  const userId = payload.sub;
  if (!userId || typeof userId !== 'string') {
    return null;
  }

  const now = new Date();
  const expiresAt =
    typeof payload.exp === 'number'
      ? new Date(payload.exp * 1000)
      : new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const jti = typeof payload.jti === 'string' ? payload.jti : null;
  const sessionId = jti ?? `jwt_${userId}`;
  const email = typeof payload.email === 'string' ? payload.email : '';

  const name = typeof payload.name === 'string' ? payload.name : undefined;

  return {
    session: {
      id: sessionId,
      createdAt: now,
      updatedAt: now,
      userId,
      expiresAt,
      token: sessionId,
      ipAddress: context.ipAddress ?? null,
      userAgent: context.userAgent ?? null,
    },
    user: {
      id: userId,
      createdAt: now,
      updatedAt: now,
      email,
      emailVerified: payload.email_verified ?? false,
      name: name ?? (email || userId),
      image: typeof payload.picture === 'string' ? payload.picture : null,
    },
  } as Session;
};

export const jwtAuthMiddleware = createMiddleware<AppBindings>(
  async (c, next) => {
    const authMode = resolveAuthMode(c.env.AUTH_MODE);
    if (authMode !== 'jwt') {
      return next();
    }

    if (c.get('session')) {
      logDebug('✅ Skipping [jwtAuthMiddleware] Session found');
      return next();
    }

    const secret = c.env.JWT_SECRET;
    if (!secret) {
      logError('❌ JWT_SECRET is missing while AUTH_MODE=jwt');
      return next();
    }

    const token = getBearerToken(c.req.header('authorization'));
    if (!token) {
      logDebug('🔑 No JWT provided, skipping to next middleware');
      return next();
    }

    try {
      const payload = (await verify(token, secret, {
        alg: 'HS256',
        iss: c.env.JWT_ISSUER,
        aud: c.env.JWT_AUDIENCE,
      })) as JwtPayload;

      const session = resolveJwtSession(payload, {
        userAgent: c.req.header('user-agent'),
        ipAddress: c.var.userIP,
      });

      if (!session) {
        logWarn('🚨 Invalid JWT payload: missing sub claim');
        return next();
      }

      c.set('session', session);

      logDebug('✅ JWT authenticated successfully:', {
        userId: session.user.id,
        sessionId: session.session.id,
      });
    } catch (error) {
      logWarn('🚨 JWT verification failed:', error);
    }

    return next();
  },
);
