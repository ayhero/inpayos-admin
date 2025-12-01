import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, Download, RefreshCw, User, ChevronDown, ChevronUp } from 'lucide-react';
import { cashierUserService, CashierUser, CashierUserListParams, CashierUserStats } from '../services/cashierUserService';
import { toast } from '../utils/toast';
import { StatusBadge } from './StatusBadge';
import { getCcyLabel, getTrxMethodLabel } from '../constants/business';

// 交易类型中文映射
const getTrxTypeLabel = (trxType: string) => {
  const typeMap: Record<string, string> = {
    'cashier_payin': '代收',
    'cashier_payout': '代付',
    'payin': '代收',
    'payout': '代付',
  };
  return typeMap[trxType] || trxType;
};

export function CashierUserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCashier, setSelectedCashier] = useState<CashierUser | null>(null);
  const [expandedAccountId, setExpandedAccountId] = useState<string | null>(null);
  const [cashiers, setCashiers] = useState<CashierUser[]>([]);
  const [stats, setStats] = useState<CashierUserStats>({
    total: 0,
    active: 0,
    online: 0,
    suspended: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  });

  // 获取出纳员用户统计
  const fetchStats = useCallback(async () => {
    try {
      const response = await cashierUserService.getCashierUserStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('获取统计数据失败:', error);
    }
  }, []);

  // 获取出纳员用户列表
  const fetchCashiers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: CashierUserListParams = {
        page: pagination.page,
        size: pagination.size
      };

      // 添加筛选条件
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (searchTerm) {
        // 智能搜索检测
        if (searchTerm.startsWith('U')) {
          // U 开头：user_id
          params.user_id = searchTerm;
        } else {
          // 其他：按用户名搜索
          params.user_name = searchTerm;
        }
      }

      const response = await cashierUserService.getCashierUserList(params);
      if (response.success) {
        setCashiers(response.data.list);
        setPagination(prev => ({
          ...prev,
          total: response.data.total,
          totalPages: Math.ceil(response.data.total / prev.size)
        }));
      } else {
        setCashiers([]);
        setPagination(prev => ({
          ...prev,
          total: 0,
          totalPages: 0
        }));
        setError(response.msg || '获取数据失败');
      }
    } catch (error: any) {
      console.error('获取出纳员用户列表失败:', error);
      setCashiers([]);
      setPagination(prev => ({
        ...prev,
        total: 0,
        totalPages: 0
      }));
      setError(error.message || '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, statusFilter, searchTerm]);

  useEffect(() => {
    fetchCashiers();
    fetchStats();
  }, [fetchCashiers, fetchStats]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleRefresh = () => {
    fetchCashiers();
    fetchStats();
  };

  const formatDateTime = (timestamp: number) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString('zh-CN');
  };

  // 查看Cashier用户详情
  const handleViewDetail = async (cashier: CashierUser) => {
    try {
      const response = await cashierUserService.getCashierUserDetail({ user_id: cashier.user_id });
      if (response.success) {
        setSelectedCashier(response.data);
      } else {
        toast.error('获取Cashier用户详情失败', response.msg);
      }
    } catch (error) {
      console.error('获取Cashier用户详情失败:', error);
      toast.error('获取Cashier用户详情失败', '网络错误，请稍后重试');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">出纳员用户</h1>
        <Button onClick={handleRefresh} className="gap-2" variant="outline">
          <RefreshCw className="h-4 w-4" />
          刷新
        </Button>
      </div>

      {/* 错误提示 */}
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
            <CardTitle className="text-sm font-medium">总数</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">可用</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">在线</CardTitle>
            <User className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.online}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">暂停</CardTitle>
            <User className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.suspended}
            </div>
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
                  placeholder="搜索用户名/用户ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">激活</SelectItem>
                <SelectItem value="inactive">未激活</SelectItem>
                <SelectItem value="suspended">暂停</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} className="gap-2">
              <Search className="h-4 w-4" />
              搜索
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              导出
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 出纳员用户列表 */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : cashiers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">暂无数据</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>用户</TableHead>
                      <TableHead>手机</TableHead>
                      <TableHead>邮箱</TableHead>
                      <TableHead>主账户</TableHead>
                      <TableHead>车队</TableHead>
                      <TableHead>币种</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>在线状态</TableHead>
                      <TableHead>代收</TableHead>
                      <TableHead>代付</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cashiers.map((cashier) => (
                      <TableRow key={cashier.user_id}>
                        <TableCell>
                          <div className="font-semibold">{cashier.name || '-'}</div>
                          <div className="font-mono text-xs text-muted-foreground">({cashier.user_id})</div>
                        </TableCell>
                        <TableCell>{cashier.phone || '-'}</TableCell>
                        <TableCell>{cashier.email || '-'}</TableCell>
                        <TableCell>
                          {cashier.primary_account ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help text-blue-600 hover:text-blue-800 font-mono text-xs">
                                    {cashier.primary_account.upi || cashier.primary_account.card_number || '-'}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm">
                                  <div className="space-y-1.5 text-xs">
                                    {cashier.primary_account.app_type && (
                                      <div><strong>App:</strong> {cashier.primary_account.app_type}</div>
                                    )}
                                    {cashier.primary_account.upi && (
                                      <div><strong>UPI:</strong> {cashier.primary_account.upi}</div>
                                    )}
                                    {cashier.primary_account.bank_name && (
                                      <div><strong>银行:</strong> {cashier.primary_account.bank_name}</div>
                                    )}
                                    {cashier.primary_account.card_number && (
                                      <div><strong>卡号:</strong> {cashier.primary_account.card_number}</div>
                                    )}
                                    {cashier.primary_account.holder_name && (
                                      <div><strong>持卡人:</strong> {cashier.primary_account.holder_name}</div>
                                    )}
                                    {cashier.primary_account.holder_phone && (
                                      <div><strong>手机:</strong> {cashier.primary_account.holder_phone}</div>
                                    )}
                                    {cashier.primary_account.status && (
                                      <div className="flex items-center gap-2">
                                        <strong>账户状态:</strong>
                                        <StatusBadge status={cashier.primary_account.status} type="account" />
                                      </div>
                                    )}
                                    {cashier.primary_account.online_status && (
                                      <div className="flex items-center gap-2">
                                        <strong>在线状态:</strong>
                                        <StatusBadge status={cashier.primary_account.online_status} type="online" />
                                      </div>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>{cashier.tid || '-'}</TableCell>
                        <TableCell>{cashier.ccy || '-'}</TableCell>
                        <TableCell><StatusBadge status={cashier.status} type="account" /></TableCell>
                        <TableCell><StatusBadge status={cashier.online_status} type="online" /></TableCell>
                        <TableCell><StatusBadge status={cashier.payin_status} type="trx" /></TableCell>
                        <TableCell><StatusBadge status={cashier.payout_status} type="trx" /></TableCell>
                        <TableCell>{formatDateTime(cashier.created_at)}</TableCell>
                        <TableCell>
                          <Dialog>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(cashier)}
                            >
                              查看
                            </Button>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* 分页 */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  共 {pagination.total} 条记录，第 {pagination.page} / {pagination.totalPages || 1} 页
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page <= 1 || loading}
                  >
                    上一页
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                    disabled={pagination.page >= pagination.totalPages || loading}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 详情对话框 */}
      {selectedCashier && (
        <Dialog open={!!selectedCashier} onOpenChange={() => setSelectedCashier(null)}>
          <DialogContent className="max-w-[60vw] w-[60vw] min-w-[700px] max-h-[90vh]" style={{width: '60vw', maxWidth: '60vw'}}>
            <DialogHeader>
              <DialogTitle>出纳员详情</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4 max-h-[75vh] overflow-y-auto">
              {/* 基本信息 - 顶部模块 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">基本信息</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">出纳员ID</label>
                    <p className="text-base font-semibold font-mono mt-1">{selectedCashier.user_id}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">姓名</label>
                    <p className="text-base font-semibold mt-1">{selectedCashier.name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">手机</label>
                    <p className="text-base font-semibold mt-1">{selectedCashier.phone || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">状态</label>
                    <p className="mt-1"><StatusBadge status={selectedCashier.status} type="account" /></p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">在线状态</label>
                    <p className="mt-1"><StatusBadge status={selectedCashier.online_status} type="online" /></p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">车队ID</label>
                    <p className="text-base font-mono mt-1">{selectedCashier.org_id || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Tab 页面 */}
              <Tabs defaultValue="team" className="w-full">
                <TabsList>
                  <TabsTrigger value="team">车队信息</TabsTrigger>
                  <TabsTrigger value="app-accounts">
                    APP账户 ({selectedCashier.app_accounts?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="cashier-accounts">
                    收银账户 ({selectedCashier.cashier_accounts?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="accounts">
                    余额账户 ({selectedCashier.accounts?.length || 0})
                  </TabsTrigger>
                </TabsList>

                {/* 车队信息 Tab */}
                <TabsContent value="team" className="mt-4">
                  {selectedCashier.team ? (
                    <div className="border rounded-lg p-4 space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm text-muted-foreground">车队ID</label>
                          <p className="text-base font-mono mt-1">{selectedCashier.team.user_id}</p>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">车队名称</label>
                          <p className="text-base mt-1">{selectedCashier.team.name}</p>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">邮箱</label>
                          <p className="text-base mt-1">{selectedCashier.team.email || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">类型</label>
                          <p className="text-base mt-1">{selectedCashier.team.type || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">状态</label>
                          <p className="mt-1"><StatusBadge status={selectedCashier.team.status} type="account" /></p>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">地区</label>
                          <p className="text-base mt-1">{selectedCashier.team.region || '-'}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">暂无车队信息</div>
                  )}
                </TabsContent>

                {/* APP账户列表 Tab */}
                <TabsContent value="app-accounts" className="mt-4">
                  {selectedCashier.app_accounts && selectedCashier.app_accounts.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>APP类型</TableHead>
                            <TableHead>账户ID</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>验证状态</TableHead>
                            <TableHead>币种</TableHead>
                            <TableHead>绑定时间</TableHead>
                            <TableHead>创建时间</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedCashier.app_accounts.map((account, index) => (
                            <TableRow key={index}>
                              <TableCell>{account.app_type?.toUpperCase() || '-'}</TableCell>
                              <TableCell className="font-mono text-xs">{account.account_id}</TableCell>
                              <TableCell><StatusBadge status={account.status} type="account" /></TableCell>
                              <TableCell><StatusBadge status={account.verify_status || 'unverified'} type="trx" /></TableCell>
                              <TableCell>{account.ccy}</TableCell>
                              <TableCell>{formatDateTime(account.bound_at)}</TableCell>
                              <TableCell>{formatDateTime(account.created_at)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">暂无APP账户</div>
                  )}
                </TabsContent>

                {/* 收银账户列表 Tab */}
                <TabsContent value="cashier-accounts" className="mt-4">
                  {selectedCashier.cashier_accounts && selectedCashier.cashier_accounts.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>UPI</TableHead>
                            <TableHead>App</TableHead>
                            <TableHead>类型</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>在线状态</TableHead>
                            <TableHead>代收</TableHead>
                            <TableHead>代付</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedCashier.cashier_accounts.map((account) => (
                            <>
                              <TableRow key={account.account_id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {account.primary && <span className="text-green-600">★</span>}
                                    <span className="font-mono text-sm">{account.upi}</span>
                                  </div>
                                </TableCell>
                                <TableCell>{account.provider || '-'}</TableCell>
                                <TableCell>
                                  <StatusBadge status={account.type || 'private'} type="trx" />
                                </TableCell>
                                <TableCell><StatusBadge status={account.status} type="account" /></TableCell>
                                <TableCell><StatusBadge status={account.online_status || 'offline'} type="online" /></TableCell>
                                <TableCell>
                                  <StatusBadge status={account.payin_status === 'active' ? 'enabled' : 'disabled'} type="trx" />
                                </TableCell>
                                <TableCell>
                                  <StatusBadge status={account.payout_status === 'active' ? 'enabled' : 'disabled'} type="trx" />
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setExpandedAccountId(
                                      expandedAccountId === account.account_id ? null : account.account_id
                                    )}
                                  >
                                    {expandedAccountId === account.account_id ? 
                                      <ChevronUp className="h-4 w-4" /> : 
                                      <ChevronDown className="h-4 w-4" />
                                    }
                                  </Button>
                                </TableCell>
                              </TableRow>
                              {expandedAccountId === account.account_id && (
                                <TableRow>
                                  <TableCell colSpan={8} className="bg-muted/30">
                                    <div className="p-4 space-y-4">
                                      <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                          <label className="text-muted-foreground">账户ID</label>
                                          <p className="font-mono mt-1">{account.account_id}</p>
                                        </div>
                                        <div>
                                          <label className="text-muted-foreground">APP账户ID</label>
                                          <p className="font-mono mt-1">{account.app_account_id || '-'}</p>
                                        </div>
                                        <div>
                                          <label className="text-muted-foreground">绑定时间</label>
                                          <p className="mt-1">{formatDateTime(account.bound_at)}</p>
                                        </div>
                                      </div>

                                      {/* 代收配置 */}
                                      {account.payin_config && (
                                        <div className="bg-blue-50 dark:bg-blue-950 rounded p-3">
                                          <h5 className="text-sm font-semibold mb-2">代收配置</h5>
                                          <div className="grid grid-cols-3 gap-3 text-xs">
                                            <div className="flex items-center gap-2">
                                              <span className="text-muted-foreground">交易类型:</span>
                                              <Badge variant="default" className="bg-blue-600 text-xs">
                                                {getTrxTypeLabel(account.payin_config.trx_type || '')}
                                              </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-muted-foreground">币种:</span>
                                              <span className="font-semibold text-xs">{getCcyLabel(account.payin_config.ccy)}</span>
                                            </div>
                                            <div>
                                              <span className="text-muted-foreground">日限笔数:</span> <span className="font-semibold">{account.payin_config.max_daily_count}</span>
                                            </div>
                                            <div>
                                              <span className="text-muted-foreground">日限金额:</span> <span className="font-semibold">{account.payin_config.max_daily_sum}</span>
                                            </div>
                                            <div>
                                              <span className="text-muted-foreground">单笔范围:</span> <span className="font-semibold">{account.payin_config.min_trx_amount} - {account.payin_config.max_trx_amount}</span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className="text-muted-foreground">支持方式:</span>
                                              {account.payin_config.support_trx_methods?.map((method, idx) => (
                                                <span key={idx} className="text-xs font-semibold">{getTrxMethodLabel(method)}{idx < (account.payin_config.support_trx_methods?.length || 0) - 1 ? ', ' : ''}</span>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* 代付配置 */}
                                      {account.payout_config && (
                                        <div className="bg-orange-50 dark:bg-orange-950 rounded p-3">
                                          <h5 className="text-sm font-semibold mb-2">代付配置</h5>
                                          <div className="grid grid-cols-3 gap-3 text-xs">
                                            <div className="flex items-center gap-2">
                                              <span className="text-muted-foreground">交易类型:</span>
                                              <Badge variant="default" className="bg-orange-600 text-xs">
                                                {getTrxTypeLabel(account.payout_config.trx_type || '')}
                                              </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-muted-foreground">币种:</span>
                                              <span className="font-semibold text-xs">{getCcyLabel(account.payout_config.ccy)}</span>
                                            </div>
                                            <div>
                                              <span className="text-muted-foreground">日限笔数:</span> <span className="font-semibold">{account.payout_config.max_daily_count}</span>
                                            </div>
                                            <div>
                                              <span className="text-muted-foreground">日限金额:</span> <span className="font-semibold">{account.payout_config.max_daily_sum}</span>
                                            </div>
                                            <div>
                                              <span className="text-muted-foreground">单笔范围:</span> <span className="font-semibold">{account.payout_config.min_trx_amount} - {account.payout_config.max_trx_amount}</span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className="text-muted-foreground">支持方式:</span>
                                              {account.payout_config.support_trx_methods?.map((method, idx) => (
                                                <span key={idx} className="text-xs font-semibold">{getTrxMethodLabel(method)}{idx < (account.payout_config.support_trx_methods?.length || 0) - 1 ? ', ' : ''}</span>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                                        <div>创建时间: {formatDateTime(account.created_at)}</div>
                                        <div>更新时间: {formatDateTime(account.updated_at)}</div>
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">暂无收银账户</div>
                  )}
                </TabsContent>

                {/* 余额账户列表 Tab */}
                <TabsContent value="accounts" className="mt-4">
                  {selectedCashier.accounts && selectedCashier.accounts.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>币种</TableHead>
                            <TableHead>总余额</TableHead>
                            <TableHead>可用余额</TableHead>
                            <TableHead>冻结余额</TableHead>
                            <TableHead>保证金</TableHead>
                            <TableHead>可用保证金</TableHead>
                            <TableHead>冻结保证金</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>最后更新</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedCashier.accounts.map((account) => (
                            <TableRow key={account.account_id}>
                              <TableCell>{account.ccy}</TableCell>
                              <TableCell className="font-mono">{parseFloat(account.balance || '0').toFixed(2)}</TableCell>
                              <TableCell className="font-mono text-green-600">{parseFloat(account.available_balance || '0').toFixed(2)}</TableCell>
                              <TableCell className="font-mono text-red-600">{parseFloat(account.frozen_balance || '0').toFixed(2)}</TableCell>
                              <TableCell className="font-mono">{parseFloat(account.margin_balance || '0').toFixed(2)}</TableCell>
                              <TableCell className="font-mono text-green-600">{parseFloat(account.available_margin_balance || '0').toFixed(2)}</TableCell>
                              <TableCell className="font-mono text-red-600">{parseFloat(account.frozen_margin_balance || '0').toFixed(2)}</TableCell>
                              <TableCell><StatusBadge status={account.status} type="account" /></TableCell>
                              <TableCell>{formatDateTime(account.updated_at)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">暂无余额账户</div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
