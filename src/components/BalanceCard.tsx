
import { motion } from "framer-motion";
import { Card } from "./ui/card";
import { formatCurrency } from "../utils/format";

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

export const BalanceCard = ({ title, amount, type, onAdd, onSubtract }: BalanceCardProps) => {
  return (
    <Card className={`balance-card bg-gradient-to-br ${getGradient(type)} p-6`}>
      <div className="flex flex-col space-y-4">
        <h3 className="text-lg font-medium text-white/90">{title}</h3>
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
  );
};
