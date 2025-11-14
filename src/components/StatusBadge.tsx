import { Badge } from './ui/badge';
import { getAccountStatusBadgeConfig } from '../constants/status';

// 在线状态配置
const ONLINE_STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  'online': { label: '在线', variant: 'default', className: 'bg-green-500' },
  'offline': { label: '离线', variant: 'secondary', className: 'bg-gray-500' },
  'busy': { label: '忙碌', variant: 'default', className: 'bg-yellow-500' },
  'locked': { label: '锁定', variant: 'destructive', className: '' }
};

// 交易状态配置（代收/代付）
const TRX_STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  'active': { label: '启用', variant: 'default', className: 'bg-green-500' },
  'inactive': { label: '禁用', variant: 'secondary', className: 'bg-gray-500' }
};

interface StatusBadgeProps {
  status: string;
  type?: 'account' | 'online' | 'trx';
}

/**
 * 公共状态组件
 * @param status - 状态值
 * @param type - 状态类型：account(账户状态)、online(在线状态)、trx(交易状态)
 */
export function StatusBadge({ status, type = 'account' }: StatusBadgeProps) {
  if (!status) {
    return <span className="text-muted-foreground">-</span>;
  }

  let config;
  const statusLower = status.toLowerCase();

  switch (type) {
    case 'online':
      config = ONLINE_STATUS_CONFIG[statusLower] || { 
        label: status, 
        variant: 'outline' as const, 
        className: '' 
      };
      break;
    case 'trx':
      config = TRX_STATUS_CONFIG[statusLower] || { 
        label: status, 
        variant: 'outline' as const, 
        className: '' 
      };
      break;
    case 'account':
    default:
      config = getAccountStatusBadgeConfig(statusLower);
      break;
  }

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
