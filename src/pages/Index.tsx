
import { useState, useEffect } from "react";
import { BalanceCard } from "../components/BalanceCard";
import { TransactionModal } from "../components/TransactionModal";

const Index = () => {
  const [balances, setBalances] = useState(() => {
    const savedBalances = localStorage.getItem('balances');
    return savedBalances ? JSON.parse(savedBalances) : {
      cash: 0,
      savings: 0,
      investments: 0,
    };
  });

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: "add" as "add" | "subtract",
    category: "",
  });

  useEffect(() => {
    localStorage.setItem('balances', JSON.stringify(balances));
  }, [balances]);

  const handleTransaction = (amount: number) => {
    setBalances((prev) => ({
      ...prev,
      [modalState.category]: modalState.type === "add"
        ? prev[modalState.category as keyof typeof prev] + amount
        : prev[modalState.category as keyof typeof prev] - amount,
    }));
  };

  const openModal = (type: "add" | "subtract", category: string) => {
    setModalState({ isOpen: true, type, category });
  };

  const totalBalance = Object.values(balances).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Invest.Kids
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Total Balance:{" "}
            <span className="font-semibold text-money">
              ${totalBalance.toFixed(2)}
            </span>
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <BalanceCard
            title="Cash"
            amount={balances.cash}
            type="cash"
            onAdd={() => openModal("add", "cash")}
            onSubtract={() => openModal("subtract", "cash")}
          />
          <BalanceCard
            title="Savings"
            amount={balances.savings}
            type="savings"
            onAdd={() => openModal("add", "savings")}
            onSubtract={() => openModal("subtract", "savings")}
          />
          <BalanceCard
            title="Investments"
            amount={balances.investments}
            type="investments"
            onAdd={() => openModal("add", "investments")}
            onSubtract={() => openModal("subtract", "investments")}
          />
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
