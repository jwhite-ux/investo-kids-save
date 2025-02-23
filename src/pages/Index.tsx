
import { useState } from "react";
import { BalanceCard } from "../components/BalanceCard";
import { TransactionModal } from "../components/TransactionModal";
import { Plus, LogOut, UserCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";

interface Transaction {
  id: string;
  account_id: string;
  amount: number;
  type: string;
  category: string;
  created_at: string;
}

interface ModalState {
  isOpen: boolean;
  type: "add" | "subtract" | null;
  accountId: string | null;
}

interface Account {
  id: string;
  name: string;
  cash_balance: number;
  savings_balance: number;
  investments_balance: number;
}

const Index = () => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: null,
    accountId: null,
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: accounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kids_accounts")
        .select("*")
        .eq("user_id", session?.user.id);
      if (error) {
        throw new Error(error.message);
      }
      return data as Account[];
    },
  });

  const { data: transactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", session?.user.id);
      if (error) {
        throw new Error(error.message);
      }
      return (data || []) as Transaction[];
    },
  });

  const addAccountMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from("kids_accounts").insert([
        {
          user_id: session?.user.id,
          name: "New Account",
          cash_balance: 0,
          savings_balance: 0,
          investments_balance: 0,
        },
      ]);
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast({
        title: "Success",
        description: "Account added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      localStorage.removeItem("sb-uiclcvtpifwbvfojxxtp-auth-token");
      navigate("/auth");
    }
  };

  const openModal = (type: "add" | "subtract", accountId: string) => {
    setModalState({ isOpen: true, type, accountId });
  };

  const handleTransaction = async (amount: number) => {
    if (!modalState.accountId || !modalState.type) {
      toast({
        title: "Error",
        description: "Invalid transaction parameters",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("transactions").insert([
      {
        account_id: modalState.accountId,
        amount,
        type: modalState.type,
        category: "cash", // Default to cash for now
      },
    ]);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Transaction added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    }

    setModalState({ ...modalState, isOpen: false });
  };

  const handleNameChange = async (accountId: string, newName: string) => {
    const { error } = await supabase
      .from("kids_accounts")
      .update({ name: newName })
      .eq("id", accountId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Account name updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    }
  };

  const handleBalanceChange = async (
    accountId: string,
    balanceType: string,
    newBalance: number
  ) => {
    const { error } = await supabase
      .from("kids_accounts")
      .update({ [balanceType]: newBalance })
      .eq("id", accountId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `${
          balanceType.split("_")[0].charAt(0).toUpperCase() +
          balanceType.split("_")[0].slice(1)
        } balance updated successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kids Money Manager</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/profile")}>
            <UserCircle className="mr-2" />
            Profile
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts?.map((account) => (
          <div key={account.id} className="flex gap-4">
            <BalanceCard
              key={account.id}
              account={account}
              type="cash"
              onTransaction={openModal}
              onNameChange={handleNameChange}
              onBalanceChange={handleBalanceChange}
              transactions={transactions?.filter(t => t.account_id === account.id && t.category === 'cash') ?? []}
            />
            <BalanceCard
              key={`${account.id}-savings`}
              account={account}
              type="savings"
              onTransaction={openModal}
              onNameChange={handleNameChange}
              onBalanceChange={handleBalanceChange}
              transactions={transactions?.filter(t => t.account_id === account.id && t.category === 'savings') ?? []}
            />
            <BalanceCard
              key={`${account.id}-investments`}
              account={account}
              type="investments"
              onTransaction={openModal}
              onNameChange={handleNameChange}
              onBalanceChange={handleBalanceChange}
              transactions={transactions?.filter(t => t.account_id === account.id && t.category === 'investments') ?? []}
            />
          </div>
        ))}
        <button
          onClick={() => addAccountMutation.mutate()}
          className="flex items-center justify-center h-48 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
        >
          <Plus className="mr-2" />
          Add Account
        </button>
      </div>

      <TransactionModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onConfirm={handleTransaction}
        type={modalState.type}
        category={modalState.accountId ? "cash" : undefined}
      />
    </div>
  );
};

export default Index;
