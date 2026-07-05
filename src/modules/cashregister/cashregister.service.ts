import { OpenSessionInput, CloseSessionInput, SessionResponse } from "./cashregister.types";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { getPaginationParams, paginatedResult, type PaginatedResult } from "../../utils/pagination";
import { emitEvent } from "../notifications/notifications.service";

function toSessionResponse(session: any): SessionResponse {
  return {
    id: session.id,
    openingAmount: parseFloat(session.openingAmount.toString()),
    closingAmount: session.closingAmount ? parseFloat(session.closingAmount.toString()) : null,
    expectedAmount: session.expectedAmount ? parseFloat(session.expectedAmount.toString()) : null,
    difference: session.difference ? parseFloat(session.difference.toString()) : null,
    status: session.status.toLowerCase() as "open" | "closed",
    openedAt: session.openedAt.toISOString(),
    closedAt: session.closedAt?.toISOString() || null,
    openedById: session.openedById,
    closedById: session.closedById,
    notes: session.notes,
  };
}

export async function openSession(userId: number, data: OpenSessionInput): Promise<SessionResponse> {
  const result = await prisma.$transaction(async (tx) => {
    const openSession = await tx.cashRegisterSession.findFirst({
      where: { status: "OPEN" },
    });
    if (openSession) {
      await tx.cashRegisterSession.update({
        where: { id: openSession.id },
        data: { status: "CLOSED", closedAt: new Date(), closedById: userId },
      });
    }

    const session = await tx.cashRegisterSession.create({
      data: {
        openingAmount: data.openingAmount,
        notes: data.notes,
        openedById: userId,
      },
    });

    return toSessionResponse(session);
  });

  emitEvent("cashregister:session_opened", result);
  return result;
}

export async function closeSession(
  sessionId: string,
  userId: number,
  data: CloseSessionInput
): Promise<SessionResponse> {
  const result = await prisma.$transaction(async (tx) => {
    const session = await tx.cashRegisterSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw new AppError("Sesión no encontrada.", 404);
    }
    if (session.status !== "OPEN") {
      throw new AppError("La sesión ya está cerrada.", 400);
    }
    if (session.openedById !== userId) {
      throw new AppError("No puedes cerrar la sesión de otro usuario.", 403);
    }

    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    const cashPaymentsResult = await tx.salePayment.aggregate({
      _sum: { amount: true },
      where: {
        method: "CASH",
        sale: {
          createdAt: { gte: todayStart, lte: todayEnd },
          status: "ACTIVE",
        },
      },
    });

    const openingAmount = parseFloat(session.openingAmount.toString());
    const todayCashSales = parseFloat(cashPaymentsResult._sum.amount?.toString() || "0");
    const expectedAmount = openingAmount + todayCashSales;
    const difference = data.closingAmount - expectedAmount;

    const updated = await tx.cashRegisterSession.update({
      where: { id: sessionId },
      data: {
        closingAmount: data.closingAmount,
        expectedAmount,
        difference,
        status: "CLOSED",
        closedAt: new Date(),
        closedById: userId,
        notes: data.notes ?? session.notes,
      },
    });

    return toSessionResponse(updated);
  });

  emitEvent("cashregister:session_closed", result);
  return result;
}

export async function getActiveSession(): Promise<SessionResponse | null> {
  const session = await prisma.cashRegisterSession.findFirst({
    where: { status: "OPEN" },
    orderBy: { openedAt: "desc" },
  });
  return session ? toSessionResponse(session) : null;
}

export async function getSessions(query: Record<string, any> = {}): Promise<PaginatedResult<SessionResponse>> {
  const params = getPaginationParams(query);

  const [sessions, total] = await Promise.all([
    prisma.cashRegisterSession.findMany({
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { openedAt: "desc" },
    }),
    prisma.cashRegisterSession.count(),
  ]);

  return paginatedResult(sessions.map(toSessionResponse), total, params);
}
