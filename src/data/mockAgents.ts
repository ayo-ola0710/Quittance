export interface AgentRegistryNode {
  id: string;
  name: string;
  version: string;
  categoryKey: "content" | "visuals" | "data" | "security";
  categoryLabel: string;
  icon: string;
  iconColor: string;
  statusText: string;
  statusType: "online" | "idle";
  wallet: string;
  feeNear: string;
  successRate: string;
  capabilities: string[];
  turnaround: string;
  repScore: string;
}

export const registryNodes: AgentRegistryNode[] = [
  {
    id: "copy-agent",
    name: "CopyAgent",
    version: "v2.1",
    categoryKey: "content",
    categoryLabel: "Content & Copywriting",
    icon: "edit_note",
    iconColor: "text-primary",
    statusText: "Online • Ready to execute",
    statusType: "online",
    wallet: "copy-agent.testnet",
    feeNear: "0.05",
    successRate: "99.4%",
    capabilities: ["Long-form Copy", "X Threads", "Ad Strategy", "SEO"],
    turnaround: "< 1.5s avg turnaround",
    repScore: "99.4 / 100",
  },
  {
    id: "prompt-artisan",
    name: "PromptArtisan",
    version: "v1.4",
    categoryKey: "visuals",
    categoryLabel: "Visuals & Creative Direction",
    icon: "palette",
    iconColor: "text-secondary",
    statusText: "Online • Ready to execute",
    statusType: "online",
    wallet: "design-agent.testnet",
    feeNear: "0.05",
    successRate: "98.8%",
    capabilities: ["Midjourney v6", "Flux.1", "Color Palettes", "Aspect Ratios"],
    turnaround: "< 1.8s avg turnaround",
    repScore: "98.8 / 100",
  },
  {
    id: "scrape-scout",
    name: "ScrapeScout",
    version: "v3.0",
    categoryKey: "data",
    categoryLabel: "Data Extraction & Research",
    icon: "radar",
    iconColor: "text-tertiary",
    statusText: "Online • Ready to execute",
    statusType: "online",
    wallet: "scout-worker.testnet",
    feeNear: "0.03",
    successRate: "100%",
    capabilities: ["Web Scraping", "Social Sentiment", "RSS Parsing"],
    turnaround: "< 0.8s avg turnaround",
    repScore: "100 / 100",
  },
  {
    id: "contract-verifier",
    name: "ContractVerifier",
    version: "v1.0",
    categoryKey: "security",
    categoryLabel: "Security & Validation",
    icon: "verified_user",
    iconColor: "text-primary",
    statusText: "Idle • Awaiting Dispatch",
    statusType: "idle",
    wallet: "verify-node.testnet",
    feeNear: "0.10",
    successRate: "97.5%",
    capabilities: ["JSON Schema Check", "Output Quality Scoring", "Link Check"],
    turnaround: "< 2.1s avg turnaround",
    repScore: "97.5 / 100",
  },
];
