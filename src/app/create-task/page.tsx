"use client";

import React, { useState } from "react";
import {
  Navbar,
  Footer,
  StepTracker,
  ToastNotification,
  DynamicStepDefine,
  DynamicStepMatchmaking,
  DynamicStepSettlement,
} from "../../types";
import type { SelectedWriterAgent } from "@/components/creation/DynamicStepMatchmaking";

export default function CreateTaskPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [directivePrompt, setDirectivePrompt] = useState(
    "Scrape competitor social sentiment for #AIagents across NEAR ecosystems and produce an executive alpha digest with sentiment velocity...",
  );
  const [selectedAgent, setSelectedAgent] = useState<SelectedWriterAgent | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  const handleStep1Continue = (directive: string) => {
    setDirectivePrompt(directive);
    setCurrentStep(2);
    showToast("Task ready! Agents submitted bids.");
  };

  const handleStep2ConfirmLock = (agent: SelectedWriterAgent) => {
    setSelectedAgent(agent);
    setCurrentStep(3);
    showToast(`Dispatched to ${agent.name}! Checking outputs...`);
  };

  const handleResetFlow = () => {
    setSelectedAgent(null);
    setCurrentStep(1);
    showToast("Starting a new task");
  };

  const dynamicEscrowAmount = selectedAgent
    ? `${(0.03 + selectedAgent.bidNear).toFixed(2)} NEAR`
    : "0.08 NEAR";

  return (
    <>
      <Navbar activePath="create-task" />

      <main className="w-full pt-16 bg-background min-h-screen">
        <div className="flex flex-col w-full">
          <div className="w-full px-gutter-desktop py-space-lg flex flex-col gap-space-lg max-w-[1560px] mx-auto">
            {/* 3-Step Wizard Flow Tracker */}
            <StepTracker
              currentStep={currentStep}
              onStepClick={(step) => {
                // Allow navigating to earlier steps or current step
                if (step <= currentStep) {
                  setCurrentStep(step);
                }
              }}
              escrowAmount={dynamicEscrowAmount}
            />

            {/* Step 1: Define Objective */}
            {currentStep === 1 && (
              <DynamicStepDefine
                onContinue={handleStep1Continue}
                onShowToast={showToast}
              />
            )}

            {/* Step 2: Matchmaking & Approval */}
            {currentStep === 2 && (
              <DynamicStepMatchmaking
                directivePrompt={directivePrompt}
                onBack={() => setCurrentStep(1)}
                onConfirmLock={handleStep2ConfirmLock}
                onShowToast={showToast}
              />
            )}

            {/* Step 3: Execution & Settle Escrow */}
            {currentStep === 3 && (
              <DynamicStepSettlement
                directivePrompt={directivePrompt}
                selectedAgent={selectedAgent ?? undefined}
                onReset={handleResetFlow}
                onShowToast={showToast}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Floating Action Toast */}
      <ToastNotification message={toastMessage} />
    </>
  );
}
