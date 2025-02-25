
import { motion } from "framer-motion";
import { formatCurrency } from "../../utils/format";

interface CardHeaderProps {
  title: string;
  amount: number;
  interestRate: string | null;
}

export const CardHeader = ({ title, amount, interestRate }: CardHeaderProps) => {
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
      <motion.div
        key={amount}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-white"
      >
        {formatCurrency(amount)}
      </motion.div>
    </div>
  );
};
