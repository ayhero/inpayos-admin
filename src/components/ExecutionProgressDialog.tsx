import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { CheckCircle2, XCircle, Loader2, AlertCircle, RotateCw } from 'lucide-react';
import { cn } from '../utils/utils';

export type ExecutionStatus = 'pending' | 'running' | 'success' | 'error';

export interface ExecutionItem {
  id: string;
  type: 'user' | 'account' | 'contract' | 'router';
  label: string;
  status: ExecutionStatus;
  error?: string;
  data?: any; // 用于重试时的原始数据
}

interface ExecutionProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ExecutionItem[];
  title?: string;
  autoCloseDelay?: number; // 自动关闭延迟（毫秒），默认6秒
  onRetry?: (item: ExecutionItem) => Promise<void>; // 重试回调函数
  onRetryAll?: (items: ExecutionItem[]) => Promise<void>; // 批量重试回调函数
}

export function ExecutionProgressDialog({
  open,
  onOpenChange,
  items,
  title = '执行进度',
  autoCloseDelay = 6000,
  onRetry,
  onRetryAll
}: ExecutionProgressDialogProps) {
  const [countdown, setCountdown] = useState(0);
  const [retryingItems, setRetryingItems] = useState<Set<string>>(new Set());
  const [retryingAll, setRetryingAll] = useState(false);

  // 计算总体进度
  const totalItems = items.length;
  const completedItems = items.filter(
    item => item.status === 'success' || item.status === 'error'
  ).length;
  const successItems = items.filter(item => item.status === 'success').length;
  const errorItems = items.filter(item => item.status === 'error').length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  const isComplete = completedItems === totalItems;
  const hasErrors = errorItems > 0;

  // 自动关闭逻辑
  useEffect(() => {
    if (!isComplete || !open || hasErrors) {
      setCountdown(0);
      return;
    }

    // 所有任务完成后且无错误时开始倒计时
    const countdownSeconds = Math.ceil(autoCloseDelay / 1000);
    setCountdown(countdownSeconds);

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onOpenChange(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isComplete, open, autoCloseDelay, onOpenChange, hasErrors]);

  const handleRetry = async (item: ExecutionItem) => {
    if (!onRetry || retryingItems.has(item.id)) return;
    
    setRetryingItems(prev => new Set(prev).add(item.id));
    try {
      await onRetry(item);
    } finally {
      setRetryingItems(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const handleRetryAll = async () => {
    const failedItems = items.filter(item => item.status === 'error');
    if (failedItems.length === 0 || retryingAll) return;

    setRetryingAll(true);
    try {
      if (onRetryAll) {
        // 使用批量重试回调
        await onRetryAll(failedItems);
      } else if (onRetry) {
        // 如果没有批量回调，则按顺序逐个重试
        for (const item of failedItems) {
          await handleRetry(item);
        }
      }
    } finally {
      setRetryingAll(false);
    }
  };

  const getStatusIcon = (status: ExecutionStatus) => {
    switch (status) {
      case 'pending':
        return <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'user':
        return '用户';
      case 'account':
        return '账户';
      case 'contract':
        return '合同';
      case 'router':
        return '路由';
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 总体进度 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                总体进度: {completedItems} / {totalItems}
              </span>
              <span className={cn(
                "font-medium",
                isComplete && !hasErrors && "text-green-600",
                isComplete && hasErrors && "text-orange-600"
              )}>
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            
            {isComplete && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-green-600">
                    成功: {successItems}
                  </span>
                  {errorItems > 0 && (
                    <span className="text-red-600">
                      失败: {errorItems}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 执行详情列表 */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            <div className="text-sm font-medium text-muted-foreground mb-2">执行详情</div>
            {items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                  item.status === 'success' && "bg-green-50 border-green-200",
                  item.status === 'error' && "bg-red-50 border-red-200",
                  item.status === 'running' && "bg-blue-50 border-blue-200",
                  item.status === 'pending' && "bg-muted/30 border-muted"
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(item.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {getTypeLabel(item.type)}
                    </span>
                    <span className="text-sm font-medium truncate">
                      {item.label}
                    </span>
                  </div>
                  {item.status === 'running' && (
                    <div className="text-xs text-blue-600 mt-1">执行中...</div>
                  )}
                  {item.status === 'success' && (
                    <div className="text-xs text-green-600 mt-1">创建成功</div>
                  )}
                  {item.status === 'error' && item.error && (
                    <div className="text-xs text-red-600 mt-1 flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{item.error}</span>
                    </div>
                  )}
                </div>
                {item.status === 'error' && onRetry && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRetry(item)}
                    disabled={retryingItems.has(item.id)}
                    className="flex-shrink-0"
                  >
                    {retryingItems.has(item.id) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RotateCw className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* 底部按钮 */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center gap-3">
              {hasErrors && onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetryAll}
                  disabled={retryingAll || items.some(item => item.status === 'running')}
                  className="gap-2"
                >
                  {retryingAll ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>重试中...</span>
                    </>
                  ) : (
                    <>
                      <RotateCw className="w-4 h-4" />
                      <span>重试全部失败项</span>
                    </>
                  )}
                </Button>
              )}
              <div className="text-sm text-muted-foreground">
                {isComplete && !hasErrors && countdown > 0 && (
                  <span>将在 {countdown} 秒后自动关闭</span>
                )}
                {hasErrors && (
                  <span className="text-orange-600">有失败项，请重试或手动处理</span>
                )}
              </div>
            </div>
            <Button
              onClick={() => onOpenChange(false)}
              disabled={!isComplete && items.some(item => item.status === 'running')}
            >
              {isComplete ? '关闭' : '取消'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
