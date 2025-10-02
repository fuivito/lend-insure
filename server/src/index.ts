import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import prisma from './lib/prisma';

// Routes
import healthRoutes from './routes/health';
import clientRoutes from './routes/broker/clients';
import policyRoutes from './routes/broker/policies';
import agreementRoutes from './routes/broker/agreements';
import dashboardRoutes from './routes/broker/dashboard';

const PORT = Number(process.env.PORT) || 3001;
const HOST = '0.0.0.0';

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'development' ? 'info' : 'warn',
  },
});

async function start() {
  try {
    // Register CORS
    await fastify.register(cors, {
      origin: true,
    });

    // Register Swagger
    await fastify.register(swagger, {
      openapi: {
        info: {
          title: 'Lendinsure Broker API',
          description: 'Backend service for broker operations',
          version: '1.0.0',
        },
        servers: [
          {
            url: `http://localhost:${PORT}`,
            description: 'Development server',
          },
        ],
        tags: [
          { name: 'System', description: 'System endpoints' },
          { name: 'Broker - Clients', description: 'Client management' },
          { name: 'Broker - Policies', description: 'Policy management' },
          { name: 'Broker - Agreements', description: 'Agreement management' },
          { name: 'Broker - Dashboard', description: 'Dashboard KPIs' },
        ],
      },
    });

    await fastify.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
      },
    });

    // Register routes
    await fastify.register(healthRoutes);
    await fastify.register(clientRoutes);
    await fastify.register(policyRoutes);
    await fastify.register(agreementRoutes);
    await fastify.register(dashboardRoutes);

    // Test database connection
    await prisma.$connect();
    fastify.log.info('✅ Database connected');

    // Start server
    await fastify.listen({ port: PORT, host: HOST });
    fastify.log.info(`🚀 Server ready at http://localhost:${PORT}`);
    fastify.log.info(`📚 API docs available at http://localhost:${PORT}/docs`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  fastify.log.info('Shutting down gracefully...');
  await prisma.$disconnect();
  await fastify.close();
  process.exit(0);
});

start();
