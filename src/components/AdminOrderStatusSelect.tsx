'use client';

import React, { useState } from 'react';

interface AdminOrderStatusSelectProps {
  id: number;
  currentStatus: string;
}

export default function AdminOrderStatusSelect({ id, currentStatus }: AdminOrderStatusSelectProps) {
  const [status, setStatus] = useState(currentStatus);
  const [updating, setUpdating] = useState(false);

  const handleChange = async (newStatus: string) => {
    setStatus(newStatus);
    setUpdating(true);
    try {
      await fetch('/api/orders/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch {
      // ignore
    } finally {
      setUpdating(false);
    }
  };

  return (
    <select
      value={status}
      disabled={updating}
      onChange={(e) => handleChange(e.target.value)}
      className="form-select"
      style={{ fontSize: '0.8rem', padding: '4px 24px 4px 8px', opacity: updating ? 0.6 : 1 }}
    >
      <option value="lead_initiated">Lead Initiated</option>
      <option value="contacted">Contacted</option>
      <option value="fulfilled">Fulfilled Order</option>
      <option value="cancelled">Cancelled</option>
    </select>
  );
}
