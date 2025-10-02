import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthContext } from './auth';

type Role = 'BROKER' | 'BROKER_ADMIN' | 'INTERNAL';

export function requireRole(...allowedRoles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.auth) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(request.auth.role)) {
      return reply.code(403).send({
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
    }
  };
}

export function requireOrganisation(request: FastifyRequest, organisationId: string) {
  if (!request.auth) {
    return false;
  }

  // INTERNAL role can access all organisations
  if (request.auth.role === 'INTERNAL') {
    return true;
  }

  // Other roles can only access their own organisation
  return request.auth.organisationId === organisationId;
}
