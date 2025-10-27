import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Search, RefreshCw, Users } from 'lucide-react';
import { cashierTeamService, CashierTeam, CashierTeamListParams, CashierTeamStats } from '../services/cashierTeamService';
import { toast } from '../utils/toast';

export function CashierTeamManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<CashierTeam | null>(null);
  const [teams, setTeams] = useState<CashierTeam[]>([]);
  const [stats, setStats] = useState<CashierTeamStats>({
    total: 0,
    active: 0,
    inactive: 0,
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

  // 获取CashierTeam统计
  const fetchStats = useCallback(async () => {
    try {
      const response = await cashierTeamService.getCashierTeamStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('获取统计数据失败:', error);
    }
  }, []);

  // 获取CashierTeam列表
  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: CashierTeamListParams = {
        page: pagination.page,
        size: pagination.size
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }
      if (searchTerm) {
        if (searchTerm.includes('@')) {
          params.email = searchTerm;
        } else if (/^\d+$/.test(searchTerm)) {
          params.phone = searchTerm;
        } else {
          params.name = searchTerm;
        }
      }

      const response = await cashierTeamService.getCashierTeamList(params);
      if (response.success) {
        setTeams(response.data.list);
        setPagination(prev => ({
          ...prev,
          total: response.data.total,
          totalPages: Math.ceil(response.data.total / prev.size)
        }));
      } else {
        setTeams([]);
        setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
        setError(response.msg || '获取数据失败');
      }
    } catch (error: any) {
      console.error('获取CashierTeam列表失败:', error);
      setTeams([]);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
      setError(error.message || '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, statusFilter, typeFilter, searchTerm]);

  useEffect(() => {
    fetchTeams();
    fetchStats();
  }, [fetchTeams, fetchStats]);

  const handleRefresh = () => {
    fetchTeams();
    fetchStats();
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
      'active': { label: '激活', variant: 'default', className: 'bg-green-500' },
      'inactive': { label: '未激活', variant: 'secondary', className: 'bg-gray-500' },
      'suspended': { label: '暂停', variant: 'destructive', className: '' },
      'pending': { label: '待审核', variant: 'secondary', className: 'bg-yellow-500' }
    };
    const config = configs[status?.toLowerCase()] || { label: status || '-', variant: 'outline' as const, className: '' };
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const handleViewDetail = async (team: CashierTeam) => {
    try {
      const response = await cashierTeamService.getCashierTeamDetail({ tid: team.tid });
      if (response.success) {
        setSelectedTeam(response.data);
      } else {
        toast.error('获取CashierTeam详情失败', response.msg);
      }
    } catch (error) {
      console.error('获取CashierTeam详情失败:', error);
      toast.error('获取CashierTeam详情失败', '网络错误，请稍后重试');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">CashierTeam</h1>
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
            <CardTitle className="text-sm font-medium">总数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">激活</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">未激活</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">暂停</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
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
                  placeholder="搜索团队名称、邮箱或电话..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="internal">内部</SelectItem>
                <SelectItem value="external">外部</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* CashierTeam列表 */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-12">加载中...</div>
          ) : teams.length === 0 ? (
            <div className="text-center py-12 text-gray-500">暂无数据</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>团队ID</TableHead>
                  <TableHead>团队名称</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>电话</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-mono text-xs">{team.tid}</TableCell>
                    <TableCell>{team.name}</TableCell>
                    <TableCell>{team.email}</TableCell>
                    <TableCell>{team.phone}</TableCell>
                    <TableCell>{team.type}</TableCell>
                    <TableCell>{getStatusBadge(team.status)}</TableCell>
                    <TableCell>{formatDateTime(team.created_at)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetail(team)}>
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
      {!loading && teams.length > 0 && (
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

      {/* CashierTeam详情对话框 */}
      <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>CashierTeam详情</DialogTitle>
            <DialogDescription>
              查看CashierTeam的详细信息
            </DialogDescription>
          </DialogHeader>
          {selectedTeam && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">团队ID</label>
                  <p className="mt-1 font-mono text-sm">{selectedTeam.tid}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">团队名称</label>
                  <p className="mt-1">{selectedTeam.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">邮箱</label>
                  <p className="mt-1">{selectedTeam.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">电话</label>
                  <p className="mt-1">{selectedTeam.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">类型</label>
                  <p className="mt-1">{selectedTeam.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">状态</label>
                  <p className="mt-1">{getStatusBadge(selectedTeam.status)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">创建时间</label>
                  <p className="mt-1">{formatDateTime(selectedTeam.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">更新时间</label>
                  <p className="mt-1">{formatDateTime(selectedTeam.updated_at)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
