
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const calculateProjectedBalance = (
  principal: number,
  annualRate: number,
  days: number
): number => {
  // Convert annual rate to daily rate
  const dailyRate = annualRate / 365;
  // Use compound interest formula: A = P(1 + r)^t
  return principal * Math.pow(1 + dailyRate, days);
};

export const getAnnualRate = (type: string): number => {
  switch (type) {
    case 'savings':
      return 0.045; // 4.5% APY
    case 'investments':
      return 0.10; // Using 10% (middle of 8-12% range)
    default:
      return 0; // Cash doesn't earn interest
  }
};
