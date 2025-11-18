import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { UserInfo } from '../services/cashierService';

interface UserInfoTooltipProps {
  user: UserInfo;
  displayText: string;  // 默认显示的文本（通常是手机号）
  className?: string;   // 可选的样式类
}

export function UserInfoTooltip({ user, displayText, className = '' }: UserInfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`cursor-help underline decoration-dotted ${className}`}>
          {displayText}
        </span>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        <div className="space-y-1 text-xs">
          <div><span className="text-gray-400">用户ID:</span> <span className="font-mono">{user.user_id}</span></div>
          <div><span className="text-gray-400">类型:</span> {user.user_type}</div>
          {user.name && <div><span className="text-gray-400">姓名:</span> {user.name}</div>}
          {user.phone && <div><span className="text-gray-400">手机:</span> {user.phone}</div>}
          {user.email && <div><span className="text-gray-400">邮箱:</span> {user.email}</div>}
          {user.org_id && <div><span className="text-gray-400">组织:</span> {user.org_id}</div>}
          {user.status && <div><span className="text-gray-400">状态:</span> {user.status}</div>}
          {user.online_status && <div><span className="text-gray-400">在线状态:</span> {user.online_status}</div>}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
