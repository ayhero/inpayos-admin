import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
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
  const [rulesJson, setRulesJson] = useState('');
  const [jsonError, setJsonError] = useState('');

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
        setRulesJson(strategy.rules ? JSON.stringify(strategy.rules, null, 2) : '');
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
        setRulesJson('');
      }
      setJsonError('');
    }
  }, [open, strategy]);

  const handleRulesChange = (value: string) => {
    setRulesJson(value);
    setJsonError('');
    
    if (!value.trim()) {
      setFormData({ ...formData, rules: undefined });
      return;
    }

    try {
      const parsed = JSON.parse(value);
      setFormData({ ...formData, rules: parsed });
    } catch (error) {
      setJsonError('JSON 格式错误');
    }
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
    if (jsonError) {
      toast.error('请修正 JSON 格式错误');
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{strategy ? '编辑派单策略' : '新增派单策略'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">
                  策略代码 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="请输入策略代码"
                  disabled={!!strategy}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  策略名称 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入策略名称"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="version">策略版本</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="默认 v1.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user_id">用户ID</Label>
                <Input
                  id="user_id"
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  placeholder="为空表示全局策略"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">策略描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请输入策略描述"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>状态</Label>
                <div className="flex items-center space-x-2">
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

              <div className="space-y-2">
                <Label htmlFor="priority">优先级</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  placeholder="数字越大优先级越高"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rules">
                派单规则配置 (JSON)
                {jsonError && <span className="text-red-500 ml-2 text-sm">{jsonError}</span>}
              </Label>
              <Textarea
                id="rules"
                value={rulesJson}
                onChange={(e) => handleRulesChange(e.target.value)}
                placeholder='{"user_online_required": true, "sort_by": "score_desc"}'
                rows={8}
                className={`font-mono text-sm ${jsonError ? 'border-red-500' : ''}`}
              />
              <div className="text-xs text-gray-500">
                示例: &#123;"user_online_required": true, "account_online_required": true, "min_balance_ratio": 1.5, "sort_by": "score_desc"&#125;
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remark">备注</Label>
              <Textarea
                id="remark"
                value={formData.remark}
                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                placeholder="请输入备注"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              取消
            </Button>
            <Button onClick={handleSubmitClick} disabled={loading || !!jsonError}>
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
              确定保存
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
