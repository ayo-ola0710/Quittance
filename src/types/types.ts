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

export interface VerificationRuleDef {
  id: string;
  name: string;
  description: string;
  threshold: string;
}

export const VERIFICATION_RULES: VerificationRuleDef[] = [
  {
    id: "min-length",
    name: "Minimum Content Length",
    description: "Output must exceed minimum character count threshold (> 120 chars for synthesis, > 80 chars for research)",
    threshold: "> 120 chars (synthesis) / > 80 chars (research)",
  },
  {
    id: "prompt-keywords",
    name: "Prompt Keyword Match",
    description: "Deliverable must contain salient thematic keywords from the user bounty directive",
    threshold: "Salient keyword match",
  },
  {
    id: "structured-sections",
    name: "Structured Markdown / Sections",
    description: "Deliverable must contain structured Markdown formatting, headings, or metric key-values",
    threshold: "Headings, line breaks, or key-values",
  },
  {
    id: "complete-deliverable",
    name: "Complete Deliverable",
    description: "Output must be complete without placeholder error tokens, truncated data, or syntax crash markers",
    threshold: "No error:, incomplete, or corrupted draft tokens",
  },
];
