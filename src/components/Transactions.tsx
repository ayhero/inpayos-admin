import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Search, RefreshCw } from 'lucide-react';
import { getStatusDisplayName, getStatusColor, getTrxTypeBadgeConfig } from '../constants/status';
import { getTrxMethodLabel } from '../constants/business';
import { transactionService, TransactionInfo, TransactionType, TransactionQueryParams } from '../services/transactionService';
import { toast } from '../utils/toast';

export function Transactions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [trxTypeFilter, setTrxTypeFilter] = useState<TransactionType>(TransactionType.PAYOUT);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionInfo | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  });

  // 获取交易列表
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: TransactionQueryParams = {
        trxType: trxTypeFilter,
        page: pagination.page,
        pageSize: pagination.size,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter as any;
      }
      if (searchTerm) {
        params.trxID = searchTerm;
      }

      const response = await transactionService.getTransactions(params);
      if (response.success) {
        setTransactions(response.data.items);
        setPagination(prev => ({
          ...prev,
          total: response.data.total,
          totalPages: response.data.totalPages
        }));
      } else {
        setTransactions([]);
        setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
        setError(response.msg || '获取数据失败');
      }
    } catch (error: any) {
      console.error('获取交易列表失败:', error);
      setTransactions([]);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
      setError(error.message || '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, statusFilter, trxTypeFilter, searchTerm]);

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.size, statusFilter, trxTypeFilter, searchTerm]);

  const handleRefresh = () => {
    fetchTransactions();
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchTransactions();
  };

  // 查看交易详情
  const handleViewDetail = async (transaction: TransactionInfo) => {
    setDialogOpen(true);
    setDetailLoading(true);
    setSelectedTransaction(null);
    try {
      const response = await transactionService.getTransactionDetail(transaction.trxID, transaction.trxType);
      if (response.success) {
        setSelectedTransaction(response.data);
      } else {
        toast.error('获取交易详情失败', response.msg);
        setDialogOpen(false);
      }
    } catch (error) {
      console.error('获取交易详情失败:', error);
      toast.error('获取交易详情失败', '网络错误，请稍后重试');
      setDialogOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
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

  const formatDateTime = (timestamp?: string) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">交易记录</h1>
          <p className="text-muted-foreground">查看和管理所有交易记录</p>
        </div>
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

      {/* 筛选和搜索 */}
      <Card>
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索交易ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={trxTypeFilter} onValueChange={(value) => setTrxTypeFilter(value as TransactionType)}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="交易类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TransactionType.PAYIN}>代收</SelectItem>
                <SelectItem value={TransactionType.PAYOUT}>代付</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="交易状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="success">成功</SelectItem>
                <SelectItem value="pending">待处理</SelectItem>
                <SelectItem value="processing">处理中</SelectItem>
                <SelectItem value="failed">失败</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} className="gap-2">
              <Search className="h-4 w-4" />
              搜索
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 交易列表 */}
      <Card>
        <CardHeader>
          <CardTitle>交易列表</CardTitle>
          <CardDescription>
            {loading ? '加载中...' : `共找到 ${pagination.total} 条交易记录`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">加载中...</div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">暂无数据</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>交易ID</TableHead>
                  <TableHead>请求ID</TableHead>
                  <TableHead>交易类型</TableHead>
                  <TableHead>支付方式</TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.trxID}>
                    <TableCell className="font-mono text-sm">{transaction.trxID}</TableCell>
                    <TableCell className="font-mono text-sm">{transaction.reqID}</TableCell>
                    <TableCell>
                      {(() => {
                        const config = getTrxTypeBadgeConfig(transaction.trxType || '');
                        return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
                      })()}
                    </TableCell>
                    <TableCell>{getTrxMethodLabel(transaction.trxMethod)}</TableCell>
                    <TableCell>
                      {transaction.amount} {transaction.ccy}
                      {transaction.usdAmount && transaction.usdAmount !== transaction.amount && (
                        <span className="text-muted-foreground text-sm ml-1">(${transaction.usdAmount})</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden">{transaction.ccy}</TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>{formatDateTime(transaction.createdAt)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetail(transaction)}
                      >
                        详情
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 交易详情对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[45vw] w-[45vw] min-w-[600px]" style={{width: '45vw', maxWidth: '45vw'}}>
          <DialogHeader>
            <DialogTitle>交易详情</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="text-center py-12">加载中...</div>
          ) : selectedTransaction ? (
            <div className="grid grid-cols-2 gap-4 py-4 max-h-[500px] overflow-y-auto">
              <div>
                <label className="text-sm text-muted-foreground">交易ID</label>
                <p className="text-base font-semibold font-mono mt-1">{selectedTransaction.trxID}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">请求ID</label>
                <p className="text-base font-semibold font-mono mt-1">{selectedTransaction.reqID}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">交易类型</label>
                <p className="text-base font-semibold mt-1">{selectedTransaction.trxType}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">交易方式</label>
                <p className="text-base font-semibold mt-1">{selectedTransaction.trxMethod || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">金额</label>
                <p className="text-base font-semibold mt-1">
                  {selectedTransaction.amount} {selectedTransaction.ccy}
                  {selectedTransaction.usdAmount && selectedTransaction.usdAmount !== selectedTransaction.amount && (
                    <span className="text-muted-foreground text-sm ml-2">(${selectedTransaction.usdAmount})</span>
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">状态</label>
                <p className="mt-1">{getStatusBadge(selectedTransaction.status)}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">渠道状态</label>
                <p className="text-base font-semibold mt-1">{selectedTransaction.channelStatus ?? '-'}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">渠道代码</label>
                <p className="text-base font-semibold mt-1">{selectedTransaction.channelCode || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">渠道交易ID</label>
                <p className="text-base font-semibold font-mono mt-1">{selectedTransaction.channelTrxID || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">流水号</label>
                <p className="text-base font-semibold font-mono mt-1">{selectedTransaction.flowNo || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">国家</label>
                <p className="text-base font-semibold mt-1">{selectedTransaction.country || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">手续费</label>
                <p className="text-base font-semibold mt-1">{selectedTransaction.feeAmount ? `${selectedTransaction.feeAmount} ${selectedTransaction.feeCcy}` : '-'}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">响应代码</label>
                <p className="text-base font-semibold mt-1">{selectedTransaction.resCode || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">创建时间</label>
                <p className="text-base font-semibold mt-1">{formatDateTime(selectedTransaction.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">更新时间</label>
                <p className="text-base font-semibold mt-1">{formatDateTime(selectedTransaction.updatedAt)}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">完成时间</label>
                <p className="text-base font-semibold mt-1">{formatDateTime(selectedTransaction.completedAt)}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">结算状态</label>
                <p className="text-base font-semibold mt-1">{selectedTransaction.settleStatus ?? '-'}</p>
              </div>
              {selectedTransaction.resMsg && (
                <div className="col-span-2">
                  <label className="text-sm text-muted-foreground">响应消息</label>
                  <p className="text-base font-semibold mt-1">{selectedTransaction.resMsg}</p>
                </div>
              )}
              {selectedTransaction.reason && (
                <div className="col-span-2">
                  <label className="text-sm text-muted-foreground">失败原因</label>
                  <p className="text-base font-semibold mt-1">{selectedTransaction.reason}</p>
                </div>
              )}
              {selectedTransaction.remark && (
                <div className="col-span-2">
                  <label className="text-sm text-muted-foreground">备注</label>
                  <p className="text-base font-semibold mt-1">{selectedTransaction.remark}</p>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* 分页 */}
      {!loading && transactions && transactions.length > 0 && (
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
    </div>
  );
}