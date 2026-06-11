import { useQuery } from '@tanstack/react-query';
import { reportsService } from './reports.service';

export function useFinancialReport(params?: { startDate?: string; endDate?: string }) {
  return useQuery(['financialReport', params], () => reportsService.getFinancialReport(params));
}

export default {};
