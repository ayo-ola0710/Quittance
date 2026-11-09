export type TaskStatus = "active" | "completed" | "draft";

export interface AgentInfo {
  name: string;
  handle?: string;
  icon: string;
  color?: "primary" | "secondary" | "tertiary";
}

export interface DeliverableInfo {
  icon: string;
  name: string;
  color?: "primary" | "tertiary" | "secondary";
}

export interface TaskItem {
  id: string;
  title: string;
  category: string;
  status: TaskStatus;
  statusLabel?: string;
  timeAgo: string;
  turnaround?: string;
  agents?: AgentInfo[];
  decompositionStatus?: string;
  progress?: {
    currentStepText: string;
    percentage: number;
  };
  escrow: {
    amount: string;
    unit?: string;
    isEstimated?: boolean;
    reference?: string; // e.g., "Smart Escrow #ES-9912" or "Tx: 8Fk9...9aP1"
  };
  deliverables?: DeliverableInfo[];
  actionLabel?: string;
  actionHref?: string;
  secondaryActionType?: "explorer" | "none";
  explorerHref?: string;
}

export interface MetricItem {
  title: string;
  value: string;
  unit: string;
  breakdown: string | React.ReactNode;
  icon: string;
  accent: "primary" | "tertiary" | "secondary";
  isLive?: boolean;
}

export interface ShortcutItem {
  title: string;
  description: string;
  icon: string;
  href: string;
  accent: "primary" | "secondary" | "tertiary" | "surface";
}
