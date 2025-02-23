import { useState, useEffect } from "react";
import { BalanceCard } from "../components/BalanceCard";
import { TransactionModal } from "../components/TransactionModal";
import { Plus, LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";

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
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: "add" as "add" | "subtract",
    category: "",
    accountId: "",
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kids_accounts")
        .select("*");
      
      if (error) throw error;
      
      return data.map(account => ({
        id: account.id,
        name: account.name,
        balances: {
          cash: Number(account.cash_balance),
          savings: Number(account.savings_balance),
          investments: Number(account.investments_balance),
        }
      }));
    },
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      return data.map(t => ({
        id: t.id,
        date: new Date(t.created_at),
        amount: Number(t.amount),
        type: t.type,
        category: t.category,
        accountId: t.account_id,
      }));
    },
  });

  const addAccountMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("kids_accounts")
        .insert([
          {
            name: `Kid's Account ${accounts.length + 1}`,
            cash_balance: 0,
            savings_balance: 0,
            investments_balance: 0,
            user_id: session.user.id,
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast({
        title: "Success",
        description: "Account created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create account: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: async ({ accountId, name, category, newAmount }: any) => {
      const { error } = await supabase
        .from("kids_accounts")
        .update({
          name: name,
          [`${category}_balance`]: newAmount,
        })
        .eq("id", accountId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });

  const addTransactionMutation = useMutation({
    mutationFn: async ({ amount, type, category, accountId }: any) => {
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert([
          {
            amount,
            type,
            category,
            account_id: accountId,
          }
        ]);
      
      if (transactionError) throw transactionError;

      const accountToUpdate = accounts.find(a => a.id === accountId);
      if (!accountToUpdate) throw new Error("Account not found");

      const newAmount = type === "add"
        ? accountToUpdate.balances[category as keyof AccountBalances] + amount
        : accountToUpdate.balances[category as keyof AccountBalances] - amount;

      const { error: accountError } = await supabase
        .from("kids_accounts")
        .update({
          [`${category}_balance`]: newAmount,
        })
        .eq("id", accountId);
      
      if (accountError) throw accountError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast({
        title: "Success",
        description: "Transaction added successfully",
      });
    },
  });

  const handleTransaction = (amount: number) => {
    addTransactionMutation.mutate({
      amount,
      type: modalState.type,
      category: modalState.category,
      accountId: modalState.accountId,
    });
    setModalState({ ...modalState, isOpen: false });
  };

  const openModal = (type: "add" | "subtract", category: string, accountId: string) => {
    setModalState({ isOpen: true, type, category, accountId });
  };

  const handleNameChange = (accountId: string, newName: string) => {
    updateAccountMutation.mutate({ accountId, name: newName });
  };

  const handleBalanceChange = (accountId: string, category: keyof AccountBalances, newAmount: number) => {
    updateAccountMutation.mutate({ accountId, category, newAmount });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Invest.Kids
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => addAccountMutation.mutate()}
              className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Account
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {accounts.map((account) => (
            <div key={account.id} className="rounded-xl bg-white/50 backdrop-blur-sm p-6 shadow-sm">
              <div className="mb-6">
                <input
                  type="text"
                  value={account.name}
                  onChange={(e) => handleNameChange(account.id, e.target.value)}
                  className="text-2xl font-semibold bg-transparent border-none p-0 focus:ring-0 w-full"
                />
                <p className="mt-2 text-lg text-gray-600">
                  Total Balance:{" "}
                  <span className="font-semibold text-money">
                    ${Object.values(account.balances).reduce((a, b) => a + b, 0).toFixed(2)}
                  </span>
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <BalanceCard
                  title="Cash"
                  amount={account.balances.cash}
                  type="cash"
                  onAdd={() => openModal("add", "cash", account.id)}
                  onSubtract={() => openModal("subtract", "cash", account.id)}
                  onBalanceChange={(newAmount) => handleBalanceChange(account.id, "cash", newAmount)}
                  transactions={transactions.filter(t => t.category === "cash" && t.accountId === account.id)}
                />
                <BalanceCard
                  title="Savings"
                  amount={account.balances.savings}
                  type="savings"
                  onAdd={() => openModal("add", "savings", account.id)}
                  onSubtract={() => openModal("subtract", "savings", account.id)}
                  onBalanceChange={(newAmount) => handleBalanceChange(account.id, "savings", newAmount)}
                  transactions={transactions.filter(t => t.category === "savings" && t.accountId === account.id)}
                />
                <BalanceCard
                  title="Investments"
                  amount={account.balances.investments}
                  type="investments"
                  onAdd={() => openModal("add", "investments", account.id)}
                  onSubtract={() => openModal("subtract", "investments", account.id)}
                  onBalanceChange={(newAmount) => handleBalanceChange(account.id, "investments", newAmount)}
                  transactions={transactions.filter(t => t.category === "investments" && t.accountId === account.id)}
                />
              </div>
            </div>
          ))}
        </div>

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
