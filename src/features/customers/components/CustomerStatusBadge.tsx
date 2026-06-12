import React from 'react';
import { UserCheck, UserX, Crown, ShieldAlert } from 'lucide-react';
import type { CustomerStatus } from '../customers.types';

interface Props { status: CustomerStatus }

export default function CustomerStatusBadge({ status }: Props) {
  const config: Record<CustomerStatus, { color: string; icon: typeof UserCheck }> = {
    active: { color: 'text-green-600 bg-green-100', icon: UserCheck },
    inactive: { color: 'text-gray-600 bg-gray-100', icon: UserX },
    vip: { color: 'text-purple-600 bg-purple-100', icon: Crown },
    blacklisted: { color: 'text-red-600 bg-red-100', icon: ShieldAlert }
  };

  const { color, icon: Icon } = config[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded ${color} text-sm font-medium`}>
      <Icon className="w-4 h-4 mr-1" />
      {status.replace('_', ' ')}
    </span>
  );
}
