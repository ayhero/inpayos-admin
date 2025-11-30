import { api, ApiResponse } from './api';

// 派单策略接口
export interface DispatchStrategy {
  id: number;
  strategy_id: string;
  code: string;
  name: string;
  version: string;
  user_id?: string;
  description?: string;
  status: string;
  priority: number;
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
  sort_random_factor?: number;
  limit_max_candidates?: number;
  limit_min_candidates?: number;
}

// 保存派单策略参数
export interface SaveDispatchStrategyParams {
  id?: number;
  user_id?: string;
  code: string;
  name: string;
  version?: string;
  description?: string;
  status?: string;
  priority?: number;
  rules?: DispatchRules;
  remark?: string;
}

// 派单策略列表查询参数
export interface DispatchStrategyListParams {
  code?: string;
  name?: string;
  status?: string;
  statuses?: string[];
  user_id?: string;
  page: number;
  size: number;
  order_by?: string;
  order_desc?: boolean;
}

// 分页结果
export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  count: number;
}

class DispatchStrategyService {
  /**
   * 保存派单策略（新增或更新）
   */
  async saveStrategy(params: SaveDispatchStrategyParams): Promise<ApiResponse<DispatchStrategy>> {
    try {
      const response = await api.post<DispatchStrategy>('/dispatch/strategy/save', params);
      return {
        success: response.code === '0000',
        code: response.code,
        msg: response.msg,
        data: response.data
      };
    } catch (error) {
      console.error('保存派单策略失败:', error);
      throw error;
    }
  }

  /**
   * 获取派单策略列表（分页）
   */
  async listStrategies(params: DispatchStrategyListParams): Promise<ApiResponse<PageResult<DispatchStrategy>>> {
    try {
      const response = await api.post<PageResult<DispatchStrategy>>('/dispatch/strategy/list', params);
      return {
        success: response.code === '0000',
        code: response.code,
        msg: response.msg,
        data: response.data || { records: [], total: 0, size: params.size, current: params.page, count: 0 }
      };
    } catch (error) {
      console.error('获取派单策略列表失败:', error);
      throw error;
    }
  }

  /**
   * 删除派单策略
   */
  async deleteStrategy(id: number): Promise<ApiResponse<null>> {
    try {
      const response = await api.post<null>('/dispatch/strategy/delete', { id });
      return {
        success: response.code === '0000',
        code: response.code,
        msg: response.msg,
        data: null
      };
    } catch (error) {
      console.error('删除派单策略失败:', error);
      throw error;
    }
  }
}

export const dispatchStrategyService = new DispatchStrategyService();
