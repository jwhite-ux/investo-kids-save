
import { useMotionValue, useSpring, motion } from "framer-motion";
import { Card } from "./ui/card";
import { calculateProjectedBalance, getAnnualRate } from "../utils/format";
import { useRef, useEffect, useState } from "react";
import { CardHeader } from "./balance/CardHeader";
import { StepperControls } from "./balance/StepperControls";
import { ProjectionsChart } from "./balance/ProjectionsChart";
import { TransactionHistory } from "./balance/TransactionHistory";

interface Transaction {
  id: string;
  date: Date;
  amount: number;
  type: "add" | "subtract";
  category: "cash" | "savings" | "investments";
}

interface BalanceCardProps {
  title: string;
  amount: number;
  type: 'cash' | 'savings' | 'investments';
  onAdd: () => void;
  onSubtract: () => void;
  onBalanceChange: (newAmount: number) => void;
  transactions: Transaction[];
}

const getGradient = (type: string) => {
  switch (type) {
    case 'cash':
      return 'from-green-400 to-emerald-600';
    case 'savings':
      return 'from-blue-400 to-indigo-600';
    case 'investments':
      return 'from-purple-400 to-violet-600';
    default:
      return 'from-gray-400 to-gray-600';
  }
};

const getInterestRate = (type: string) => {
  switch (type) {
    case 'savings':
      return '4.5% APY';
    case 'investments':
      return '8-12% avg. return';
    default:
      return null;
  }
};

export const BalanceCard = ({ title, amount, type, onAdd, onSubtract, onBalanceChange, transactions }: BalanceCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Add state to track pending transactions
  const [pendingAmount, setPendingAmount] = useState(0);
  const [pendingType, setPendingType] = useState<"add" | "subtract" | null>(null);
  const timeoutRef = useRef<number>();

  const springConfig = { damping: 25, stiffness: 700 };
  const followX = useSpring(mouseX, springConfig);
  const followY = useSpring(mouseY, springConfig);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || type !== 'cash') return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    mouseX.set(x);
    mouseY.set(y);
  };

  const commitPendingTransaction = () => {
    if (pendingAmount > 0 && pendingType) {
      onBalanceChange(pendingType === "add" ? amount + pendingAmount : amount - pendingAmount);
      setPendingAmount(0);
      setPendingType(null);
    }
  };

  const handleStep = (stepType: "add" | "subtract") => {
    if (stepType === "subtract" && amount < 1) return;
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    // If this is a new transaction type, commit any pending transaction first
    if (pendingType && pendingType !== stepType) {
      commitPendingTransaction();
    }

    // Update pending amount
    setPendingType(stepType);
    setPendingAmount(prev => prev + 1);

    // Set a timeout to commit the transaction
    timeoutRef.current = window.setTimeout(() => {
      commitPendingTransaction();
    }, 1500); // Wait 1.5 seconds before committing
  };

  const interestRate = getInterestRate(type);
  const annualRate = getAnnualRate(type);

  const projections = type !== 'cash' ? {
    twoWeeks: calculateProjectedBalance(amount, annualRate, 14),
    thirtyDays: calculateProjectedBalance(amount, annualRate, 30),
    sixMonths: calculateProjectedBalance(amount, annualRate, 180),
    oneYear: calculateProjectedBalance(amount, annualRate, 365),
    fiveYears: calculateProjectedBalance(amount, annualRate, 1825),
  } : null;

  // Calculate the preview amount including pending changes
  const previewAmount = pendingType === "add" 
    ? amount + pendingAmount 
    : pendingType === "subtract" 
      ? amount - pendingAmount 
      : amount;

  return (
    <div className="flex flex-col space-y-4 h-full">
      <Card 
        ref={cardRef}
        className={`balance-card bg-gradient-to-br ${getGradient(type)} p-6 relative overflow-hidden flex-shrink-0`}
        onMouseMove={handleMouseMove}
      >
        {type === 'cash' && (
          <motion.div
            className="pointer-events-none absolute -inset-px opacity-50"
            style={{
              background: "radial-gradient(circle 150px at var(--x) var(--y), rgba(255,255,255,0.5), transparent 60%)",
              WebkitMaskImage: "radial-gradient(circle 150px at var(--x) var(--y), white, transparent)",
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            animate={{
              '--x': followX,
              '--y': followY,
            } as any}
          />
        )}
        <div className="flex justify-between items-start">
          <CardHeader 
            title={title} 
            amount={previewAmount} 
            interestRate={interestRate}
            onAmountChange={onBalanceChange}
          />
          <StepperControls amount={amount} onStep={handleStep} />
        </div>
      </Card>

      {projections && previewAmount > 0 ? (
        <ProjectionsChart amount={previewAmount} projections={projections} type={type as 'savings' | 'investments'} />
      ) : (
        <TransactionHistory transactions={transactions} />
      )}
    </div>
  );
};
