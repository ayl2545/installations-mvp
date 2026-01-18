'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  createdAt: Date;
  updatedAt: Date;
}

export default function TeamsClient({ teams }: { teams: Team[] }) {
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
    <div>
      <div style={{ marginBottom: '30px', padding: '20px', background: '#f9f9f9', borderRadius: '5px' }}>
        <h2>Create New Team</h2>
        <form onSubmit={handleCreateTeam} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            value={teamForm.name}
            onChange={(e) => setTeamForm({ name: e.target.value })}
            placeholder="Team name"
            required
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', flex: 1 }}
          />
          <button
            type="submit"
            disabled={creatingTeam}
            style={{
              padding: '8px 16px',
              background: creatingTeam ? '#ccc' : '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: creatingTeam ? 'not-allowed' : 'pointer',
            }}
          >
            {creatingTeam ? 'Creating...' : 'Create Team'}
          </button>
        </form>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Team Name</th>
            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Installer</th>
            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.id}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{team.name}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                {team.installer ? (
                  <div>
                    <div><strong>{team.installer.name}</strong></div>
                    {team.installer.email && <div style={{ fontSize: '0.9em', color: '#666' }}>{team.installer.email}</div>}
                  </div>
                ) : (
                  <span style={{ color: '#999' }}>No installer</span>
                )}
              </td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                {!team.installer ? (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Installer name"
                      value={userForms[team.id]?.name || ''}
                      onChange={(e) =>
                        setUserForms({
                          ...userForms,
                          [team.id]: { ...(userForms[team.id] || { name: '', email: '' }), name: e.target.value },
                        })
                      }
                      style={{ padding: '5px', border: '1px solid #ddd', borderRadius: '4px', width: '150px' }}
                    />
                    <input
                      type="email"
                      placeholder="Email (optional)"
                      value={userForms[team.id]?.email || ''}
                      onChange={(e) =>
                        setUserForms({
                          ...userForms,
                          [team.id]: { ...(userForms[team.id] || { name: '', email: '' }), email: e.target.value },
                        })
                      }
                      style={{ padding: '5px', border: '1px solid #ddd', borderRadius: '4px', width: '150px' }}
                    />
                    <button
                      onClick={() => handleCreateUser(team.id)}
                      disabled={creatingUser[team.id]}
                      style={{
                        padding: '5px 10px',
                        background: creatingUser[team.id] ? '#ccc' : '#0070f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: creatingUser[team.id] ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {creatingUser[team.id] ? 'Creating...' : 'Create Installer'}
                    </button>
                  </div>
                ) : (
                  <span style={{ color: '#666' }}>Installer assigned</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {teams.length === 0 && (
        <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No teams yet. Create one above.</p>
      )}
    </div>
  );
}
