import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { RefreshCw } from 'lucide-react';
import { accountService, AccountData, AccountListParams } from '../services/accountService';
import { getAccountStatusBadgeConfig } from '../constants/status';
import { AccountDetail } from './AccountDetail';

export function CashierMemberAccount() {
  const [teamId, setTeamId] = useState('');
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

  // 获取 Cashier 成员账户列表
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: AccountListParams = {
        user_type: 'cashier', // 查询 cashier 类型的账户
        page: pagination.page,
        size: pagination.size
      };

      // 如果指定了车队ID，则查询该车队的成员账户
      if (teamId) {
        params.tid = teamId;
      }

      if (currency !== 'all') {
        params.ccy = currency;
      }

      const response = await accountService.getAccountList(params);
      if (response.success) {
        setAccounts(response.data.records || []);
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
      console.error('获取Cashier成员账户列表失败:', error);
      setAccounts([]);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
      setError(error.message || '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, teamId, currency]);

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, teamId, currency]);

  const handleRefresh = () => {
    fetchAccounts();
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchAccounts();
  };

  const getStatusBadge = (status: string) => {
    const config = getAccountStatusBadgeConfig(status);
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const formatAmount = (amount?: string) => {
    if (!amount) return '0.00';
    return parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDateTime = (timestamp?: number) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString('zh-CN');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          {/* 搜索筛选区 */}
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="车队ID（选填，不填则查全部）"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="w-64"
              maxLength={50}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择币种" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部币种</SelectItem>
                <SelectItem value="INR">INR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="CNY">CNY</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>搜索</Button>
            <Button variant="outline" onClick={() => { setTeamId(''); setCurrency('all'); }} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              重置
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
              {error}
            </div>
          )}

          {/* 数据表格 */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户</TableHead>
                  <TableHead>车队</TableHead>
                  <TableHead>币种</TableHead>
                  <TableHead className="text-right">余额</TableHead>
                  <TableHead className="text-right">可用余额</TableHead>
                  <TableHead className="text-right">冻结余额</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>最后更新时间</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : accounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  accounts.map((account) => (
                    <TableRow key={account.account_id}>
                      <TableCell>{account.user?.name || '-'}</TableCell>
                      <TableCell className="font-mono text-sm">{account.user?.org_id || '-'}</TableCell>
                      <TableCell>{account.ccy}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatAmount(account.balance || '0')}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatAmount(account.available_balance || '0')}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatAmount(account.frozen_balance || '0')}
                      </TableCell>
                      <TableCell>{getStatusBadge(account.status)}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(account.updated_at).toLocaleString('zh-CN')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          onClick={() => setSelectedAccount(account)}
                          className="p-0 h-auto"
                        >
                          查看详情
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页 */}
          {pagination.total > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                共 {pagination.total} 条记录，第 {pagination.page} / {pagination.totalPages} 页
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1 || loading}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages || loading}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 详情弹窗 */}
      <Dialog open={!!selectedAccount} onOpenChange={() => setSelectedAccount(null)}>
        <DialogContent className="max-w-[45vw] w-[45vw] min-w-[600px]" style={{width: '45vw', maxWidth: '45vw'}}>
          <DialogHeader>
            <DialogTitle>出纳员账户详情</DialogTitle>
          </DialogHeader>
          {selectedAccount && (
            <AccountDetail 
              account={selectedAccount}
              formatDateTime={formatDateTime}
              formatAmount={formatAmount}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
