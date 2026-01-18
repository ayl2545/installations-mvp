import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OrderDetailsClient from './OrderDetailsClient';

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
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
          email: true,
        },
      },
      updates: {
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!order) {
    redirect('/admin/orders');
  }

  const teams = await prisma.team.findMany({
    where: {
      installerUserId: { not: null },
    },
    orderBy: { name: 'asc' },
  });

  // Serialize dates for client component
  const serializedOrder = {
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    scheduledDate: order.scheduledDate?.toISOString() || null,
    updates: order.updates.map(u => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    })),
  };

  return <OrderDetailsClient order={serializedOrder} teams={teams} />;
}
