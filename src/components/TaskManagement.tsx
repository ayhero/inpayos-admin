import { useState, useEffect } from 'react';
import taskService, { Task } from '../services/taskService';
import { cronToChineseDescription, formatTimestamp, getStatusBadge } from '../utils/taskUtils';
import { getHandlerLabel } from '../constants/taskHandlers';
import { toast } from '../utils/toast';
import { Search, Play, Pause, RefreshCw, Eye, Edit } from 'lucide-react';

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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">定时任务管理</h1>
        <p className="text-gray-600">管理系统定时任务的执行状态和配置</p>
      </div>

      {/* 搜索和筛选 */}
      <div className="mb-6 flex gap-4">
        <div className="md:w-64 relative">
          <input
            type="text"
            placeholder="搜索任务名称或Handler Key"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
        >
          <option value="">全部状态</option>
          <option value="enabled">已启用</option>
          <option value="disabled">已禁用</option>
        </select>
        <button
          onClick={fetchTasks}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          刷新
        </button>
      </div>

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
      {detailDialog.open && detailDialog.task && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setDetailDialog({ open: false, task: null })}>
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold">任务详情</h2>
              <button onClick={() => setDetailDialog({ open: false, task: null })} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
                ×
              </button>
            </div>
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
          </div>
        </div>
      )}

      {/* 编辑Cron对话框 */}
      {editDialog.open && editDialog.task && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setEditDialog({ open: false, task: null, cron: '' })}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{editDialog.task.name}</h2>
              <button onClick={() => setEditDialog({ open: false, task: null, cron: '' })} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={editDialog.cron}
                  onChange={(e) => setEditDialog({ ...editDialog, cron: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveCron();
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0 0 * * * *"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setEditDialog({ open: false, task: null, cron: '' })}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveCron}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
