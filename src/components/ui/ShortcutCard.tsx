import React from "react";
import Link from "next/link";
import { ShortcutItem } from "../../types/types";

interface ShortcutCardProps {
  shortcut: ShortcutItem;
}

export function ShortcutCard({ shortcut }: ShortcutCardProps) {
  const { title, description, icon, href, accent } = shortcut;

  const iconClasses = {
    primary: "bg-primary-container/10 text-primary group-hover:scale-105",
    secondary: "bg-secondary-container/20 text-secondary group-hover:scale-105",
    tertiary: "bg-tertiary/10 text-tertiary group-hover:scale-105",
    surface:
      "bg-surface-container-highest text-on-surface group-hover:scale-105",
  }[accent];

  const chevronHoverClasses = {
    primary: "group-hover:text-primary",
    secondary: "group-hover:text-secondary",
    tertiary: "group-hover:text-tertiary",
    surface: "group-hover:text-on-surface",
  }[accent];

  return (
    <Link
      href={href}
      className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-all duration-200 group"
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform ${iconClasses}`}
      >
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <div className="flex flex-col min-w-0">
        <span className="font-body-md text-on-surface font-medium truncate">
          {title}
        </span>
        <span className="font-label-mono-xs text-on-surface-variant truncate">
          {description}
        </span>
      </div>
      <span
        className={`material-symbols-outlined text-outline text-[16px] ml-auto transition-colors ${chevronHoverClasses}`}
      >
        chevron_right
      </span>
    </Link>
  );
}

interface MissionLaunchpadProps {
  shortcuts?: ShortcutItem[];
}

export function MissionLaunchpad({ shortcuts }: MissionLaunchpadProps) {
  const defaultShortcuts: ShortcutItem[] = shortcuts || [
    {
      title: "Dispatch Swarm",
      description: "Define objective & escrow",
      icon: "add_circle",
      href: "/create-task",
      accent: "primary",
    },
    {
      title: "Swarm Pipeline",
      description: "Inspect 2 live DAG executions",
      icon: "dynamic_form",
      href: "/create-task",
      accent: "secondary",
    },
    {
      title: "Agent Registry",
      description: "Explore 14 specialized nodes",
      icon: "smart_toy",
      href: "/agent-registry",
      accent: "surface",
    },
    {
      title: "Settlement Ledger",
      description: "Inspect NEAR on-chain micro-tx",
      icon: "account_balance_wallet",
      href: "/settlement-ledger",
      accent: "tertiary",
    },
  ];

  return (
    <div className="w-full bg-surface-container/40 p-space-md rounded-xl backdrop-blur-md flex flex-col gap-space-sm border border-surface-container-high/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-primary text-[18px]">
            rocket_launch
          </span>
          <span className="font-title-md text-on-surface font-semibold">
            Mission Launchpad &amp; Protocol Shortcuts
          </span>
        </div>
        <span className="font-label-mono-xs text-on-surface-variant hidden sm:inline">
          RAPID PROTOCOL DIRECTORY
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm mt-1">
        {defaultShortcuts.map((item, idx) => (
          <ShortcutCard key={idx} shortcut={item} />
        ))}
      </div>
    </div>
  );
}
