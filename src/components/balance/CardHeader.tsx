
import { motion } from "framer-motion";
import { formatCurrency } from "../../utils/format";
import { useState } from "react";
import { Input } from "../ui/input";

interface CardHeaderProps {
  title: string;
  amount: number;
  interestRate: string | null;
  onAmountChange?: (newAmount: number) => void;
}

export const CardHeader = ({ title, amount, interestRate, onAmountChange }: CardHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(amount.toString());

  const handleClick = () => {
    if (!onAmountChange) return;
    setIsEditing(true);
    setInputValue(amount.toString());
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (!onAmountChange) return;
    
    const newAmount = parseFloat(inputValue);
    if (!isNaN(newAmount) && newAmount >= 0) {
      onAmountChange(newAmount);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(amount.toString());
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-medium text-white/90">{title}</h3>
        {interestRate && (
          <p className="text-sm font-medium text-white/75">{interestRate}</p>
        )}
        {!interestRate && (
          <p className="text-sm font-medium text-white/75">&nbsp;</p>
        )}
      </div>
      {isEditing ? (
        <Input
          type="number"
          min="0"
          step="0.01"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="text-3xl font-bold h-auto py-0 bg-white/10 border-white/20 text-white placeholder:text-white/50"
          autoFocus
        />
      ) : (
        <motion.div
          key={amount}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-3xl font-bold text-white ${onAmountChange ? 'cursor-pointer hover:opacity-80' : ''}`}
          onClick={handleClick}
        >
          {formatCurrency(amount)}
        </motion.div>
      )}
    </div>
  );
};
