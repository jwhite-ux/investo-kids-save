
import { useState, useEffect } from "react";
import { BalanceCard } from "../components/BalanceCard";
import { TransactionModal } from "../components/TransactionModal";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AccountBalances {
  cash: number;
  savings: number;
  investments: number;
}

interface KidsAccount {
  id: string;
  name: string;
  balances: AccountBalances;
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
    return savedAccounts ? JSON.parse(savedAccounts) : [{
      id: crypto.randomUUID(),
      name: "Kid's Account",
      balances: {
        cash: 0,
        savings: 0,
        investments: 0,
      }
    }];
  });

  const [selectedAccountId, setSelectedAccountId] = useState<string>(() => {
    return accounts[0]?.id || '';
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

  useEffect(() => {
    localStorage.setItem('accounts', JSON.stringify(accounts));
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [accounts, transactions]);

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
      }
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

        <div className="mb-6">
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select an account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedAccount && (
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
