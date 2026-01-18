'use client';

import { useI18n } from '@/lib/i18n';

export default function HomeClient() {
  const { t } = useI18n();

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 60px)' }}>
      <div className="text-center">
        <div style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)' }}>🏭</div>
        <h1 className="page-title" style={{ marginBottom: 'var(--space-md)' }}>{t('app.title')}</h1>
        <p className="text-muted" style={{ fontSize: '1.125rem' }}>{t('msg.selectUserFirst')}</p>
      </div>
    </div>
  );
}
