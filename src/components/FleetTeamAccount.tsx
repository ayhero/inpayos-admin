import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { RefreshCw } from 'lucide-react';
import { accountService, AccountData, AccountListParams } from '../services/accountService';
import { getAccountStatusBadgeConfig } from '../constants/status';

export function FleetTeamAccount() {
  const [fleetId, setFleetId] = useState('');
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

  // 获取车队账户列表
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: AccountListParams = {
        user_type: 'cashier_team',
        page: pagination.page,
        size: pagination.size
      };

      if (fleetId) {
        params.user_id = fleetId;
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
      console.error('获取车队账户列表失败:', error);
      setAccounts([]);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
      setError(error.message || '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, fleetId, currency]);

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, fleetId, currency]);

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

  const formatAmount = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          {/* 搜索筛选区 */}
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="车队ID"
              value={fleetId}
              onChange={(e) => setFleetId(e.target.value)}
              className="max-w-xs"
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
                  <TableHead>用户名称</TableHead>
                  <TableHead>所属组织</TableHead>
                  <TableHead>币种</TableHead>
                  <TableHead className="text-right">余额</TableHead>
                  <TableHead className="text-right">可用余额</TableHead>
                  <TableHead className="text-right">冻结余额</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
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
                        {formatAmount(account.balance?.balance || '0')}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatAmount(account.balance?.available_balance || '0')}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatAmount(account.balance?.frozen_balance || '0')}
                      </TableCell>
                      <TableCell>{getStatusBadge(account.status)}</TableCell>
                      <TableCell>
                        {new Date(account.created_at).toLocaleString('zh-CN')}
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
            <DialogTitle>车队账户详情</DialogTitle>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-6 max-h-[500px] overflow-y-auto">
              {/* 基本信息 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">账户ID</label>
                  <p className="mt-1 font-mono text-sm">{selectedAccount.account_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">车队ID</label>
                  <p className="mt-1 font-mono text-sm">{selectedAccount.user_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">用户名称</label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="mt-1 text-sm cursor-help underline decoration-dotted">{selectedAccount.user?.name || '-'}</p>
                    </TooltipTrigger>
                    {selectedAccount.user && (
                      <TooltipContent side="right" className="max-w-xs">
                        <div className="space-y-1 text-xs">
                          <div><span className="text-gray-400">用户ID:</span> {selectedAccount.user.user_id}</div>
                          <div><span className="text-gray-400">用户类型:</span> {selectedAccount.user.user_type}</div>
                          {selectedAccount.user.org_id && <div><span className="text-gray-400">所属组织:</span> {selectedAccount.user.org_id}</div>}
                          {selectedAccount.user.phone && <div><span className="text-gray-400">手机号:</span> {selectedAccount.user.phone}</div>}
                          {selectedAccount.user.email && <div><span className="text-gray-400">邮箱:</span> {selectedAccount.user.email}</div>}
                          {selectedAccount.user.status && <div><span className="text-gray-400">状态:</span> {selectedAccount.user.status}</div>}
                          {selectedAccount.user.online_status && <div><span className="text-gray-400">在线状态:</span> {selectedAccount.user.online_status}</div>}
                        </div>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">币种</label>
                  <p className="mt-1 text-sm">{selectedAccount.ccy}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">状态</label>
                  <p className="mt-1">{getStatusBadge(selectedAccount.status)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">版本</label>
                  <p className="mt-1 text-sm">{selectedAccount.version}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">创建时间</label>
                  <p className="mt-1 text-sm">{new Date(selectedAccount.created_at).toLocaleString('zh-CN')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">更新时间</label>
                  <p className="mt-1 text-sm">{new Date(selectedAccount.updated_at).toLocaleString('zh-CN')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">最后活跃时间</label>
                  <p className="mt-1 text-sm">{selectedAccount.last_active_at ? new Date(selectedAccount.last_active_at).toLocaleString('zh-CN') : '-'}</p>
                </div>
              </div>
              
              {/* 余额信息 */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">余额信息</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">总余额</label>
                    <p className="mt-1 font-mono text-lg font-semibold">{formatAmount(selectedAccount.balance?.balance || '0')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">可用余额</label>
                    <p className="mt-1 font-mono text-lg font-semibold text-green-600">{formatAmount(selectedAccount.balance?.available_balance || '0')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">冻结余额</label>
                    <p className="mt-1 font-mono text-lg font-semibold text-red-600">{formatAmount(selectedAccount.balance?.frozen_balance || '0')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">保证金</label>
                    <p className="mt-1 font-mono text-lg font-semibold">{formatAmount(selectedAccount.balance?.margin_balance || '0')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">可用保证金</label>
                    <p className="mt-1 font-mono text-lg font-semibold text-green-600">{formatAmount(selectedAccount.balance?.available_margin_balance || '0')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">冻结保证金</label>
                    <p className="mt-1 font-mono text-lg font-semibold text-red-600">{formatAmount(selectedAccount.balance?.frozen_margin_balance || '0')}</p>
                  </div>
                  {selectedAccount.balance?.updated_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">余额更新时间</label>
                      <p className="mt-1 text-sm">{new Date(selectedAccount.balance.updated_at).toLocaleString('zh-CN')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
