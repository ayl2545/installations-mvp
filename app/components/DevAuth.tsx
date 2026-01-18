'use client';

import { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string | null;
  role: 'ADMIN' | 'INSTALLER';
  teamId: string | null;
}

export default function DevAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadUsers();
    loadCurrentUser();
  }, []);

  async function loadCurrentUser() {
    try {
      const res = await fetch('/api/me');
      const data = await res.json();
      setCurrentUser(data.user);
    } catch (error) {
      console.error('Failed to load current user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers() {
    try {
      // We'll need to create an API endpoint to get all users for dev auth
      // For now, we'll fetch from a simple endpoint
      const res = await fetch('/api/dev-users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  }

  async function handleLogin(userId: string) {
    try {
      const res = await fetch('/api/dev-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to login:', error);
    }
  }

  // Prevent hydration mismatch by showing same content on server and client initially
  if (!mounted || loading) {
    return <div style={{ padding: '10px', background: '#f0f0f0' }}>Loading...</div>;
  }

  return (
    <div style={{
      padding: '10px',
      background: '#f0f0f0',
      borderBottom: '1px solid #ccc',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    }}>
      <strong>Dev Auth:</strong>
      <select
        value={currentUser?.id || ''}
        onChange={(e) => handleLogin(e.target.value)}
        style={{ padding: '5px' }}
      >
        <option value="">Select user...</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name} ({user.role})
          </option>
        ))}
      </select>
      {currentUser && (
        <span style={{ marginLeft: '10px' }}>
          Logged in as: <strong>{currentUser.name}</strong> ({currentUser.role})
        </span>
      )}
    </div>
  );
}
