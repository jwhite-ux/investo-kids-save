
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Card } from "./ui/card";
import { formatCurrency, calculateProjectedBalance, getAnnualRate } from "../utils/format";
import { useRef, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from "date-fns";

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
      return 4.5;
    case 'investments':
      return 10;
    default:
      return null;
  }
};

const formatInterestRate = (rate: number | null, type: string) => {
  if (rate === null) return null;
  return type === 'savings' ? `${rate}% APY` : `${rate}% avg. return`;
};

export const BalanceCard = ({ title, amount, type, onAdd, onSubtract, onBalanceChange, transactions }: BalanceCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [interestRateValue, setInterestRateValue] = useState<number | null>(getInterestRate(type));
  const rateInputRef = useRef<HTMLInputElement>(null);

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

  const handleStartEditRate = () => {
    if (type === 'cash') return;
    setIsEditingRate(true);
    setTimeout(() => rateInputRef.current?.focus(), 0);
  };

  const handleFinishEditRate = () => {
    if (interestRateValue !== null) {
      const newRate = parseFloat(interestRateValue.toString());
      if (!isNaN(newRate) && newRate >= 0 && newRate <= 100) {
        setInterestRateValue(newRate);
      } else {
        setInterestRateValue(getInterestRate(type));
      }
    }
    setIsEditingRate(false);
  };

  const handleRateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleFinishEditRate();
    } else if (e.key === 'Escape') {
      setIsEditingRate(false);
      setInterestRateValue(getInterestRate(type));
    }
  };

  const formattedInterestRate = formatInterestRate(interestRateValue, type);
  const annualRate = interestRateValue !== null ? interestRateValue / 100 : getAnnualRate(type);

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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-sm p-2 rounded shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

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
            <h3 className="text-lg font-medium text-white/90">{title}</h3>
            {formattedInterestRate ? (
              <p 
                className="text-sm font-medium text-white/75 cursor-pointer"
                onClick={handleStartEditRate}
              >
                {isEditingRate ? (
                  <input
                    ref={rateInputRef}
                    type="number"
                    value={interestRateValue || ''}
                    onChange={(e) => setInterestRateValue(e.target.value ? parseFloat(e.target.value) : null)}
                    onBlur={handleFinishEditRate}
                    onKeyDown={handleRateKeyDown}
                    className="bg-transparent border-none p-0 text-sm font-medium text-white w-24 focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    step="0.1"
                    min="0"
                    max="100"
                  />
                ) : (
                  formattedInterestRate
                )}
              </p>
            ) : (
              <p className="text-sm font-medium text-white/75">&nbsp;</p>
            )}
          </div>
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
        </div>
      </Card>

      {projections && amount > 0 ? (
        <Card className="p-4 bg-white/50 backdrop-blur-sm flex-1">
          <div className="h-32 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ right: 20, top: 10, bottom: 5 }}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={type === 'savings' ? '#4F46E5' : '#7C3AED'}
                  strokeWidth={2}
                  dot={(props: any) => {
                    if (props.payload.name === '5y') {
                      return (
                        <>
                          <text
                            x={props.cx - 10}
                            y={props.cy}
                            dy={4}
                            fill={type === 'savings' ? '#4F46E5' : '#7C3AED'}
                            fontSize={12}
                            fontWeight="500"
                            textAnchor="end"
                          >
                            {formatCurrency(props.payload.value)}
                          </text>
                          <circle
                            cx={props.cx}
                            cy={props.cy}
                            r={4}
                            fill={type === 'savings' ? '#4F46E5' : '#7C3AED'}
                            stroke="white"
                            strokeWidth={2}
                          />
                        </>
                      );
                    }
                    return null;
                  }}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  hide
                  domain={['dataMin', 'dataMax']}
                />
                <Tooltip content={<CustomTooltip />} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
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
      ) : (
        <Card className="p-4 bg-white/50 backdrop-blur-sm flex-1">
          <p className="text-sm font-medium text-gray-900 mb-2">Transaction History:</p>
          <div className="space-y-2">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    {format(new Date(transaction.date), "MMM d, yyyy")}
                  </span>
                  <span className={`font-medium ${transaction.type === 'add' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'add' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400">No transactions yet</p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
