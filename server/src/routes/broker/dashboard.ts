import { FastifyInstance } from 'fastify';
import prisma from '../../lib/prisma';
import { authMiddleware } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

export default async function dashboardRoutes(fastify: FastifyInstance) {
  fastify.get('/api/broker/dashboard', {
    preHandler: [authMiddleware, requireRole('BROKER', 'BROKER_ADMIN', 'INTERNAL')],
    schema: {
      description: 'Get broker dashboard KPIs',
      tags: ['Broker - Dashboard'],
    },
  }, async (request, reply) => {
    const organisationId = request.auth!.organisationId;
    const isInternal = request.auth!.role === 'INTERNAL';

    const where = isInternal ? {} : { organisationId };

    // Get agreement counts
    const [activeCount, defaultedCount, terminatedCount, allAgreements] = await Promise.all([
      prisma.agreement.count({
        where: { ...where, status: 'ACTIVE' },
      }),
      prisma.agreement.count({
        where: { ...where, status: 'DEFAULTED' },
      }),
      prisma.agreement.count({
        where: { ...where, status: 'TERMINATED' },
      }),
      prisma.agreement.findMany({
        where: {
          ...where,
          status: { in: ['ACTIVE', 'SIGNED'] },
          startDate: {
            gte: new Date(new Date().getFullYear(), 0, 1), // Start of current year
          },
        },
        include: {
          commissionLines: true,
        },
      }),
    ]);

    // Calculate YTD revenue from commission lines
    const revenueYTD = allAgreements.reduce((sum, agreement) => {
      const commissionTotal = agreement.commissionLines.reduce(
        (lineSum, line) => lineSum + Number(line.amount),
        0
      );
      return sum + commissionTotal;
    }, 0);

    // Get recent notifications (recent events)
    const recentEvents = await prisma.agreementEvent.findMany({
      where: isInternal ? {} : {
        agreement: { organisationId },
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        agreement: {
          include: {
            client: true,
          },
        },
      },
    });

    const notifications = recentEvents.map(event => ({
      id: event.id,
      type: event.type,
      message: formatEventMessage(event.type, event.agreement.client),
      timestamp: event.createdAt,
      agreementId: event.agreementId,
    }));

    return {
      activeAgreements: activeCount,
      defaults: defaultedCount,
      terminated: terminatedCount,
      revenueYTD,
      notifications,
    };
  });
}

function formatEventMessage(eventType: string, client: any): string {
  const clientName = `${client.firstName} ${client.lastName}`;
  
  switch (eventType) {
    case 'AGREEMENT_CREATED':
      return `New agreement created for ${clientName}`;
    case 'AGREEMENT_PROPOSED':
      return `Agreement proposed to ${clientName}`;
    case 'AGREEMENT_SIGNED':
      return `${clientName} signed their agreement`;
    case 'PAYMENT_RECEIVED':
      return `Payment received from ${clientName}`;
    case 'PAYMENT_MISSED':
      return `Payment missed by ${clientName}`;
    default:
      return `Event: ${eventType} for ${clientName}`;
  }
}
