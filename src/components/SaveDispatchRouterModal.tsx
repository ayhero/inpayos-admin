import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { dispatchRouterService, DispatchRouter, SaveDispatchRouterParams } from '../services/dispatchRouterService';
import { dispatchStrategyService, DispatchStrategy } from '../services/dispatchStrategyService';
import { toast } from '../utils/toast';
import { 
  CASHIER_TRX_TYPE_OPTIONS,
  TRX_METHOD_OPTIONS,
  CCY_OPTIONS,
  COUNTRY_OPTIONS,
} from '../constants/business';

interface SaveDispatchRouterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  userId: string;
  userType: 'merchant' | 'cashier_team';
  router?: DispatchRouter | null;
}

export function SaveDispatchRouterModal({
  open,
  onOpenChange,
  onSuccess,
  userId,
  userType,
  router
}: SaveDispatchRouterModalProps) {
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [strategies, setStrategies] = useState<DispatchStrategy[]>([]);
  const [loadingStrategies, setLoadingStrategies] = useState(false);

  const [formData, setFormData] = useState<SaveDispatchRouterParams>({
    user_id: userId,
    user_type: userType,
    strategy_code: '',
    trx_type: '',
    trx_method: '',
    trx_ccy: '',
    country: '',
    min_amount: undefined,
    max_amount: undefined,
    min_usd_amount: undefined,
    max_usd_amount: undefined,
    start_at: undefined,
    expired_at: undefined,
    daily_start_time: undefined,
    daily_end_time: undefined,
    status: 'active',
    priority: 0,
  });

  // 加载策略列表
  useEffect(() => {
    if (open) {
      loadStrategies();
    }
  }, [open]);

  // 初始化表单数据
  useEffect(() => {
    if (router) {
      setFormData({
        id: router.id,
        user_id: userId,
        user_type: userType,
        strategy_code: router.strategy_code || '',
        trx_type: router.trx_type || '',
        trx_mode: router.trx_mode || '',
        trx_method: router.trx_method || '',
        trx_ccy: router.trx_ccy || '',
        country: router.country || '',
        min_amount: router.min_amount,
        max_amount: router.max_amount,
        min_usd_amount: router.min_usd_amount,
        max_usd_amount: router.max_usd_amount,
        start_at: router.start_at,
        expired_at: router.expired_at,
        daily_start_time: router.daily_start_time,
        daily_end_time: router.daily_end_time,
        status: router.status || 'active',
        priority: router.priority || 0,
      });
    } else {
      setFormData({
        user_id: userId,
        user_type: userType,
        strategy_code: '',
        trx_type: '',
        trx_method: '',
        trx_ccy: '',
        country: '',
        min_amount: undefined,
        max_amount: undefined,
        min_usd_amount: undefined,
        max_usd_amount: undefined,
        start_at: undefined,
        expired_at: undefined,
        daily_start_time: undefined,
        daily_end_time: undefined,
        status: 'active',
        priority: 0,
      });
    }
  }, [router, userId, userType, open]);

  const loadStrategies = async () => {
    setLoadingStrategies(true);
    try {
      const response = await dispatchStrategyService.listStrategies({
        page: 1,
        size: 100,
        status: 'active', // 只加载启用的策略
      });
      if (response.success && response.data) {
        setStrategies(response.data.records || []);
      }
    } catch (error) {
      console.error('加载策略列表失败:', error);
      toast.error('加载策略列表失败');
    } finally {
      setLoadingStrategies(false);
    }
  };

  const handleSubmit = () => {
    // 验证必填字段
    if (!formData.strategy_code) {
      toast.error('请选择派单策略');
      return;
    }
    if (!formData.trx_type) {
      toast.error('请选择交易类型');
      return;
    }
    if (!formData.trx_method) {
      toast.error('请选择支付方式');
      return;
    }
    if (!formData.trx_ccy) {
      toast.error('请选择币种');
      return;
    }
    if (!formData.country) {
      toast.error('请选择国家');
      return;
    }

    // 显示确认对话框
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    setLoading(true);

    try {
      const response = router
        ? await dispatchRouterService.updateDispatchRouter(formData)
        : await dispatchRouterService.createDispatchRouter(formData);

      if (response.success) {
        toast.success(router ? '更新派单路由成功' : '创建派单路由成功');
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(response.msg || (router ? '更新派单路由失败' : '创建派单路由失败'));
      }
    } catch (error) {
      console.error('保存派单路由失败:', error);
      toast.error(router ? '更新派单路由失败' : '创建派单路由失败');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTimeForInput = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toISOString().slice(0, 16); // 格式: YYYY-MM-DDTHH:mm
  };

  const parseDateTimeFromInput = (value: string): number => {
    if (!value) return 0;
    return new Date(value).getTime();
  };

  const formatTimeForInput = (seconds?: number) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const parseTimeFromInput = (value: string): number => {
    if (!value) return 0;
    const [hours, minutes] = value.split(':').map(Number);
    return (hours * 3600) + (minutes * 60);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{router ? '编辑派单路由' : '新增派单路由'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 策略选择 */}
            <div className="space-y-2">
              <Label htmlFor="strategy_code">派单策略 *</Label>
              <Select
                value={formData.strategy_code}
                onValueChange={(value) => setFormData({ ...formData, strategy_code: value })}
                disabled={loadingStrategies}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingStrategies ? "加载中..." : "选择派单策略"} />
                </SelectTrigger>
                <SelectContent>
                  {strategies.map((strategy) => (
                    <SelectItem key={strategy.code} value={strategy.code}>
                      {strategy.name} ({strategy.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 交易类型 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trx_type">交易类型 *</Label>
                <Select
                  value={formData.trx_type}
                  onValueChange={(value) => setFormData({ ...formData, trx_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择交易类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {CASHIER_TRX_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trx_method">支付方式 *</Label>
                <Select
                  value={formData.trx_method}
                  onValueChange={(value) => setFormData({ ...formData, trx_method: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择支付方式" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRX_METHOD_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 币种和国家 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trx_ccy">币种 *</Label>
                <Select
                  value={formData.trx_ccy}
                  onValueChange={(value) => setFormData({ ...formData, trx_ccy: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择币种" />
                  </SelectTrigger>
                  <SelectContent>
                    {CCY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">国家 *</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData({ ...formData, country: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择国家" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 金额范围 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_amount">最小金额</Label>
                <Input
                  id="min_amount"
                  type="number"
                  value={formData.min_amount || ''}
                  onChange={(e) => setFormData({ ...formData, min_amount: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="最小金额"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_amount">最大金额</Label>
                <Input
                  id="max_amount"
                  type="number"
                  value={formData.max_amount || ''}
                  onChange={(e) => setFormData({ ...formData, max_amount: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="最大金额"
                />
              </div>
            </div>

            {/* USD金额范围 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_usd_amount">最小USD金额</Label>
                <Input
                  id="min_usd_amount"
                  type="number"
                  value={formData.min_usd_amount || ''}
                  onChange={(e) => setFormData({ ...formData, min_usd_amount: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="最小USD金额"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_usd_amount">最大USD金额</Label>
                <Input
                  id="max_usd_amount"
                  type="number"
                  value={formData.max_usd_amount || ''}
                  onChange={(e) => setFormData({ ...formData, max_usd_amount: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="最大USD金额"
                />
              </div>
            </div>

            {/* 每日时段 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="daily_start_time">每日开始时间</Label>
                <Input
                  id="daily_start_time"
                  type="time"
                  value={formatTimeForInput(formData.daily_start_time)}
                  onChange={(e) => setFormData({ ...formData, daily_start_time: parseTimeFromInput(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">留空表示不限制</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="daily_end_time">每日结束时间</Label>
                <Input
                  id="daily_end_time"
                  type="time"
                  value={formatTimeForInput(formData.daily_end_time)}
                  onChange={(e) => setFormData({ ...formData, daily_end_time: parseTimeFromInput(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">留空表示不限制</p>
              </div>
            </div>

            {/* 有效期 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_at">生效时间</Label>
                <Input
                  id="start_at"
                  type="datetime-local"
                  value={formatDateTimeForInput(formData.start_at)}
                  onChange={(e) => setFormData({ ...formData, start_at: parseDateTimeFromInput(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">留空表示立即生效</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expired_at">失效时间</Label>
                <Input
                  id="expired_at"
                  type="datetime-local"
                  value={formatDateTimeForInput(formData.expired_at)}
                  onChange={(e) => setFormData({ ...formData, expired_at: parseDateTimeFromInput(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">留空表示永久有效</p>
              </div>
            </div>

            {/* 优先级 */}
            <div className="space-y-2">
              <Label htmlFor="priority">优先级</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                placeholder="优先级(数字越大优先级越高)"
              />
            </div>

            {/* 状态 */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="status"
                checked={formData.status === 'active'}
                onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 'active' : 'inactive' })}
              />
              <Label htmlFor="status" className="cursor-pointer">
                启用该路由
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 确认对话框 */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认{router ? '更新' : '创建'}派单路由</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要{router ? '更新' : '创建'}这个派单路由吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>确认</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
