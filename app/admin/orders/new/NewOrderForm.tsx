'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

export default function NewOrderForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      customerName: formData.get('customerName'),
      siteAddress: formData.get('siteAddress'),
      description: formData.get('description'),
      externalRef: formData.get('externalRef') || undefined,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create order');
      }

      const { order } = await res.json();
      router.push(`/admin/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '600px' }}>
        <Link href="/admin/orders" className="btn btn-secondary mb-lg">
          ← {t('app.back')}
        </Link>

        <div className="card">
          <div className="card-header">
            <h2>{t('orders.createNew')}</h2>
          </div>
          <div className="card-body">
            {error && (
              <div style={{ 
                padding: 'var(--space-md)', 
                background: 'var(--danger-light)', 
                color: 'var(--danger)', 
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-lg)'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">{t('orders.externalRef')}</label>
                <input
                  type="text"
                  name="externalRef"
                  className="form-input"
                  placeholder="e.g., ORD-0001"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('orders.customer')} *</label>
                <input
                  type="text"
                  name="customerName"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('orders.address')} *</label>
                <input
                  type="text"
                  name="siteAddress"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('orders.description')} *</label>
                <textarea
                  name="description"
                  required
                  rows={5}
                  className="form-textarea"
                />
              </div>

              <div className="flex gap-sm mt-lg">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg"
                >
                  {loading ? t('app.loading') : t('app.create')}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn btn-secondary btn-lg"
                >
                  {t('app.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
