import * as React from 'react';
import { Badge } from '@/components/ui';

interface StatusBadgeProps {
  value?: string;
  status?: string;
  variantMap?: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }>;
}

export function StatusBadge({ value, status: statusProp, variantMap = {} }: StatusBadgeProps) {
  const resolvedValue = statusProp ?? value ?? '';
  const status = variantMap[resolvedValue] ?? { label: resolvedValue, variant: 'default' as const };

  return <Badge variant={status.variant}>{status.label}</Badge>;
}
