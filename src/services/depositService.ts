import { api, ApiResponse } from './api';

// 充值记录数据类型
export interface DepositRecord {
  id: number;
  trx_id: string;
  sid: string;
  s_type: string;
  account_id: string;
  status: string;
  ccy: string;
  amount: string;
  flow_no?: string;
  created_at: number;
  updated_at: number;
}

// 充值列表请求参数
export interface DepositListParams {
  keyword?: string;
  user_type?: string;
  status?: string;
  ccy?: string;
  start_time?: number;
  end_time?: number;
  page: number;
  size: number;
}

// 充值列表响应
export interface DepositListResponse {
  records: DepositRecord[];
  total: number;
}

// 充值统计数据
export interface DepositStats {
  total_amount: string;
  total_count: number;
  success_count: number;
  success_rate: number;
}

export const depositService = {
  // 获取充值列表
  getDepositList: async (params: DepositListParams): Promise<ApiResponse<DepositListResponse>> => {
    try {
      const response = await api.post<DepositListResponse>('/deposit/list', params);
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('获取充值列表失败:', error);
      return {
        code: 'ERROR',
        msg: error.message || '获取充值列表失败',
        data: {
          records: [],
          total: 0
        },
        success: false
      };
    }
  },

  // 获取充值详情
  getDepositDetail: async (trxId: string): Promise<ApiResponse<DepositRecord>> => {
    try {
      const response = await api.post<DepositRecord>('/deposit/detail', { trx_id: trxId });
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('获取充值详情失败:', error);
      return {
        code: 'ERROR',
        msg: error.message || '获取充值详情失败',
        data: {} as DepositRecord,
        success: false
      };
    }
  },

  // 获取今日统计
  getTodayStats: async (): Promise<ApiResponse<DepositStats>> => {
    try {
      const response = await api.post<DepositStats>('/deposit/stats/today', {});
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('获取今日统计失败:', error);
      return {
        code: 'ERROR',
        msg: error.message || '获取今日统计失败',
        data: {
          total_amount: '0.00',
          total_count: 0,
          success_count: 0,
          success_rate: 0
        },
        success: false
      };
    }
  }
};
