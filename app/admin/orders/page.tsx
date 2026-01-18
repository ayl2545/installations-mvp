import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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

  const where: { status?: string; assignedTeamId?: string } = {};
  if (status) {
    where.status = status;
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
      orderBy: { createdAt: 'desc' },
    }),
    prisma.team.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  return <OrdersPageClient orders={orders} teams={teams} />;
}
