
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Card } from "./ui/card";
import { formatCurrency, calculateProjectedBalance, getAnnualRate } from "../utils/format";
import { useRef } from "react";

interface BalanceCardProps {
  title: string;
  amount: number;
  type: 'cash' | 'savings' | 'investments';
  onAdd: () => void;
  onSubtract: () => void;
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

export const BalanceCard = ({ title, amount, type, onAdd, onSubtract }: BalanceCardProps) => {
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
    <div className="flex flex-col space-y-4">
      <Card 
        ref={cardRef}
        className={`balance-card bg-gradient-to-br ${getGradient(type)} p-6 relative overflow-hidden`}
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
        <div className="flex flex-col space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-medium text-white/90">{title}</h3>
            {interestRate && (
              <p className="text-sm font-medium text-white/75">{interestRate}</p>
            )}
          </div>
          <motion.div
            key={amount}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white"
          >
            {formatCurrency(amount)}
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
        </div>
      </Card>

      {projections && amount > 0 && (
        <Card className="p-4 bg-white/50 backdrop-blur-sm">
          <p className="text-sm font-medium text-gray-900 mb-2">Projected Balance:</p>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>2 Weeks:</span>
              <span className="font-medium">{formatCurrency(projections.twoWeeks)}</span>
            </div>
            <div className="flex justify-between">
              <span>30 Days:</span>
              <span className="font-medium">{formatCurrency(projections.thirtyDays)}</span>
            </div>
            <div className="flex justify-between">
              <span>6 Months:</span>
              <span className="font-medium">{formatCurrency(projections.sixMonths)}</span>
            </div>
            <div className="flex justify-between">
              <span>1 Year:</span>
              <span className="font-medium">{formatCurrency(projections.oneYear)}</span>
            </div>
            <div className="flex justify-between">
              <span>5 Years:</span>
              <span className="font-medium">{formatCurrency(projections.fiveYears)}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
