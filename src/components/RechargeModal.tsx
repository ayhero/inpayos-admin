import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Wallet } from 'lucide-react';
import { accountService } from '../services/accountService';
import { toast } from '../utils/toast';
import { UserTypeLabel } from './UserTypeLabel';
import { ConfirmDialog } from './ui/confirm-dialog';
import { getCcyLabel } from '../constants/business';

interface RechargeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  userType: 'merchant' | 'cashier_team';
  onSuccess?: () => void;
}

interface UserBalance {
  ccy: string;
  balance: string;
  availableBalance: string;
}

export function RechargeModal({ 
  open, 
  onOpenChange, 
  userId, 
  userName, 
  userType,
  onSuccess 
}: RechargeModalProps) {
  const [amount, setAmount] = useState('');
  const [ccy, setCcy] = useState('INR');
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balances, setBalances] = useState<UserBalance[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  // 加载用户余额
  const loadBalances = async () => {
    if (!userId) return;
    
    setBalanceLoading(true);
    try {
      const response = await accountService.getAccountList({
        user_id: userId,
        user_type: userType,
        page: 1,
        size: 100
      });
      if (response.success) {
        const accounts = response.data.records || [];
        setBalances(accounts.map(acc => ({
          ccy: acc.ccy,
          balance: acc.balance,
          availableBalance: acc.available_balance
        })));
        // 如果只有一个账户，自动选中
        if (accounts.length === 1) {
          setCcy(accounts[0].ccy);
        }
      }
    } catch (error) {
      console.error('获取余额失败:', error);
    } finally {
      setBalanceLoading(false);
    }
  };

  // 监听弹窗打开
  useEffect(() => {
    if (open && userId) {
      loadBalances();
      // 重置表单
      setAmount('');
      setRemark('');
    }
  }, [open, userId]);

  // 验证金额
  const validateAmount = (value: string): boolean => {
    if (!value || value.trim() === '') return false;
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return false;
    // 最多两位小数
    if (!/^\d+(\.\d{1,2})?$/.test(value)) return false;
    return true;
  };

  // 提交充值
  const handleSubmit = () => {
    // 验证
    if (!validateAmount(amount)) {
      toast.error('请输入有效的充值金额', '金额必须大于0，最多两位小数');
      return;
    }

    if (!ccy) {
      toast.error('请选择币种');
      return;
    }

    // 显示确认对话框
    setShowConfirm(true);
  };

  // 确认充值
  const confirmRecharge = async () => {
    setLoading(true);
    try {
      const response = await accountService.depositAccount({
        user_id: userId,
        user_type: userType,
        amount,
        ccy,
        remark: remark.trim() || undefined
      });

      if (response.success) {
        toast.success('充值成功', `已为用户 ${userName} 充值 ${ccy} ${amount}`);
        onOpenChange(false);
        // 调用成功回调刷新父组件
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error('充值失败', response.msg);
      }
    } catch (error: any) {
      console.error('充值失败:', error);
      toast.error('充值失败', error.message || '网络错误，请稍后重试');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  // 获取当前币种的余额
  const getCurrentBalance = () => {
    const balance = balances.find(b => b.ccy === ccy);
    return balance ? balance.availableBalance : '0.00';
  };

  // 计算充值后的余额
  const getNewBalance = () => {
    const current = parseFloat(getCurrentBalance());
    const rechargeAmount = parseFloat(amount) || 0;
    return (current + rechargeAmount).toFixed(2);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              账户充值
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 用户信息 */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">用户</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{userName}</span>
                    <UserTypeLabel type={userType} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">用户ID</span>
                  <span className="font-mono text-sm">{userId}</span>
                </div>
                {balanceLoading ? (
                  <div className="text-sm text-muted-foreground">加载余额中...</div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">当前余额</span>
                    <span className="font-semibold text-lg">{getCcyLabel(ccy)} {getCurrentBalance()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 充值表单 */}
            <div className="space-y-4">
              {/* 币种和充值金额 - 同一行 */}
              <div className="grid grid-cols-3 gap-3">
                {/* 币种选择 */}
                <div>
                  <select
                    id="ccy"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={ccy}
                    onChange={(e) => setCcy(e.target.value)}
                    disabled={balances.length === 0}
                  >
                    {balances.length > 0 ? (
                      balances.map(b => (
                        <option key={b.ccy} value={b.ccy}>
                          {getCcyLabel(b.ccy)} ({b.ccy})
                        </option>
                      ))
                    ) : (
                      <option value="INR">INR - 印度卢比</option>
                    )}
                  </select>
                </div>

                {/* 充值金额 */}
                <div className="col-span-2">
                  <Input
                    id="amount"
                    type="text"
                    placeholder="请输入充值金额"
                    value={amount}
                    onChange={(e) => {
                      const value = e.target.value;
                      // 只允许数字和小数点
                      if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                        setAmount(value);
                      }
                    }}
                    className="font-mono"
                    autoComplete="off"
                  />
                  {amount && validateAmount(amount) && (
                    <p className="text-xs text-green-600 mt-1">
                      充值后余额: {getCcyLabel(ccy)} {getNewBalance()}
                    </p>
                  )}
                </div>
              </div>

              {/* 备注 */}
              <div>
                <textarea
                  id="remark"
                  placeholder="备注（选填，如充值原因等）"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  maxLength={200}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  style={{ minHeight: '80px', maxHeight: '80px' }}
                />
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                取消
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !validateAmount(amount)}
              >
                提交充值
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 确认对话框 */}
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="确认充值"
        description={
          <div className="space-y-2">
            <p>请确认充值信息：</p>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">用户:</span>
                <span className="font-semibold">{userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">币种:</span>
                <span className="font-semibold">{getCcyLabel(ccy)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">充值金额:</span>
                <span className="font-semibold text-green-600">+{amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">当前余额:</span>
                <span>{getCurrentBalance()}</span>
              </div>
              <div className="flex justify-between border-t pt-1 mt-1">
                <span className="text-muted-foreground">充值后余额:</span>
                <span className="font-semibold">{getNewBalance()}</span>
              </div>
              {remark && (
                <div className="flex justify-between border-t pt-1 mt-1">
                  <span className="text-muted-foreground">备注:</span>
                  <span className="text-xs">{remark}</span>
                </div>
              )}
            </div>
            <p className="text-sm text-amber-600">此操作将立即生效且不可撤销</p>
          </div>
        }
        onConfirm={confirmRecharge}
        onCancel={() => setShowConfirm(false)}
        confirmText="确认充值"
        cancelText="取消"
        loading={loading}
      />
    </>
  );
}
