import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Search, RefreshCw, ArrowUpCircle, CheckCircle, XCircle } from 'lucide-react';
import { withdrawService, WithdrawRecord, WithdrawListParams, WithdrawStats } from '../services/withdrawService';
import { toast } from '../utils/toast';
import { StatusBadge } from './StatusBadge';
import { getCcyLabel } from '../constants/business';
import { ConfirmDialog } from './ui/confirm-dialog';

export function WithdrawRecords() {
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [settleStatusFilter, setSettleStatusFilter] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<WithdrawRecord | null>(null);
  const [records, setRecords] = useState<WithdrawRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stats, setStats] = useState<WithdrawStats | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 20,
    total: 0
  });

  // 审核相关状态
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewRecord, setReviewRecord] = useState<WithdrawRecord | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewRemark, setReviewRemark] = useState('');
  const [reviewing, setReviewing] = useState(false);

  // 结算相关状态
  const [settleDialogOpen, setSettleDialogOpen] = useState(false);
  const [settleRecord, setSettleRecord] = useState<WithdrawRecord | null>(null);
  const [settling, setSettling] = useState(false);

  // 获取今日统计
  const fetchStats = async () => {
    try {
      const response = await withdrawService.getTodayStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  // 获取提现记录列表
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params: WithdrawListParams = {
        page: pagination.page,
        size: pagination.size
      };

      if (userTypeFilter !== 'all') {
        params.user_type = userTypeFilter;
      }
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (settleStatusFilter !== 'all') {
        params.settle_status = settleStatusFilter;
      }
      if (searchTerm) {
        params.keyword = searchTerm;
      }

      const response = await withdrawService.getWithdrawList(params);
      if (response.success) {
        setRecords(response.data.records || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.total
        }));
      } else {
        setRecords([]);
        setPagination(prev => ({ ...prev, total: 0 }));
      }
    } catch (error) {
      console.error('获取提现记录失败:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [pagination.page]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchRecords();
  };

  const handleRefresh = () => {
    fetchRecords();
    fetchStats();
  };

  const handleViewDetail = async (record: WithdrawRecord) => {
    setSelectedRecord(record);
    setDialogOpen(true);
  };

  // 打开审核对话框
  const handleOpenReview = (record: WithdrawRecord, action: 'approve' | 'reject') => {
    setReviewRecord(record);
    setReviewAction(action);
    setReviewRemark('');
    setReviewDialogOpen(true);
  };

  // 确认审核
  const handleConfirmReview = async () => {
    if (!reviewRecord) return;

    setReviewing(true);
    try {
      const response = await withdrawService.reviewWithdraw({
        withdraw_id: reviewRecord.trx_id,
        action: reviewAction,
        review_remark: reviewRemark
      });

      if (response.success) {
        const actionText = reviewAction === 'approve' ? '通过' : '拒绝';
        if (response.data.auto_settled) {
          toast.success(`审核${actionText}成功`, '余额充足，已自动结算');
        } else {
          toast.success(`审核${actionText}成功`);
        }
        setReviewDialogOpen(false);
        fetchRecords();
        fetchStats();
      } else {
        toast.error('审核失败', response.msg);
      }
    } catch (error: any) {
      console.error('审核失败:', error);
      toast.error('审核失败', error.message || '网络错误');
    } finally {
      setReviewing(false);
    }
  };

  // 打开结算对话框
  const handleOpenSettle = (record: WithdrawRecord) => {
    setSettleRecord(record);
    setSettleDialogOpen(true);
  };

  // 确认结算
  const handleConfirmSettle = async () => {
    if (!settleRecord) return;

    setSettling(true);
    try {
      const response = await withdrawService.settleWithdraw({
        withdraw_id: settleRecord.trx_id
      });

      if (response.success) {
        toast.success('结算成功');
        setSettleDialogOpen(false);
        fetchRecords();
        fetchStats();
      } else {
        toast.error('结算失败', response.msg);
      }
    } catch (error: any) {
      console.error('结算失败:', error);
      toast.error('结算失败', error.message || '网络错误');
    } finally {
      setSettling(false);
    }
  };

  const formatDateTime = (timestamp: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const formatAmount = (amount: string, ccy: string) => {
    return `${getCcyLabel(ccy)} ${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getUserTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      merchant: '商户',
      cashier_team: '车队'
    };
    return labels[type] || type;
  };

  const getSettleStatusBadge = (settleStatus: string) => {
    const config: Record<string, { label: string; variant: any }> = {
      pending: { label: '待结算', variant: 'warning' },
      success: { label: '已结算', variant: 'success' },
      failed: { label: '失败', variant: 'destructive' }
    };
    const item = config[settleStatus] || { label: settleStatus, variant: 'default' };
    return <Badge variant={item.variant as any}>{item.label}</Badge>;
  };

  const totalPages = Math.ceil(pagination.total / pagination.size);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">提现</h1>
        <Button onClick={handleRefresh} className="gap-2" variant="outline">
          <RefreshCw className="h-4 w-4" />
          刷新
        </Button>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">今日提现笔数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_count}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">待审核笔数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.reviewing_count}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">待结算笔数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending_settle_count}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 筛选区域 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索用户ID/提现ID/流水号"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="用户类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="merchant">商户</SelectItem>
                <SelectItem value="cashier_team">车队</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="业务状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="reviewing">待审核</SelectItem>
                <SelectItem value="approved">已批准</SelectItem>
                <SelectItem value="success">成功</SelectItem>
                <SelectItem value="rejected">已拒绝</SelectItem>
              </SelectContent>
            </Select>
            <Select value={settleStatusFilter} onValueChange={setSettleStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="结算状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待结算</SelectItem>
                <SelectItem value="success">已结算</SelectItem>
                <SelectItem value="failed">失败</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              搜索
            </Button>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setUserTypeFilter('all');
              setStatusFilter('all');
              setSettleStatusFilter('all');
              setPagination(prev => ({ ...prev, page: 1 }));
              fetchRecords();
            }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 数据表格 */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-12">加载中...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-gray-500">暂无数据</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>提现ID</TableHead>
                  <TableHead>用户信息</TableHead>
                  <TableHead>金额</TableHead>
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
                      <div>
                        <div className="font-semibold">{record.sid}</div>
                        <div className="text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {getUserTypeLabel(record.s_type)}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-amber-600">
                      {formatAmount(record.amount, record.ccy)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={record.status} type="trx" />
                    </TableCell>
                    <TableCell className="text-sm">{formatDateTime(record.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetail(record)}>
                          查看
                        </Button>
                        {record.status === 'reviewing' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleOpenReview(record, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              通过
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleOpenReview(record, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              拒绝
                            </Button>
                          </>
                        )}
                        {record.status === 'approved' && record.settle_status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700"
                            onClick={() => handleOpenSettle(record)}
                          >
                            结算
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 分页 */}
      {!loading && records.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            共 {pagination.total} 条记录，第 {pagination.page} / {totalPages} 页
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
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
              disabled={pagination.page >= totalPages}
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
            <DialogTitle>提现详情</DialogTitle>
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
                        <label className="text-sm text-muted-foreground">提现ID</label>
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
                        <p className="mt-1"><Badge variant="outline">{getUserTypeLabel(selectedRecord.s_type)}</Badge></p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">金额</label>
                        <p className="text-lg font-semibold text-amber-600 mt-1">
                          {formatAmount(selectedRecord.amount, selectedRecord.ccy)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">流水号</label>
                        <p className="text-base font-semibold font-mono mt-1">{selectedRecord.flow_no || '-'}</p>
                      </div>
                    </div>
                    {selectedRecord.remark && (
                      <div>
                        <label className="text-sm text-muted-foreground">申请备注</label>
                        <p className="text-base font-semibold mt-1">{selectedRecord.remark}</p>
                      </div>
                    )}
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

                {/* 审核信息模块 - 仅在有审核记录时显示 */}
                {selectedRecord.reviewer_id && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-300 dark:border-gray-600">审核信息</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-muted-foreground">审核人</label>
                          <p className="text-base font-semibold font-mono mt-1">{selectedRecord.reviewer_id}</p>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">审核时间</label>
                          <p className="text-base font-semibold mt-1">{formatDateTime(selectedRecord.reviewed_at || 0)}</p>
                        </div>
                      </div>
                      {selectedRecord.review_remark && (
                        <div>
                          <label className="text-sm text-muted-foreground">审核意见</label>
                          <p className="text-base font-semibold mt-1">{selectedRecord.review_remark}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 结算信息模块 */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-300 dark:border-gray-600">结算信息</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">结算状态</label>
                        <p className="mt-1">{getSettleStatusBadge(selectedRecord.settle_status)}</p>
                      </div>
                      {selectedRecord.settled_at && (
                        <div>
                          <label className="text-sm text-muted-foreground">结算时间</label>
                          <p className="text-base font-semibold mt-1">{formatDateTime(selectedRecord.settled_at)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 审核确认对话框 */}
      <ConfirmDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        title={reviewAction === 'approve' ? '确认通过审核' : '确认拒绝审核'}
        description={
          <div className="space-y-4">
            {reviewRecord && (
              <>
                <p>请确认{reviewAction === 'approve' ? '通过' : '拒绝'}以下提现申请：</p>
                <div className="rounded-lg border p-3 bg-gray-50 dark:bg-gray-800 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">提现ID:</span>
                    <span className="font-mono">{reviewRecord.trx_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">用户:</span>
                    <span>{reviewRecord.sid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">金额:</span>
                    <span className="font-semibold">{formatAmount(reviewRecord.amount, reviewRecord.ccy)}</span>
                  </div>
                </div>
                <div>
                  <textarea
                    placeholder="审核意见（选填）"
                    value={reviewRemark}
                    onChange={(e) => setReviewRemark(e.target.value)}
                    className="w-full rounded-md border p-2 text-sm"
                    rows={3}
                  />
                </div>
                {reviewAction === 'approve' && (
                  <p className="text-sm text-blue-600">
                    ℹ️ 通过后，如果用户余额充足将自动结算
                  </p>
                )}
              </>
            )}
          </div>
        }
        onConfirm={handleConfirmReview}
        onCancel={() => setReviewDialogOpen(false)}
        confirmText={reviewAction === 'approve' ? '确认通过' : '确认拒绝'}
        cancelText="取消"
        loading={reviewing}
      />

      {/* 结算确认对话框 */}
      <ConfirmDialog
        open={settleDialogOpen}
        onOpenChange={setSettleDialogOpen}
        title="确认结算"
        description={
          <div className="space-y-4">
            {settleRecord && (
              <>
                <p>请确认结算以下提现申请：</p>
                <div className="rounded-lg border p-3 bg-gray-50 dark:bg-gray-800 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">提现ID:</span>
                    <span className="font-mono">{settleRecord.trx_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">用户:</span>
                    <span>{settleRecord.sid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">金额:</span>
                    <span className="font-semibold text-amber-600">{formatAmount(settleRecord.amount, settleRecord.ccy)}</span>
                  </div>
                </div>
                <p className="text-sm text-amber-600">
                  ⚠️ 结算后将从用户账户中扣除相应金额
                </p>
              </>
            )}
          </div>
        }
        onConfirm={handleConfirmSettle}
        onCancel={() => setSettleDialogOpen(false)}
        confirmText="确认结算"
        cancelText="取消"
        loading={settling}
      />
    </div>
  );
}
