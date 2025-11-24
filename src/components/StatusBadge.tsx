import { Badge } from './ui/badge';
import { getAccountStatusBadgeConfig, getStatusDisplayName, getStatusColor } from '../constants/status';

// 在线状态配置
const ONLINE_STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  'online': { label: '在线', variant: 'default', className: 'bg-green-500' },
  'offline': { label: '离线', variant: 'secondary', className: 'bg-gray-500' },
  'busy': { label: '忙碌', variant: 'default', className: 'bg-yellow-500' },
  'locked': { label: '锁定', variant: 'destructive', className: '' }
};

interface StatusBadgeProps {
  status: string;
  type?: 'account' | 'online' | 'trx';
}

/**
 * 公共状态组件
 * @param status - 状态值
 * @param type - 状态类型：account(账户状态)、online(在线状态)、trx(交易状态-使用全局配置)
 */
export function StatusBadge({ status, type = 'account' }: StatusBadgeProps) {
  if (!status || status === '-') {
    return <span className="text-muted-foreground">-</span>;
  }

  const statusLower = status.toLowerCase();

  switch (type) {
    case 'online': {
      const config = ONLINE_STATUS_CONFIG[statusLower] || { 
        label: status, 
        variant: 'outline' as const,
        className: ''
      };
      return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
    }
    case 'trx': {
      // 使用全局配置
      const displayName = getStatusDisplayName(statusLower);
      const color = getStatusColor(statusLower);
      
      const getVariantAndClass = (color: string) => {
        switch (color) {
          case 'success':
            return { variant: 'default' as const, className: 'bg-green-500' };
          case 'error':
            return { variant: 'destructive' as const, className: '' };
          case 'warning':
            return { variant: 'secondary' as const, className: 'bg-yellow-500' };
          case 'info':
            return { variant: 'secondary' as const, className: 'bg-blue-500' };
          default:
            return { variant: 'secondary' as const, className: 'bg-gray-500' };
        }
      };
      
      const { variant, className } = getVariantAndClass(color);
      return <Badge variant={variant} className={className}>{displayName}</Badge>;
    }
    case 'account':
    default: {
      const config = getAccountStatusBadgeConfig(statusLower);
      return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
    }
  }
}
