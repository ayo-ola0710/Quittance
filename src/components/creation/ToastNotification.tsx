"use client";

import React from "react";

interface ToastNotificationProps {
  message: string | null;
  type?: "success" | "info" | "warning";
}

export function ToastNotification({
  message,
  type = "success",
}: ToastNotificationProps) {
  if (!message) return null;

  const iconName = {
    success: "check_circle",
    info: "info",
    warning: "warning",
  }[type];

  const iconColor = {
    success: "text-tertiary",
    info: "text-primary",
    warning: "text-error",
  }[type];

  return (
    <div className="fixed bottom-6 right-6 px-4 py-2 rounded-xl bg-surface-bright text-on-surface font-label-mono-sm shadow-2xl flex items-center gap-2 z-50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
      <span className={`material-symbols-outlined text-[18px] ${iconColor}`}>
        {iconName}
      </span>
      <span>{message}</span>
    </div>
  );
}
