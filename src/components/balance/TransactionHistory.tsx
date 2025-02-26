
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
  // Aggregate transactions by date
  const aggregatedTransactions = transactions.reduce((acc, transaction) => {
    const date = format(new Date(transaction.date), "MMM d, yyyy");
    
    if (!acc[date]) {
      acc[date] = {
        add: 0,
        subtract: 0,
        interest: 0
      };
    }
    
    // Detect interest transactions (small additions that are likely interest)
    if (transaction.type === "add" && 
        (transaction.amount < 1 || 
         (transaction.category !== "cash" && transaction.amount / 10 < 1))) {
      acc[date].interest += transaction.amount;
    } else {
      acc[date][transaction.type] += transaction.amount;
    }
    
    return acc;
  }, {} as Record<string, { add: number; subtract: number; interest: number }>);

  // Convert aggregated data to array and sort by date (most recent first)
  const sortedDates = Object.keys(aggregatedTransactions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <Card className="p-4 bg-white/50 backdrop-blur-sm flex-1">
      <p className="text-sm font-medium text-gray-900 mb-2">Transaction History:</p>
      <div className="space-y-2">
        {sortedDates.length > 0 ? (
          sortedDates.map((date) => {
            const dayTransactions = aggregatedTransactions[date];
            return (
              <div key={date} className="space-y-1">
                <div className="text-xs font-medium text-gray-500">{date}</div>
                {dayTransactions.add > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Added</span>
                    <span className="font-medium text-green-600">
                      +{formatCurrency(dayTransactions.add)}
                    </span>
                  </div>
                )}
                {dayTransactions.interest > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Interest earned</span>
                    <span className="font-medium text-blue-600">
                      +{formatCurrency(dayTransactions.interest)}
                    </span>
                  </div>
                )}
                {dayTransactions.subtract > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Withdrawn</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(dayTransactions.subtract)}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-400">No transactions yet</p>
        )}
      </div>
    </Card>
  );
};
