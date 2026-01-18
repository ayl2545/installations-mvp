import { redirect } from 'next/navigation';
import { requireOrderAccess } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
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

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Link href="/team/orders" style={{ color: '#0070f3', textDecoration: 'none' }}>
        ← Back to Orders
      </Link>

      <h1>Order Details</h1>

      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '5px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <strong>External Ref:</strong> {order.externalRef || '-'}
          </div>
          <div>
            <strong>Status:</strong> {order.status}
          </div>
          <div>
            <strong>Customer:</strong> {order.customerName}
          </div>
          <div>
            <strong>Site Address:</strong> {order.siteAddress}
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <strong>Description:</strong> {order.description}
          </div>
          <div>
            <strong>Assigned Team:</strong> {order.assignedTeam?.name || 'Not assigned'}
          </div>
          <div>
            <strong>Assigned Installer:</strong> {order.assignedUser?.name || 'Not assigned'}
          </div>
          <div>
            <strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}
          </div>
          <div>
            <strong>Updated:</strong> {new Date(order.updatedAt).toLocaleString()}
          </div>
        </div>
      </div>

      <OrderDetailsClient order={order} />
    </div>
  );
}
