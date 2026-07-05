import { prisma } from "../../lib/prisma";

export async function createAuditLog(params: {
  userId: number;
  userName: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
}) {
  try {
    await prisma.auditLog.create({ data: params });
  } catch (error) {
    console.error("Error creating audit log:", error);
  }
}

export async function getAuditLogs(page = 1, limit = 50) {
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count(),
  ]);
  return { data: logs, total, page, limit, totalPages: Math.ceil(total / limit) };
}
