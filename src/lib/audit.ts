import { run } from './db';

export function logAuditAction(
  userId: number | null,
  userEmail: string | null,
  action: string,
  entityType: string,
  entityId: string | number | null,
  details: object | string | null = null,
  ipAddress: string | null = null
): void {
  try {
    const detailsStr = details ? (typeof details === 'string' ? details : JSON.stringify(details)) : null;
    run(
      `INSERT INTO audit_logs (user_id, user_email, action, entity_type, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, userEmail, action, entityType, entityId ? String(entityId) : null, detailsStr, ipAddress]
    );
  } catch (err) {
    console.error('Failed to log audit action:', err);
  }
}
