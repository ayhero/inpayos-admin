import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { RefreshCw, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from '../utils/toast';
import { StatusBadge } from './StatusBadge';
import { 
  dispatchStrategyService, 
  DispatchStrategy, 
  DispatchStrategyListParams 
} from '../services/dispatchStrategyService';
import { SaveDispatchStrategyModal } from './SaveDispatchStrategyModal';
import { ViewDispatchStrategyModal } from './ViewDispatchStrategyModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

const STATUS_OPTIONS = [
  { value: 'all', label: '全部状态' },
  { value: 'active', label: '启用' },
  { value: 'inactive', label: '禁用' },
];

export function DispatchStrategyManagement() {
  const [strategies, setStrategies] = useState<DispatchStrategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  
  const [searchParams, setSearchParams] = useState({
    code: '',
    name: '',
    status: 'all'
  });

  // 新增/编辑弹窗
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<DispatchStrategy | null>(null);

  // 详情查看弹窗
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingStrategy, setViewingStrategy] = useState<DispatchStrategy | null>(null);

  // 删除确认弹窗
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [strategyToDelete, setStrategyToDelete] = useState<DispatchStrategy | null>(null);

  const fetchStrategies = async () => {
    setLoading(true);
    try {
      const params: DispatchStrategyListParams = {
        page: currentPage,
        size: pageSize,
        ...(searchParams.code && { code: searchParams.code }),
        ...(searchParams.name && { name: searchParams.name }),
        ...(searchParams.status && searchParams.status !== 'all' && { status: searchParams.status })
      };

      const response = await dispatchStrategyService.listStrategies(params);
      if (response.success && response.data) {
        setStrategies(response.data.records || []);
        setTotal(response.data.total || 0);
      } else {
        toast.error('获取策略列表失败', response.msg);
      }
    } catch (error) {
      console.error('获取策略列表失败:', error);
      toast.error('获取策略列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategies();
  }, [currentPage]);

  // 当搜索参数变化时，重置到第一页并重新查询
  useEffect(() => {
    setCurrentPage(1);
    fetchStrategies();
  }, [searchParams.code, searchParams.name, searchParams.status]);

  const handleRefresh = () => {
    fetchStrategies();
  };

  const handleCreate = () => {
    setEditingStrategy(null);
    setSaveModalOpen(true);
  };

  const handleEdit = (strategy: DispatchStrategy) => {
    setEditingStrategy(strategy);
    setSaveModalOpen(true);
  };

  const handleView = (strategy: DispatchStrategy) => {
    setViewingStrategy(strategy);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (strategy: DispatchStrategy) => {
    setStrategyToDelete(strategy);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!strategyToDelete) return;

    try {
      const response = await dispatchStrategyService.deleteStrategy(strategyToDelete.id);
      if (response.success) {
        toast.success('删除成功');
        fetchStrategies();
      } else {
        toast.error('删除失败', response.msg);
      }
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败');
    } finally {
      setDeleteDialogOpen(false);
      setStrategyToDelete(null);
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">派单策略</h1>
        <div className="flex gap-2">
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            新建
          </Button>
          <Button onClick={handleRefresh} className="gap-2" variant="outline">
            <RefreshCw className="h-4 w-4" />
            刷新
          </Button>
        </div>
      </div>

      {/* 搜索栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="策略代码"
              value={searchParams.code}
              onChange={(e) => setSearchParams({ ...searchParams, code: e.target.value })}
              className="w-full md:w-48"
              maxLength={50}
            />
            <Input
              placeholder="策略名称"
              value={searchParams.name}
              onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value })}
              className="w-full md:w-48"
              maxLength={100}
            />
            <Select 
              value={searchParams.status} 
              onValueChange={(value) => setSearchParams({ ...searchParams, status: value })}
            >
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setSearchParams({ code: '', name: '', status: 'all' })} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 列表 */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">

            {/* 列表 */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>策略代码</TableHead>
                  <TableHead>策略名称</TableHead>
                  <TableHead>版本</TableHead>
                  <TableHead>用户ID</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>优先级</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : strategies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  strategies.map((strategy) => (
                    <TableRow key={strategy.id}>
                      <TableCell className="font-mono text-sm">{strategy.code}</TableCell>
                      <TableCell>{strategy.name}</TableCell>
                      <TableCell>{strategy.version}</TableCell>
                      <TableCell>{strategy.user_id || '-'}</TableCell>
                      <TableCell><StatusBadge status={strategy.status} type="account" /></TableCell>
                      <TableCell>{strategy.priority}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(strategy.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleView(strategy)}
                            className="text-blue-600 hover:text-blue-700"
                            title="查看"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEdit(strategy)}
                            className="text-blue-600 hover:text-blue-700"
                            title="编辑"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteClick(strategy)}
                            className="text-red-600 hover:text-red-700"
                            title="删除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* 分页 */}
            {total > 0 && (
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-gray-600">
                  共 {total} 条记录，第 {currentPage} / {Math.ceil(total / pageSize)} 页
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || loading}
                  >
                    上一页
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(Math.ceil(total / pageSize), currentPage + 1))}
                    disabled={currentPage >= Math.ceil(total / pageSize) || loading}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 新增/编辑弹窗 */}
      <SaveDispatchStrategyModal
        open={saveModalOpen}
        onOpenChange={setSaveModalOpen}
        strategy={editingStrategy}
        onSuccess={fetchStrategies}
      />

      {/* 详情查看弹窗 */}
      <ViewDispatchStrategyModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        strategy={viewingStrategy}
      />

      {/* 删除确认弹窗 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除策略 "{strategyToDelete?.name}" 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              确定删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
