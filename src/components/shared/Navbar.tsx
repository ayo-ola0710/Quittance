"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface NavbarProps {
  activePath?: string;
  accountBalance?: string;
  accountId?: string;
  rpcStatus?: string;
}

export function Navbar({
  activePath = "mission-control",
  accountBalance = "...",
  accountId = "quittance-treasury.testnet",
  rpcStatus = "RPC Online",
}: NavbarProps) {
  const [isConnected, setIsConnected] = useState(true);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [balance, setBalance] = useState(accountBalance);
  const [currentAccountId, setCurrentAccountId] = useState(accountId);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchAccount() {
      try {
        setIsLoadingBalance(true);
        const res = await fetch("/api/account");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.balance) setBalance(data.balance);
            if (data.accountId) setCurrentAccountId(data.accountId);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch balance", err);
      } finally {
        if (isMounted) setIsLoadingBalance(false);
      }
    }
    fetchAccount();
    return () => {
      isMounted = false;
    };
  }, []);

  const navItems = [
    { label: "Dashboard", path: "mission-control", href: "/" },
    { label: "New task", path: "create-task", href: "/create-task" },
    {
      label: "Ledger",
      path: "settlement-ledger",
      href: "/settlement-ledger",
    },
    {
      label: "Agents",
      path: "agent-registry",
      href: "/agent-registry",
    },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/95 backdrop-blur-md border-b border-outline">
      <div className="h-16 w-full px-gutter-desktop flex items-center justify-between gap-space-md">
        {/* Brand / Logo */}
        <div className="flex items-center gap-space-md">
          <Link href="/" className="flex items-center gap-2 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Quittance Logo"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              src="/logo.png"
            />
            <span className="font-headline-sm tracking-tight text-on-surface font-semibold">
              Quittance
            </span>
          </Link>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] border border-outline/60 bg-surface-container-low">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
            <span className="font-label-mono-xs text-on-surface-variant">
              NEAR Testnet
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-[2px] border border-outline/50 bg-surface-container-low">
          {navItems.map((item) => {
            const isActive = activePath === item.path;
            return (
              <Link
                key={item.path}
                href={item.href}
                className={
                  isActive
                    ? "px-3 py-1.5 rounded-[2px] font-body-sm bg-primary text-on-primary font-medium transition-colors"
                    : "px-3 py-1.5 rounded-[2px] font-body-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Info Cluster */}
        <div className="flex items-center gap-space-md">
          {/* RPC Status */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] border border-outline/50 bg-surface">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
            <span className="font-label-mono-xs text-on-surface-variant">
              {rpcStatus}
            </span>
          </div>

          {/* Wallet State */}
          {isConnected ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowWalletMenu(!showWalletMenu)}
                className="flex items-center gap-space-sm px-3 py-1.5 rounded-[2px] bg-surface hover:bg-surface-container transition-colors cursor-pointer border border-outline"
              >
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    account_balance_wallet
                  </span>
                  <span className="font-label-mono-sm text-secondary font-semibold tabular-nums">
                    {isLoadingBalance ? "..." : balance}
                  </span>
                </div>
                <span className="w-px h-3 bg-outline" />
                <span className="font-label-mono-sm text-on-surface tabular-nums">
                  {currentAccountId}
                </span>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                  expand_more
                </span>
              </button>

              {/* Wallet Dropdown */}
              {showWalletMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-[2px] bg-surface border border-outline shadow-lg p-2 z-50 flex flex-col gap-1 font-body-sm animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-outline/50 flex flex-col gap-0.5">
                    <span className="font-label-mono-xs text-on-surface-variant block">
                      Connected account
                    </span>
                    <span className="font-label-mono-sm text-on-surface font-semibold truncate block tabular-nums">
                      {currentAccountId}
                    </span>
                    <span className="font-label-mono-xs text-secondary font-medium mt-1 tabular-nums">
                      Available: {balance}
                    </span>
                  </div>
                  <a
                    href={`https://testnet.nearblocks.io/address/${currentAccountId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-[2px] text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      open_in_new
                    </span>
                    <span>View on NearBlocks</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setIsConnected(false);
                      setShowWalletMenu(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-[2px] text-error hover:bg-error-container/40 transition-colors w-full text-left cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      logout
                    </span>
                    <span>Disconnect wallet</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsConnected(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[2px] bg-primary hover:bg-primary/90 text-on-primary font-body-sm font-semibold transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                account_balance_wallet
              </span>
              <span>Connect NEAR</span>
            </button>
          )}

          {/* User Avatar */}
          <div className="w-8 h-8 rounded-[2px] bg-surface-container border border-outline flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[18px]">
              person
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
