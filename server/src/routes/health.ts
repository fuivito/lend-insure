import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';

export default async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', {
    schema: {
      description: 'Health check endpoint',
      tags: ['System'],
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            ts: { type: 'string' },
            database: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    let dbStatus = 'connected';
    
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      dbStatus = 'disconnected';
    }

    return {
      ok: dbStatus === 'connected',
      ts: new Date().toISOString(),
      database: dbStatus,
    };
  });
}
