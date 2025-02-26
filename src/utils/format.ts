
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const calculateProjectedBalance = (
  principal: number,
  annualRate: number,
  days: number
): number => {
  // Convert annual rate to daily rate (as a decimal)
  const dailyRate = annualRate / 365;
  // Use compound interest formula: A = P(1 + r)^t
  return principal * Math.pow(1 + dailyRate, days);
};

export const calculateInterest = (
  principal: number, 
  annualRate: number, 
  daysPassed: number
): number => {
  // If principal is 0 or days haven't passed, no interest
  if (principal <= 0 || daysPassed <= 0) return 0;
  
  // Convert annual rate to daily rate (as a decimal)
  // For example, 4.5% becomes 0.045 / 365
  const dailyRate = annualRate / 365;
  
  // Calculate interest using compound interest formula
  // Interest = P((1 + r)^t - 1)
  const interest = principal * (Math.pow(1 + dailyRate, daysPassed) - 1);
  
  // Round to 2 decimal places for currency
  return Math.round(interest * 100) / 100;
};

export const getAnnualRate = (type: string): number => {
  switch (type) {
    case 'savings':
      return 0.045; // 4.5% APY - stored as decimal (0.045)
    case 'investments':
      return 0.10; // 10% - stored as decimal (0.10)
    default:
      return 0; // Cash doesn't earn interest
  }
};
