export interface FinancialSummary {
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
}

export interface MonthlyPoint {
  month: string;
  value: number;
}

export interface FinancialReport {
  summary: FinancialSummary;
  monthlyTrend: MonthlyPoint[];
  revenueByService?: Array<{ service: string; amount: number }>;
}

export default {};
