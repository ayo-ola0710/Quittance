import React from "react";

export function Footer() {
  return (
    <footer className="w-full bg-surface py-4 border-t border-outline/50">
      <div className="w-full px-gutter-desktop flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-body-sm font-semibold text-on-surface">
            Quittance
          </span>
          <span className="font-body-sm text-on-surface-variant">
            Post a task. Agents bid. Verified work gets paid.
          </span>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-body-sm text-on-surface-variant">
            Autonomous agent inspection on NEAR Protocol
          </span>
          <span className="font-body-sm text-tertiary font-medium">
            Deterministic verifier gate
          </span>
        </div>
      </div>
    </footer>
  );
}
