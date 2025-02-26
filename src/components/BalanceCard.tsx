
import { useMotionValue, useSpring, motion } from "framer-motion";
import { Card } from "./ui/card";
import { calculateProjectedBalance, getAnnualRate } from "../utils/format";
import { useRef, useState } from "react";
import { CardHeader } from "./balance/CardHeader";
import { StepperControls } from "./balance/StepperControls";
import { ProjectionsChart } from "./balance/ProjectionsChart";
import { TransactionHistory } from "./balance/TransactionHistory";
import { LineChart, Clock } from "lucide-react";

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
  const [activeView, setActiveView] = useState<'projections' | 'history'>(type !== 'cash' ? 'projections' : 'history');
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 700 };
  const followX = useSpring(mouseX, springConfig);
  const followY = useSpring(mouseY, springConfig);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || type !== 'cash') return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleStep = (stepType: "add" | "subtract") => {
    if (stepType === "subtract" && amount < 1) return;
    
    const newValue = stepType === "add" ? amount + 1 : amount - 1;
    onBalanceChange(newValue);
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

  return (
    <div className="flex flex-col space-y-4 h-full">
      <Card 
        ref={cardRef}
        className={`balance-card bg-gradient-to-br ${getGradient(type)} p-6 relative overflow-hidden flex-shrink-0`}
        onMouseMove={handleMouseMove}
      >
        {type !== 'cash' && (
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-white/70 backdrop-blur-sm rounded-full p-0.5 inline-flex shadow-sm scale-75">
              <button
                onClick={() => setActiveView('projections')}
                className={`p-1 rounded-full transition-colors ${
                  activeView === 'projections'
                    ? type === 'savings' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-purple-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="Projections"
              >
                <LineChart size={14} />
              </button>
              <button
                onClick={() => setActiveView('history')}
                className={`p-1 rounded-full transition-colors ${
                  activeView === 'history'
                    ? type === 'savings' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-purple-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="History"
              >
                <Clock size={14} />
              </button>
            </div>
          </div>
        )}
        
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
            amount={amount} 
            interestRate={interestRate}
            onAmountChange={onBalanceChange}
          />
          <StepperControls amount={amount} onStep={handleStep} />
        </div>
      </Card>

      {(type === 'cash' || activeView === 'history') ? (
        <TransactionHistory transactions={transactions} />
      ) : (
        <ProjectionsChart amount={amount} projections={projections!} type={type as 'savings' | 'investments'} />
      )}
    </div>
  );
};
