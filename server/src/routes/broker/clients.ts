import { FastifyInstance } from 'fastify';
import prisma from '../../lib/prisma';
import { authMiddleware } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

export default async function clientRoutes(fastify: FastifyInstance) {
  // List clients
  fastify.get('/api/broker/clients', {
    preHandler: [authMiddleware, requireRole('BROKER', 'BROKER_ADMIN', 'INTERNAL')],
    schema: {
      description: 'List all clients for the broker organisation',
      tags: ['Broker - Clients'],
      querystring: {
        type: 'object',
        properties: {
          search: { type: 'string' },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      },
    },
  }, async (request, reply) => {
    const { search, page = 1, limit = 20 } = request.query as any;
    const organisationId = request.auth!.organisationId;

    const where: any = {
      organisationId: request.auth!.role === 'INTERNAL' ? undefined : organisationId,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              agreements: true,
              policies: true,
            },
          },
        },
      }),
      prisma.client.count({ where }),
    ]);

    return {
      data: clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  });

  // Get client by ID
  fastify.get('/api/broker/clients/:id', {
    preHandler: [authMiddleware, requireRole('BROKER', 'BROKER_ADMIN', 'INTERNAL')],
    schema: {
      description: 'Get client details by ID',
      tags: ['Broker - Clients'],
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

    const client = await prisma.client.findFirst({
      where: {
        id,
        organisationId: request.auth!.role === 'INTERNAL' ? undefined : organisationId,
      },
      include: {
        policies: true,
        agreements: {
          include: {
            policy: true,
          },
        },
      },
    });

    if (!client) {
      return reply.code(404).send({ error: 'Client not found' });
    }

    return client;
  });

  // Create client
  fastify.post('/api/broker/clients', {
    preHandler: [authMiddleware, requireRole('BROKER', 'BROKER_ADMIN')],
    schema: {
      description: 'Create a new client',
      tags: ['Broker - Clients'],
      body: {
        type: 'object',
        required: ['firstName', 'lastName', 'email'],
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          dob: { type: 'string', format: 'date' },
          address: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const data = request.body as any;
    const organisationId = request.auth!.organisationId;

    const client = await prisma.client.create({
      data: {
        ...data,
        organisationId,
        dob: data.dob ? new Date(data.dob) : undefined,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        organisationId,
        actorType: request.auth!.role,
        action: 'CREATE',
        entity: 'CLIENT',
        after: client,
      },
    });

    return reply.code(201).send(client);
  });
}
