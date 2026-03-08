'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Search, BookOpen, MessageSquare } from 'lucide-react';

const STEPS = [
  {
    icon: Search,
    title: 'Drop a GitHub URL',
    description:
      'Paste any public GitHub repository URL. RepoIQ will scan every file — code, configs, scripts — everything.',
  },
  {
    icon: BookOpen,
    title: 'Get your learning report',
    description:
      'AI identifies the 5 critical concepts you must understand, finds real bugs, and maps out a personalised learning path.',
  },
  {
    icon: MessageSquare,
    title: 'Learn through Socratic teaching',
    description:
      'AI asks you questions about YOUR code. Never explains directly. You build real understanding through guided discovery.',
  },
];

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OnboardingModal({ open, onOpenChange }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const currentStep = STEPS[step];

  if (!currentStep) return null;

  const Icon = currentStep.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green/20">
            <Icon className="h-8 w-8 text-green" />
          </div>
          <DialogTitle className="text-center text-xl">
            {currentStep.title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {currentStep.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between pt-4">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-6 rounded-full transition-colors ${
                  i === step ? 'bg-green' : 'bg-navy'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {step < STEPS.length - 1 ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                >
                  Skip
                </Button>
                <Button size="sm" onClick={() => setStep(step + 1)}>
                  Next
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => onOpenChange(false)}>
                Get Started
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
