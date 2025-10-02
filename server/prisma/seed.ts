import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create organisation
  const org = await prisma.organisation.create({
    data: {
      name: 'Demo Insurance Brokers Ltd',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Created organisation:', org.name);

  // Create broker admin
  const brokerAdmin = await prisma.brokerUser.create({
    data: {
      organisationId: org.id,
      role: 'BROKER_ADMIN',
      email: 'admin@demobroker.com',
      name: 'Sarah Johnson',
    },
  });
  console.log('✅ Created broker admin:', brokerAdmin.email);

  // Create broker
  const broker = await prisma.brokerUser.create({
    data: {
      organisationId: org.id,
      role: 'BROKER',
      email: 'broker@demobroker.com',
      name: 'Michael Smith',
    },
  });
  console.log('✅ Created broker:', broker.email);

  // Create client
  const client = await prisma.client.create({
    data: {
      organisationId: org.id,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+44 20 7123 4567',
      dob: new Date('1985-06-15'),
      address: '123 High Street, London, SW1A 1AA',
    },
  });
  console.log('✅ Created client:', `${client.firstName} ${client.lastName}`);

  // Create policy
  const policy = await prisma.policy.create({
    data: {
      organisationId: org.id,
      clientId: client.id,
      insurerName: 'Aviva',
      productType: 'Motor',
      policyNumber: 'POL-2024-001',
      inceptionDate: new Date('2024-01-01'),
      expiryDate: new Date('2024-12-31'),
      grossPremium: 1200.00,
    },
  });
  console.log('✅ Created policy:', policy.policyNumber);

  // Create agreement
  const principalAmount = 1200.00;
  const termMonths = 12;
  const aprBps = 995; // 9.95%
  const monthlyRate = (aprBps / 10000) / 12;
  const monthlyPayment = principalAmount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -termMonths));
  
  const agreement = await prisma.agreement.create({
    data: {
      organisationId: org.id,
      clientId: client.id,
      policyId: policy.id,
      principalAmount,
      aprBps,
      termMonths,
      status: 'ACTIVE',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      outstandingAmount: principalAmount,
    },
  });
  console.log('✅ Created agreement:', agreement.id);

  // Create instalments
  const instalments = [];
  for (let i = 0; i < termMonths; i++) {
    const dueDate = new Date('2024-01-01');
    dueDate.setMonth(dueDate.getMonth() + i);
    
    instalments.push({
      agreementId: agreement.id,
      sequence: i + 1,
      dueDate,
      amountDue: Math.round(monthlyPayment * 100) / 100,
      amountPaid: i < 3 ? Math.round(monthlyPayment * 100) / 100 : 0,
      status: i < 3 ? 'PAID' : 'UPCOMING' as const,
    });
  }

  await prisma.instalment.createMany({
    data: instalments,
  });
  console.log(`✅ Created ${instalments.length} instalments`);

  // Create agreement event
  await prisma.agreementEvent.create({
    data: {
      agreementId: agreement.id,
      type: 'AGREEMENT_CREATED',
      actorType: 'BROKER',
      meta: {
        brokerId: broker.id,
        brokerName: broker.name,
      },
    },
  });

  // Create commission line
  await prisma.commissionLine.create({
    data: {
      agreementId: agreement.id,
      type: 'ORIGINATION',
      amount: 60.00, // 5% of principal
      currency: 'GBP',
    },
  });

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
