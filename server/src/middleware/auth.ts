import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

export interface AuthContext {
  userId: string;
  organisationId: string;
  role: 'BROKER' | 'BROKER_ADMIN' | 'INTERNAL';
}

declare module 'fastify' {
  interface FastifyRequest {
    auth?: AuthContext;
  }
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Development mode: allow dev headers
  if (process.env.NODE_ENV === 'development') {
    const userId = request.headers['x-user-id'] as string;
    const organisationId = request.headers['x-org-id'] as string;
    const role = request.headers['x-role'] as string;

    if (userId && organisationId && role) {
      request.auth = {
        userId,
        organisationId,
        role: role as AuthContext['role'],
      };
      return;
    }
  }

  // JWT authentication
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Missing or invalid authorization header',
    });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthContext;
    request.auth = decoded;
  } catch (error) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
}
