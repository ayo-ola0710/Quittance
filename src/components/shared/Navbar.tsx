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
  accountId = "agentbounty-treasury.testnet",
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
    { label: "New Task", path: "create-task", href: "/create-task" },
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
    <header className="fixed top-0 w-full z-50 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.5)]">
      <div className="h-16 w-full px-gutter-desktop flex items-center justify-between gap-space-md">
        {/* Brand / Logo */}
        <div className="flex items-center gap-space-md">
          {/* Logo image with fallback styling */}
          <Link href="/" className="flex items-center gap-space-xs group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="AgentBounty Logo"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              src="/logo.png"
            />
            <span className="font-headline-sm tracking-tight text-on-surface font-semibold ml-2">
              AgentBounty
            </span>
          </Link>
          <div className="flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-surface-container-high">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="font-label-mono-xs text-on-surface-variant uppercase tracking-wider">
              NEAR Testnet
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-space-xs p-1 rounded-full bg-surface-container-low">
          {navItems.map((item) => {
            const isActive = activePath === item.path;
            return (
              <Link
                key={item.path}
                href={item.href}
                className={
                  isActive
                    ? "px-space-md py-1.5 rounded-full font-body-sm bg-primary-container text-on-primary-container font-medium shadow-[0_0_16px_rgba(6,182,212,0.3)] transition-colors"
                    : "px-space-md py-1.5 rounded-full font-body-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
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
          <div className="hidden xl:flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-low">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary shadow-[0_0_8px_rgba(78,222,163,0.5)]" />
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
                className="flex items-center gap-space-sm px-space-md py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer border border-surface-container-high/40"
              >
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    account_balance_wallet
                  </span>
                  <span className="font-label-mono-sm text-primary font-semibold">
                    {isLoadingBalance ? "..." : balance}
                  </span>
                </div>
                <span className="w-px h-3 bg-surface-container-highest" />
                <span className="font-label-mono-sm text-on-surface">
                  {currentAccountId}
                </span>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                  expand_more
                </span>
              </button>

              {/* Wallet Dropdown */}
              {showWalletMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-surface-container-high border border-surface-container-highest shadow-2xl p-2 z-50 flex flex-col gap-1 font-body-sm animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-surface-container-highest/60 flex flex-col gap-0.5">
                    <span className="font-label-mono-xs text-outline uppercase tracking-wider block">
                      Connected Account
                    </span>
                    <span className="font-label-mono-sm text-on-surface font-semibold truncate block">
                      {currentAccountId}
                    </span>
                    <span className="font-label-mono-xs text-primary font-medium mt-1">
                      Available: {balance}
                    </span>
                  </div>
                  <a
                    href={`https://testnet.nearblocks.io/address/${currentAccountId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
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
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-error hover:bg-error-container/20 transition-colors w-full text-left cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      logout
                    </span>
                    <span>Disconnect Wallet</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsConnected(true)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-body-sm font-semibold shadow-[0_0_16px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                account_balance_wallet
              </span>
              <span>Connect NEAR</span>
            </button>
          )}

          {/* User Avatar */}
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[18px]">
              person
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
