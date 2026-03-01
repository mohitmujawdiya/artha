import type { Transaction as PlaidTransaction } from "plaid";

export function mapPlaidTransaction(
  pt: PlaidTransaction,
  userId: string
) {
  const date = new Date(pt.date);
  return {
    userId,
    date: pt.date + "T12:00:00",
    amount: -(pt.amount ?? 0), // Plaid uses positive for debits; we use negative
    merchant: pt.merchant_name || pt.name || "Unknown",
    category: mapCategory(pt.personal_finance_category?.primary),
    dayOfWeek: date.getDay(),
    hour: 12,
    isRecurring: false,
    isSubscription: false,
    plaidTransactionId: pt.transaction_id,
  };
}

function mapCategory(plaidCategory?: string): string {
  if (!plaidCategory) return "other";
  const map: Record<string, string> = {
    FOOD_AND_DRINK: "food",
    TRANSPORTATION: "transport",
    ENTERTAINMENT: "entertainment",
    SHOPPING: "shopping",
    PERSONAL_CARE: "personal",
    GENERAL_MERCHANDISE: "shopping",
    INCOME: "income",
    TRANSFER_IN: "income",
    TRANSFER_OUT: "transfer",
    RENT_AND_UTILITIES: "bills",
    LOAN_PAYMENTS: "bills",
    MEDICAL: "health",
    TRAVEL: "travel",
    GENERAL_SERVICES: "services",
  };
  return map[plaidCategory] || "other";
}
