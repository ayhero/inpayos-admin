import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Search, RefreshCw, Smartphone, User, Phone, Wallet } from 'lucide-react';
import { appAccountService, AppAccount, AppAccountListParams, AppAccountTodayStats } from '../services/appAccountService';
import { toast } from '../utils/toast';
import { getAppAccountStatusBadgeConfig, getAppVerifyStatusBadgeConfig } from '../constants/status';

export function AppAccountManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [appTypeFilter, setAppTypeFilter] = useState<string>('all');
  const [verifyStatusFilter, setVerifyStatusFilter] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<AppAccount | null>(null);
  const [accounts, setAccounts] = useState<AppAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  });
  const [stats, setStats] = useState<AppAccountTodayStats>({
    totalCount: 0,
    activeCount: 0,
    verifiedCount: 0,
    totalBalance: '0.00',
    todayNewCount: 0
  });

  // 获取应用账户列表
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: AppAccountListParams = {
        page: pagination.page,
        size: pagination.size
      };

      // 状态筛选
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      // 应用类型筛选
      if (appTypeFilter !== 'all') {
        params.app_type = appTypeFilter;
      }

      // 验证状态筛选
      if (verifyStatusFilter !== 'all') {
        params.verify_status = verifyStatusFilter;
      }

      // 搜索条件
      if (searchTerm) {
        if (searchTerm.includes('@')) {
          // 如果包含@符号，按账户名称搜索
          params.account_name = searchTerm;
        } else if (/^[\d\s+\-()]+$/.test(searchTerm)) {
          // 如果是数字格式，按手机号搜索
          params.phone = searchTerm;
        } else if (searchTerm.startsWith('ac_') || searchTerm.startsWith('user_')) {
          // 如果是ID格式，按账户ID搜索
          params.account_id = searchTerm;
        } else {
          // 其他情况，按用户ID搜索
          params.user_id = searchTerm;
        }
      }

      const response = await appAccountService.getAppAccountList(params);
      if (response.success) {
        setAccounts(response.data.list);
        setPagination(prev => ({
          ...prev,
          total: response.data.total,
          totalPages: Math.ceil(response.data.total / prev.size)
        }));
      } else {
        setAccounts([]);
        setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
        setError(response.msg || '获取数据失败');
      }
    } catch (error: any) {
      console.error('获取应用账户列表失败:', error);
      setAccounts([]);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
      setError(error.message || '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, statusFilter, appTypeFilter, verifyStatusFilter, searchTerm]);

  // 获取统计数据
  const fetchStats = useCallback(async () => {
    try {
      const response = await appAccountService.getAppAccountTodayStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('获取统计数据失败:', error);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.size, statusFilter, appTypeFilter, verifyStatusFilter, searchTerm]);

  const handleRefresh = () => {
    fetchAccounts();
    fetchStats();
  };

  const getStatusBadge = (status: string) => {
    const config = getAppAccountStatusBadgeConfig(status);
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const getVerifyStatusBadge = (status: string) => {
    const config = getAppVerifyStatusBadgeConfig(status);
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const getAppTypeBadge = (appType: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      'freecharge': { label: 'FreeCharge', className: 'bg-blue-500' },
      'paytm': { label: 'Paytm', className: 'bg-indigo-500' },
      'phonepe': { label: 'PhonePe', className: 'bg-purple-500' },
      'gpay': { label: 'GPay', className: 'bg-green-600' }
    };
    const config = configs[appType?.toLowerCase()] || { label: appType || '-', className: 'bg-gray-500' };
    return <Badge className={`text-white ${config.className}`}>{config.label}</Badge>;
  };

  const formatDateTime = (timestamp: number) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString('zh-CN');
  };

  const formatAmount = (amount: number) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleViewDetail = async (account: AppAccount) => {
    try {
      const response = await appAccountService.getAppAccountDetail({ 
        app_type: account.app_type, 
        account_id: account.account_id 
      });
      if (response.success) {
        setSelectedAccount(response.data);
      } else {
        toast.error('获取应用账户详情失败', response.msg);
      }
    } catch (error) {
      console.error('获取应用账户详情失败:', error);
      toast.error('获取应用账户详情失败', '网络错误，请稍后重试');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">应用账户管理</h1>
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

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总账户数</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCount}</div>
            <p className="text-xs text-muted-foreground">所有应用账户</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃账户</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeCount}</div>
            <p className="text-xs text-muted-foreground">状态为活跃</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已验证</CardTitle>
            <Phone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.verifiedCount}</div>
            <p className="text-xs text-muted-foreground">验证通过</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日新增</CardTitle>
            <RefreshCw className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.todayNewCount}</div>
            <p className="text-xs text-muted-foreground">今日创建账户</p>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索账户ID、用户ID、手机号或账户名称..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={appTypeFilter} onValueChange={setAppTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="应用类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="freecharge">FreeCharge</SelectItem>
                <SelectItem value="paytm">Paytm</SelectItem>
                <SelectItem value="phonepe">PhonePe</SelectItem>
                <SelectItem value="gpay">GPay</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">活跃</SelectItem>
                <SelectItem value="inactive">非活跃</SelectItem>
                <SelectItem value="frozen">冻结</SelectItem>
                <SelectItem value="canceled">已注销</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verifyStatusFilter} onValueChange={setVerifyStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="验证状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部验证状态</SelectItem>
                <SelectItem value="verified">已验证</SelectItem>
                <SelectItem value="unverified">未验证</SelectItem>
                <SelectItem value="rejected">拒绝</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 应用账户列表 */}
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
                  <TableHead>应用</TableHead>
                  <TableHead>手机</TableHead>
                  <TableHead>账户</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>验证状态</TableHead>
                  <TableHead>账户数</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={`${account.app_type}_${account.account_id}`}>
                    <TableCell>{getAppTypeBadge(account.app_type)}</TableCell>
                    <TableCell>
                      <div 
                        className="font-mono text-sm cursor-pointer hover:text-blue-600" 
                        title={`用户信息：${account.user?.name || '未知'} (${account.user_id})\n邮箱：${account.user?.email || '未知'}\n账户ID：${account.account_id}`}
                      >
                        {account.user?.phone || account.phone || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-xs break-all">
                        {account.account_id}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(account.status)}</TableCell>
                    <TableCell>{getVerifyStatusBadge(account.verify_status)}</TableCell>
                    <TableCell className="text-center">
                      <span className="text-green-600 font-medium">{account.active_cashier_count || 0}</span>
                      <span className="text-gray-500">/{account.total_cashier_count || 0}</span>
                    </TableCell>
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

      {/* 应用账户详情对话框 */}
      <Dialog open={!!selectedAccount} onOpenChange={() => setSelectedAccount(null)}>
        <DialogContent className="max-w-[45vw] w-[45vw] min-w-[600px]" style={{width: '45vw', maxWidth: '45vw'}}>
          <DialogHeader>
            <DialogTitle>应用账户详情</DialogTitle>
          </DialogHeader>
          {selectedAccount && (
            <div className="grid grid-cols-2 gap-4 py-4 max-h-[500px] overflow-y-auto">
              <div>
                <label className="text-sm text-muted-foreground">应用类型</label>
                <div className="mt-1">{getAppTypeBadge(selectedAccount.app_type)}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">账户ID</label>
                <p className="text-base font-semibold font-mono mt-1">{selectedAccount.account_id}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">用户名</label>
                <p className="text-base font-semibold mt-1">{selectedAccount.user?.name || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">用户ID</label>
                <p className="text-base font-semibold font-mono mt-1">{selectedAccount.user_id}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">手机号</label>
                <p className="text-base font-semibold mt-1">{selectedAccount.phone}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">邮箱</label>
                <p className="text-base font-semibold mt-1">{selectedAccount.user?.email || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">账户名称</label>
                <p className="text-base font-semibold mt-1">{selectedAccount.account_name || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">币种</label>
                <p className="text-base font-semibold mt-1">{selectedAccount.ccy}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">状态</label>
                <div className="mt-1">{getStatusBadge(selectedAccount.status)}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">验证状态</label>
                <div className="mt-1">{getVerifyStatusBadge(selectedAccount.verify_status)}</div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">账户余额</label>
                <p className="text-base font-semibold text-green-600 mt-1">{formatAmount(selectedAccount.balance)}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">出纳员总余额</label>
                <p className="text-base font-semibold text-blue-600 mt-1">{formatAmount(selectedAccount.total_cashier_balance)}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">出纳员总数</label>
                <p className="text-base font-semibold mt-1">{selectedAccount.total_cashier_count || 0}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">活跃出纳员数</label>
                <p className="text-base font-semibold text-green-600 mt-1">{selectedAccount.active_cashier_count || 0}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">创建时间</label>
                <p className="text-base font-semibold mt-1">{formatDateTime(selectedAccount.created_at)}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">更新时间</label>
                <p className="text-base font-semibold mt-1">{formatDateTime(selectedAccount.updated_at)}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">绑定时间</label>
                <p className="text-base font-semibold mt-1">{formatDateTime(selectedAccount.bound_at)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}