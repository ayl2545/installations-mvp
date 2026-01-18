'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useI18n, useStatusTranslation } from '@/lib/i18n';

interface Order {
  id: string;
  externalRef: string | null;
  customerName: string;
  siteAddress: string;
  status: string;
  assignedTeam: { id: string; name: string } | null;
  assignedUser: { id: string; name: string } | null;
}

export default function OrdersPageClient({ orders }: { orders: Order[] }) {
  const { t } = useI18n();
  const translateStatus = useStatusTranslation();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status') || '';

  const statuses = ['ASSIGNED', 'IN_PROGRESS', 'BLOCKED', 'DONE'];

  const getStatusClass = (status: string) => {
    const statusMap: Record<string, string> = {
      'NEW': 'badge-new',
      'ASSIGNED': 'badge-assigned',
      'IN_PROGRESS': 'badge-in-progress',
      'BLOCKED': 'badge-blocked',
      'DONE': 'badge-done',
    };
    return statusMap[status] || '';
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">{t('orders.myOrders')}</h1>
        </div>

        {/* Status Filter */}
        <div className="filters-bar">
          <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
            <Link
              href="/team/orders"
              className={`btn ${!currentStatus ? 'btn-primary' : 'btn-secondary'}`}
            >
              {t('app.all')}
            </Link>
            {statuses.map((s) => (
              <Link
                key={s}
                href={`/team/orders?status=${s}`}
                className={`btn ${currentStatus === s ? 'btn-primary' : 'btn-secondary'}`}
              >
                {translateStatus(s)}
              </Link>
            ))}
          </div>
        </div>

        {orders.length > 0 ? (
          <div className="grid-2">
            {orders.map((order) => (
              <Link key={order.id} href={`/team/orders/${order.id}`} style={{ textDecoration: 'none' }}>
                <div className="order-card">
                  <div className="order-card-header">
                    <div>
                      <div className="order-card-title">{order.customerName}</div>
                      <div className="order-card-ref">{order.externalRef || '-'}</div>
                    </div>
                    <span className={`badge ${getStatusClass(order.status)}`}>
                      {translateStatus(order.status)}
                    </span>
                  </div>
                  <p className="order-card-address">{order.siteAddress}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <p>{t('orders.noOrders')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
