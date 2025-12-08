import { api, ApiResponse } from './api';
import { accountService } from './accountService';

// 提现记录数据类型
export interface WithdrawRecord {
  id: number;
  trx_id: string;
  sid: string;
  s_type: string;
  account_id: string;
  status: string;
  settle_status: string;
  ccy: string;
  amount: string;
  flow_no?: string;
  remark?: string;
  reviewer_id?: string;
  review_remark?: string;
  reviewed_at?: number;
  settled_at?: number;
  created_at: number;
  updated_at: number;
}

// 提现列表请求参数
export interface WithdrawListParams {
  keyword?: string;
  user_type?: string;
  status?: string;
  settle_status?: string;
  ccy?: string;
  start_time?: number;
  end_time?: number;
  page: number;
  size: number;
}

// 提现列表响应
export interface WithdrawListResponse {
  records: WithdrawRecord[];
  total: number;
}

// 提现统计数据
export interface WithdrawStats {
  total_amount: string;
  total_count: number;
  reviewing_count: number;
  pending_settle_count: number;
}

export const withdrawService = {
  // 获取提现列表
  getWithdrawList: async (params: WithdrawListParams): Promise<ApiResponse<WithdrawListResponse>> => {
    try {
      const response = await api.post<WithdrawListResponse>('/withdraw/list', params);
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('获取提现列表失败:', error);
      return {
        code: 'ERROR',
        msg: error.message || '获取提现列表失败',
        data: {
          records: [],
          total: 0
        },
        success: false
      };
    }
  },

  // 获取提现详情
  getWithdrawDetail: async (trxId: string): Promise<ApiResponse<WithdrawRecord>> => {
    try {
      const response = await api.post<WithdrawRecord>('/withdraw/detail', { trx_id: trxId });
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('获取提现详情失败:', error);
      return {
        code: 'ERROR',
        msg: error.message || '获取提现详情失败',
        data: {} as WithdrawRecord,
        success: false
      };
    }
  },

  // 获取今日统计
  getTodayStats: async (): Promise<ApiResponse<WithdrawStats>> => {
    try {
      const response = await api.post<WithdrawStats>('/withdraw/stats/today', {});
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
          reviewing_count: 0,
          pending_settle_count: 0
        },
        success: false
      };
    }
  },

  // 审核提现（复用 accountService 的方法）
  reviewWithdraw: accountService.reviewWithdraw,

  // 结算提现（复用 accountService 的方法）
  settleWithdraw: accountService.settleWithdraw
};
