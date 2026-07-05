import { describe, it, expect } from 'vitest';
import { prisma } from './setup';
import { getAuditLogs, createAuditLog } from '../src/modules/audit/audit.service';

describe('Audit Logs Service', () => {
  it('should create an audit log', async () => {
    await createAuditLog({
      userId: 1,
      userName: 'Admin Test',
      action: 'CREATE',
      entity: 'Product',
      entityId: 'prod-1',
      details: 'Creación de producto test',
    });

    const result = await getAuditLogs(1, 10);
    expect(result.data.length).toBeGreaterThanOrEqual(1);
    expect(result.data[0].action).toBe('CREATE');
    expect(result.data[0].entity).toBe('Product');
  });

  it('should get paginated audit logs', async () => {
    for (let i = 0; i < 5; i++) {
      await createAuditLog({
        userId: 2,
        userName: 'User Test',
        action: 'LOGIN',
        entity: 'Auth',
        details: `Login #${i + 1}`,
      });
    }

    const page1 = await getAuditLogs(1, 2);
    expect(page1.data).toHaveLength(2);
    expect(page1.total).toBe(5);
    expect(page1.page).toBe(1);
    expect(page1.limit).toBe(2);
    expect(page1.totalPages).toBe(3);

    const page2 = await getAuditLogs(2, 2);
    expect(page2.data).toHaveLength(2);
    expect(page2.page).toBe(2);
  });

  it('should return empty array when no logs', async () => {
    await prisma.auditLog.deleteMany();

    const result = await getAuditLogs();
    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});
