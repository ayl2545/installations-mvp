import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OrdersPageClient from './OrdersPageClient';

export default async function TeamOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireAuth();
  
  if (user.role !== 'INSTALLER') {
    redirect('/admin/orders');
  }

  const params = await searchParams;
  const status = params.status;

  const where: { OR: Array<{ assignedUserId: string } | { assignedTeamId: string | null }>; status?: string } = {
    OR: [
      { assignedUserId: user.id },
      { assignedTeamId: user.teamId },
    ],
  };

  if (status) {
    where.status = status;
  }

  const orders = await prisma.order.findMany({
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
      { scheduledDate: 'asc' }, // Primary sort: by scheduled date
      { createdAt: 'desc' },    // Secondary sort: by creation date for orders without scheduled date
    ],
  });

  // Serialize dates for client component
  const serializedOrders = orders.map(order => ({
    ...order,
    scheduledDate: order.scheduledDate?.toISOString() || null,
  }));

  return <OrdersPageClient orders={serializedOrders} />;
}
