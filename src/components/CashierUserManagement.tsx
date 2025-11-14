import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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
import { Search, Download, RefreshCw, User } from 'lucide-react';
import { cashierUserService, CashierUser, CashierUserListParams, CashierUserStats } from '../services/cashierUserService';
import { toast } from '../utils/toast';
import { StatusBadge } from './StatusBadge';

export function CashierUserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCashier, setSelectedCashier] = useState<CashierUser | null>(null);
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
        <h1 className="text-2xl font-bold">Cashier用户</h1>
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
        <CardHeader>
          <CardTitle>出纳员用户列表</CardTitle>
        </CardHeader>
        <CardContent>
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
                      <TableHead>用户ID</TableHead>
                      <TableHead>姓名</TableHead>
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
                        <TableCell className="font-mono text-xs">{cashier.user_id}</TableCell>
                        <TableCell>{cashier.name || '-'}</TableCell>
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
                                    {cashier.primary_account.account_id && (
                                      <div><strong>账户ID:</strong> {cashier.primary_account.account_id}</div>
                                    )}
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
          <DialogContent className="max-w-[45vw] w-[45vw] min-w-[600px]" style={{width: '45vw', maxWidth: '45vw'}}>
            <DialogHeader>
              <DialogTitle>Cashier用户详情</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">用户ID</div>
                  <div className="mt-1 font-mono text-sm">{selectedCashier.user_id}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">姓名</div>
                  <div className="mt-1">{selectedCashier.name || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">手机</div>
                  <div className="mt-1">{selectedCashier.phone || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">邮箱</div>
                  <div className="mt-1">{selectedCashier.email || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">车队ID</div>
                  <div className="mt-1">{selectedCashier.tid || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">币种</div>
                  <div className="mt-1">{selectedCashier.ccy || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">国家</div>
                  <div className="mt-1">{selectedCashier.country || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">状态</div>
                  <div className="mt-1"><StatusBadge status={selectedCashier.status} type="account" /></div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">在线状态</div>
                  <div className="mt-1"><StatusBadge status={selectedCashier.online_status} type="online" /></div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">代收状态</div>
                  <div className="mt-1"><StatusBadge status={selectedCashier.payin_status} type="trx" /></div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">代付状态</div>
                  <div className="mt-1"><StatusBadge status={selectedCashier.payout_status} type="trx" /></div>
                </div>
              </div>

              {/* 时间信息 - 单独一行 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">创建时间</div>
                  <div className="mt-1">{formatDateTime(selectedCashier.created_at)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">更新时间</div>
                  <div className="mt-1">{formatDateTime(selectedCashier.updated_at)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">最后登录</div>
                  <div className="mt-1">{formatDateTime(selectedCashier.last_login_at)}</div>
                </div>
              </div>

              {/* 主账户信息 */}
              {selectedCashier.primary_account && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">主账户信息</h3>
                  <div className="grid grid-cols-2 gap-4 border rounded-lg p-4 bg-muted/50">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">账户ID</div>
                      <div className="mt-1 font-mono text-sm">{selectedCashier.primary_account.account_id}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">应用类型</div>
                      <div className="mt-1">{selectedCashier.primary_account.app_type || '-'}</div>
                    </div>
                    {selectedCashier.primary_account.upi && (
                      <>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">UPI ID</div>
                          <div className="mt-1 font-mono text-sm">{selectedCashier.primary_account.upi}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">UPI Provider</div>
                          <div className="mt-1">{selectedCashier.primary_account.provider || '-'}</div>
                        </div>
                      </>
                    )}
                    {selectedCashier.primary_account.card_number && (
                      <>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">银行名称</div>
                          <div className="mt-1">{selectedCashier.primary_account.bank_name || '-'}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">银行代码</div>
                          <div className="mt-1">{selectedCashier.primary_account.bank_code || '-'}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">卡号</div>
                          <div className="mt-1 font-mono text-sm">{selectedCashier.primary_account.card_number}</div>
                        </div>
                      </>
                    )}
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">持卡人姓名</div>
                      <div className="mt-1">{selectedCashier.primary_account.holder_name || '-'}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">持卡人手机</div>
                      <div className="mt-1">{selectedCashier.primary_account.holder_phone || '-'}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">持卡人邮箱</div>
                      <div className="mt-1">{selectedCashier.primary_account.holder_email || '-'}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">账户状态</div>
                      <div className="mt-1"><StatusBadge status={selectedCashier.primary_account.status} type="account" /></div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">在线状态</div>
                      <div className="mt-1"><StatusBadge status={selectedCashier.primary_account.online_status} type="online" /></div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">代收状态</div>
                      <div className="mt-1"><StatusBadge status={selectedCashier.primary_account.payin_status} type="trx" /></div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">代付状态</div>
                      <div className="mt-1"><StatusBadge status={selectedCashier.primary_account.payout_status} type="trx" /></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
