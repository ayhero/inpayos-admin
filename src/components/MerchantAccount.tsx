import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { RefreshCw, Wallet } from 'lucide-react';
import { accountService, AccountData, AccountListParams } from '../services/accountService';
import { toast } from '../utils/toast';

export function MerchantAccount() {
  const [merchantId, setMerchantId] = useState('');
  const [currency, setCurrency] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState<AccountData | null>(null);
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  });

  // 获取账户列表
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: AccountListParams = {
        user_type: 'merchant',
        page: pagination.page,
        size: pagination.size
      };

      if (merchantId) {
        params.user_id = merchantId;
      }
      if (currency !== 'all') {
        params.ccy = currency;
      }

      const response = await accountService.getAccountList(params);
      if (response.success) {
        setAccounts(response.data.records);
        setPagination(prev => ({
          ...prev,
          total: response.data.count,
          totalPages: Math.ceil(response.data.count / prev.size)
        }));
      } else {
        setAccounts([]);
        setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
        setError(response.msg || '获取数据失败');
      }
    } catch (error: any) {
      console.error('获取商户账户列表失败:', error);
      setAccounts([]);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
      setError(error.message || '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, merchantId, currency]);

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, merchantId, currency]);

  const handleRefresh = () => {
    fetchAccounts();
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
      '1': { label: '正常', variant: 'default', className: 'bg-green-500' },
      '0': { label: '停用', variant: 'secondary', className: 'bg-gray-500' },
      '2': { label: '冻结', variant: 'destructive', className: '' }
    };
    const config = configs[status] || { label: '未知', variant: 'outline' as const, className: '' };
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const formatDateTime = (timestamp: number) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString('zh-CN');
  };

  const formatAmount = (amount?: string) => {
    if (!amount) return '0.00';
    return parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleViewDetail = async (account: AccountData) => {
    try {
      const response = await accountService.getAccountDetail({ account_id: account.account_id });
      if (response.success) {
        setSelectedAccount(response.data);
      } else {
        toast.error('获取账户详情失败', response.msg);
      }
    } catch (error) {
      console.error('获取账户详情失败:', error);
      toast.error('获取账户详情失败', '网络错误，请稍后重试');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">商户账户</h1>
        <Button onClick={handleRefresh} className="gap-2" variant="outline">
          <RefreshCw className="h-4 w-4" />
          刷新
        </Button>
      </div>

      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-500">错误: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 md:flex-initial md:w-64">
              <Input
                placeholder="请输入商户ID..."
                value={merchantId}
                onChange={(e) => {
                  setMerchantId(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              />
            </div>
            <Select 
              value={currency} 
              onValueChange={(value) => {
                setCurrency(value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="币种" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部币种</SelectItem>
                <SelectItem value="INR">INR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="USDT">USDT</SelectItem>
                <SelectItem value="CNY">CNY</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 账户列表 */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-12">加载中...</div>
          ) : !accounts || accounts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">暂无数据</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>账户ID</TableHead>
                  <TableHead>商户ID</TableHead>
                  <TableHead>币种</TableHead>
                  <TableHead>总余额</TableHead>
                  <TableHead>可用余额</TableHead>
                  <TableHead>冻结余额</TableHead>
                  <TableHead>保证金</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.account_id}>
                    <TableCell className="font-mono text-xs">{account.account_id}</TableCell>
                    <TableCell className="font-mono text-xs">{account.user_id}</TableCell>
                    <TableCell>{account.ccy}</TableCell>
                    <TableCell className="font-mono">{formatAmount(account.balance?.balance)}</TableCell>
                    <TableCell className="font-mono text-green-600">{formatAmount(account.balance?.available_balance)}</TableCell>
                    <TableCell className="font-mono text-red-600">{formatAmount(account.balance?.frozen_balance)}</TableCell>
                    <TableCell className="font-mono">{formatAmount(account.balance?.margin_balance)}</TableCell>
                    <TableCell>{getStatusBadge(account.status)}</TableCell>
                    <TableCell>{formatDateTime(account.created_at)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetail(account)}>
                        查看
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 分页 */}
      {!loading && accounts && accounts.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            共 {pagination.total} 条记录，第 {pagination.page} / {pagination.totalPages} 页
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              disabled={pagination.page >= pagination.totalPages}
            >
              下一页
            </Button>
          </div>
        </div>
      )}

      {/* 账户详情对话框 */}
      <Dialog open={!!selectedAccount} onOpenChange={() => setSelectedAccount(null)}>
        <DialogContent className="max-w-[45vw] w-[45vw] min-w-[600px]" style={{width: '45vw', maxWidth: '45vw'}}>
          <DialogHeader>
            <DialogTitle>账户详情</DialogTitle>
          </DialogHeader>
          {selectedAccount && (
            <div className="grid grid-cols-2 gap-4 py-4 max-h-[500px] overflow-y-auto">
              <div>
                <label className="text-sm text-muted-foreground">账户ID</label>
                <p className="text-base font-semibold font-mono mt-1">{selectedAccount.account_id}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">商户ID</label>
                <p className="text-base font-semibold font-mono mt-1">{selectedAccount.user_id}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">币种</label>
                <p className="text-base font-semibold mt-1">{selectedAccount.ccy}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">总余额</label>
                <p className="text-base font-semibold font-mono mt-1">{formatAmount(selectedAccount.balance?.balance)}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">可用余额</label>
                <p className="text-base font-semibold font-mono text-green-600 mt-1">{formatAmount(selectedAccount.balance?.available_balance)}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">冻结余额</label>
                <p className="text-base font-semibold font-mono text-red-600 mt-1">{formatAmount(selectedAccount.balance?.frozen_balance)}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">保证金</label>
                <p className="text-base font-semibold font-mono mt-1">{formatAmount(selectedAccount.balance?.margin_balance)}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">可用保证金</label>
                <p className="text-base font-semibold font-mono text-green-600 mt-1">{formatAmount(selectedAccount.balance?.available_margin_balance)}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">冻结保证金</label>
                <p className="text-base font-semibold font-mono text-red-600 mt-1">{formatAmount(selectedAccount.balance?.frozen_margin_balance)}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">状态</label>
                <p className="mt-1">{getStatusBadge(selectedAccount.status)}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">版本</label>
                <p className="text-base font-semibold mt-1">{selectedAccount.version}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">最后活跃时间</label>
                <p className="text-base font-semibold mt-1">{formatDateTime(selectedAccount.last_active_at)}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">创建时间</label>
                <p className="text-base font-semibold mt-1">{formatDateTime(selectedAccount.created_at)}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">更新时间</label>
                <p className="text-base font-semibold mt-1">{formatDateTime(selectedAccount.updated_at)}</p>
              </div>
              {selectedAccount.balance?.updated_at && (
                <div>
                  <label className="text-sm text-muted-foreground">余额更新时间</label>
                  <p className="text-base font-semibold mt-1">{formatDateTime(selectedAccount.balance.updated_at)}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
