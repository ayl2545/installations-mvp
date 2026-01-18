'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';

interface User {
  id: string;
  name: string;
  email: string | null;
  role: 'ADMIN' | 'INSTALLER';
  teamId: string | null;
}

export default function DevAuth() {
  const { t, lang, setLang } = useI18n();
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

  function toggleLang() {
    setLang(lang === 'en' ? 'he' : 'en');
  }

  function getRoleLabel(role: string) {
    return role === 'ADMIN' ? t('role.admin') : t('role.installer');
  }

  if (!mounted || loading) {
    return (
      <div className="dev-auth">
        <span>{t('app.loading')}</span>
      </div>
    );
  }

  return (
    <div className="dev-auth">
      <div className="dev-auth-left">
        <strong>🔧 {t('devAuth.title')}</strong>
        <select
          value={currentUser?.id || ''}
          onChange={(e) => handleLogin(e.target.value)}
        >
          <option value="">{t('devAuth.selectUser')}</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({getRoleLabel(user.role)})
            </option>
          ))}
        </select>
      </div>
      
      <div className="dev-auth-right">
        {currentUser && (
          <div className="dev-auth-user">
            <span>{t('devAuth.loggedAs')}:</span>
            <strong>{currentUser.name}</strong>
            <span className={`badge badge-${currentUser.role.toLowerCase()}`}>
              {getRoleLabel(currentUser.role)}
            </span>
          </div>
        )}
        <button className="lang-toggle" onClick={toggleLang}>
          {t('devAuth.switchLang')}
        </button>
      </div>
    </div>
  );
}
