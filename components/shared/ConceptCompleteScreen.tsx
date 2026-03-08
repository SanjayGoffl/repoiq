'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Trophy } from 'lucide-react';

interface ConceptCompleteScreenProps {
  conceptName: string;
  score: number;
  attempts: number;
  onNext: () => void;
  isLastConcept: boolean;
}

export function ConceptCompleteScreen({
  conceptName,
  score,
  attempts,
  onNext,
  isLastConcept,
}: ConceptCompleteScreenProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="flex h-24 w-24 items-center justify-center rounded-full bg-green/20"
      >
        {isLastConcept ? (
          <Trophy className="h-12 w-12 text-green" />
        ) : (
          <CheckCircle className="h-12 w-12 text-green" />
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <h1 className="text-2xl font-bold text-white">
          {isLastConcept ? 'All Concepts Complete!' : 'Concept Understood!'}
        </h1>
        <p className="text-lg text-green">{conceptName}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex gap-8 rounded-lg border border-border bg-navy-light p-6"
      >
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{score}%</p>
          <p className="text-sm text-muted">Comprehension</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{attempts}</p>
          <p className="text-sm text-muted">Exchanges</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <Button size="lg" onClick={onNext} className="gap-2">
          {isLastConcept ? 'View Learning Path' : 'Next Concept'}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  );
}
