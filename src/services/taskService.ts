import api from './api';

export interface Task {
  id: number;
  task_id: string;
  name: string;
  type: string;
  handler_key: string;
  cron: string;
  status: string;
  last_time: number;
  next_time: number;
  last_result: string;
  retry_count: number;
  max_retries: number;
  timeout: number;
  params: Record<string, any> | null;
  remark: string;
  created_at: number;
  updated_at: number;
}

export interface TaskListParams {
  search?: string;
  status?: string;
}

export interface TaskListResponse {
  tasks: Task[];
}

export interface TaskDetailResponse {
  task: Task;
  cron_description: string;
}

export interface TaskStatusParams {
  task_id: string;
  status: string;
}

export interface TaskTriggerParams {
  task_id: string;
}

export interface TaskUpdateCronParams {
  task_id: string;
  cron: string;
}

const taskService = {
  // 获取任务列表
  getTaskList: async (params: TaskListParams): Promise<TaskListResponse> => {
    const response = await api.post<{ data: TaskListResponse }>('/system/task/list', params);
    return response.data.data;
  },

  // 获取任务详情
  getTaskDetail: async (task_id: string): Promise<TaskDetailResponse> => {
    const response = await api.post<{ data: TaskDetailResponse }>('/system/task/detail', { task_id });
    return response.data.data;
  },

  // 更新任务状态
  updateTaskStatus: async (params: TaskStatusParams): Promise<void> => {
    await api.post('/system/task/status', params);
  },

  // 手动触发任务
  triggerTask: async (params: TaskTriggerParams): Promise<void> => {
    await api.post('/system/task/trigger', params);
  },

  // 更新Cron表达式
  updateTaskCron: async (params: TaskUpdateCronParams): Promise<void> => {
    await api.post('/system/task/cron', params);
  },
};

export default taskService;
