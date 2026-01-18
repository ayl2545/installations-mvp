import { redirect } from 'next/navigation';
import { requireOrderAccess } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OrderDetailsClient from './OrderDetailsClient';

export default async function TeamOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOrderAccess((await params).id);
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
    redirect('/team/orders');
  }

  // Serialize dates for client component
  const serializedOrder = {
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    updates: order.updates.map(u => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    })),
  };

  return <OrderDetailsClient order={serializedOrder} />;
}
