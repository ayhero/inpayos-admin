import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { DispatchStrategy } from '../services/dispatchStrategyService';

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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'active': 'default',
      'inactive': 'secondary',
      'testing': 'outline'
    };
    const labels: Record<string, string> = {
      'active': '启用',
      'inactive': '禁用',
      'testing': '测试'
    };
    return <Badge variant={variants[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>派单策略详情</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
              <div className="mt-1">{getStatusBadge(strategy.status)}</div>
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

          {strategy.rules && (
            <div>
              <Label className="text-gray-600">派单规则配置</Label>
              <div className="mt-1 bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(strategy.rules, null, 2)}
                </pre>
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
