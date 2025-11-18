import { Badge } from './ui/badge';
import { 
  getOnlineStatusBadgeConfig, 
  getAppAccountStatusBadgeConfig 
} from '../constants/status';

// 在线状态Badge
export function OnlineStatusBadge({ status }: { status: string }) {
  const config = getOnlineStatusBadgeConfig(status);
  
  return (
    <Badge 
      variant={config.variant} 
      className={`text-xs ${config.className}`}
    >
      {config.label}
    </Badge>
  );
}

// 账户状态Badge
export function AccountStatusBadge({ status }: { status: string }) {
  const config = getAppAccountStatusBadgeConfig(status);
  
  return (
    <Badge 
      variant={config.variant} 
      className={`text-xs ${config.className}`}
    >
      {config.label}
    </Badge>
  );
}
