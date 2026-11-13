"use client";

import React from "react";

interface StepTrackerProps {
  currentStep: 1 | 2 | 3;
  onStepClick?: (step: 1 | 2 | 3) => void;
  escrowAmount?: string;
}

export function StepTracker({
  currentStep,
  onStepClick,
  escrowAmount = "0.08 NEAR",
}: StepTrackerProps) {
  return (
    <div className="w-full bg-surface-container-low rounded-xl p-space-sm sm:p-space-md shadow-xl relative overflow-hidden border border-surface-container-high/40">
      <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm relative z-10">
        {/* Step 1 */}
        <div
          onClick={() => onStepClick?.(1)}
          className={`flex items-center gap-space-md p-space-sm rounded-lg transition-all cursor-pointer ${
            currentStep === 1
              ? "bg-surface-container-high shadow-[0_0_24px_-4px_rgba(6,182,212,0.25)]"
              : currentStep > 1
              ? "bg-surface-container/60 hover:bg-surface-container"
              : "bg-surface-container/30 opacity-70"
          }`}
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
              currentStep > 1
                ? "bg-tertiary-container/30 text-tertiary"
                : currentStep === 1
                ? "bg-primary-container text-on-primary-container font-label-mono-md shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                : "bg-surface-container-highest text-on-surface-variant font-label-mono-md"
            }`}
          >
            {currentStep > 1 ? (
              <span
                className="material-symbols-outlined text-tertiary text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            ) : (
              "01"
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <span
              className={`font-label-mono-xs uppercase tracking-wider font-semibold ${
                currentStep > 1
                  ? "text-tertiary"
                  : currentStep === 1
                  ? "text-primary"
                  : "text-on-surface-variant"
              }`}
            >
              {currentStep > 1
                ? "Step 01 • Done"
                : currentStep === 1
                ? "Step 01 • Current"
                : "Step 01"}
            </span>
            <span className="font-title-md text-on-surface truncate">
              Write Task
            </span>
            <span className="font-label-mono-xs text-on-surface-variant truncate">
              {currentStep > 1
                ? "Task & budget ready"
                : "Describe what you need"}
            </span>
          </div>

          {currentStep > 1 && (
            <div className="ml-auto hidden xl:flex items-center gap-1 text-tertiary font-label-mono-xs">
              Done
            </div>
          )}
        </div>

        {/* Step 2 */}
        <div
          onClick={() => onStepClick?.(2)}
          className={`flex items-center gap-space-md p-space-sm rounded-lg transition-all cursor-pointer ${
            currentStep === 2
              ? "bg-surface-container-high shadow-[0_0_24px_-4px_rgba(6,182,212,0.25)]"
              : currentStep > 2
              ? "bg-surface-container/60 hover:bg-surface-container"
              : "bg-surface-container/30 opacity-70"
          }`}
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
              currentStep > 2
                ? "bg-tertiary-container/30 text-tertiary"
                : currentStep === 2
                ? "bg-primary-container text-on-primary-container font-label-mono-md shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                : "bg-surface-container-highest text-on-surface-variant font-label-mono-md"
            }`}
          >
            {currentStep > 2 ? (
              <span
                className="material-symbols-outlined text-tertiary text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            ) : (
              "02"
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-space-xs">
              {currentStep === 2 && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
              <span
                className={`font-label-mono-xs uppercase tracking-wider font-semibold ${
                  currentStep > 2
                    ? "text-tertiary"
                    : currentStep === 2
                    ? "text-primary"
                    : "text-on-surface-variant"
                }`}
              >
                {currentStep > 2
                  ? "Step 02 • Done"
                  : currentStep === 2
                  ? "Step 02 • Current"
                  : "Step 02 • Next"}
              </span>
              {currentStep > 2 && (
                <span className="px-1.5 py-0.2 rounded-full bg-surface-container-highest font-label-mono-xs text-primary">
                  {escrowAmount}
                </span>
              )}
            </div>
            <span className="font-title-md text-on-surface truncate">
              Agents Bid
            </span>
            <span className="font-label-mono-xs text-on-surface-variant truncate">
              {currentStep === 2
                ? "Review bids & pick winner"
                : currentStep > 2
                ? "Agents assigned"
                : "Pick qualified agents"}
            </span>
          </div>

          {currentStep > 2 && (
            <div className="ml-auto hidden xl:flex items-center gap-1 text-tertiary font-label-mono-xs">
              <span className="material-symbols-outlined text-[16px]">verified</span>
            </div>
          )}
        </div>

        {/* Step 3 */}
        <div
          onClick={() => onStepClick?.(3)}
          className={`flex items-center gap-space-md p-space-sm rounded-lg transition-all cursor-pointer ${
            currentStep === 3
              ? "bg-surface-container-high shadow-[0_0_24px_-4px_rgba(6,182,212,0.25)]"
              : "bg-surface-container/30 opacity-70"
          }`}
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
              currentStep === 3
                ? "bg-tertiary text-on-tertiary font-bold shadow-[0_0_12px_rgba(78,222,163,0.6)]"
                : "bg-surface-container-highest text-on-surface-variant font-label-mono-md"
            }`}
          >
            {currentStep === 3 ? (
              <span className="material-symbols-outlined text-[18px]">currency_exchange</span>
            ) : (
              "03"
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-space-xs">
              <span
                className={`font-label-mono-xs uppercase tracking-wider font-semibold ${
                  currentStep === 3 ? "text-tertiary" : "text-on-surface-variant"
                }`}
              >
                {currentStep === 3 ? "Step 03 • Current" : "Step 03 • Final"}
              </span>
              {currentStep === 3 && (
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
              )}
            </div>
            <span className="font-title-md text-on-surface truncate">
              Verify &amp; Pay
            </span>
            <span className="font-label-mono-xs text-outline truncate">
              {currentStep === 3 ? "Review & release NEAR" : "Check work & pay in NEAR"}
            </span>
          </div>

          {currentStep === 3 && (
            <div className="ml-auto hidden sm:flex items-center px-space-sm py-1 rounded-full bg-tertiary-container/30 text-tertiary font-label-mono-xs">
              Ready
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
