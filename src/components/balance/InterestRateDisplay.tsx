
import { useRef, useState } from "react";

interface InterestRateDisplayProps {
  type: 'cash' | 'savings' | 'investments';
  initialRate: number | null;
  onRateChange: (rate: number | null) => void;
}

export const InterestRateDisplay = ({ type, initialRate, onRateChange }: InterestRateDisplayProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [rateValue, setRateValue] = useState<number | null>(initialRate);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatRate = (rate: number | null) => {
    if (rate === null) return null;
    return type === 'savings' ? `${rate}% APY` : `${rate}% avg. return`;
  };

  const handleStartEdit = () => {
    if (type === 'cash') return;
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleFinishEdit = () => {
    if (rateValue !== null) {
      const newRate = parseFloat(rateValue.toString());
      if (!isNaN(newRate) && newRate >= 0 && newRate <= 100) {
        onRateChange(newRate);
      } else {
        setRateValue(initialRate);
      }
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleFinishEdit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setRateValue(initialRate);
    }
  };

  const formattedRate = formatRate(rateValue);

  if (!formattedRate) {
    return <p className="text-sm font-medium text-white/75">&nbsp;</p>;
  }

  return (
    <p 
      className="text-sm font-medium text-white/75 cursor-pointer"
      onClick={handleStartEdit}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="number"
          value={rateValue || ''}
          onChange={(e) => setRateValue(e.target.value ? parseFloat(e.target.value) : null)}
          onBlur={handleFinishEdit}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none p-0 text-sm font-medium text-white w-24 focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          step="0.1"
          min="0"
          max="100"
        />
      ) : (
        formattedRate
      )}
    </p>
  );
};
