
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Card } from "./ui/card";
import { useRef, useState } from "react";
import { ProjectionChart } from "./balance/ProjectionChart";
import { TransactionHistory } from "./balance/TransactionHistory";
import { BalanceDisplay } from "./balance/BalanceDisplay";
import { InterestRateDisplay } from "./balance/InterestRateDisplay";
import { calculateProjectedBalance, getAnnualRate } from "../utils/format";

interface Transaction {
  id: string;
  date: Date;
  amount: number;
  type: "add" | "subtract";
  category: "cash" | "savings" | "investments";
}

interface BalanceCardProps {
  account: {
    id: string;
    name: string;
    cash_balance: number;
    savings_balance: number;
    investments_balance: number;
  };
  type: 'cash' | 'savings' | 'investments';
  onTransaction: (type: "add" | "subtract", accountId: string) => void;
  onNameChange: (accountId: string, newName: string) => void;
  onBalanceChange: (accountId: string, balanceType: string, newAmount: number) => void;
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

export const BalanceCard = ({ account, type, onTransaction, onNameChange, onBalanceChange, transactions }: BalanceCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [interestRate, setInterestRate] = useState<number | null>(getAnnualRate(type));

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

  const amount = account[`${type}_balance`];
  const annualRate = interestRate !== null ? interestRate / 100 : getAnnualRate(type);

  const projections = type !== 'cash' ? {
    twoWeeks: calculateProjectedBalance(amount, annualRate, 14),
    thirtyDays: calculateProjectedBalance(amount, annualRate, 30),
    sixMonths: calculateProjectedBalance(amount, annualRate, 180),
    oneYear: calculateProjectedBalance(amount, annualRate, 365),
    fiveYears: calculateProjectedBalance(amount, annualRate, 1825),
  } : null;

  const chartData = projections ? [
    { name: 'Now', value: amount },
    { name: '2w', value: projections.twoWeeks },
    { name: '30d', value: projections.thirtyDays },
    { name: '6m', value: projections.sixMonths },
    { name: '1y', value: projections.oneYear },
    { name: '5y', value: projections.fiveYears },
  ] : [];

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
        <div className="flex flex-col space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-medium text-white/90">{account.name}</h3>
            <InterestRateDisplay
              type={type}
              initialRate={interestRate}
              onRateChange={setInterestRate}
            />
          </div>
          <BalanceDisplay
            amount={amount}
            onBalanceChange={(newAmount) => onBalanceChange(account.id, `${type}_balance`, newAmount)}
            onAdd={() => onTransaction("add", account.id)}
            onSubtract={() => onTransaction("subtract", account.id)}
          />
        </div>
      </Card>

      {projections && amount > 0 ? (
        <ProjectionChart
          chartData={chartData}
          type={type}
          projections={projections}
        />
      ) : (
        <TransactionHistory transactions={transactions} />
      )}
    </div>
  );
};
