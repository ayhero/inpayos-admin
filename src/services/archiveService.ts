import { apiClient, ApiResponse } from './api';

// 存档记录接口
export interface TransactionArchive {
  id: number;
  archive_id: string;
  archive_type: string; // daily, monthly
  trx_type: string; // payin, payout
  mid: string;
  archive_date: string;
  completed_from: number;
  completed_to: number;
  export_job_id: string;
  status: string; // pending, processing, completed, failed
  error_message?: string;
  filename: string;
  file_path: string;
  s3_key?: string;
  s3_url?: string;
  expires_at?: number;
  record_count?: number;
  file_size?: number;
  started_at?: number;
  completed_at?: number;
  created_at: number;
  updated_at: number;
}

// 查询参数
export interface ArchiveQueryParams {
  type?: string;
  trx_type?: string;
  mid?: string;
  status?: string;
  date?: string;
  page: number;
  size: number;
}

// 分页响应
export interface PageResult<T> {
  size: number;
  current: number;
  total: number;
  count: number;
  records: T[];
}

// 获取存档列表
export const getArchiveList = async (params: ArchiveQueryParams): Promise<ApiResponse<PageResult<TransactionArchive>>> => {
  const response = await apiClient.post<ApiResponse<PageResult<TransactionArchive>>>('/system/archive/list', params);
  return response.data;
};

// 获取存档详情
export const getArchiveDetail = async (archiveId: string): Promise<ApiResponse<TransactionArchive>> => {
  const response = await apiClient.post<ApiResponse<TransactionArchive>>('/system/archive/detail', {
    archive_id: archiveId
  });
  return response.data;
};

// 重试失败的存档
export const retryArchive = async (archiveId: string): Promise<ApiResponse<null>> => {
  const response = await apiClient.post<ApiResponse<null>>('/system/archive/retry', {
    archive_id: archiveId
  });
  return response.data;
};

// 删除存档
export const deleteArchive = async (archiveId: string): Promise<ApiResponse<null>> => {
  const response = await apiClient.post<ApiResponse<null>>('/system/archive/delete', {
    archive_id: archiveId
  });
  return response.data;
};

// 手动触发存档
export const triggerArchive = async (type: string, date: string): Promise<ApiResponse<null>> => {
  const response = await apiClient.post<ApiResponse<null>>('/system/archive/trigger', {
    type: type,
    date: date
  });
  return response.data;
};

// 导出服务对象
export const archiveService = {
  getArchiveList,
  getArchiveDetail,
  retryArchive,
  deleteArchive,
  triggerArchive
};
