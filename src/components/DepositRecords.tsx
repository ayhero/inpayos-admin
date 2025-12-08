import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Search, RefreshCw, ArrowDownCircle } from 'lucide-react';
import { depositService, DepositRecord, DepositListParams, DepositStats } from '../services/depositService';
import { StatusBadge } from './StatusBadge';
import { UserTypeLabel } from './UserTypeLabel';
import { getCcyLabel } from '../constants/business';
import { toast } from '../utils/toast';

export function DepositRecords() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<DepositRecord | null>(null);
  const [records, setRecords] = useState<DepositRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [todayStats, setTodayStats] = useState<DepositStats | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  });

  // 获取今日统计
  const fetchTodayStats = async () => {
    try {
      const response = await depositService.getTodayStats();
      if (response.success) {
        setTodayStats(response.data);
      } else {
        setTodayStats({
          total_amount: '0.00',
          total_count: 0,
          success_count: 0,
          success_rate: 0
        });
      }
    } catch (error) {
      console.error('获取今日统计失败:', error);
      setTodayStats({
        total_amount: '0.00',
        total_count: 0,
        success_count: 0,
        success_rate: 0
      });
    }
  };

  // 获取充值记录
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params: DepositListParams = {
        page: pagination.page,
        size: pagination.pageSize
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (userTypeFilter !== 'all') {
        params.user_type = userTypeFilter;
      }
      if (searchTerm) {
        params.keyword = searchTerm;
      }

      const response = await depositService.getDepositList(params);
      if (response.success) {
        setRecords(response.data.records);
        const totalPages = Math.ceil(response.data.total / pagination.pageSize);
        setPagination(prev => ({
          ...prev,
          total: response.data.total,
          totalPages: totalPages
        }));
      } else {
        setRecords([]);
        setPagination(prev => ({
          ...prev,
          total: 0,
          totalPages: 0
        }));
      }
    } catch (error) {
      console.error('获取充值记录失败:', error);
      setRecords([]);
      setPagination(prev => ({
        ...prev,
        total: 0,
        totalPages: 0
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayStats();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [pagination.page, statusFilter, userTypeFilter]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchRecords();
  };

  const handleRefresh = () => {
    fetchRecords();
    fetchTodayStats();
  };

  const handleViewDetail = async (record: DepositRecord) => {
    setDialogOpen(true);
    setSelectedRecord(record);
  };

  const formatDateTime = (timestamp: number) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? '-' : date.toLocaleString('zh-CN');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">充值</h1>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          刷新
        </Button>
      </div>

      {/* 统计卡片 */}
      {todayStats && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今日充值笔数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.total_count}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">成功笔数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{todayStats.success_count}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索充值ID、用户ID、流水号..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="用户类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="merchant">商户</SelectItem>
                <SelectItem value="cashier_team">车队</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="success">成功</SelectItem>
                <SelectItem value="failed">失败</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>搜索</Button>
          </div>
        </CardContent>
      </Card>

      {/* 数据表格 */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-12">加载中...</div>
          ) : !records || records.length === 0 ? (
            <div className="text-center py-12 text-gray-500">暂无数据</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>充值ID</TableHead>
                  <TableHead>用户信息</TableHead>
                  <TableHead>币种</TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>流水号</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono text-sm">{record.trx_id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="font-mono text-sm">{record.sid}</div>
                        <UserTypeLabel type={record.s_type as 'merchant' | 'cashier_team'} />
                      </div>
                    </TableCell>
                    <TableCell>{getCcyLabel(record.ccy)}</TableCell>
                    <TableCell className="font-semibold">{parseFloat(record.amount).toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-sm">{record.flow_no || '-'}</TableCell>
                    <TableCell>
                      <StatusBadge status={record.status} type="trx" />
                    </TableCell>
                    <TableCell>{formatDateTime(record.created_at)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetail(record)}>
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
      {!loading && records && records.length > 0 && (
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

      {/* 详情弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[60vw] w-[60vw] min-w-[600px]" style={{width: '60vw', maxWidth: '60vw'}}>
          <DialogHeader>
            <DialogTitle>充值详情</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="py-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                {/* 基本信息模块 */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-300 dark:border-gray-600">基本信息</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">充值ID</label>
                        <p className="text-base font-semibold font-mono mt-1">{selectedRecord.trx_id}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">状态</label>
                        <p className="mt-1"><StatusBadge status={selectedRecord.status} type="trx" /></p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">账户ID</label>
                        <p className="text-base font-semibold font-mono mt-1">{selectedRecord.account_id}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">用户类型</label>
                        <p className="mt-1"><UserTypeLabel type={selectedRecord.s_type as 'merchant' | 'cashier_team'} /></p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">金额</label>
                        <p className="text-lg font-semibold text-green-600 mt-1">
                          {getCcyLabel(selectedRecord.ccy)} {parseFloat(selectedRecord.amount).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">流水号</label>
                        <p className="text-base font-semibold font-mono mt-1">{selectedRecord.flow_no || '-'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">创建时间</label>
                        <p className="text-base font-semibold mt-1">{formatDateTime(selectedRecord.created_at)}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">更新时间</label>
                        <p className="text-base font-semibold mt-1">{formatDateTime(selectedRecord.updated_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
