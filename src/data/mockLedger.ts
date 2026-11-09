export interface SettlementRow {
  id: string;
  bountyId: string;
  taskTitle: string;
  taskSubtitle: string;
  workerAccount: string;
  workerIcon: string;
  workerIconBg: string;
  workerColor: string;
  amount: string;
  status: "Confirmed" | "Failed";
  txHash: string;
  timeAgo: string;
  utcTime: string;
}

export const initialSettlementRows: SettlementRow[] = [
  {
    id: "tx-1",
    bountyId: "#BNT-842",
    taskTitle: "Social Campaign Strategy",
    taskSubtitle: "Sub-task of Web3 Coffee Launch",
    workerAccount: "copy-agent.testnet",
    workerIcon: "smart_toy",
    workerIconBg: "bg-secondary-container text-on-secondary-container",
    workerColor: "text-secondary",
    amount: "0.05",
    status: "Confirmed",
    txHash: "8XpL...3qK9",
    timeAgo: "2 mins ago",
    utcTime: "18:42:09 UTC",
  },
  {
    id: "tx-2",
    bountyId: "#BNT-843",
    taskTitle: "Midjourney Visual Specs",
    taskSubtitle: "Prompt engineering & color grading",
    workerAccount: "design-agent.testnet",
    workerIcon: "palette",
    workerIconBg: "bg-primary-container text-on-primary-container",
    workerColor: "text-primary",
    amount: "0.05",
    status: "Confirmed",
    txHash: "4MnY...8wR2",
    timeAgo: "2 mins ago",
    utcTime: "18:42:01 UTC",
  },
  {
    id: "tx-3",
    bountyId: "#BNT-840",
    taskTitle: "Sentiment Analysis on Feed",
    taskSubtitle: "Parsed 500 tweets",
    workerAccount: "data-scout.testnet",
    workerIcon: "radar",
    workerIconBg: "bg-tertiary-container text-on-tertiary-container",
    workerColor: "text-tertiary",
    amount: "0.03",
    status: "Confirmed",
    txHash: "7RtK...1mD5",
    timeAgo: "15 mins ago",
    utcTime: "18:29:14 UTC",
  },
  {
    id: "tx-4",
    bountyId: "#BNT-839",
    taskTitle: "Smart Contract Logic Audit",
    taskSubtitle: "Automated formal verification scan",
    workerAccount: "verify-node.testnet",
    workerIcon: "security",
    workerIconBg: "bg-surface-container-highest text-primary-fixed",
    workerColor: "text-primary-fixed",
    amount: "0.10",
    status: "Confirmed",
    txHash: "9Bq2...4wT7",
    timeAgo: "42 mins ago",
    utcTime: "18:02:40 UTC",
  },
  {
    id: "tx-5",
    bountyId: "#BNT-838",
    taskTitle: "Discord Announcement Copy",
    taskSubtitle: "Localized markdown templates",
    workerAccount: "copy-agent.testnet",
    workerIcon: "smart_toy",
    workerIconBg: "bg-secondary-container text-on-secondary-container",
    workerColor: "text-secondary",
    amount: "0.05",
    status: "Confirmed",
    txHash: "2Zp9...8kH1",
    timeAgo: "1 hour ago",
    utcTime: "17:44:11 UTC",
  },
];
