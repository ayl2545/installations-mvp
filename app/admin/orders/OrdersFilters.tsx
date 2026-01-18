'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useI18n, useStatusTranslation } from '@/lib/i18n';

interface Team {
  id: string;
  name: string;
}

export default function OrdersFilters({ teams }: { teams: Team[] }) {
  const { t } = useI18n();
  const translateStatus = useStatusTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status') || '';
  const teamId = searchParams.get('teamId') || '';

  const statuses = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'BLOCKED', 'DONE'];

  function handleStatusChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('status', value);
    } else {
      params.delete('status');
    }
    router.push(`/admin/orders?${params.toString()}`);
  }

  function handleTeamChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('teamId', value);
    } else {
      params.delete('teamId');
    }
    router.push(`/admin/orders?${params.toString()}`);
  }

  return (
    <div className="filters-bar">
      <div className="filter-group">
        <label>{t('orders.filterByStatus')}</label>
        <select
          className="form-select"
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          style={{ minWidth: '150px' }}
        >
          <option value="">{t('app.all')}</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{translateStatus(s)}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>{t('orders.filterByTeam')}</label>
        <select
          className="form-select"
          value={teamId}
          onChange={(e) => handleTeamChange(e.target.value)}
          style={{ minWidth: '150px' }}
        >
          <option value="">{t('app.all')}</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
