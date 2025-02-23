
import { motion } from "framer-motion";
import { formatCurrency } from "@/utils/format";
import { useRef, useState } from "react";

interface BalanceDisplayProps {
  amount?: number;
  onBalanceChange: (newAmount: number) => void;
  onAdd: () => void;
  onSubtract: () => void;
}

export const BalanceDisplay = ({ amount = 0, onBalanceChange, onAdd, onSubtract }: BalanceDisplayProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(amount.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  const handleStartEdit = () => {
    setEditValue(amount.toString());
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleFinishEdit = () => {
    const newAmount = parseFloat(editValue);
    if (!isNaN(newAmount) && newAmount >= 0) {
      onBalanceChange(newAmount);
    } else {
      setEditValue(amount.toString());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleFinishEdit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(amount.toString());
    }
  };

  return (
    <>
      <motion.div
        key={amount}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-white cursor-pointer"
        onClick={handleStartEdit}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleFinishEdit}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none p-0 text-3xl font-bold text-white w-full focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            step="0.01"
            min="0"
          />
        ) : (
          formatCurrency(amount)
        )}
      </motion.div>
      <div className="flex space-x-2">
        <button
          onClick={onAdd}
          className="rounded bg-white/20 px-3 py-1 text-sm text-white backdrop-blur-sm transition-colors hover:bg-white/30"
        >
          Add
        </button>
        <button
          onClick={onSubtract}
          className="rounded bg-white/20 px-3 py-1 text-sm text-white backdrop-blur-sm transition-colors hover:bg-white/30"
        >
          Subtract
        </button>
      </div>
    </>
  );
};
