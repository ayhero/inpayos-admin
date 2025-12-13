import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { FileText, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { exportService, ExportJob } from '../services/exportService';
import { toast } from '../utils/toast';

interface ExportSpaceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportSpace({ open, onOpenChange }: ExportSpaceProps) {
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageSize = 20;

  // 获取导出任务列表
  const fetchJobs = async (pageNum: number = 1, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await exportService.getExportJobs(pageNum, pageSize);
      if (response.success && response.data) {
        if (append) {
          setJobs(prev => [...prev, ...response.data]);
        } else {
          setJobs(response.data);
        }
        
        // 判断是否还有更多数据
        setHasMore(response.data.length === pageSize);
      }
    } catch (error) {
      console.error('获取导出任务失败:', error);
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  // 加载更多
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchJobs(nextPage, true);
    }
  };

  // 处理滚动事件
  const handleScroll = () => {
    if (!scrollContainerRef.current || loadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    // 当滚动到底部前100px时，加载更多
    if (scrollHeight - scrollTop - clientHeight < 100) {
      loadMore();
    }
  };

  // 打开弹窗时重置并获取第一页
  useEffect(() => {
    if (open) {
      setPage(1);
      setJobs([]);
      setHasMore(true);
      fetchJobs(1, false);
      
      // 每10秒刷新第一页（不影响已加载的数据）
      const interval = setInterval(() => {
        fetchJobs(1, false);
        setPage(1);
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [open]);

  // 下载文件
  const handleDownload = async (job: ExportJob) => {
    if (job.status !== 'completed' || !job.downloadUrl) {
      toast.error('文件未准备好');
      return;
    }

    try {
      // 直接打开下载链接
      window.open(job.downloadUrl, '_blank');
      toast.success('开始下载');
    } catch (error) {
      console.error('下载失败:', error);
      toast.error('下载失败，请重试');
    }
  };

  // 获取状态显示
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50"><Clock className="h-3 w-3 mr-1" />等待中</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50"><Loader2 className="h-3 w-3 mr-1 animate-spin" />处理中</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50"><CheckCircle className="h-3 w-3 mr-1" />已完成</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50"><XCircle className="h-3 w-3 mr-1" />失败</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 获取模板名称
  const getTemplateName = (templateId: string) => {
    switch (templateId) {
      case 'transaction_payin':
        return '代收交易';
      case 'transaction_payout':
        return '代付交易';
      default:
        return templateId;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-h-[80vh] overflow-hidden flex flex-col"
        style={{ maxWidth: '45vw', width: '45vw' }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            下载历史
          </DialogTitle>
        </DialogHeader>

        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto"
          onScroll={handleScroll}
        >
          {loading && jobs.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <FileText className="h-12 w-12 mb-2 opacity-50" />
              <p>暂无导出记录</p>
            </div>
          ) : (
            <>
              <Card>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-64 text-center">文件名</TableHead>
                        <TableHead className="w-32">状态</TableHead>
                        <TableHead className="w-24">记录数</TableHead>
                        <TableHead className="w-32 text-center">创建时间</TableHead>
                        <TableHead className="w-24 text-center"></TableHead>
                      </TableRow>
                    </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.jobId}>
                      <TableCell className="font-medium w-64">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate" title={job.filename}>{job.filename}</span>
                        </div>
                      </TableCell>
                      <TableCell className="w-32">
                        {getStatusBadge(job.status)}
                        {job.errorMessage && (
                          <div className="text-xs text-red-500 mt-1 truncate" title={job.errorMessage}>
                            {job.errorMessage}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="w-24">{job.totalCount !== undefined ? job.totalCount.toLocaleString() : '-'}</TableCell>
                      <TableCell className="w-32 text-sm text-muted-foreground">{formatTime(job.createdAt)}</TableCell>
                      <TableCell className="w-24 text-center">
                        {job.status === 'completed' && job.downloadUrl && (
                          <button
                            onClick={() => handleDownload(job)}
                            className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                          >
                            下载
                          </button>
                        )}
                        {job.status === 'processing' && (
                          <span className="text-sm text-muted-foreground">处理中</span>
                        )}
                        {job.status === 'pending' && (
                          <span className="text-sm text-muted-foreground">等待中</span>
                        )}
                        {job.status === 'failed' && (
                          <span className="text-sm text-red-600">失败</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
                </CardContent>
              </Card>
              
              {/* 加载更多指示器 */}
              {loadingMore && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">加载中...</span>
                </div>
              )}
              
              {/* 没有更多数据提示 */}
              {!hasMore && jobs.length > 0 && (
                <div className="flex items-center justify-center py-4">
                  <span className="text-sm text-muted-foreground">没有更多数据了</span>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
