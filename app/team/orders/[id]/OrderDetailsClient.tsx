'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n, useStatusTranslation, useUpdateTypeTranslation } from '@/lib/i18n';

interface User {
  id: string;
  name: string;
  email: string | null;
}

interface JobUpdate {
  id: string;
  type: string;
  message: string;
  needs: string | null;
  createdAt: string;
  createdBy: { id: string; name: string };
}

interface Order {
  id: string;
  externalRef: string | null;
  customerName: string;
  siteAddress: string;
  description: string;
  status: string;
  assignedTeam: { id: string; name: string } | null;
  assignedUser: User | null;
  createdAt: string;
  updatedAt: string;
  updates: JobUpdate[];
}

export default function OrderDetailsClient({ order }: { order: Order }) {
  const { t, lang } = useI18n();
  const translateStatus = useStatusTranslation();
  const translateUpdateType = useUpdateTypeTranslation();
  const router = useRouter();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateForm, setUpdateForm] = useState({ type: 'NOTE', message: '', needs: '' });

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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  async function handleStatusChange(status: string) {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Failed to update status');
        return;
      }

      router.refresh();
    } catch {
      alert('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleAddUpdate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/orders/${order.id}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: updateForm.type,
          message: updateForm.message,
          needs: updateForm.needs || undefined,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Failed to add update');
        return;
      }

      setShowUpdateForm(false);
      setUpdateForm({ type: 'NOTE', message: '', needs: '' });
      router.refresh();
    } catch {
      alert('Failed to add update');
    }
  }

  return (
    <div className="page">
      <div className="container">
        <Link href="/team/orders" className="btn btn-secondary mb-lg">
          ← {t('app.back')}
        </Link>

        <div className="page-header">
          <div>
            <h1 className="page-title">{order.customerName}</h1>
            <p className="text-muted">{t('orders.externalRef')}: {order.externalRef || '-'}</p>
          </div>
          <span className={`badge ${getStatusClass(order.status)}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
            {translateStatus(order.status)}
          </span>
        </div>

        <div className="card mb-lg">
          <div className="card-header">
            <h3>{t('app.details')}</h3>
          </div>
          <div className="card-body">
            <div className="details-grid">
              <div className="details-item">
                <span className="details-label">{t('orders.customer')}</span>
                <span className="details-value">{order.customerName}</span>
              </div>
              <div className="details-item">
                <span className="details-label">{t('orders.address')}</span>
                <span className="details-value">{order.siteAddress}</span>
              </div>
              <div className="details-item">
                <span className="details-label">{t('orders.team')}</span>
                <span className="details-value">{order.assignedTeam?.name || t('orders.unassigned')}</span>
              </div>
              <div className="details-item">
                <span className="details-label">{t('orders.createdAt')}</span>
                <span className="details-value">{formatDate(order.createdAt)}</span>
              </div>
              <div className="details-item" style={{ gridColumn: '1 / -1' }}>
                <span className="details-label">{t('orders.description')}</span>
                <span className="details-value">{order.description}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Update Status */}
        <div className="card mb-lg">
          <div className="card-header">
            <h3>{t('orders.status')}</h3>
          </div>
          <div className="card-body">
            <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
              {['ASSIGNED', 'IN_PROGRESS', 'BLOCKED', 'DONE'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={updatingStatus || order.status === status}
                  className={`btn ${order.status === status ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {translateStatus(status)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Updates */}
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <h3>{t('updates.title')}</h3>
            <button
              onClick={() => setShowUpdateForm(!showUpdateForm)}
              className="btn btn-primary"
            >
              + {t('updates.add')}
            </button>
          </div>
          <div className="card-body">
            {showUpdateForm && (
              <form onSubmit={handleAddUpdate} className="card mb-lg" style={{ background: 'var(--background)' }}>
                <div className="card-body">
                  <div className="form-group">
                    <label className="form-label">{t('updates.type')}</label>
                    <select
                      className="form-select"
                      value={updateForm.type}
                      onChange={(e) => setUpdateForm({ ...updateForm, type: e.target.value })}
                    >
                      <option value="PROGRESS">{translateUpdateType('PROGRESS')}</option>
                      <option value="BLOCKER">{translateUpdateType('BLOCKER')}</option>
                      <option value="COMPLETE">{translateUpdateType('COMPLETE')}</option>
                      <option value="NOTE">{translateUpdateType('NOTE')}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('updates.message')} *</label>
                    <textarea
                      className="form-textarea"
                      value={updateForm.message}
                      onChange={(e) => setUpdateForm({ ...updateForm, message: e.target.value })}
                      required
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('updates.needs')}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={updateForm.needs}
                      onChange={(e) => setUpdateForm({ ...updateForm, needs: e.target.value })}
                      placeholder='e.g., ["Item 1", "Item 2"]'
                    />
                  </div>
                  <div className="flex gap-sm">
                    <button type="submit" className="btn btn-primary">
                      {t('updates.add')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowUpdateForm(false);
                        setUpdateForm({ type: 'NOTE', message: '', needs: '' });
                      }}
                      className="btn btn-secondary"
                    >
                      {t('app.cancel')}
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="timeline">
              {order.updates.map((update) => (
                <div key={update.id} className={`timeline-item ${update.type.toLowerCase()}`}>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="timeline-type">{translateUpdateType(update.type)}</span>
                      <span className="timeline-date">
                        {formatDate(update.createdAt)} • {update.createdBy.name}
                      </span>
                    </div>
                    <p className="timeline-message">{update.message}</p>
                    {update.needs && (
                      <div className="timeline-needs">
                        <strong>{t('updates.needs')}:</strong> {update.needs}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {order.updates.length === 0 && (
                <div className="empty-state">
                  <p>{t('updates.noUpdates')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
