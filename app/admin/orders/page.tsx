import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import OrdersFilters from './OrdersFilters';

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

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Orders</h1>
        <Link href="/admin/orders/new" style={{
          padding: '10px 20px',
          background: '#0070f3',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px',
        }}>
          New Order
        </Link>
      </div>

      <OrdersFilters teams={teams} />

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Ref</th>
            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Customer</th>
            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Status</th>
            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Team</th>
            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Installer</th>
            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{order.externalRef || '-'}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{order.customerName}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{order.status}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{order.assignedTeam?.name || '-'}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{order.assignedUser?.name || '-'}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                <Link href={`/admin/orders/${order.id}`} style={{ color: '#0070f3' }}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {orders.length === 0 && (
        <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No orders found</p>
      )}
    </div>
  );
}
