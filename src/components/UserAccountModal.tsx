import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, Save, X, RefreshCw } from 'lucide-react';
import { accountService, AccountData } from '../services/accountService';
import { toast } from '../utils/toast';
import { UserTypeLabel } from './UserTypeLabel';
import { ConfirmDialog } from './ui/confirm-dialog';
import { StatusBadge } from './StatusBadge';
import { CCY_OPTIONS } from '../constants/business';

interface UserAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  userType: 'merchant' | 'cashier_team';
}

export function UserAccountModal({ open, onOpenChange, userId, userName, userType }: UserAccountModalProps) {
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccount, setNewAccount] = useState<{ccy: string}>({ccy: ''});
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // 加载账户列表
  const loadAccounts = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await accountService.getAccountList({
        user_id: userId,
        user_type: userType,
        page: 1,
        size: 100
      });
      if (response.success) {
        setAccounts(response.data.records || []);
      } else {
        toast.error('获取账户失败', response.msg);
      }
    } catch (error) {
      console.error('获取账户失败:', error);
      toast.error('获取账户失败', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [userId, userType]);

  // 监听弹窗打开
  useEffect(() => {
    if (open && userId) {
      loadAccounts();
    }
  }, [open, userId, loadAccounts]);

  // 新增账户
  const handleAddNewAccount = () => {
    setIsAddingAccount(true);
    setNewAccount({ccy: ''});
  };

  // 取消新增账户
  const handleCancelNewAccount = () => {
    setIsAddingAccount(false);
    setNewAccount({ccy: ''});
  };

  // 保存新账户
  const handleSaveNewAccount = () => {
    if (!userId || !newAccount.ccy.trim()) {
      toast.error('保存失败', '币种不能为空');
      return;
    }
    setShowConfirm(true);
  };

  // 确认创建账户
  const confirmCreateAccount = async () => {
    if (!userId) return;

    try {
      const response = await accountService.createAccount({
        user_id: userId,
        user_type: userType,
        ccy: newAccount.ccy
      });

      if (response.success) {
        toast.success('创建账户成功', '');
        setIsAddingAccount(false);
        setNewAccount({ccy: ''});
        await loadAccounts();
      } else {
        toast.error('创建账户失败', response.msg);
      }
    } catch (error) {
      console.error('创建账户失败:', error);
      toast.error('创建账户失败', '网络错误，请稍后重试');
    } finally {
      setShowConfirm(false);
    }
  };

  const formatDateTime = (timestamp: number) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-[90vw] min-w-[900px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>账户管理</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2">
              <UserTypeLabel type={userType} />
              <span>{userName}</span>
              <span className="text-muted-foreground">({userId})</span>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleAddNewAccount} disabled={isAddingAccount} className="h-9">
              <Plus className="h-4 w-4 mr-1" />
              新建
            </Button>
            <Button size="sm" variant="outline" onClick={loadAccounts} className="h-9">
              <RefreshCw className="h-4 w-4 mr-1" />
              刷新
            </Button>
          </div>

          <div className="overflow-auto max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>币种</TableHead>
                  <TableHead>总余额</TableHead>
                  <TableHead>可用余额</TableHead>
                  <TableHead>冻结余额</TableHead>
                  <TableHead>保证金</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>最后活跃时间</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isAddingAccount && (
                  <TableRow>
                    <TableCell>
                      <Select value={newAccount.ccy} onValueChange={(value) => setNewAccount({ccy: value})}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="选择币种" />
                        </SelectTrigger>
                        <SelectContent>
                          {CCY_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="font-mono">0.00</TableCell>
                    <TableCell className="font-mono text-green-600">0.00</TableCell>
                    <TableCell className="font-mono text-red-600">0.00</TableCell>
                    <TableCell className="font-mono">0.00</TableCell>
                    <TableCell>
                      <StatusBadge status="active" type="account" />
                    </TableCell>
                    <TableCell className="text-xs">-</TableCell>
                    <TableCell className="text-xs">-</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={handleSaveNewAccount}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleCancelNewAccount}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {accounts.map((account) => (
                  <TableRow key={account.account_id}>
                    <TableCell>{account.ccy}</TableCell>
                    <TableCell className="font-mono">{parseFloat(account.balance?.balance || '0').toFixed(2)}</TableCell>
                    <TableCell className="font-mono text-green-600">{parseFloat(account.balance?.available_balance || '0').toFixed(2)}</TableCell>
                    <TableCell className="font-mono text-red-600">{parseFloat(account.balance?.frozen_balance || '0').toFixed(2)}</TableCell>
                    <TableCell className="font-mono">{parseFloat(account.balance?.margin_balance || '0').toFixed(2)}</TableCell>
                    <TableCell><StatusBadge status={account.status} type="account" /></TableCell>
                    <TableCell className="text-xs">{formatDateTime(account.last_active_at)}</TableCell>
                    <TableCell className="text-xs">{formatDateTime(account.created_at)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))}

                {!loading && !isAddingAccount && accounts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      暂无账户数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="确认创建账户"
        description={`确定要为${userType === 'merchant' ? '商户' : '车队'} ${userName} 创建 ${newAccount.ccy} 账户吗？`}
        onConfirm={confirmCreateAccount}
      />
    </Dialog>
  );
}
