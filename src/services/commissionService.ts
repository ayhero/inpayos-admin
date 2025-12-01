import { api, ApiResponse } from './api';

// 佣金配置接口
export interface CommissionConfig {
  id: number;
  tid: string;
  cid: string;
  trx_type: string;
  status: string;
  country: string;
  trx_method: string;
  min_amount?: string;
  max_amount?: string;
  min_fee?: string;
  max_fee?: string;
  min_rate?: string;
  max_rate?: string;
  min_usd_fee?: string;
  max_usd_fee?: string;
  min_usd_rate?: string;
  max_usd_rate?: string;
  ccy: string;
  fixed_commission?: string;
  rate?: string;
  fixed_usd_commission?: string;
  usd_rate?: string;
  priority: number;
  created_at: number;
  updated_at: number;
}

// 佣金配置列表查询参数
export interface CommissionListParams {
  user_id: string;
  user_type: string;
  tid?: string;
  cid?: string;
  trx_type?: string;
  status?: string;
  country?: string;
  trx_method?: string;
  page: number;
  size: number;
}

// 分页响应（匹配后端PageResult结构）
export interface PaginatedResponse<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  count: number;
}

// 创建佣金配置参数
export interface CreateCommissionParams {
  user_id: string;
  user_type: string;
  tid?: string;
  cid?: string;
  trx_type: string;
  status?: string;
  country?: string;
  trx_method?: string;
  min_amount?: string;
  max_amount?: string;
  min_fee?: string;
  max_fee?: string;
  min_rate?: string;
  max_rate?: string;
  min_usd_fee?: string;
  max_usd_fee?: string;
  min_usd_rate?: string;
  max_usd_rate?: string;
  ccy?: string;
  fixed_commission?: string;
  rate?: string;
  fixed_usd_commission?: string;
  usd_rate?: string;
  priority?: number;
}

// 更新佣金配置参数
export interface UpdateCommissionParams {
  id: number;
  trx_type?: string;
  status?: string;
  country?: string;
  trx_method?: string;
  min_amount?: string;
  max_amount?: string;
  min_fee?: string;
  max_fee?: string;
  min_rate?: string;
  max_rate?: string;
  min_usd_fee?: string;
  max_usd_fee?: string;
  min_usd_rate?: string;
  max_usd_rate?: string;
  ccy?: string;
  fixed_commission?: string;
  rate?: string;
  fixed_usd_commission?: string;
  usd_rate?: string;
  priority?: number;
}

class CommissionService {
  /**
   * 获取用户佣金配置列表（不分页，返回所有记录）
   */
  async listCommissions(params: Omit<CommissionListParams, 'page' | 'size'>): Promise<ApiResponse<CommissionConfig[]>> {
    return api.post('/user/commissions', params);
  }

  /**
   * 创建用户佣金配置
   */
  async createCommission(params: CreateCommissionParams): Promise<ApiResponse<CommissionConfig>> {
    return api.post('/user/commission/new', params);
  }

  /**
   * 更新用户佣金配置
   */
  async updateCommission(params: UpdateCommissionParams): Promise<ApiResponse<CommissionConfig>> {
    return api.post('/user/commission/update', params);
  }

  /**
   * 删除用户佣金配置
   */
  async deleteCommission(id: number): Promise<ApiResponse<null>> {
    return api.post('/user/commission/delete', { id });
  }
}

export const commissionService = new CommissionService();
