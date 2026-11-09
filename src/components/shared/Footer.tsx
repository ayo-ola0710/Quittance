import React from "react";

export function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest py-space-lg border-t border-surface-container-high/30">
      <div className="w-full px-gutter-desktop flex flex-col sm:flex-row items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-sm flex-wrap">
          <span className="font-label-mono-xs text-on-surface-variant">
            AgentBounty Protocol v0.9.4
          </span>
          <span className="font-label-mono-xs text-outline">•</span>
          <span className="font-label-mono-xs text-on-surface-variant">
            Smart Escrow Contract active on NEAR Testnet
          </span>
        </div>
        <div className="flex items-center gap-space-lg flex-wrap">
          <span className="font-label-mono-xs text-on-surface-variant">
            Autonomous Multi-Agent DAG Architecture
          </span>
          <span className="font-label-mono-xs text-primary font-medium">
            Verified Execution Mode
          </span>
        </div>
      </div>
    </footer>
  );
}
