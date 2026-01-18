'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

interface Installer {
  id: string;
  name: string;
  email: string | null;
}

interface Team {
  id: string;
  name: string;
  installerUserId: string | null;
  installer: Installer | null;
  createdAt: string;
  updatedAt: string;
}

export default function TeamsClient({ teams }: { teams: Team[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [creatingUser, setCreatingUser] = useState<{ [teamId: string]: boolean }>({});
  const [teamForm, setTeamForm] = useState({ name: '' });
  const [userForms, setUserForms] = useState<{ [teamId: string]: { name: string; email: string } }>({});

  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    setCreatingTeam(true);
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: teamForm.name }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Failed to create team');
        return;
      }

      setTeamForm({ name: '' });
      router.refresh();
    } catch {
      alert('Failed to create team');
    } finally {
      setCreatingTeam(false);
    }
  }

  async function handleCreateUser(teamId: string) {
    const form = userForms[teamId] || { name: '', email: '' };
    if (!form.name) {
      alert('Name is required');
      return;
    }

    setCreatingUser({ ...creatingUser, [teamId]: true });
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email || undefined,
          teamId,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Failed to create user');
        return;
      }

      setUserForms({ ...userForms, [teamId]: { name: '', email: '' } });
      router.refresh();
    } catch {
      alert('Failed to create user');
    } finally {
      setCreatingUser({ ...creatingUser, [teamId]: false });
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">{t('teams.title')}</h1>
          <Link href="/admin/orders" className="btn btn-secondary">
            {t('orders.title')}
          </Link>
        </div>

        {/* Create Team Form */}
        <div className="card mb-lg">
          <div className="card-header">
            <h3>{t('teams.createTeam')}</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateTeam} className="flex gap-md items-center">
              <input
                type="text"
                value={teamForm.name}
                onChange={(e) => setTeamForm({ name: e.target.value })}
                placeholder={t('teams.name')}
                required
                className="form-input"
                style={{ flex: 1, maxWidth: '400px' }}
              />
              <button
                type="submit"
                disabled={creatingTeam}
                className="btn btn-primary"
              >
                {creatingTeam ? t('app.loading') : t('teams.createTeam')}
              </button>
            </form>
          </div>
        </div>

        {/* Teams Table */}
        {teams.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('teams.name')}</th>
                  <th>{t('teams.installer')}</th>
                  <th>{t('app.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team.id}>
                    <td>
                      <span className="font-medium">{team.name}</span>
                    </td>
                    <td>
                      {team.installer ? (
                        <div>
                          <div className="font-medium">{team.installer.name}</div>
                          {team.installer.email && (
                            <div className="text-sm text-muted">{team.installer.email}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      {!team.installer ? (
                        <div className="flex gap-sm items-center" style={{ flexWrap: 'wrap' }}>
                          <input
                            type="text"
                            placeholder={t('teams.installerName')}
                            value={userForms[team.id]?.name || ''}
                            onChange={(e) =>
                              setUserForms({
                                ...userForms,
                                [team.id]: { ...(userForms[team.id] || { name: '', email: '' }), name: e.target.value },
                              })
                            }
                            className="form-input"
                            style={{ width: '150px' }}
                          />
                          <input
                            type="email"
                            placeholder={t('teams.installerEmail')}
                            value={userForms[team.id]?.email || ''}
                            onChange={(e) =>
                              setUserForms({
                                ...userForms,
                                [team.id]: { ...(userForms[team.id] || { name: '', email: '' }), email: e.target.value },
                              })
                            }
                            className="form-input"
                            style={{ width: '180px' }}
                          />
                          <button
                            onClick={() => handleCreateUser(team.id)}
                            disabled={creatingUser[team.id]}
                            className="btn btn-sm btn-primary"
                          >
                            {creatingUser[team.id] ? t('app.loading') : t('teams.createInstaller')}
                          </button>
                        </div>
                      ) : (
                        <span className="badge badge-installer">{t('teams.installer')}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <p>{t('teams.noTeams')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
