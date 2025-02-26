
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
  // Find interest transactions - they are small amounts added to savings or investments
  const interestTransactions = transactions.filter(t => 
    t.type === "add" && 
    t.category !== "cash" && // Only savings and investments earn interest
    ((t.amount < 1) || (t.amount < 20 && t.amount / 100 < 0.1)) // Small amounts or < 0.1% of principal
  );

  // Group transactions by date
  const transactionsByDate = transactions.reduce((acc, transaction) => {
    const dateStr = format(new Date(transaction.date), "MMM d, yyyy");
    
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    
    // Add a flag to identify interest transactions
    const isInterest = interestTransactions.some(it => it.id === transaction.id);
    
    acc[dateStr].push({
      ...transaction,
      isInterest
    });
    
    return acc;
  }, {} as Record<string, (Transaction & { isInterest?: boolean })[]>);

  // Calculate totals for each date
  const aggregatedTransactions = Object.entries(transactionsByDate).map(([date, txs]) => {
    const add = txs
      .filter(t => t.type === "add" && !t.isInterest)
      .reduce((sum, t) => sum + t.amount, 0);
      
    const interest = txs
      .filter(t => t.isInterest)
      .reduce((sum, t) => sum + t.amount, 0);
      
    const subtract = txs
      .filter(t => t.type === "subtract")
      .reduce((sum, t) => sum + t.amount, 0);
      
    return {
      date,
      add,
      interest,
      subtract
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card className="p-4 bg-white/50 backdrop-blur-sm flex-1">
      <div className="space-y-4">
        <div className="max-h-[220px] overflow-y-auto pr-1">
          {aggregatedTransactions.length > 0 ? (
            aggregatedTransactions.map((dayData) => {
              return (
                <div key={dayData.date} className="space-y-1 pb-2 border-b border-gray-100 last:border-0">
                  <div className="text-xs font-medium text-gray-500">{dayData.date}</div>
                  {dayData.add > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Added</span>
                      <span className="font-medium text-green-600">
                        +{formatCurrency(dayData.add)}
                      </span>
                    </div>
                  )}
                  {dayData.interest > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Interest accrued</span>
                      <span className="font-medium text-blue-600">
                        +{formatCurrency(dayData.interest)}
                      </span>
                    </div>
                  )}
                  {dayData.subtract > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Withdrawn</span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(dayData.subtract)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-400 py-4">No transactions yet</p>
          )}
        </div>
      </div>
    </Card>
  );
};
