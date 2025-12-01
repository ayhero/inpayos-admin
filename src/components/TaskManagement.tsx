import { useState, useEffect } from 'react';
import taskService, { Task } from '../services/taskService';
import { cronToChineseDescription, formatTimestamp, getStatusBadge } from '../utils/taskUtils';
import { getHandlerLabel } from '../constants/taskHandlers';
import { toast } from '../utils/toast';
import { Search, Play, Pause, RefreshCw, Eye, Edit } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';

const TaskManagement = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; task: Task | null }>({
    open: false,
    task: null,
  });
  const [editDialog, setEditDialog] = useState<{ open: boolean; task: Task | null; cron: string }>({
    open: false,
    task: null,
    cron: '',
  });

  // 获取任务列表
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTaskList({
        search: searchTerm,
        status: statusFilter,
      });
      setTasks(response.tasks || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchTasks();
  }, []);

  // 实时搜索
  useEffect(() => {
    fetchTasks();
  }, [searchTerm, statusFilter]);

  // 更新任务状态
  const handleStatusToggle = async (task: Task) => {
    try {
      const newStatus = task.status === 'enabled' ? 'disabled' : 'enabled';
      await taskService.updateTaskStatus({
        task_id: task.task_id,
        status: newStatus,
      });
      
      // 显示成功提示
      const actionText = newStatus === 'enabled' ? '已启用' : '已禁用';
      toast.success(task.name, actionText);
      
      fetchTasks();
    } catch (error: any) {
      console.error('Failed to update task status:', error);
      const actionText = task.status === 'enabled' ? '禁用' : '启用';
      toast.error(task.name, `${actionText}失败: ${error.message || '未知错误'}`);
    }
  };

  // 手动触发任务
  const handleTrigger = async (task: Task) => {
    if (!confirm(`确定要手动执行任务"${task.name}"吗？`)) {
      return;
    }
    try {
      await taskService.triggerTask({ task_id: task.task_id });
      alert('任务已触发执行');
      fetchTasks();
    } catch (error) {
      console.error('Failed to trigger task:', error);
      alert('触发任务失败');
    }
  };

  // 查看详情
  const handleViewDetail = async (task: Task) => {
    try {
      const detail = await taskService.getTaskDetail(task.task_id);
      setDetailDialog({ open: true, task: detail.task });
    } catch (error) {
      console.error('Failed to fetch task detail:', error);
      alert('获取任务详情失败');
    }
  };

  // 编辑Cron表达式
  const handleEditCron = (task: Task) => {
    setEditDialog({ open: true, task, cron: task.cron });
  };

  // 保存Cron表达式
  const handleSaveCron = async () => {
    if (!editDialog.task) return;
    try {
      await taskService.updateTaskCron({
        task_id: editDialog.task.task_id,
        cron: editDialog.cron,
      });
      
      // 显示成功提示
      toast.success(editDialog.task.name, 'Cron表达式已更新');
      
      setEditDialog({ open: false, task: null, cron: '' });
      fetchTasks();
    } catch (error: any) {
      console.error('Failed to update cron:', error);
      toast.error(editDialog.task.name, `更新失败: ${error.message || '未知错误'}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">定时任务</h1>
        <Button onClick={fetchTasks} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          刷新
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 md:flex-initial md:w-80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索任务名称或Handler Key..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  maxLength={100}
                />
              </div>
            </div>
            <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="enabled">已启用</SelectItem>
                <SelectItem value="disabled">已禁用</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter(''); }} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 任务列表 */}
      {loading ? (
        <div className="text-center py-12">加载中...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">任务名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cron表达式</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">上次执行</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">下次执行</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    暂无任务数据
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
                  const statusBadge = getStatusBadge(task.status);
                  return (
                    <tr key={task.task_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{task.name}</div>
                        <div className="text-xs text-gray-500">{task.task_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.cron}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusBadge.className}`}>
                          {statusBadge.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatTimestamp(task.last_time)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatTimestamp(task.next_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleStatusToggle(task)}
                          className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                          title={task.status === 'enabled' ? '禁用' : '启用'}
                        >
                          {task.status === 'enabled' ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleTrigger(task)}
                          className="text-green-600 hover:text-green-800 inline-flex items-center gap-1"
                          title="手动触发"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditCron(task)}
                          className="text-purple-600 hover:text-purple-800 inline-flex items-center gap-1"
                          title="编辑Cron"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleViewDetail(task)}
                          className="text-gray-600 hover:text-gray-800 inline-flex items-center gap-1"
                          title="查看详情"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 详情对话框 */}
      <Dialog open={detailDialog.open} onOpenChange={(open) => !open && setDetailDialog({ open: false, task: null })}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>任务详情</DialogTitle>
          </DialogHeader>
          {detailDialog.task && (
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <label className="text-sm text-muted-foreground">任务ID</label>
                <p className="text-base font-semibold font-mono mt-1">{detailDialog.task.task_id}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">任务名称</label>
                <p className="text-base font-semibold mt-1">{detailDialog.task.name}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">类型</label>
                <p className="text-base font-semibold mt-1">{detailDialog.task.type}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Handler Key</label>
                <p className="text-base font-semibold mt-1">{getHandlerLabel(detailDialog.task.handler_key)}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Cron表达式</label>
                <p className="text-base font-semibold mt-1">{detailDialog.task.cron}</p>
                <p className="text-xs text-muted-foreground mt-1">{cronToChineseDescription(detailDialog.task.cron)}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">状态</label>
                <p className="text-base font-semibold mt-1">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(detailDialog.task.status).className}`}>
                    {getStatusBadge(detailDialog.task.status).text}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">上次执行时间</label>
                <p className="text-base font-semibold mt-1">{formatTimestamp(detailDialog.task.last_time)}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">下次执行时间</label>
                <p className="text-base font-semibold mt-1">{formatTimestamp(detailDialog.task.next_time)}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">上次执行结果</label>
                <p className="text-base font-semibold mt-1">{detailDialog.task.last_result || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">重试次数 / 最大重试</label>
                <p className="text-base font-semibold mt-1">
                  {detailDialog.task.retry_count} / {detailDialog.task.max_retries}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">超时时间</label>
                <p className="text-base font-semibold mt-1">{detailDialog.task.timeout}秒</p>
              </div>
              {detailDialog.task.params && Object.keys(detailDialog.task.params).length > 0 && (
                <div className="col-span-2">
                  <label className="text-sm text-muted-foreground">参数</label>
                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto mt-1 border">
                    {JSON.stringify(detailDialog.task.params, null, 2)}
                  </pre>
                </div>
              )}
              {detailDialog.task.remark && (
                <div className="col-span-2">
                  <label className="text-sm text-muted-foreground">备注</label>
                  <p className="text-base font-semibold mt-1">{detailDialog.task.remark}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 编辑Cron对话框 */}
      <Dialog open={editDialog.open} onOpenChange={(open) => !open && setEditDialog({ open: false, task: null, cron: '' })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editDialog.task?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                value={editDialog.cron}
                onChange={(e) => setEditDialog({ ...editDialog, cron: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveCron();
                  }
                }}
                placeholder="0 0 * * * *"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog({ open: false, task: null, cron: '' })}
            >
              取消
            </Button>
            <Button onClick={handleSaveCron}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskManagement;
