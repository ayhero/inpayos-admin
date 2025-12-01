import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { DispatchStrategy } from '../services/dispatchStrategyService';
import { Checkbox } from './ui/checkbox';
import { StatusBadge } from './StatusBadge';

// 规则字段配置
const RULE_FIELD_LABELS: Record<string, string> = {
  user_online_required: '用户在线',
  user_status_required: '用户状态',
  user_payin_status: '用户代收状态',
  user_payout_status: '用户代付状态',
  account_online_required: '账户在线',
  account_status_required: '账户状态',
  account_payin_status: '账户代收状态',
  account_payout_status: '账户代付状态',
  min_balance_ratio: '最小余额倍数',
  prevent_same_upi: '防止相同UPI',
  enforce_trx_config: '执行交易配置检查',
  sort_by: '排序方式',
  sort_random_factor: '随机因子(0-1)',
  limit_max_candidates: '最大候选人数',
  limit_min_candidates: '最小候选人数',
};

const STATUS_LABELS: Record<string, string> = {
  active: '启用',
  inactive: '禁用',
};

const SORT_LABELS: Record<string, string> = {
  score_desc: '分数降序',
  random: '随机',
  round_robin: '轮询',
};

interface ViewDispatchStrategyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strategy: DispatchStrategy | null;
}

export function ViewDispatchStrategyModal({ 
  open, 
  onOpenChange, 
  strategy 
}: ViewDispatchStrategyModalProps) {
  if (!strategy) return null;

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  // 渲染规则值
  const renderRuleValue = (key: string, value: any) => {
    if (typeof value === 'boolean') {
      return (
        <div className="flex items-center space-x-2">
          <Checkbox checked={value} disabled />
          <span className="text-sm">是</span>
        </div>
      );
    }
    
    if (Array.isArray(value)) {
      return (
        <div className="space-y-1.5">
          {value.map((v: string, idx: number) => (
            <div key={idx} className="flex items-center space-x-2">
              <Checkbox checked={true} disabled />
              <span className="text-xs">{STATUS_LABELS[v] || v}</span>
            </div>
          ))}
        </div>
      );
    }
    
    if (key === 'sort_by' && typeof value === 'string') {
      return <span className="text-sm">{SORT_LABELS[value] || value}</span>;
    }
    
    return <span className="text-sm">{value}</span>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>派单策略详情</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600">策略ID</Label>
              <div className="mt-1 font-mono text-sm">{strategy.strategy_id}</div>
            </div>
            <div>
              <Label className="text-gray-600">策略代码</Label>
              <div className="mt-1 font-mono">{strategy.code}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600">策略名称</Label>
              <div className="mt-1">{strategy.name}</div>
            </div>
            <div>
              <Label className="text-gray-600">版本</Label>
              <div className="mt-1">{strategy.version}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600">用户ID</Label>
              <div className="mt-1">{strategy.user_id || '-'}</div>
            </div>
            <div>
              <Label className="text-gray-600">状态</Label>
              <div className="mt-1"><StatusBadge status={strategy.status} type="account" /></div>
            </div>
            <div>
              <Label className="text-gray-600">优先级</Label>
              <div className="mt-1">{strategy.priority}</div>
            </div>
          </div>

          {strategy.description && (
            <div>
              <Label className="text-gray-600">策略描述</Label>
              <div className="mt-1 text-sm">{strategy.description}</div>
            </div>
          )}

          {strategy.rules && Object.keys(strategy.rules).length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-base font-semibold">规则配置</h3>
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(strategy.rules).map(([key, value]) => (
                  <div key={key} className="flex flex-col gap-2 p-3 border rounded-lg bg-gray-50">
                    <Label className="text-sm font-medium">
                      {RULE_FIELD_LABELS[key] || key}
                    </Label>
                    <div className="flex-1">
                      {renderRuleValue(key, value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {strategy.remark && (
            <div>
              <Label className="text-gray-600">备注</Label>
              <div className="mt-1 text-sm">{strategy.remark}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <Label className="text-gray-600">创建时间</Label>
              <div className="mt-1 text-sm">{formatDate(strategy.created_at)}</div>
            </div>
            <div>
              <Label className="text-gray-600">更新时间</Label>
              <div className="mt-1 text-sm">{formatDate(strategy.updated_at)}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
