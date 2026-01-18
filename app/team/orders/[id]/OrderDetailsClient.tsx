'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
}

interface JobUpdate {
  id: string;
  type: string;
  message: string;
  needs: string | null;
  createdAt: string;
  createdBy: User;
}

interface Order {
  id: string;
  status: string;
  updates: JobUpdate[];
}

export default function OrderDetailsClient({ order }: { order: Order }) {
  const router = useRouter();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateForm, setUpdateForm] = useState({ type: 'NOTE', message: '', needs: '' });

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
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h2>Update Status</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['ASSIGNED', 'IN_PROGRESS', 'BLOCKED', 'DONE'].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={updatingStatus || order.status === status}
              style={{
                padding: '8px 16px',
                background: order.status === status ? '#0070f3' : '#f0f0f0',
                color: order.status === status ? 'white' : 'black',
                border: '1px solid #ddd',
                borderRadius: '5px',
                cursor: updatingStatus ? 'not-allowed' : 'pointer',
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2>Updates</h2>
          <button
            onClick={() => setShowUpdateForm(!showUpdateForm)}
            style={{
              padding: '8px 16px',
              background: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Add Update
          </button>
        </div>

        {showUpdateForm && (
          <form onSubmit={handleAddUpdate} style={{ marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '5px' }}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Type</label>
              <select
                value={updateForm.type}
                onChange={(e) => setUpdateForm({ ...updateForm, type: e.target.value })}
                style={{ width: '100%', padding: '5px' }}
              >
                <option value="PROGRESS">PROGRESS</option>
                <option value="BLOCKER">BLOCKER</option>
                <option value="COMPLETE">COMPLETE</option>
                <option value="NOTE">NOTE</option>
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Message *</label>
              <textarea
                value={updateForm.message}
                onChange={(e) => setUpdateForm({ ...updateForm, message: e.target.value })}
                required
                rows={3}
                style={{ width: '100%', padding: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Needs (optional, for BLOCKER)</label>
              <input
                type="text"
                value={updateForm.needs}
                onChange={(e) => setUpdateForm({ ...updateForm, needs: e.target.value })}
                placeholder='e.g., ["Item 1", "Item 2"] or free text'
                style={{ width: '100%', padding: '5px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{
                  padding: '8px 16px',
                  background: '#0070f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Add Update
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUpdateForm(false);
                  setUpdateForm({ type: 'NOTE', message: '', needs: '' });
                }}
                style={{
                  padding: '8px 16px',
                  background: '#f0f0f0',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {order.updates.map((update) => (
            <div key={update.id} style={{ padding: '15px', background: '#f9f9f9', borderRadius: '5px', border: '1px solid #ddd' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <strong>{update.type}</strong>
                <span style={{ color: '#666', fontSize: '0.9em' }}>
                  {new Date(update.createdAt).toLocaleString()} by {update.createdBy.name}
                </span>
              </div>
              <div style={{ marginBottom: '5px' }}>{update.message}</div>
              {update.needs && (
                <div style={{ padding: '5px', background: '#fff3cd', borderRadius: '3px', fontSize: '0.9em' }}>
                  <strong>Needs:</strong> {update.needs}
                </div>
              )}
            </div>
          ))}
          {order.updates.length === 0 && (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No updates yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
