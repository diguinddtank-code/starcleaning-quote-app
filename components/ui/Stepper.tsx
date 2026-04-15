'use client';

import { Minus, Plus } from 'lucide-react';

interface StepperProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function Stepper({ label, value, onChange, min = 0, max = 9999, step = 1 }: StepperProps) {
  const handleMinus = () => {
    if (value > min) onChange(Math.max(min, value - step));
  };

  const handlePlus = () => {
    if (value < max) onChange(Math.min(max, value + step));
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-xl shadow-sm">
      <span className="font-semibold text-sm text-zinc-700">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={handleMinus}
          disabled={value <= min}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Minus size={16} />
        </button>
        <span className="w-10 text-center font-bold text-zinc-900">{value}</span>
        <button
          onClick={handlePlus}
          disabled={value >= max}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
