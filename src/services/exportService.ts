import apiClient from './api';

export interface ExportRequest {
  template_id: string;
  format?: string;
  columns?: string[];
  query_params?: Record<string, any>;
}

export interface ExportJobInfo {
  task_id: string;
  name: string;
  status: string;
  created_at: number;
  updated_at: number;
  params: {
    template_id: string;
    format: string;
    filename: string;
    s3_key?: string;
    download_url?: string;
    expires_at?: number;
    total_count?: number;
    processed_count?: number;
    file_size?: number;
    error_message?: string;  // 错误信息
    stage?: string;
  };
}

// 前端使用的导出任务类型
export interface ExportJob {
  jobId: string;
  templateId: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: number;
  updatedAt: number;
  downloadUrl?: string;
  totalCount?: number;
  processedCount?: number;
  fileSize?: number;
  errorMessage?: string;
}

export interface ExportJobListResponse {
  list: ExportJobInfo[];  // 后端返回的是 list 不是 items
  total: number;
  page: number;
  size: number;  // 后端返回的是 size 不是 pageSize
}

export interface ApiResponse<T = any> {
  code: string;
  msg: string;
  data: T;
  success: boolean;
}

class ExportService {
  // 转换后端任务格式到前端格式
  private convertJob(job: ExportJobInfo): ExportJob {
    return {
      jobId: job.task_id,
      templateId: job.params.template_id,
      filename: job.params.filename,
      status: job.status as 'pending' | 'processing' | 'completed' | 'failed',
      createdAt: job.created_at,
      updatedAt: job.updated_at,
      downloadUrl: job.params.download_url,
      totalCount: job.params.total_count,
      processedCount: job.params.processed_count,
      fileSize: job.params.file_size,
      errorMessage: job.params.error_message || (job.status === 'failed' ? '导出失败' : undefined)
    };
  }

  // 创建导出任务
  async createExport(params: ExportRequest): Promise<ApiResponse<ExportJobInfo>> {
    const response = await apiClient.post<ApiResponse<ExportJobInfo>>('/system/export/create', params);
    return response.data;
  }

  // 获取导出任务详情
  async getExportJob(taskId: string): Promise<ApiResponse<ExportJobInfo>> {
    const response = await apiClient.post<ApiResponse<ExportJobInfo>>('/system/export/progress', {
      task_id: taskId
    });
    return response.data;
  }

  // 获取导出任务列表（返回前端格式）
  async getExportJobs(page: number = 1, pageSize: number = 20): Promise<ApiResponse<ExportJob[]>> {
    try {
      const response = await apiClient.post<ApiResponse<ExportJobListResponse>>('/system/export/list', {
        page_index: page,
        page_size: pageSize
      });
      
      if (response.data.success && response.data.data && response.data.data.list) {
        const jobs = response.data.data.list.map(job => this.convertJob(job));
        return {
          ...response.data,
          data: jobs
        };
      }
      
      return {
        code: response.data.code || '500',
        msg: response.data.msg || '获取失败',
        success: false,
        data: []
      };
    } catch (error) {
      console.error('获取导出任务列表失败:', error);
      return {
        code: '500',
        msg: '获取失败',
        success: false,
        data: []
      };
    }
  }

  // 删除导出任务
  async deleteExportJob(taskId: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>('/system/export/delete', {
      task_id: taskId
    });
    return response.data;
  }

  // 轮询导出任务状态
  async pollExportStatus(taskId: string, onProgress?: (job: ExportJobInfo) => void): Promise<ExportJobInfo> {
    return new Promise((resolve, reject) => {
      const maxAttempts = 60; // 最多轮询60次（5分钟）
      let attempts = 0;

      const poll = async () => {
        try {
          const response = await this.getExportJob(taskId);
          
          if (!response.success) {
            reject(new Error(response.msg || '获取任务状态失败'));
            return;
          }

          const job = response.data;
          
          if (onProgress) {
            onProgress(job);
          }

          // 终态：completed 或 failed
          if (job.status === 'completed' || job.status === 'failed') {
            resolve(job);
            return;
          }

          // 超时检查
          attempts++;
          if (attempts >= maxAttempts) {
            reject(new Error('导出任务超时'));
            return;
          }

          // 继续轮询
          setTimeout(poll, 5000); // 每5秒轮询一次
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

  // 一键导出（创建+轮询+下载）
  async exportAndDownload(params: ExportRequest, onProgress?: (message: string, progress?: number) => void): Promise<void> {
    try {
      // 1. 创建导出任务
      if (onProgress) onProgress('正在创建导出任务...', 0);
      const createResponse = await this.createExport(params);
      
      if (!createResponse.success) {
        throw new Error(createResponse.msg || '创建导出任务失败');
      }

      const taskId = createResponse.data.task_id;

      // 2. 轮询任务状态
      if (onProgress) onProgress('正在生成导出文件...', 10);
      
      const job = await this.pollExportStatus(taskId, (job) => {
        const progress = job.params.processed_count && job.params.total_count
          ? Math.min(90, 10 + (job.params.processed_count / job.params.total_count) * 80)
          : 50;
        
        if (onProgress) {
          onProgress(`正在导出数据... ${job.params.processed_count || 0}/${job.params.total_count || 0}`, progress);
        }
      });

      // 3. 检查结果
      if (job.status === 'failed') {
        throw new Error('导出任务失败');
      }

      if (!job.params.download_url) {
        throw new Error('未获取到下载链接');
      }

      // 4. 下载文件
      if (onProgress) onProgress('准备下载文件...', 95);
      
      const link = document.createElement('a');
      link.href = job.params.download_url;
      link.download = job.params.filename || 'export.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (onProgress) onProgress('下载完成', 100);
    } catch (error) {
      console.error('导出失败:', error);
      throw error;
    }
  }
}

export const exportService = new ExportService();
