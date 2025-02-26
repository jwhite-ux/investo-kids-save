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
  // Find the latest interest transaction if any
  const latestInterest = transactions
    .filter(t => t.type === "add" && (t.amount < 1 || t.amount / 100 < 0.1))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

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
        (transaction.amount < 1 || (transaction.amount / 100 < 0.1 && transaction.amount > 0))) {
      acc[date].interest += transaction.amount;
    } else if (transaction.type === "add") {
      acc[date].add += transaction.amount;
    } else {
      acc[date].subtract += transaction.amount;
    }
    
    return acc;
  }, {} as Record<string, { add: number; subtract: number; interest: number }>);

  // Convert aggregated data to array and sort by date (most recent first)
  const sortedDates = Object.keys(aggregatedTransactions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const formatInterestDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    
    // Check if the date is today
    if (format(now, 'MMM d, yyyy') === dateString) {
      return 'Today';
    }
    
    // Check if the date is yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (format(yesterday, 'MMM d, yyyy') === dateString) {
      return 'Yesterday';
    }
    
    // Otherwise, return the date
    return dateString;
  };

  return (
    <Card className="p-4 bg-white/50 backdrop-blur-sm flex-1">
      <div className="space-y-4">
        {latestInterest && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3">
            <p className="text-sm text-blue-800 font-medium">
              Interest was last added {formatInterestDate(format(new Date(latestInterest.date), "MMM d, yyyy"))}
              <span className="font-bold ml-1">
                (+{formatCurrency(latestInterest.amount)})
              </span>
            </p>
          </div>
        )}
        
        <p className="text-sm font-medium text-gray-900">Transaction History:</p>
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {sortedDates.length > 0 ? (
            sortedDates.map((date) => {
              const dayTransactions = aggregatedTransactions[date];
              return (
                <div key={date} className="space-y-1 pb-2 border-b border-gray-100 last:border-0">
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
            <p className="text-center text-gray-400 py-4">No transactions yet</p>
          )}
        </div>
      </div>
    </Card>
  );
};
