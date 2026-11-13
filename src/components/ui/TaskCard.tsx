import React from "react";
import Link from "next/link";
import { TaskItem } from "../../types/types";

interface TaskCardProps {
  task: TaskItem;
  onInspect?: (task: TaskItem) => void;
  onViewLive?: (task: TaskItem) => void;
}

export function TaskCard({ task, onInspect, onViewLive }: TaskCardProps) {
  const {
    id,
    title,
    category,
    status,
    statusLabel,
    timeAgo,
    turnaround,
    agents,
    decompositionStatus,
    progress,
    escrow,
    deliverables,
    actionLabel,
    actionHref = "#",
    secondaryActionType = "none",
    explorerHref = "#",
  } = task;

  const isActive = status === "active";
  const isDraft = status === "draft";
  const isCompleted = status === "completed";

  return (
    <div
      className={
        isDraft
          ? "rounded-xl bg-surface-container-low/60 p-space-lg backdrop-blur-md shadow-sm transition-all hover:bg-surface-container relative overflow-hidden group border border-surface-container-high/30"
          : isActive
            ? "relative overflow-hidden rounded-xl p-6 bg-surface-container/75 backdrop-blur-md shadow-lg hover:bg-surface-container transition-all duration-200 group border border-primary/20"
            : "relative overflow-hidden rounded-xl p-6 bg-surface-container/75 backdrop-blur-md shadow-lg hover:bg-surface-container transition-all duration-200 group border border-surface-container-high/30"
      }
    >
      {/* Accent Glow Line for Running State */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary shadow-[0_0_12px_rgba(6,182,212,0.8)]" />
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        {/* Left Column: Details */}
        <div className="flex flex-col gap-space-xs flex-1 min-w-0">
          {/* Metadata line */}
          <div className="flex items-center gap-space-xs flex-wrap">
            <span
              className={
                isActive
                  ? "font-label-mono-sm font-semibold text-primary"
                  : isDraft
                    ? "font-label-mono-sm font-semibold text-outline"
                    : "font-label-mono-sm font-semibold text-on-surface"
              }
            >
              {id}
            </span>

            {/* Status Badge */}
            {isActive && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-mono-xs font-medium tracking-wide bg-primary-container/20 text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                <span>{statusLabel || "Active Swarm DAG"}</span>
              </span>
            )}
            {isCompleted && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-mono-xs font-medium tracking-wide bg-tertiary/10 text-tertiary">
                <span className="material-symbols-outlined text-[12px]">
                  check_circle
                </span>
                <span>{statusLabel || "Delivered & Verified"}</span>
              </span>
            )}
            {isDraft && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-mono-xs font-medium tracking-wide bg-surface-container-high text-on-surface-variant">
                <span className="material-symbols-outlined text-[12px]">
                  drafts
                </span>
                <span>{statusLabel || "Draft Saved"}</span>
              </span>
            )}

            {/* Category */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-mono-xs font-medium tracking-wide bg-surface-container-high text-on-surface-variant">
              {category}
            </span>

            <span className="font-label-mono-xs text-outline">•</span>
            <span className="font-label-mono-xs text-on-surface-variant">
              {timeAgo}
            </span>

            {turnaround && (
              <>
                <span className="font-label-mono-xs text-outline">•</span>
                <span className="font-label-mono-xs text-secondary font-medium">
                  {turnaround}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h3
            className={
              isDraft
                ? "font-headline-sm text-on-surface/90 font-semibold tracking-tight"
                : "font-headline-sm text-on-surface font-semibold tracking-tight"
            }
          >
            {title}
          </h3>

          {/* Agent Squad Assignment */}
          {agents && agents.length > 0 && (
            <div className="flex items-center gap-space-sm flex-wrap mt-1">
              <span className="font-label-mono-xs text-on-surface-variant">
                {isCompleted ? "Workers:" : "Assigned Agents:"}
              </span>
              {agents.map((agent, index) => {
                const colorMap = {
                  primary: "bg-primary/20 text-primary",
                  secondary: "bg-secondary/20 text-secondary",
                  tertiary: "bg-tertiary/20 text-tertiary",
                };
                const iconColor = colorMap[agent.color || "primary"];

                return (
                  <React.Fragment key={index}>
                    {index > 0 && (
                      <span className="font-label-mono-xs text-outline">+</span>
                    )}
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-surface-container-low font-label-mono-xs">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${iconColor}`}
                      >
                        <span className="material-symbols-outlined text-[12px]">
                          {agent.icon}
                        </span>
                      </div>
                      <span className="font-label-mono-xs text-on-surface">
                        {agent.name}
                      </span>
                      {agent.handle && (
                        <span className="font-label-mono-xs text-outline">
                          ({agent.handle})
                        </span>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* Decomposition Status for Draft */}
          {decompositionStatus && (
            <div className="flex items-center gap-space-sm flex-wrap mt-1">
              <span className="font-label-mono-xs text-outline">
                Decomposition Status:
              </span>
              <span className="font-label-mono-xs text-on-surface-variant italic">
                {decompositionStatus}
              </span>
            </div>
          )}

          {/* Real-time Progress Bar */}
          {progress && (
            <div className="w-full max-w-xl mt-2 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-on-surface-variant font-label-mono-xs">
                <span className="text-primary font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] animate-spin">
                    rotate_right
                  </span>
                  <span>{progress.currentStepText}</span>
                </span>
                <span className="text-primary font-bold">
                  {progress.percentage}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all duration-500"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Deliverables Capsule */}
          {deliverables && deliverables.length > 0 && (
            <div className="flex items-center gap-space-sm flex-wrap mt-2">
              {deliverables.map((item, idx) => {
                const iconColor =
                  item.color === "tertiary"
                    ? "text-tertiary"
                    : item.color === "primary"
                      ? "text-primary"
                      : "text-secondary";

                return (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-surface-container-lowest text-on-surface-variant font-label-mono-xs"
                  >
                    <span
                      className={`material-symbols-outlined text-[14px] ${iconColor}`}
                    >
                      {item.icon}
                    </span>
                    <span
                      className={
                        item.color === "tertiary" && item.icon === "shield"
                          ? "text-tertiary"
                          : ""
                      }
                    >
                      {item.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Escrow & Actions */}
        <div className="flex lg:flex-col items-center lg:items-end justify-between gap-space-md pt-space-xs lg:pt-0">
          <div className="flex flex-col items-start lg:items-end">
            <span
              className={
                isDraft
                  ? "font-label-mono-xs text-outline uppercase"
                  : "font-label-mono-xs text-on-surface-variant uppercase"
              }
            >
              {isDraft
                ? "Est. Escrow"
                : isCompleted
                  ? "Escrow Settled"
                  : "Escrow Locked"}
            </span>

            <div
              className={`flex items-center gap-1 ${
                isActive
                  ? "text-primary"
                  : isCompleted
                    ? "text-tertiary"
                    : "text-on-surface-variant"
              }`}
            >
              {isActive && (
                <span className="material-symbols-outlined text-[16px]">
                  token
                </span>
              )}
              {isCompleted && (
                <span className="material-symbols-outlined text-[16px]">
                  verified
                </span>
              )}
              <span className="font-label-mono-md font-bold">
                {escrow.amount} {escrow.unit || "NEAR"}
              </span>
            </div>

            <span
              className={
                isCompleted
                  ? "font-label-mono-xs text-outline font-mono"
                  : "font-label-mono-xs text-outline"
              }
            >
              {escrow.reference || (isDraft ? "Uncommitted" : "")}
            </span>
          </div>

          <div className="flex items-center gap-space-xs">
            {isActive && (
              <button
                type="button"
                onClick={() => onViewLive?.(task)}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container active:scale-95 text-on-primary font-body-sm font-semibold shadow-[0_0_24px_-4px_rgba(6,182,212,0.4)] transition-all duration-150 cursor-pointer"
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-on-primary opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-on-primary" />
                </span>
                <span>{actionLabel || "View Live Execution"}</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            )}

            {isCompleted && (
              <>
                {actionHref && actionHref !== "#" ? (
                  <Link
                    href={actionHref}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright active:scale-95 text-on-surface font-body-sm font-medium transition-all duration-150 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-primary">
                      receipt_long
                    </span>
                    <span>{actionLabel || "Open Receipt"}</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => onInspect?.(task)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright active:scale-95 text-on-surface font-body-sm transition-all duration-150 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {actionLabel?.includes("JSON")
                        ? "download"
                        : actionLabel?.includes("Audit")
                          ? "find_in_page"
                          : "visibility"}
                    </span>
                    <span>{actionLabel || "Inspect Deliverables"}</span>
                  </button>
                )}
                {secondaryActionType === "explorer" && explorerHref !== "#" && (
                  <a
                    href={explorerHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center p-2 rounded-xl bg-surface-container-high hover:bg-surface-bright active:scale-95 text-on-surface-variant hover:text-on-surface transition-all duration-150"
                    title="View on NearBlocks Explorer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      open_in_new
                    </span>
                  </a>
                )}
              </>
            )}

            {isDraft && (
              <Link
                href={actionHref}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright active:scale-95 text-primary font-body-sm font-semibold transition-all duration-150"
              >
                <span>{actionLabel || "Continue Configuration"}</span>
                <span className="material-symbols-outlined text-[16px]">
                  arrow_forward
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
