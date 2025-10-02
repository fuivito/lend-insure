import { FastifyInstance } from 'fastify';
import prisma from '../../lib/prisma';
import { authMiddleware } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

export default async function policyRoutes(fastify: FastifyInstance) {
  // Create policy
  fastify.post('/api/broker/policies', {
    preHandler: [authMiddleware, requireRole('BROKER', 'BROKER_ADMIN')],
    schema: {
      description: 'Create a new policy for a client',
      tags: ['Broker - Policies'],
      body: {
        type: 'object',
        required: ['clientId', 'insurerName', 'productType', 'policyNumber', 'inceptionDate', 'expiryDate', 'grossPremium'],
        properties: {
          clientId: { type: 'string' },
          insurerName: { type: 'string' },
          productType: { type: 'string' },
          policyNumber: { type: 'string' },
          inceptionDate: { type: 'string', format: 'date' },
          expiryDate: { type: 'string', format: 'date' },
          grossPremium: { type: 'number' },
        },
      },
    },
  }, async (request, reply) => {
    const data = request.body as any;
    const organisationId = request.auth!.organisationId;

    // Verify client belongs to organisation
    const client = await prisma.client.findFirst({
      where: {
        id: data.clientId,
        organisationId,
      },
    });

    if (!client) {
      return reply.code(404).send({ error: 'Client not found' });
    }

    const policy = await prisma.policy.create({
      data: {
        organisationId,
        clientId: data.clientId,
        insurerName: data.insurerName,
        productType: data.productType,
        policyNumber: data.policyNumber,
        inceptionDate: new Date(data.inceptionDate),
        expiryDate: new Date(data.expiryDate),
        grossPremium: data.grossPremium,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        organisationId,
        actorType: request.auth!.role,
        action: 'CREATE',
        entity: 'POLICY',
        after: policy,
      },
    });

    return reply.code(201).send(policy);
  });

  // Get policy by ID
  fastify.get('/api/broker/policies/:id', {
    preHandler: [authMiddleware, requireRole('BROKER', 'BROKER_ADMIN', 'INTERNAL')],
    schema: {
      description: 'Get policy details by ID',
      tags: ['Broker - Policies'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const organisationId = request.auth!.organisationId;

    const policy = await prisma.policy.findFirst({
      where: {
        id,
        organisationId: request.auth!.role === 'INTERNAL' ? undefined : organisationId,
      },
      include: {
        client: true,
        agreements: true,
      },
    });

    if (!policy) {
      return reply.code(404).send({ error: 'Policy not found' });
    }

    return policy;
  });
}
