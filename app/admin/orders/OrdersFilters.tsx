'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface Team {
  id: string;
  name: string;
}

export default function OrdersFilters({ teams }: { teams: Team[] }) {
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
    <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      <select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value)}
        style={{ padding: '5px' }}
      >
        <option value="">All Statuses</option>
        {statuses.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        value={teamId}
        onChange={(e) => handleTeamChange(e.target.value)}
        style={{ padding: '5px' }}
      >
        <option value="">All Teams</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>{team.name}</option>
        ))}
      </select>
    </div>
  );
}
