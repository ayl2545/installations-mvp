import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import OrdersPageClient from './OrdersPageClient';

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; teamId?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const status = params.status;
  const teamId = params.teamId;

  const where: Prisma.OrderWhereInput = {};
  if (status) {
    where.status = status as Prisma.OrderWhereInput['status'];
  }
  if (teamId) {
    where.assignedTeamId = teamId;
  }

  const [orders, teams] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        assignedTeam: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { scheduledDate: 'asc' },
        { createdAt: 'desc' },
      ],
    }),
    prisma.team.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  // Serialize dates for client component
  const serializedOrders = orders.map((order: typeof orders[number]) => ({
    ...order,
    scheduledDate: order.scheduledDate?.toISOString() || null,
  }));

  return <OrdersPageClient orders={serializedOrders} teams={teams} />;
}
