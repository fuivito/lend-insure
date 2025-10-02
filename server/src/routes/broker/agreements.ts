import { FastifyInstance } from 'fastify';
import prisma from '../../lib/prisma';
import { authMiddleware } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

export default async function agreementRoutes(fastify: FastifyInstance) {
  // List agreements
  fastify.get('/api/broker/agreements', {
    preHandler: [authMiddleware, requireRole('BROKER', 'BROKER_ADMIN', 'INTERNAL')],
    schema: {
      description: 'List all agreements for the broker organisation',
      tags: ['Broker - Agreements'],
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['DRAFT', 'PROPOSED', 'SIGNED', 'ACTIVE', 'DEFAULTED', 'TERMINATED'] },
          clientId: { type: 'string' },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      },
    },
  }, async (request, reply) => {
    const { status, clientId, page = 1, limit = 20 } = request.query as any;
    const organisationId = request.auth!.organisationId;

    const where: any = {
      organisationId: request.auth!.role === 'INTERNAL' ? undefined : organisationId,
    };

    if (status) where.status = status;
    if (clientId) where.clientId = clientId;

    const [agreements, total] = await Promise.all([
      prisma.agreement.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: true,
          policy: true,
          _count: {
            select: {
              instalments: true,
              payments: true,
            },
          },
        },
      }),
      prisma.agreement.count({ where }),
    ]);

    return {
      data: agreements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  });

  // Get agreement by ID
  fastify.get('/api/broker/agreements/:id', {
    preHandler: [authMiddleware, requireRole('BROKER', 'BROKER_ADMIN', 'INTERNAL')],
    schema: {
      description: 'Get agreement details by ID',
      tags: ['Broker - Agreements'],
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

    const agreement = await prisma.agreement.findFirst({
      where: {
        id,
        organisationId: request.auth!.role === 'INTERNAL' ? undefined : organisationId,
      },
      include: {
        client: true,
        policy: true,
        instalments: {
          orderBy: { sequence: 'asc' },
        },
        payments: {
          orderBy: { collectedAt: 'desc' },
        },
        events: {
          orderBy: { createdAt: 'desc' },
        },
        documents: true,
        commissionLines: true,
      },
    });

    if (!agreement) {
      return reply.code(404).send({ error: 'Agreement not found' });
    }

    return agreement;
  });

  // Create draft agreement
  fastify.post('/api/broker/agreements', {
    preHandler: [authMiddleware, requireRole('BROKER', 'BROKER_ADMIN')],
    schema: {
      description: 'Create a new draft agreement with instalment schedule',
      tags: ['Broker - Agreements'],
      body: {
        type: 'object',
        required: ['clientId', 'policyId', 'principalAmount', 'aprBps', 'termMonths'],
        properties: {
          clientId: { type: 'string' },
          policyId: { type: 'string' },
          principalAmount: { type: 'number' },
          aprBps: { type: 'integer' },
          termMonths: { type: 'integer' },
          startDate: { type: 'string', format: 'date' },
        },
      },
    },
  }, async (request, reply) => {
    const data = request.body as any;
    const organisationId = request.auth!.organisationId;

    // Verify client and policy belong to organisation
    const [client, policy] = await Promise.all([
      prisma.client.findFirst({
        where: { id: data.clientId, organisationId },
      }),
      prisma.policy.findFirst({
        where: { id: data.policyId, organisationId },
      }),
    ]);

    if (!client || !policy) {
      return reply.code(404).send({ error: 'Client or policy not found' });
    }

    // Calculate instalment schedule
    const principalAmount = data.principalAmount;
    const termMonths = data.termMonths;
    const aprBps = data.aprBps;
    const monthlyRate = (aprBps / 10000) / 12;
    const monthlyPayment = principalAmount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -termMonths));

    const startDate = data.startDate ? new Date(data.startDate) : new Date();

    // Create agreement
    const agreement = await prisma.agreement.create({
      data: {
        organisationId,
        clientId: data.clientId,
        policyId: data.policyId,
        principalAmount,
        aprBps,
        termMonths,
        status: 'DRAFT',
        startDate,
        endDate: new Date(startDate.getTime() + termMonths * 30 * 24 * 60 * 60 * 1000),
        outstandingAmount: principalAmount,
      },
    });

    // Create instalments
    const instalments = [];
    for (let i = 0; i < termMonths; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      instalments.push({
        agreementId: agreement.id,
        sequence: i + 1,
        dueDate,
        amountDue: Math.round(monthlyPayment * 100) / 100,
        amountPaid: 0,
        status: 'UPCOMING' as const,
      });
    }

    await prisma.instalment.createMany({
      data: instalments,
    });

    // Log event
    await prisma.agreementEvent.create({
      data: {
        agreementId: agreement.id,
        type: 'AGREEMENT_CREATED',
        actorType: request.auth!.role,
        meta: {
          userId: request.auth!.userId,
        },
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        organisationId,
        actorType: request.auth!.role,
        action: 'CREATE',
        entity: 'AGREEMENT',
        after: agreement,
      },
    });

    return reply.code(201).send(agreement);
  });

  // Propose agreement
  fastify.post('/api/broker/agreements/:id/propose', {
    preHandler: [authMiddleware, requireRole('BROKER', 'BROKER_ADMIN')],
    schema: {
      description: 'Mark agreement as PROPOSED',
      tags: ['Broker - Agreements'],
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

    const agreement = await prisma.agreement.findFirst({
      where: {
        id,
        organisationId,
        status: 'DRAFT',
      },
    });

    if (!agreement) {
      return reply.code(404).send({ error: 'Agreement not found or not in DRAFT status' });
    }

    const updated = await prisma.agreement.update({
      where: { id },
      data: { status: 'PROPOSED' },
    });

    // Log event
    await prisma.agreementEvent.create({
      data: {
        agreementId: id,
        type: 'AGREEMENT_PROPOSED',
        actorType: request.auth!.role,
        meta: {
          userId: request.auth!.userId,
        },
      },
    });

    return updated;
  });
}
