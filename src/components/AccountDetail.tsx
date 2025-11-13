import { Badge } from './ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { CurrencyDisplay } from '../utils/currencyMapping';
import { getAccountStatusBadgeConfig } from '../constants/status';

// 账户详情组件的Props类型
interface AccountDetailProps {
  account: any;  // 账户数据
  formatDateTime: (timestamp?: number) => string;
  formatAmount: (amount?: string) => string;
}

export function AccountDetail({ account, formatDateTime, formatAmount }: AccountDetailProps) {
  if (!account) {
    return null;
  }

  // 判断是商户还是车队（根据user_type或其他字段）
  const isMerchant = account.user_type === 'merchant';

  // 获取状态Badge配置
  const statusConfig = getAccountStatusBadgeConfig(account.status);
  const statusBadge = (
    <Badge variant={statusConfig.variant} className={statusConfig.className}>
      {statusConfig.label}
    </Badge>
  );

  return (
    <div className="space-y-6 max-h-[500px] overflow-y-auto">
      {/* 基本信息 */}
      <div className="space-y-4">
        {/* 第一行：账户ID、用户信息、空位（保持3列对齐） */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">账户ID</label>
            <p className="mt-1 text-sm font-mono">{account.account_id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">{isMerchant ? '商户' : '车队'}</label>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="mt-1 text-sm cursor-help underline decoration-dotted">{account.user?.name || '-'}</p>
              </TooltipTrigger>
              {account.user && (
                <TooltipContent side="right" className="max-w-xs">
                  <div className="space-y-1 text-xs">
                    <div><span className="text-gray-400">用户ID:</span> {account.user.user_id}</div>
                    <div><span className="text-gray-400">用户类型:</span> {account.user.user_type}</div>
                    {account.user.org_id && <div><span className="text-gray-400">所属组织:</span> {account.user.org_id}</div>}
                    {account.user.phone && <div><span className="text-gray-400">手机号:</span> {account.user.phone}</div>}
                    {account.user.email && <div><span className="text-gray-400">邮箱:</span> {account.user.email}</div>}
                    {account.user.status && <div><span className="text-gray-400">状态:</span> {account.user.status}</div>}
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </div>
          <div></div>
        </div>
        
        {/* 第二行：币种、状态 */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">币种</label>
            <p className="mt-1 text-sm">{CurrencyDisplay(account.ccy)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">状态</label>
            <p className="mt-1">{statusBadge}</p>
          </div>
          <div></div>
        </div>
        
        {/* 第三行：创建时间、更新时间、最后活跃时间 */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">创建时间</label>
            <p className="mt-1 text-sm">{formatDateTime(account.created_at)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">更新时间</label>
            <p className="mt-1 text-sm">{formatDateTime(account.updated_at)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">最后活跃时间</label>
            <p className="mt-1 text-sm">{formatDateTime(account.last_active_at)}</p>
          </div>
        </div>
      </div>
      
      {/* 实时余额 */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">实时余额</h3>
          {account.balance?.updated_at && (
            <span className="text-sm text-gray-500">
              更新于 {formatDateTime(account.balance.updated_at)}
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {/* 基础余额字段 */}
          <div>
            <label className="text-sm font-medium text-gray-500">总余额</label>
            <p className="mt-1 font-mono text-lg font-semibold">{formatAmount(account.balance?.balance)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">可用余额</label>
            <p className="mt-1 font-mono text-lg font-semibold text-green-600">{formatAmount(account.balance?.available_balance)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">冻结余额</label>
            <p className="mt-1 font-mono text-lg font-semibold text-red-600">{formatAmount(account.balance?.frozen_balance)}</p>
          </div>
          
          {/* 保证金字段 - 所有账户类型都显示 */}
          <div>
            <label className="text-sm font-medium text-gray-500">保证金</label>
            <p className="mt-1 font-mono text-lg font-semibold">{formatAmount(account.balance?.margin_balance)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">可用保证金</label>
            <p className="mt-1 font-mono text-lg font-semibold text-green-600">{formatAmount(account.balance?.available_margin_balance)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">冻结保证金</label>
            <p className="mt-1 font-mono text-lg font-semibold text-red-600">{formatAmount(account.balance?.frozen_margin_balance)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

