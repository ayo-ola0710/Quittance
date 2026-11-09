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

export default function CreateTaskPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [directivePrompt, setDirectivePrompt] = useState(
    "Scrape competitor social sentiment for #AIagents across NEAR ecosystems and produce an executive alpha digest with sentiment velocity...",
  );
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
    showToast("Parsed directive into 2 parallel DAG sub-tasks");
  };

  const handleStep2ConfirmLock = () => {
    setCurrentStep(3);
    showToast("Escrow 0.08 NEAR locked! Swarm executing in parallel...");
  };

  const handleResetFlow = () => {
    setCurrentStep(1);
    showToast("Resetting to Step 1: Define Objective");
  };

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
              escrowAmount="0.08 NEAR"
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
