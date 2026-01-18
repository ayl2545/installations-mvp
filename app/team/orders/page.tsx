import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

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
    orderBy: { createdAt: 'desc' },
  });

  const statuses = ['ASSIGNED', 'IN_PROGRESS', 'BLOCKED', 'DONE'];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>My Orders</h1>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <Link
          href="/team/orders"
          style={{
            padding: '5px 10px',
            background: !status ? '#0070f3' : '#f0f0f0',
            color: !status ? 'white' : 'black',
            textDecoration: 'none',
            borderRadius: '5px',
            border: '1px solid #ddd',
          }}
        >
          All
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/team/orders?status=${s}`}
            style={{
              padding: '5px 10px',
              background: status === s ? '#0070f3' : '#f0f0f0',
              color: status === s ? 'white' : 'black',
              textDecoration: 'none',
              borderRadius: '5px',
              border: '1px solid #ddd',
            }}
          >
            {s}
          </Link>
        ))}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Ref</th>
            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Customer</th>
            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Status</th>
            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Site Address</th>
            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{order.externalRef || '-'}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{order.customerName}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{order.status}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{order.siteAddress}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                <Link href={`/team/orders/${order.id}`} style={{ color: '#0070f3' }}>View</Link>
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
