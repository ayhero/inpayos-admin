import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Search, Download, RefreshCw } from 'lucide-react';
import { DispatchHistory } from './DispatchHistory';
import { MerchantSelector } from './MerchantSelector';
import { 
  transactionService, 
  TransactionInfo, 
  TransactionType, 
  TransactionStatus,
  TransactionQueryParams,
  TodayStats 
} from '../services/transactionService';
import { getStatusDisplayName, getStatusColor, getTrxTypeBadgeConfig, getChannelStatusBadgeConfig, getSettleStatusBadgeConfig } from '../constants/status';
import { getTrxMethodLabel, getChannelCodeLabel } from '../constants/business';
import { toast } from '../utils/toast';

export function PayinRecords() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [merchantFilter, setMerchantFilter] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<TransactionInfo | null>(null);
  const [records, setRecords] = useState<TransactionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  });

  // 手动通知交易
  const handleNotifyTransaction = async (trxID: string) => {
    try {
      const response = await transactionService.notifyTransaction(trxID, TransactionType.PAYIN);
      if (response.success) {
        toast.success('通知发送成功');
      } else {
        toast.error(response.msg || '通知发送失败');
      }
    } catch (error) {
      console.error('通知交易失败:', error);
      toast.error('通知发送失败');
    }
  };

  // 确认交易相关状态
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmingRecord, setConfirmingRecord] = useState<TransactionInfo | null>(null);
  const [referenceId, setReferenceId] = useState('');
  const [secondConfirmOpen, setSecondConfirmOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string>('');

  // 获取今日统计
  const fetchTodayStats = async () => {
    try {
      const response = await transactionService.getTodayStats(TransactionType.PAYIN);
      if (response.success) {
        setTodayStats(response.data);
      } else {
        // API调用成功但返回失败时，显示默认数据
        setTodayStats({
          totalAmount: '0.00',
          totalCount: 0,
          successCount: 0,
          successRate: 0,
          pendingCount: 0
        });
      }
    } catch (error) {
      console.error('获取今日统计失败:', error);
      // 网络错误时也显示默认数据
      setTodayStats({
        totalAmount: '0.00',
        totalCount: 0,
        successCount: 0,
        successRate: 0,
        pendingCount: 0
      });
    }
  };

  // 获取代收记录
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params: TransactionQueryParams = {
        trxType: TransactionType.PAYIN,
        page: pagination.page,
        pageSize: pagination.pageSize
      };

      // 添加筛选条件
      if (statusFilter !== 'all') {
        params.status = statusFilter as TransactionStatus;
      }
      if (merchantFilter !== 'all') {
        params.uid = merchantFilter;
        params.userType = 'merchant';
      }
      if (searchTerm) {
        params.keyword = searchTerm;
      }

      const response = await transactionService.getTransactions(params);
      if (response.success) {
        setRecords(response.data.items);
        setPagination(prev => ({
          ...prev,
          total: response.data.total,
          totalPages: response.data.totalPages
        }));
      } else {
        // API调用失败时清空记录和分页信息
        setRecords([]);
        setPagination(prev => ({
          ...prev,
          total: 0,
          totalPages: 0
        }));
      }
    } catch (error) {
      console.error('获取代收记录失败:', error);
      // 发生异常时也清空数据
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
  }, [pagination.page]);

  const getStatusBadge = (status: TransactionStatus) => {
    const displayName = getStatusDisplayName(status);
    const color = getStatusColor(status);
    
    const getVariantAndClass = (color: string) => {
      switch (color) {
        case 'success':
          return { variant: 'default' as const, className: 'bg-green-500' };
        case 'error':
          return { variant: 'destructive' as const, className: '' };
        case 'warning':
          return { variant: 'secondary' as const, className: 'bg-yellow-500' };
        case 'processing':
          return { variant: 'secondary' as const, className: 'bg-blue-500' };
        case 'info':
          return { variant: 'outline' as const, className: '' };
        default:
          return { variant: 'outline' as const, className: '' };
      }
    };
    
    const { variant, className } = getVariantAndClass(color);
    return <Badge variant={variant} className={className}>{displayName}</Badge>;
  };

  const formatCurrency = (amount: string, currency: string) => {
    const num = parseFloat(amount);
    const symbol = currency === 'INR' ? '₹' : currency === 'USDT' ? '' : '$';
    return `${symbol}${num.toLocaleString()} ${currency}`;
  };

  // 模态窗专用的金额格式化函数，格式为"币种 金额"，如果usdAmount存在且不同于amount，显示($xxx)
  const formatCurrencyForModal = (amount: string, currency: string, usdAmount?: string) => {
    const num = parseFloat(amount);
    let result = `${currency} ${num.toLocaleString()}`;
    if (usdAmount && usdAmount !== amount) {
      result += ` ($${parseFloat(usdAmount).toLocaleString()})`;
    }
    return result;
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '-' : date.toLocaleString('zh-CN');
  };

  // 查看详情 - 从API获取完整数据
  const handleViewDetail = async (record: TransactionInfo) => {
    setDialogOpen(true);
    setDetailLoading(true);
    setSelectedRecord(null);
    
    try {
      const response = await transactionService.getTransactionDetail(record.trxID, TransactionType.PAYIN);
      if (response.success) {
        setSelectedRecord(response.data);
      } else {
        toast.error(response.msg || '获取交易详情失败');
        setDialogOpen(false);
      }
    } catch (error) {
      console.error('获取交易详情失败:', error);
      toast.error('获取交易详情失败');
      setDialogOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRetryNotification = async (trxID: string) => {
    try {
      await transactionService.retryNotification(trxID);
      fetchRecords(); // 刷新列表
    } catch (error) {
      console.error('重试通知失败:', error);
    }
  };

  // 打开确认交易对话框
  const handleConfirmTransaction = (record: TransactionInfo) => {
    setConfirmingRecord(record);
    setReferenceId('');
    setConfirmDialogOpen(true);
  };

  // 第一步确认：输入reference_id
  const handleFirstConfirm = () => {
    if (!referenceId.trim()) {
      toast.warning('请输入流水号', '流水号不能为空');
      return;
    }
    setConfirmDialogOpen(false);
    setSecondConfirmOpen(true);
  };

  // 最终确认并提交
  const handleFinalConfirm = async () => {
    if (!confirmingRecord || !referenceId.trim()) {
      return;
    }

    setConfirming(true);
    setConfirmError('');
    try {
      const response = await transactionService.confirmTransaction({
        trxID: confirmingRecord.trxID,
        referenceID: referenceId.trim(),
        trxType: TransactionType.PAYIN
      });

      if (response.success) {
        toast.success('交易确认成功', `交易 ${confirmingRecord.trxID} 已成功确认`);
        fetchRecords(); // 刷新列表
        // 成功后关闭弹窗
        setSecondConfirmOpen(false);
        setConfirmingRecord(null);
        setReferenceId('');
        setConfirmError('');
      } else {
        // 失败时显示错误信息，但不关闭弹窗
        setConfirmError(response.msg || '确认失败');
      }
    } catch (error: any) {
      console.error('确认交易失败:', error);
      setConfirmError('确认失败，请稍后重试');
    } finally {
      setConfirming(false);
    }
  };

  // 取消确认
  const handleCancelConfirm = () => {
    setConfirmDialogOpen(false);
    setSecondConfirmOpen(false);
    setConfirmingRecord(null);
    setReferenceId('');
    setConfirmError('');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>代收</h1>
      </div>

      {/* 今日统计 */}
      {todayStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今日代收总额</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">₹</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{parseInt(todayStats.totalAmount).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{todayStats.totalCount}笔交易</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">成功率</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">%</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.successRate}%</div>
              <p className="text-xs text-muted-foreground">{todayStats.successCount}/{todayStats.totalCount} 成功</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">代收笔数</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">#</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.totalCount}</div>
              <p className="text-xs text-muted-foreground">今日交易</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">待处理</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">#</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.pendingCount}</div>
              <p className="text-xs text-muted-foreground">需要关注</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 md:flex-initial md:w-80">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索交易ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  maxLength={100}
                />
              </div>
            </div>
            <MerchantSelector
              value={merchantFilter}
              onChange={setMerchantFilter}
              className="w-full md:w-64"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="success">成功</SelectItem>
                <SelectItem value="pending">处理中</SelectItem>
                <SelectItem value="failed">失败</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => {
              setPagination(prev => ({ ...prev, page: 1 }));
              fetchRecords();
            }} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              搜索
            </Button>
            <Button variant="outline" onClick={() => { 
              setSearchTerm('');
              setStatusFilter('all');
              setMerchantFilter('all');
              setPagination(prev => ({ ...prev, page: 1 }));
              fetchRecords();
            }} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 代收记录列表 */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>交易ID</TableHead>
                <TableHead>请求ID</TableHead>
                <TableHead>交易类型</TableHead>
                <TableHead>金额</TableHead>
                <TableHead>支付方式</TableHead>
                <TableHead>派单轮数/结果</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>通知状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>完成时间</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => {
                // 计算派单信息
                const maxRound = record.dispatchRecords?.length || 0;
                const lastRecord = record.dispatchRecords?.[record.dispatchRecords.length - 1];
                const dispatchStatus = lastRecord?.status || '-';
                const dispatchDisplay = maxRound > 0 ? `R${maxRound} / ${dispatchStatus}` : '-';
                
                return (
                  <TableRow key={record.trxID}>
                    <TableCell className="font-mono text-sm">{record.trxID}</TableCell>
                    <TableCell className="font-mono text-sm">{record.reqID || '-'}</TableCell>
                    <TableCell>
                      {(() => {
                        const config = getTrxTypeBadgeConfig(record.trxType || '');
                        return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
                      })()}
                    </TableCell>
                    <TableCell>
                      {formatCurrencyForModal(record.amount, record.ccy, record.usdAmount)}
                    </TableCell>
                    <TableCell>{getTrxMethodLabel(record.trxMethod)}</TableCell>
                    <TableCell className="font-mono text-xs">{dispatchDisplay}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex flex-col gap-1">
                        <span className={`font-medium ${
                          record.notifyStatus === 'success' ? 'text-green-600' : 
                          record.notifyStatus === 'failed' ? 'text-red-600' : 'text-gray-400'
                        }`}>
                          {record.notifyStatus === 'success' ? '✓ 成功' : 
                           record.notifyStatus === 'failed' ? '✗ 失败' : 
                           record.notifyStatus === 'pending' ? '⏳ 待通知' : '-'}
                        </span>
                        {record.notifyCount !== undefined && record.notifyCount > 0 && (
                          <span className="text-gray-500">次数: {record.notifyCount}</span>
                        )}
                        {record.notifiedAt && (
                          <span className="text-gray-500">{formatDateTime(record.notifiedAt)}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatDateTime(record.createdAt)}</TableCell>
                    <TableCell>{record.completedAt ? formatDateTime(record.completedAt) : '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-3">
                        <span
                          className="text-blue-600 hover:text-blue-700 cursor-pointer"
                          onClick={() => handleViewDetail(record)}
                        >
                          详情
                        </span>
                        <span
                          className="text-green-600 hover:text-green-700 cursor-pointer"
                          onClick={() => handleNotifyTransaction(record.trxID)}
                        >
                          通知
                        </span>
                        {record.status === TransactionStatus.FAILED && (
                          <span
                            className="text-blue-600 hover:text-blue-700 cursor-pointer"
                            onClick={() => handleRetryNotification(record.trxID)}
                          >
                            重试
                          </span>
                        )}
                        {record.status === TransactionStatus.PENDING && (
                          <span
                            className="text-green-600 hover:text-green-700 cursor-pointer"
                            onClick={() => handleConfirmTransaction(record)}
                          >
                            确认
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* 分页 */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              显示第 {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} 条，共 {pagination.total} 条
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

      {/* 详情对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[60vw] w-[60vw] min-w-[600px]" style={{width: '60vw', maxWidth: '60vw'}}>
          <DialogHeader>
            <DialogTitle>代收交易详情</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="text-center py-12">加载中...</div>
          ) : selectedRecord ? (
            <div className="py-4 max-h-[70vh] overflow-y-auto">
              {/* 统一使用单栏布局 */}
              <div className="space-y-4">

                {/* 1. 基本信息模块 */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-300 dark:border-gray-600">基本信息</h3>
                <div className="space-y-4">
                  {/* 1.1 交易ID、请求ID、状态 */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">交易ID</label>
                      <p className="text-base font-semibold font-mono mt-1">{selectedRecord.trxID}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">请求ID</label>
                      <p className="text-base font-semibold font-mono mt-1">{selectedRecord.reqID || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">状态</label>
                      <p className="mt-1">{getStatusBadge(selectedRecord.status)}</p>
                    </div>
                  </div>
                  
                  {/* 1.2 交易类型、支付方式、金额 */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">交易类型</label>
                      <p className="text-base font-semibold mt-1">
                        {(() => {
                          const config = getTrxTypeBadgeConfig(selectedRecord.trxType || '');
                          return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
                        })()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">支付方式</label>
                      <p className="text-base font-semibold mt-1">{getTrxMethodLabel(selectedRecord.trxMethod)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">金额</label>
                      <p className="text-base font-semibold mt-1">
                        {formatCurrencyForModal(selectedRecord.amount, selectedRecord.ccy, selectedRecord.usdAmount)}
                      </p>
                    </div>
                  </div>
                  
                  {/* 1.3 备注 */}
                  <div>
                    <label className="text-sm text-muted-foreground">备注</label>
                    <p className="text-base font-semibold mt-1">{selectedRecord.remark || '-'}</p>
                  </div>
                  
                  {/* 1.3 创建时间、完成时间、过期时间 */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">创建时间</label>
                      <p className="text-base font-semibold mt-1">{formatDateTime(selectedRecord.createdAt)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">完成时间</label>
                      <p className="text-base font-semibold mt-1">{selectedRecord.completedAt ? formatDateTime(selectedRecord.completedAt) : '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">过期时间</label>
                      <p className="text-base font-semibold mt-1">{selectedRecord.expiredAt ? formatDateTime(selectedRecord.expiredAt) : '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

                    {/* 2. 渠道信息模块 */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-300 dark:border-gray-600">渠道信息</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm text-muted-foreground">渠道</label>
                            <p className="text-base font-semibold mt-1">{getChannelCodeLabel(selectedRecord.channelCode)}</p>
                          </div>
                    <div>
                      <label className="text-sm text-muted-foreground">渠道账户</label>
                      <p className="text-base font-semibold mt-1">{selectedRecord.channelAccount || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">渠道组</label>
                      <p className="text-base font-semibold mt-1">{selectedRecord.channelGroup || '-'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">渠道交易ID</label>
                      <p className="text-base font-semibold font-mono mt-1">{selectedRecord.channelTrxID || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">渠道状态</label>
                      <p className="mt-1">
                        {(() => {
                          const config = getChannelStatusBadgeConfig(selectedRecord.channelStatus);
                          return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. 派单历史模块 - 仅在有派单记录时显示 */}
              {selectedRecord.dispatchHistory && selectedRecord.dispatchHistory.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <DispatchHistory 
                    dispatchHistory={selectedRecord.dispatchHistory} 
                    formatDateTime={formatDateTime} 
                  />
                </div>
              )}

                    {/* 4. 收款账户模块 */}
              {selectedRecord.dispatchRecords && selectedRecord.dispatchRecords.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-300 dark:border-gray-600">收款账户</h3>
                  {(() => {
                    const acceptedDispatch = selectedRecord.dispatchRecords.find(d => d.status === 'accepted' || d.status === 'pending');
                    if (!acceptedDispatch) return <p className="text-sm text-muted-foreground">暂无接单信息</p>;
                    
                    // 从派单历史中找到对应的候选人信息
                    const historyForDispatch = selectedRecord.dispatchHistory?.find(
                      h => h.dispatchId === acceptedDispatch.dispatchId
                    );
                    const selectedCandidate = historyForDispatch?.candidates?.find(c => c.selected);
                    
                    return (
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm text-muted-foreground">收款UPI</label>
                          <p className="text-base font-semibold font-mono mt-1">{selectedCandidate?.upi || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">手机号</label>
                          {selectedCandidate?.user ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="text-base font-semibold mt-1 cursor-help underline decoration-dotted">
                                    {selectedCandidate.user.phone || '-'}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-xs">
                                  <div className="space-y-1 text-xs">
                                    <div><span className="text-gray-400">用户ID:</span> <span className="font-mono">{selectedCandidate.user.user_id}</span></div>
                                    <div><span className="text-gray-400">姓名:</span> {selectedCandidate.user.name || '-'}</div>
                                    <div><span className="text-gray-400">手机:</span> {selectedCandidate.user.phone || '-'}</div>
                                    <div><span className="text-gray-400">邮箱:</span> {selectedCandidate.user.email || '-'}</div>
                                    <div><span className="text-gray-400">组织:</span> {selectedCandidate.user.org_id || '-'}</div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <p className="text-base font-semibold mt-1">-</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">接单时间</label>
                          <p className="text-base font-semibold mt-1">{formatDateTime(acceptedDispatch.dispatchAt)}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

                    {/* 4. 结算信息模块 */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-300 dark:border-gray-600">结算信息</h3>
                <div className="space-y-4">
                  {/* 4.1 状态、时间 */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">结算状态</label>
                      <p className="mt-1">
                        {(() => {
                          const config = getSettleStatusBadgeConfig(selectedRecord.settleStatus);
                          return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
                        })()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">结算ID</label>
                      <p className="text-base font-semibold font-mono mt-1">{selectedRecord.settleID || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">结算时间</label>
                      <p className="text-base font-semibold mt-1">{selectedRecord.settledAt ? formatDateTime(selectedRecord.settledAt) : '-'}</p>
                    </div>
                  </div>
                  
                  {/* 4.2 币种、金额、费用 */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">结算币种</label>
                      <p className="text-base font-semibold mt-1">{selectedRecord.ccy}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">结算金额</label>
                      <p className="text-base font-semibold mt-1">
                        {selectedRecord.settleAmount 
                          ? `${formatCurrency(selectedRecord.settleAmount, selectedRecord.ccy)}${selectedRecord.settleUsdAmount && parseFloat(selectedRecord.settleUsdAmount) > 0 ? ` ($${selectedRecord.settleUsdAmount})` : ''}` 
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">手续费</label>
                      <p className="text-base font-semibold mt-1">
                        {selectedRecord.feeAmount ? formatCurrency(selectedRecord.feeAmount, selectedRecord.feeCcy || selectedRecord.ccy) : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. 通知信息模块 */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-300 dark:border-gray-600">通知信息</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">通知状态</label>
                    <p className="text-base font-semibold mt-1">
                      {selectedRecord.notifyStatus === 'success' ? (
                        <Badge variant="default">已通知</Badge>
                      ) : selectedRecord.notifyStatus === 'failed' ? (
                        <Badge variant="destructive">通知失败</Badge>
                      ) : (
                        <Badge variant="secondary">待通知</Badge>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">通知时间</label>
                    <p className="text-base font-semibold mt-1">
                      {selectedRecord.notifiedAt ? formatDateTime(selectedRecord.notifiedAt) : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">通知次数</label>
                    <p className="text-base font-semibold mt-1">{selectedRecord.notifyCount || 0} 次</p>
                  </div>
                  <div className="col-span-3">
                    <label className="text-sm text-muted-foreground">通知地址</label>
                    <p className="text-base font-mono text-sm mt-1 break-all">{selectedRecord.notifyUrl || '-'}</p>
                  </div>
                </div>
              </div>

              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* 确认交易对话框 - 第一步：输入参考ID */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认交易</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">交易ID:</span>
                <span className="font-mono">{confirmingRecord?.trxID}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">交易金额:</span>
                <span>{confirmingRecord && formatCurrencyForModal(confirmingRecord.amount, confirmingRecord.ccy, confirmingRecord.usdAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">支付方式:</span>
                <span>{confirmingRecord?.trxMethod || '-'}</span>
              </div>
            </div>
            <Input
              placeholder="请输入流水号"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleFirstConfirm()}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancelConfirm}>
              取消
            </Button>
            <Button onClick={handleFirstConfirm}>
              下一步
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 确认交易对话框 - 第二步：最终确认 */}
      <Dialog open={secondConfirmOpen} onOpenChange={setSecondConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认提交</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {confirmError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {confirmError}
              </div>
            )}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">交易ID:</span>
                <span className="font-mono">{confirmingRecord?.trxID}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">交易金额:</span>
                <span>{confirmingRecord && formatCurrencyForModal(confirmingRecord.amount, confirmingRecord.ccy, confirmingRecord.usdAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">支付方式:</span>
                <span>{confirmingRecord?.trxMethod || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">流水号:</span>
                <span className="font-mono">{referenceId}</span>
              </div>
            </div>
            <div className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded">
              ⚠️ 确认后交易状态将会更新，此操作不可撤销！
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancelConfirm} disabled={confirming}>
              取消
            </Button>
            <Button onClick={handleFinalConfirm} disabled={confirming}>
              {confirming ? '确认中...' : '确认提交'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}