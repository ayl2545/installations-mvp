import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@factory.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@factory.com',
      role: 'ADMIN',
    },
  });

  console.log('Created admin user:', admin.id);

  // Create teams and installer users
  const teams = [];
  const installers = [];

  for (let i = 1; i <= 3; i++) {
    // Find or create team
    let team = await prisma.team.findFirst({
      where: { name: `Team ${i}` },
      include: { orders: false },
    });

    if (!team) {
      team = await prisma.team.create({
        data: {
          name: `Team ${i}`,
        },
      });
    }

    // Upsert installer
    const installer = await prisma.user.upsert({
      where: { email: `installer${i}@factory.com` },
      update: {
        teamId: team.id,
      },
      create: {
        name: `Installer ${i}`,
        email: `installer${i}@factory.com`,
        role: 'INSTALLER',
        teamId: team.id,
      },
    });

    // Link installer to team (only if not already linked and installer is not linked to another team)
    const existingTeamWithInstaller = await prisma.team.findFirst({
      where: { installerUserId: installer.id },
    });

    if (!team.installerUserId && !existingTeamWithInstaller) {
      await prisma.team.update({
        where: { id: team.id },
        data: { installerUserId: installer.id },
      });
    } else if (existingTeamWithInstaller && existingTeamWithInstaller.id !== team.id) {
      // If installer is linked to another team, update that team to remove the link
      await prisma.team.update({
        where: { id: existingTeamWithInstaller.id },
        data: { installerUserId: null },
      });
      // Then link to current team
      await prisma.team.update({
        where: { id: team.id },
        data: { installerUserId: installer.id },
      });
    }

    teams.push(team);
    installers.push(installer);
  }

  console.log('Created teams and installers');

  // Create orders
  const orders = [];
  const statuses: Array<'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE'> = [
    'NEW',
    'NEW',
    'ASSIGNED',
    'ASSIGNED',
    'IN_PROGRESS',
    'IN_PROGRESS',
    'IN_PROGRESS',
    'BLOCKED',
    'BLOCKED',
    'DONE',
    'DONE',
    'ASSIGNED',
    'IN_PROGRESS',
    'NEW',
    'NEW',
    'DONE',
    'IN_PROGRESS',
    'BLOCKED',
    'ASSIGNED',
    'NEW',
  ];

  const customers = [
    'ABC Manufacturing',
    'XYZ Industries',
    'Metal Works Inc',
    'Steel Solutions',
    'Industrial Corp',
    'Factory Systems',
    'Production Co',
    'Manufacturing Ltd',
    'Industrial Works',
    'Steel Factory',
    'Metal Corp',
    'Production Systems',
    'Factory Solutions',
    'Industrial Co',
    'Steel Works',
    'Manufacturing Inc',
    'Metal Industries',
    'Factory Corp',
    'Production Works',
    'Steel Systems',
  ];

  const addresses = [
    '123 Industrial Ave, City A',
    '456 Factory St, City B',
    '789 Production Rd, City C',
    '321 Manufacturing Blvd, City D',
    '654 Steel Way, City E',
    '987 Metal Lane, City F',
    '147 Industrial Park, City G',
    '258 Factory Drive, City H',
    '369 Production Ave, City I',
    '741 Manufacturing St, City J',
    '852 Steel Rd, City K',
    '963 Metal Blvd, City L',
    '159 Industrial Way, City M',
    '357 Factory Lane, City N',
    '468 Production Park, City O',
    '579 Manufacturing Drive, City P',
    '680 Steel Ave, City Q',
    '791 Metal St, City R',
    '802 Industrial Rd, City S',
    '913 Factory Blvd, City T',
  ];

  for (let i = 0; i < 20; i++) {
    const status = statuses[i];
    const isAssigned = status !== 'NEW';
    const assignedTeam = isAssigned ? teams[i % teams.length] : null;
    const assignedUser = assignedTeam ? installers[i % installers.length] : null;

    const order = await prisma.order.create({
      data: {
        externalRef: `ORD-${String(i + 1).padStart(4, '0')}`,
        customerName: customers[i],
        siteAddress: addresses[i],
        description: `Installation work for ${customers[i]} at ${addresses[i]}. Includes equipment setup, wiring, and testing.`,
        status,
        assignedTeamId: assignedTeam?.id,
        assignedUserId: assignedUser?.id,
      },
    });

    orders.push(order);
  }

  console.log('Created orders');

  // Create job updates for some orders
  const updateTypes: Array<'PROGRESS' | 'BLOCKER' | 'COMPLETE' | 'NOTE'> = [
    'PROGRESS',
    'BLOCKER',
    'COMPLETE',
    'NOTE',
    'PROGRESS',
    'BLOCKER',
    'PROGRESS',
    'NOTE',
    'COMPLETE',
    'PROGRESS',
  ];

  const messages = [
    'Started installation work',
    'Encountered issue with wiring',
    'Installation completed successfully',
    'Site visit scheduled',
    'Equipment delivered and inspected',
    'Waiting for customer approval',
    'Progress update: 50% complete',
    'Additional materials needed',
    'Final inspection passed',
    'Work resumed after delay',
  ];

  const needs = [
    null,
    '["Additional wiring", "Customer approval"]',
    null,
    null,
    null,
    '["Customer signature", "Safety clearance"]',
    null,
    '["Extra cables", "Mounting brackets"]',
    null,
    null,
  ];

  // Add updates to assigned/in-progress orders
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    if (order.status !== 'NEW' && i < updateTypes.length) {
      const installer = installers[i % installers.length];
      const updateType = updateTypes[i % updateTypes.length];
      const message = messages[i % messages.length];
      
      // Check if update already exists (avoid duplicates)
      const existingUpdate = await prisma.jobUpdate.findFirst({
        where: {
          orderId: order.id,
          createdByUserId: installer.id,
          type: updateType,
          message: message,
        },
      });

      if (!existingUpdate) {
        await prisma.jobUpdate.create({
          data: {
            orderId: order.id,
            createdByUserId: installer.id,
            type: updateType,
            message: message,
            needs: needs[i % needs.length],
          },
        });
      }
    }
  }

  console.log('Created job updates');
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
