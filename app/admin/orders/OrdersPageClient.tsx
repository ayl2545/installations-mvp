'use client';

import Link from 'next/link';
import { useI18n, useStatusTranslation } from '@/lib/i18n';
import OrdersFilters from './OrdersFilters';

interface Order {
  id: string;
  externalRef: string | null;
  customerName: string;
  siteAddress: string;
  status: string;
  scheduledDate: string | null;
  estimatedDays: number | null;
  assignedTeam: { id: string; name: string } | null;
  assignedUser: { id: string; name: string } | null;
}

interface Team {
  id: string;
  name: string;
}

export default function OrdersPageClient({ 
  orders, 
  teams 
}: { 
  orders: Order[]; 
  teams: Team[];
}) {
  const { t, lang } = useI18n();
  const translateStatus = useStatusTranslation();

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

  const formatDateOnly = (date: string) => {
    return new Date(date).toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">{t('orders.title')}</h1>
          <div className="page-actions">
            <Link href="/admin/teams" className="btn btn-secondary">
              {t('teams.title')}
            </Link>
            <Link href="/admin/orders/new" className="btn btn-primary">
              + {t('orders.new')}
            </Link>
          </div>
        </div>

        <OrdersFilters teams={teams} />

        {orders.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('orders.externalRef')}</th>
                  <th>{t('orders.customer')}</th>
                  <th>{t('orders.scheduledDate')}</th>
                  <th>{t('orders.status')}</th>
                  <th>{t('orders.team')}</th>
                  <th>{t('app.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span className="font-medium">{order.externalRef || '-'}</span>
                    </td>
                    <td>
                      <div>{order.customerName}</div>
                      <div className="text-muted text-sm">{order.siteAddress}</div>
                    </td>
                    <td>
                      {order.scheduledDate ? (
                        <div>
                          <div className="font-medium">{formatDateOnly(order.scheduledDate)}</div>
                          {order.estimatedDays && (
                            <div className="text-muted text-sm">{order.estimatedDays} {t('orders.days')}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${getStatusClass(order.status)}`}>
                        {translateStatus(order.status)}
                      </span>
                    </td>
                    <td>
                      <div>{order.assignedTeam?.name || '-'}</div>
                      {order.assignedUser && (
                        <div className="text-muted text-sm">{order.assignedUser.name}</div>
                      )}
                    </td>
                    <td>
                      <Link href={`/admin/orders/${order.id}`} className="btn btn-sm btn-secondary">
                        {t('app.view')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
