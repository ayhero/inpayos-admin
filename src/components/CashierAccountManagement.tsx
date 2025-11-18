import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Search, Download, RefreshCw, User } from 'lucide-react';
import { cashierService, Cashier, CashierListParams, CashierStats } from '../services/cashierService';
import { toast } from '../utils/toast';
import { getAccountStatusBadgeConfig } from '../constants/status';

export function CashierAccountManagement() {
  console.log('CashierAccountManagement component rendering');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [primaryFilter, setPrimaryFilter] = useState<string>('all');
  const [selectedCashier, setSelectedCashier] = useState<Cashier | null>(null);
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [stats, setStats] = useState<CashierStats>({
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

  // 获取出纳员统计
  const fetchStats = useCallback(async () => {
    try {
      const response = await cashierService.getCashierStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('获取统计数据失败:', error);
    }
  }, []);

  // 获取出纳员列表
  const fetchCashiers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: CashierListParams = {
        page: pagination.page,
        size: pagination.size
      };

      // 添加筛选条件
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (searchTerm) {
        // 智能搜索检测
        if (searchTerm.includes('@')) {
          // 包含 @ 符号：UPI ID 搜索
          params.upi = searchTerm;
        } else if (searchTerm.startsWith('C') || searchTerm.startsWith('U')) {
          // C 开头：account_id，U 开头：user_id
          if (searchTerm.startsWith('C')) {
            params.account_id = searchTerm;
          } else {
            params.user_id = searchTerm;
          }
        } else {
          // 其他：按持卡人姓名搜索
          params.holder_name = searchTerm;
        }
      }

      const response = await cashierService.getCashierList(params);
      if (response.success) {
        let filteredCashiers = response.data.list;
        
        // 前端过滤主账号
        if (primaryFilter === 'primary') {
          filteredCashiers = filteredCashiers.filter(c => c.primary === true);
        } else if (primaryFilter === 'non-primary') {
          filteredCashiers = filteredCashiers.filter(c => !c.primary);
        }
        
        setCashiers(filteredCashiers);
        setPagination(prev => ({
          ...prev,
          total: filteredCashiers.length,
          totalPages: Math.ceil(filteredCashiers.length / prev.size)
        }));
      } else {
        // API调用失败时清空记录和分页信息
        setCashiers([]);
        setPagination(prev => ({
          ...prev,
          total: 0,
          totalPages: 0
        }));
        setError(response.msg || '获取数据失败');
      }
    } catch (error: any) {
      console.error('获取出纳员列表失败:', error);
      // 发生异常时也清空数据
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
  }, [pagination.page, statusFilter, primaryFilter, searchTerm]);

  useEffect(() => {
    fetchCashiers();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, statusFilter, primaryFilter, searchTerm]);

  const handleSearch = () => {
    // fetchCashiers 会自动触发，因为 searchTerm 是依赖项
  };

  const handleRefresh = () => {
    fetchCashiers();
    fetchStats();
  };

  // 账户状态徽章 - 使用通用组件
  const getStatusBadge = (status: string) => {
    const { label, variant, className } = getAccountStatusBadgeConfig(status);
    return <Badge variant={variant} className={className}>{label}</Badge>;
  };

  // 在线状态徽章
  const getOnlineStatusBadge = (onlineStatus: string) => {
    const getOnlineStatusConfig = (status: string) => {
      switch (status?.toLowerCase()) {
        case 'online':
          return { label: '在线', variant: 'default' as const, className: 'bg-green-500' };
        case 'offline':
          return { label: '离线', variant: 'secondary' as const, className: 'bg-gray-500' };
        case 'busy':
          return { label: '忙碌', variant: 'secondary' as const, className: 'bg-yellow-500' };
        case 'locked':
          return { label: '锁定', variant: 'destructive' as const, className: '' };
        default:
          return { label: status || '-', variant: 'outline' as const, className: '' };
      }
    };
    
    const { label, variant, className} = getOnlineStatusConfig(onlineStatus);
    return <Badge variant={variant} className={className}>{label}</Badge>;
  };

  // 代收/代付状态徽章
  const getTrxStatusBadge = (status: string) => {
    const getTrxStatusConfig = (status: string) => {
      switch (status?.toLowerCase()) {
        case 'active':
          return { label: '启用', variant: 'default' as const, className: 'bg-green-500' };
        case 'inactive':
          return { label: '禁用', variant: 'secondary' as const, className: 'bg-gray-500' };
        default:
          return { label: status || '-', variant: 'outline' as const, className: '' };
      }
    };
    
    const { label, variant, className } = getTrxStatusConfig(status);
    return <Badge variant={variant} className={className}>{label}</Badge>;
  };

  const formatDateTime = (timestamp: number) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString('zh-CN');
  };

  // 查看Cashier详情
  const handleViewDetail = async (cashier: Cashier) => {
    try {
      const response = await cashierService.getCashierDetail({ account_id: cashier.account_id });
      if (response.success) {
        setSelectedCashier(response.data);
      } else {
        toast.error('获取Cashier详情失败', response.msg);
      }
    } catch (error) {
      console.error('获取Cashier详情失败:', error);
      toast.error('获取Cashier详情失败', '网络错误，请稍后重试');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cashier账户</h1>
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
                  placeholder="搜索姓名/UPI/ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="在线状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">在线状态</SelectItem>
                <SelectItem value="active">激活</SelectItem>
                <SelectItem value="inactive">未激活</SelectItem>
                <SelectItem value="suspended">暂停</SelectItem>
                <SelectItem value="pending">待审核</SelectItem>
              </SelectContent>
            </Select>
            <Select value={primaryFilter} onValueChange={setPrimaryFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="账号类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部账号</SelectItem>
                <SelectItem value="primary">主账号</SelectItem>
                <SelectItem value="non-primary">非主账号</SelectItem>
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

      {/* 出纳员列表 */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>收银员手机号</TableHead>
                <TableHead>UPI</TableHead>
                <TableHead>银行卡</TableHead>
                <TableHead>主账号</TableHead>
                <TableHead>账户状态</TableHead>
                <TableHead>在线状态</TableHead>
                <TableHead>最近登录时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : !cashiers || cashiers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                (cashiers || []).map((cashier) => (
                  <TableRow key={cashier.account_id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{cashier.user?.phone || '-'}</span>
                        <span className="text-xs text-gray-500 font-mono">{cashier.user_id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{cashier.upi || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        {cashier.holder_name && <span className="font-medium">{cashier.holder_name}</span>}
                        {cashier.bank_name && <span>{cashier.bank_name}</span>}
                        {cashier.bank_code && <span className="text-xs text-gray-500">{cashier.bank_code}</span>}
                        {cashier.card_number && <span className="font-mono text-xs text-gray-500">{cashier.card_number}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {cashier.primary && (
                        <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(cashier.status)}</TableCell>
                    <TableCell>{getOnlineStatusBadge(cashier.online_status)}</TableCell>
                    <TableCell>{formatDateTime(cashier.bound_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDetail(cashier)}
                            >
                              详情
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[45vw] w-[45vw] min-w-[600px]" style={{width: '45vw', maxWidth: '45vw'}}>
                            <DialogHeader>
                              <DialogTitle>Cashier详情</DialogTitle>
                            </DialogHeader>
                            {selectedCashier && (
                              <div className="grid grid-cols-2 gap-4 py-4 max-h-[500px] overflow-y-auto">
                                <div>
                                  <label className="text-sm text-muted-foreground">Account ID</label>
                                  <p className="text-base font-semibold font-mono mt-1">{selectedCashier.account_id}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">User ID</label>
                                  <p className="text-base font-semibold font-mono mt-1">{selectedCashier.user_id}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">收银员姓名</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.user?.name || '-'}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">收银员电话</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.user?.phone || '-'}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">收银员邮箱</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.user?.email || '-'}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">组织ID</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.user?.org_id || '-'}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">账户类型</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.type === 'private' ? '主账号' : '共享账号'}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">APP类型</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.app_type}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">APP账号ID</label>
                                  <p className="text-base font-semibold font-mono mt-1">{selectedCashier.app_account_id || '-'}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">UPI ID</label>
                                  <p className="text-base font-semibold font-mono mt-1">{selectedCashier.upi || '-'}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">UPI提供商</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.provider || '-'}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">银行代码</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.bank_code || '-'}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">银行名称</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.bank_name || '-'}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">银行卡号</label>
                                  <p className="text-base font-semibold font-mono mt-1">{selectedCashier.card_number || '-'}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">持卡人姓名</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.holder_name}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">持卡人电话</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.holder_phone}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">持卡人邮箱</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.holder_email || '-'}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">账户状态</label>
                                  <p className="mt-1">{getStatusBadge(selectedCashier.status)}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">在线状态</label>
                                  <p className="mt-1">{getOnlineStatusBadge(selectedCashier.online_status)}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">代收状态</label>
                                  <p className="mt-1">{getTrxStatusBadge(selectedCashier.payin_status)}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">代付状态</label>
                                  <p className="mt-1">{getTrxStatusBadge(selectedCashier.payout_status)}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">备注</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.remark || '-'}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">创建时间</label>
                                  <p className="text-base font-semibold mt-1">{formatDateTime(selectedCashier.created_at)}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">更新时间</label>
                                  <p className="text-base font-semibold mt-1">{formatDateTime(selectedCashier.updated_at)}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">绑定时间</label>
                                  <p className="text-base font-semibold mt-1">{formatDateTime(selectedCashier.bound_at)}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">最后活跃时间</label>
                                  <p className="text-base font-semibold mt-1">{formatDateTime(selectedCashier.last_active_at)}</p>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* 分页 */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              显示第 {((pagination.page - 1) * pagination.size) + 1} - {Math.min(pagination.page * pagination.size, pagination.total)} 条，共 {pagination.total} 条
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
        </CardContent>
      </Card>
    </div>
  );
}