import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Search, RefreshCw, Download, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { MerchantSelector } from './MerchantSelector';
import { archiveService, TransactionArchive as ITransactionArchive, ArchiveQueryParams } from '../services/archiveService';
import { toast } from '../utils/toast';

export function TransactionArchive() {
  const [searchTerm, setSearchTerm] = useState('');
  const [archiveTypeFilter, setArchiveTypeFilter] = useState<string>('all');
  const [trxTypeFilter, setTrxTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [merchantFilter, setMerchantFilter] = useState<string>('all');
  const [archiveDateFilter, setArchiveDateFilter] = useState('');
  
  const [archives, setArchives] = useState<ITransactionArchive[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState<ITransactionArchive | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  });

  // 获取存档列表
  const fetchArchives = async () => {
    try {
      setLoading(true);
      
      const params: ArchiveQueryParams = {
        page: pagination.page,
        size: pagination.pageSize
      };

      if (archiveTypeFilter !== 'all') {
        params.type = archiveTypeFilter;
      }
      if (trxTypeFilter !== 'all') {
        params.trx_type = trxTypeFilter;
      }
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (merchantFilter !== 'all') {
        params.mid = merchantFilter;
      }
      if (archiveDateFilter) {
        params.date = archiveDateFilter;
      }

      const response = await archiveService.getArchiveList(params);

      if (response.code === '0000' && response.data) {
        setArchives(response.data.records || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0,
          totalPages: response.data.count || 0
        }));
      }
    } catch (error) {
      console.error('获取存档列表失败:', error);
      toast.error('获取存档列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchives();
  }, [pagination.page, pagination.pageSize]);

  // 搜索
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchArchives();
  };

  // 重置
  const handleReset = () => {
    setSearchTerm('');
    setArchiveTypeFilter('all');
    setTrxTypeFilter('all');
    setStatusFilter('all');
    setMerchantFilter('all');
    setArchiveDateFilter('');
    setPagination(prev => ({ ...prev, page: 1 }));
    setTimeout(() => fetchArchives(), 100);
  };

  // 查看详情
  const handleViewDetail = async (archive: ITransactionArchive) => {
    try {
      const response = await archiveService.getArchiveDetail(archive.archive_id);
      if (response.code === '0000' && response.data) {
        setSelectedArchive(response.data);
        setDialogOpen(true);
      }
    } catch (error) {
      console.error('获取存档详情失败:', error);
      toast.error('获取存档详情失败');
    }
  };

  // 下载存档
  const handleDownload = (archive: ITransactionArchive) => {
    if (archive.s3_url) {
      window.open(archive.s3_url, '_blank');
    } else {
      toast.error('下载链接不可用');
    }
  };

  // 重试失败的存档
  const handleRetry = async (archiveId: string) => {
    try {
      const response = await archiveService.retryArchive(archiveId);
      if (response.code === '0000') {
        toast.success('重试成功，正在重新生成存档');
        fetchArchives();
      } else {
        toast.error(response.msg || '重试失败');
      }
    } catch (error) {
      console.error('重试存档失败:', error);
      toast.error('重试失败');
    }
  };

  // 删除存档
  const handleDelete = async (archiveId: string) => {
    if (!confirm('确定要删除这个存档吗？')) {
      return;
    }

    try {
      const response = await archiveService.deleteArchive(archiveId);
      if (response.code === '0000') {
        toast.success('删除成功');
        fetchArchives();
      } else {
        toast.error(response.msg || '删除失败');
      }
    } catch (error) {
      console.error('删除存档失败:', error);
      toast.error('删除失败');
    }
  };

  // 状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // 状态徽章
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: 'default',
      processing: 'secondary',
      pending: 'outline',
      failed: 'destructive'
    };

    const labels: Record<string, string> = {
      completed: '已完成',
      processing: '处理中',
      pending: '待处理',
      failed: '失败'
    };

    return (
      <Badge variant={variants[status] || 'outline'} className="flex items-center gap-1">
        {getStatusIcon(status)}
        <span>{labels[status] || status}</span>
      </Badge>
    );
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number | undefined | null) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  // 格式化时间
  const formatDate = (timestamp: number | undefined | null) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">交易存档</h1>
      </div>

      {/* 筛选区域 */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Select value={archiveTypeFilter} onValueChange={setArchiveTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="存档类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="daily">每日存档</SelectItem>
                  <SelectItem value="monthly">每月存档</SelectItem>
                </SelectContent>
              </Select>

              <Select value={trxTypeFilter} onValueChange={setTrxTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="交易类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部交易</SelectItem>
                  <SelectItem value="payin">代收</SelectItem>
                  <SelectItem value="payout">代付</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="processing">处理中</SelectItem>
                  <SelectItem value="pending">待处理</SelectItem>
                  <SelectItem value="failed">失败</SelectItem>
                </SelectContent>
              </Select>

              <MerchantSelector value={merchantFilter} onValueChange={setMerchantFilter} />

              <Input
                type="text"
                placeholder="存档日期 (2024-01-15)"
                value={archiveDateFilter}
                onChange={(e) => setArchiveDateFilter(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                搜索
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                重置
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 存档列表 */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>存档ID</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>交易类型</TableHead>
                <TableHead>商户</TableHead>
                <TableHead>存档日期</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>记录数</TableHead>
                <TableHead>文件大小</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : archives.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                archives.map((archive) => (
                  <TableRow key={archive.archive_id}>
                    <TableCell className="font-mono text-sm">{archive.archive_id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {archive.archive_type === 'daily' ? '每日' : '每月'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={archive.trx_type === 'payin' ? 'default' : 'secondary'}>
                        {archive.trx_type === 'payin' ? '代收' : '代付'}
                      </Badge>
                    </TableCell>
                    <TableCell>{archive.mid}</TableCell>
                    <TableCell>{archive.archive_date}</TableCell>
                    <TableCell>{getStatusBadge(archive.status)}</TableCell>
                    <TableCell>{archive.record_count?.toLocaleString() || '-'}</TableCell>
                    <TableCell>{formatFileSize(archive.file_size)}</TableCell>
                    <TableCell className="text-sm">{formatDate(archive.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(archive)}
                        >
                          详情
                        </Button>
                        {archive.status === 'completed' && archive.s3_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(archive)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {archive.status === 'failed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRetry(archive.archive_id)}
                          >
                            重试
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(archive.archive_id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* 分页 */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
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
                  disabled={pagination.page === pagination.totalPages}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 详情对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>存档详情</DialogTitle>
          </DialogHeader>
          {selectedArchive && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">存档ID</label>
                  <p className="font-mono text-sm mt-1">{selectedArchive.archive_id}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">状态</label>
                  <div className="mt-1">{getStatusBadge(selectedArchive.status)}</div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">存档类型</label>
                  <p className="mt-1">{selectedArchive.archive_type === 'daily' ? '每日存档' : '每月存档'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">交易类型</label>
                  <p className="mt-1">{selectedArchive.trx_type === 'payin' ? '代收' : '代付'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">商户ID</label>
                  <p className="mt-1">{selectedArchive.mid}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">存档日期</label>
                  <p className="mt-1">{selectedArchive.archive_date}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">记录数量</label>
                  <p className="mt-1">{selectedArchive.record_count?.toLocaleString() || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">文件大小</label>
                  <p className="mt-1">{formatFileSize(selectedArchive.file_size)}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">文件名</label>
                  <p className="font-mono text-sm mt-1">{selectedArchive.filename}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">导出任务ID</label>
                  <p className="font-mono text-sm mt-1">{selectedArchive.export_job_id || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">创建时间</label>
                  <p className="text-sm mt-1">{formatDate(selectedArchive.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">完成时间</label>
                  <p className="text-sm mt-1">{formatDate(selectedArchive.completed_at)}</p>
                </div>
              </div>

              {selectedArchive.error_message && (
                <div>
                  <label className="text-sm text-muted-foreground">错误信息</label>
                  <p className="text-sm text-red-500 mt-1">{selectedArchive.error_message}</p>
                </div>
              )}

              {selectedArchive.s3_url && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => handleDownload(selectedArchive)}>
                    <Download className="h-4 w-4 mr-2" />
                    下载存档文件
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
