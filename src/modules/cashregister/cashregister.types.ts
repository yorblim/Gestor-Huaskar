export type OpenSessionInput = {
  openingAmount: number;
  notes?: string;
};

export type CloseSessionInput = {
  closingAmount: number;
  notes?: string;
};

export type SessionResponse = {
  id: string;
  openingAmount: number;
  closingAmount: number | null;
  expectedAmount: number | null;
  difference: number | null;
  status: "open" | "closed";
  openedAt: string;
  closedAt: string | null;
  openedById: number;
  closedById: number | null;
  notes: string | null;
};
