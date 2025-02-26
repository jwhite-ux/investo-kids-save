
import { useState, useEffect } from "react";
import { BalanceCard } from "../components/BalanceCard";
import { TransactionModal } from "../components/TransactionModal";
import { Plus } from "lucide-react";
import { getAnnualRate } from "../utils/format";

interface AccountBalances {
  cash: number;
  savings: number;
  investments: number;
}

interface KidsAccount {
  id: string;
  name: string;
  balances: AccountBalances;
  lastInterestUpdate: Date;
}

interface Transaction {
  id: string;
  date: Date;
  amount: number;
  type: "add" | "subtract";
  category: "cash" | "savings" | "investments";
  accountId: string;
}

const Index = () => {
  const [accounts, setAccounts] = useState<KidsAccount[]>(() => {
    const savedAccounts = localStorage.getItem('accounts');
    if (savedAccounts) {
      const parsedAccounts = JSON.parse(savedAccounts, (key, value) => {
        if (key === 'lastInterestUpdate') return new Date(value);
        return value;
      });
      
      // Ensure lastInterestUpdate exists for migrating old accounts
      return parsedAccounts.map((account: any) => ({
        ...account,
        lastInterestUpdate: account.lastInterestUpdate || new Date(),
      }));
    }
    
    return [{
      id: crypto.randomUUID(),
      name: "Kid's Account",
      balances: {
        cash: 0,
        savings: 0,
        investments: 0,
      },
      lastInterestUpdate: new Date()
    }];
  });

  const [selectedAccountId, setSelectedAccountId] = useState<string>(() => {
    return accounts[0]?.id || "";
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedTransactions = localStorage.getItem('transactions');
    return savedTransactions ? JSON.parse(savedTransactions, (key, value) => {
      if (key === 'date') return new Date(value);
      return value;
    }) : [];
  });

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: "add" as "add" | "subtract",
    category: "",
    accountId: "",
  });

  // Apply accrued interest on app load and then daily
  useEffect(() => {
    // Apply interest immediately when app loads
    applyAccruedInterest();
    
    // Set up daily interest application
    const dailyInterestInterval = setInterval(() => {
      applyAccruedInterest();
    }, 86400000); // 24 hours in milliseconds
    
    return () => clearInterval(dailyInterestInterval);
  }, []);

  // Save to localStorage whenever accounts or transactions change
  useEffect(() => {
    localStorage.setItem('accounts', JSON.stringify(accounts));
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [accounts, transactions]);

  const applyAccruedInterest = () => {
    const now = new Date();
    
    setAccounts(prevAccounts => {
      let hasUpdates = false;
      const updatedAccounts = prevAccounts.map(account => {
        const lastUpdate = new Date(account.lastInterestUpdate);
        const daysPassed = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Only apply interest if at least 1 day has passed
        if (daysPassed < 1) return account;
        
        const newAccount = { ...account };
        let newTransactions: Transaction[] = [];
        
        // Apply interest to savings (NOT cash)
        if (account.balances.savings > 0) {
          const savingsRate = getAnnualRate('savings');
          const dailyRate = savingsRate / 365;
          const accruedInterest = account.balances.savings * (Math.pow(1 + dailyRate, daysPassed) - 1);
          
          if (accruedInterest > 0.01) { // Only apply if interest is meaningful
            newAccount.balances.savings += accruedInterest;
            
            // Create an interest transaction
            newTransactions.push({
              id: crypto.randomUUID(),
              date: new Date(),
              amount: accruedInterest,
              type: "add",
              category: "savings",
              accountId: account.id,
            });
            
            hasUpdates = true;
          }
        }
        
        // Apply interest to investments (NOT cash)
        if (account.balances.investments > 0) {
          const investmentRate = getAnnualRate('investments');
          const dailyRate = investmentRate / 365;
          const accruedInterest = account.balances.investments * (Math.pow(1 + dailyRate, daysPassed) - 1);
          
          if (accruedInterest > 0.01) { // Only apply if interest is meaningful
            newAccount.balances.investments += accruedInterest;
            
            // Create an interest transaction
            newTransactions.push({
              id: crypto.randomUUID(),
              date: new Date(),
              amount: accruedInterest,
              type: "add",
              category: "investments",
              accountId: account.id,
            });
            
            hasUpdates = true;
          }
        }
        
        // Update last interest timestamp
        newAccount.lastInterestUpdate = now;
        
        // Add interest transactions
        if (newTransactions.length > 0) {
          setTransactions(prev => [...newTransactions, ...prev]);
        }
        
        return newAccount;
      });
      
      return hasUpdates ? updatedAccounts : prevAccounts;
    });
  };

  const handleTransaction = (amount: number) => {
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      date: new Date(),
      amount,
      type: modalState.type,
      category: modalState.category as "cash" | "savings" | "investments",
      accountId: modalState.accountId,
    };

    setTransactions(prev => [newTransaction, ...prev]);
    
    setAccounts(prev => prev.map(account => {
      if (account.id === modalState.accountId) {
        return {
          ...account,
          balances: {
            ...account.balances,
            [modalState.category]: modalState.type === "add"
              ? account.balances[modalState.category as keyof AccountBalances] + amount
              : account.balances[modalState.category as keyof AccountBalances] - amount,
          }
        };
      }
      return account;
    }));
  };

  const openModal = (type: "add" | "subtract", category: string, accountId: string) => {
    setModalState({ isOpen: true, type, category, accountId });
  };

  const addNewAccount = () => {
    const newAccount: KidsAccount = {
      id: crypto.randomUUID(),
      name: `Kid's Account ${accounts.length + 1}`,
      balances: {
        cash: 0,
        savings: 0,
        investments: 0,
      },
      lastInterestUpdate: new Date()
    };
    setAccounts(prev => [...prev, newAccount]);
  };

  const handleNameChange = (accountId: string, newName: string) => {
    setAccounts(prev => prev.map(account => {
      if (account.id === accountId) {
        return { ...account, name: newName };
      }
      return account;
    }));
  };

  const handleBalanceChange = (accountId: string, category: keyof AccountBalances, newAmount: number) => {
    setAccounts(prev => prev.map(account => {
      if (account.id === accountId) {
        const oldAmount = account.balances[category];
        const difference = newAmount - oldAmount;
        
        const newTransaction: Transaction = {
          id: crypto.randomUUID(),
          date: new Date(),
          amount: Math.abs(difference),
          type: difference >= 0 ? "add" : "subtract",
          category,
          accountId,
        };
        
        setTransactions(prev => [newTransaction, ...prev]);

        return {
          ...account,
          balances: {
            ...account.balances,
            [category]: newAmount
          }
        };
      }
      return account;
    }));
  };

  const selectedAccount = accounts.find(account => account.id === selectedAccountId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Invest.Kids
          </h1>
          <button
            onClick={addNewAccount}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Account
          </button>
        </div>

        <div className="relative mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-hide">
            {accounts.map((account) => (
              <button
                key={account.id}
                onClick={() => setSelectedAccountId(account.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedAccountId === account.id
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {account.name}
              </button>
            ))}
          </div>
        </div>

        {selectedAccount && (
          <div className="space-y-8">
            <div className="rounded-xl bg-white/50 backdrop-blur-sm p-6 shadow-sm">
              <div className="mb-6">
                <input
                  type="text"
                  value={selectedAccount.name}
                  onChange={(e) => handleNameChange(selectedAccount.id, e.target.value)}
                  className="text-2xl font-semibold bg-transparent border-none p-0 focus:ring-0 w-full"
                />
                <p className="mt-2 text-lg text-gray-600">
                  Total Balance:{" "}
                  <span className="font-semibold text-money">
                    ${Object.values(selectedAccount.balances).reduce((a, b) => a + b, 0).toFixed(2)}
                  </span>
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <BalanceCard
                  title="Cash"
                  amount={selectedAccount.balances.cash}
                  type="cash"
                  onAdd={() => openModal("add", "cash", selectedAccount.id)}
                  onSubtract={() => openModal("subtract", "cash", selectedAccount.id)}
                  onBalanceChange={(newAmount) => handleBalanceChange(selectedAccount.id, "cash", newAmount)}
                  transactions={transactions.filter(t => t.category === "cash" && t.accountId === selectedAccount.id)}
                />
                <BalanceCard
                  title="Savings"
                  amount={selectedAccount.balances.savings}
                  type="savings"
                  onAdd={() => openModal("add", "savings", selectedAccount.id)}
                  onSubtract={() => openModal("subtract", "savings", selectedAccount.id)}
                  onBalanceChange={(newAmount) => handleBalanceChange(selectedAccount.id, "savings", newAmount)}
                  transactions={transactions.filter(t => t.category === "savings" && t.accountId === selectedAccount.id)}
                />
                <BalanceCard
                  title="Investments"
                  amount={selectedAccount.balances.investments}
                  type="investments"
                  onAdd={() => openModal("add", "investments", selectedAccount.id)}
                  onSubtract={() => openModal("subtract", "investments", selectedAccount.id)}
                  onBalanceChange={(newAmount) => handleBalanceChange(selectedAccount.id, "investments", newAmount)}
                  transactions={transactions.filter(t => t.category === "investments" && t.accountId === selectedAccount.id)}
                />
              </div>
            </div>
          </div>
        )}

        <TransactionModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ ...modalState, isOpen: false })}
          onConfirm={handleTransaction}
          type={modalState.type}
          category={modalState.category}
        />
      </div>
    </div>
  );
};

export default Index;
