import { api, ApiResponse } from './api';

// 派单路由接口
export interface DispatchRouter {
  id: number;
  code: string;
  user_id: string;
  user_type: string;
  strategy_code: string;
  trx_type: string;
  trx_mode?: string;
  trx_method: string;
  trx_ccy: string;
  country: string;
  min_amount?: any;
  max_amount?: any;
  min_usd_amount?: any;
  max_usd_amount?: any;
  start_at: number;
  expired_at: number;
  daily_start_time: number;
  daily_end_time: number;
  status: string;
  priority: number;
  created_at: number;
  updated_at: number;
  strategy?: DispatchStrategy;  // 关联的策略详情
}

// 派单策略接口
export interface DispatchStrategy {
  id: number;
  strategy_id: string;
  code: string;
  name: string;
  version: string;
  description?: string;
  status: string;
  priority: number;
  trx_type?: string;
  trx_method?: string;
  country?: string;
  ccy?: string;
  min_amount?: any;
  max_amount?: any;
  tid?: string;
  effective_at: number;
  expires_at: number;
  rules?: DispatchRules;
  remark?: string;
  created_at: number;
  updated_at: number;
}

// 派单规则接口
export interface DispatchRules {
  // 用户级别规则
  user_online_required?: boolean;
  user_status_required?: string[];
  user_payin_status?: string[];
  user_payout_status?: string[];

  // 账户级别规则
  account_online_required?: boolean;
  account_status_required?: string[];
  account_payin_status?: string[];
  account_payout_status?: string[];

  // 余额和配置规则
  min_balance_ratio?: number;
  prevent_same_upi?: boolean;
  enforce_trx_config?: boolean;

  // 排序和筛选
  sort_by?: 'score_desc' | 'random' | 'round_robin' | 'weighted_random';
  limit_max_candidates?: number;
  limit_min_candidates?: number;

  // 评分配置
  scoring_config?: any;
}

// 查询派单路由参数
export interface GetDispatchRoutersParams {
  user_id: string;
  user_type: string;
}

class DispatchRouterService {
  /**
   * 获取用户的派单路由列表（包含策略详情）
   */
  async getDispatchRouters(params: GetDispatchRoutersParams): Promise<ApiResponse<DispatchRouter[]>> {
    try {
      const response = await api.post<DispatchRouter[]>('/user/dispatch/routers', params);
      return {
        success: response.code === '0000',
        code: response.code,
        msg: response.msg,
        data: response.data || []
      };
    } catch (error: any) {
      console.error('获取派单路由列表失败:', error);
      throw error;
    }
  }
}

export const dispatchRouterService = new DispatchRouterService();
