
import { format } from "date-fns";
import { Card } from "../ui/card";
import { formatCurrency } from "../../utils/format";

interface Transaction {
  id: string;
  date: Date;
  amount: number;
  type: "add" | "subtract";
  category: "cash" | "savings" | "investments";
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export const TransactionHistory = ({ transactions }: TransactionHistoryProps) => {
  return (
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
  );
};
