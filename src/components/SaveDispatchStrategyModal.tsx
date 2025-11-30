import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { toast } from '../utils/toast';
import { 
  dispatchStrategyService, 
  DispatchStrategy, 
  SaveDispatchStrategyParams 
} from '../services/dispatchStrategyService';
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
import { DispatchRulesEditor } from './DispatchRulesEditor';
import { UserSelector } from './UserSelector';

interface SaveDispatchStrategyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strategy: DispatchStrategy | null;
  onSuccess: () => void;
}

export function SaveDispatchStrategyModal({ 
  open, 
  onOpenChange, 
  strategy, 
  onSuccess 
}: SaveDispatchStrategyModalProps) {
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [formData, setFormData] = useState<SaveDispatchStrategyParams>({
    code: '',
    name: '',
    version: 'v1.0',
    user_id: '',
    description: '',
    status: 'active',
    priority: 0,
    rules: undefined,
    remark: ''
  });

  useEffect(() => {
    if (open) {
      if (strategy) {
        // 编辑模式
        setFormData({
          id: strategy.id,
          code: strategy.code,
          name: strategy.name,
          version: strategy.version || 'v1.0',
          user_id: strategy.user_id || '',
          description: strategy.description || '',
          status: strategy.status,
          priority: strategy.priority || 0,
          rules: strategy.rules,
          remark: strategy.remark || ''
        });
      } else {
        // 新增模式
        setFormData({
          code: '',
          name: '',
          version: 'v1.0',
          user_id: '',
          description: '',
          status: 'active',
          priority: 0,
          rules: undefined,
          remark: ''
        });
      }
    }
  }, [open, strategy]);

  const handleRulesChange = (rules: Record<string, any>) => {
    setFormData({ ...formData, rules: Object.keys(rules).length > 0 ? rules : undefined });
  };

  const handleStatusChange = (checked: boolean) => {
    setFormData({ ...formData, status: checked ? 'active' : 'inactive' });
  };

  const handleSubmitClick = () => {
    // 验证必填字段
    if (!formData.code.trim()) {
      toast.error('请输入策略代码');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('请输入策略名称');
      return;
    }

    // 显示确认对话框
    setConfirmDialogOpen(true);
  };

  const handleConfirmSave = async () => {
    setConfirmDialogOpen(false);
    setLoading(true);

    try {
      const response = await dispatchStrategyService.saveStrategy(formData);
      if (response.success) {
        toast.success(strategy ? '更新策略成功' : '创建策略成功');
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(response.msg || (strategy ? '更新策略失败' : '创建策略失败'));
      }
    } catch (error) {
      console.error('保存失败:', error);
      toast.error(strategy ? '更新策略失败' : '创建策略失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{strategy ? '编辑派单策略' : '新增派单策略'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {/* 第一行: 代码、名称、状态 */}
            <div className="flex gap-3">
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="策略代码 *"
                disabled={!!strategy}
                className="w-48"
              />
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="策略名称 *"
                className="w-64"
              />
              <div className="flex items-center space-x-2 w-24">
                <Checkbox
                  id="status"
                  checked={formData.status === 'active'}
                  onCheckedChange={handleStatusChange}
                />
                <label
                  htmlFor="status"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  启用
                </label>
              </div>
            </div>

            {/* 第二行: 用户、优先级、版本 */}
            <div className="flex gap-3">
              <UserSelector
                value={formData.user_id}
                onChange={(userId) => setFormData(prev => ({ ...prev, user_id: userId }))}
                onClear={() => setFormData(prev => ({ ...prev, user_id: '' }))}
                placeholder="用户 (空=全局)"
                className="w-64"
                userType="cashier_team"
                autoLoad={open}
              />
              <Input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                placeholder="优先级"
                className="w-40"
              />
              <Input
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="版本"
                className="w-40"
              />
            </div>

            {/* 第三行: 描述和备注 */}
            <div className="grid grid-cols-2 gap-3">
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="策略描述"
                rows={2}
                className="resize-none"
              />
              <Textarea
                value={formData.remark}
                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                placeholder="备注"
                rows={2}
                className="resize-none"
              />
            </div>

            {/* 规则配置 - 单独模块，放最底层 */}
            <div className="space-y-3 pt-4 border-t">
              <DispatchRulesEditor
                value={formData.rules}
                onChange={handleRulesChange}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              取消
            </Button>
            <Button onClick={handleSubmitClick} disabled={loading}>
              {loading ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 确认保存对话框 */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认保存</AlertDialogTitle>
            <AlertDialogDescription>
              确定要{strategy ? '更新' : '创建'}策略 "{formData.name}" 吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>
              确定
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
