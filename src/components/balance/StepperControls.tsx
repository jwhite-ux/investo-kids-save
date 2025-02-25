
import { Plus, Minus } from "lucide-react";

interface StepperControlsProps {
  amount: number;
  onStep: (type: "add" | "subtract") => void;
}

export const StepperControls = ({ amount, onStep }: StepperControlsProps) => {
  return (
    <div className="flex items-center gap-2 mt-[52px]">
      <button
        onClick={() => onStep("subtract")}
        disabled={amount < 1}
        className={`rounded-full bg-white/20 w-12 h-12 flex items-center justify-center backdrop-blur-sm transition-all
          ${amount >= 1 ? 'hover:bg-white/30 active:scale-95' : 'opacity-50 cursor-not-allowed'}
        `}
      >
        <Minus className="h-6 w-6 text-white" />
      </button>
      <button
        onClick={() => onStep("add")}
        className="rounded-full bg-white/20 w-12 h-12 flex items-center justify-center backdrop-blur-sm transition-all hover:bg-white/30 active:scale-95"
      >
        <Plus className="h-6 w-6 text-white" />
      </button>
    </div>
  );
};
