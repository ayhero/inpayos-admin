import { api, ApiResponse } from './api';

// 佣金配置接口
export interface CommissionConfig {
  id: number;
  tid: string;
  cid: string;
  trx_type: string;
  status: string;
  country?: string;
  trx_method?: string;
  min_amount?: number;
  max_amount?: number;
  min_fee?: number;
  max_fee?: number;
  min_rate?: number;
  max_rate?: number;
  min_usd_fee?: number;
  max_usd_fee?: number;
  min_usd_rate?: number;
  max_usd_rate?: number;
  ccy: string;
  fixed_commission?: number;
  rate?: number;
  fixed_usd_commission?: number;
  usd_rate?: number;
  priority: number;
  created_at: number;
  updated_at: number;
}

// 佣金配置列表查询参数
export interface CommissionListParams {
  tid?: string;
  cid?: string;
  trx_type?: string;
  status?: string;
  country?: string;
  trx_method?: string;
  page: number;
  size: number;
}

// 分页响应
export interface PaginatedResponse<T> {
  records: T[];
  current: number;
  size: number;
  total: number;
}

// 佣金详情参数
export interface CommissionDetailParams {
  id: number;
}

// 创建佣金参数
export interface CreateCommissionParams {
  tid?: string;
  cid?: string;
  trx_type: string;
  status?: string;
  country?: string;
  trx_method?: string;
  min_amount?: number;
  max_amount?: number;
  min_fee?: number;
  max_fee?: number;
  min_rate?: number;
  max_rate?: number;
  min_usd_fee?: number;
  max_usd_fee?: number;
  min_usd_rate?: number;
  max_usd_rate?: number;
  ccy?: string;
  fixed_commission?: number;
  rate?: number;
  fixed_usd_commission?: number;
  usd_rate?: number;
  priority?: number;
}

// 更新佣金参数
export interface UpdateCommissionParams {
  id: number;
  trx_type?: string;
  status?: string;
  country?: string;
  trx_method?: string;
  min_amount?: number;
  max_amount?: number;
  min_fee?: number;
  max_fee?: number;
  min_rate?: number;
  max_rate?: number;
  min_usd_fee?: number;
  max_usd_fee?: number;
  min_usd_rate?: number;
  max_usd_rate?: number;
  ccy?: string;
  fixed_commission?: number;
  rate?: number;
  fixed_usd_commission?: number;
  usd_rate?: number;
  priority?: number;
}

class CommissionManagementService {
  // 获取佣金配置列表
  async getCommissionList(params: CommissionListParams): Promise<ApiResponse<PaginatedResponse<CommissionConfig>>> {
    try {
      const response = await api.post<PaginatedResponse<CommissionConfig>>('/cashier/commission/list', params);
      return {
        code: response.code,
        msg: response.msg,
        data: response.data,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('获取佣金配置列表失败:', error);
      return {
        code: '9999',
        msg: error.message || '获取佣金配置列表失败',
        data: {
          records: [],
          current: params.page,
          size: params.size,
          total: 0
        },
        success: false
      };
    }
  }

  // 获取佣金配置详情
  async getCommissionDetail(params: CommissionDetailParams): Promise<ApiResponse<CommissionConfig>> {
    try {
      const response = await api.post<CommissionConfig>('/cashier/commission/detail', params);
      return {
        code: response.code,
        msg: response.msg,
        data: response.data,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('获取佣金配置详情失败:', error);
      return {
        code: '9999',
        msg: error.message || '获取佣金配置详情失败',
        data: {} as CommissionConfig,
        success: false
      };
    }
  }

  // 创建佣金配置
  async createCommission(params: CreateCommissionParams): Promise<ApiResponse<CommissionConfig>> {
    try {
      const response = await api.post<CommissionConfig>('/cashier/commission/create', params);
      return {
        code: response.code,
        msg: response.msg,
        data: response.data,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('创建佣金配置失败:', error);
      return {
        code: '9999',
        msg: error.message || '创建佣金配置失败',
        data: {} as CommissionConfig,
        success: false
      };
    }
  }

  // 更新佣金配置
  async updateCommission(params: UpdateCommissionParams): Promise<ApiResponse<CommissionConfig>> {
    try {
      const response = await api.post<CommissionConfig>('/cashier/commission/update', params);
      return {
        code: response.code,
        msg: response.msg,
        data: response.data,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('更新佣金配置失败:', error);
      return {
        code: '9999',
        msg: error.message || '更新佣金配置失败',
        data: {} as CommissionConfig,
        success: false
      };
    }
  }

  // 删除佣金配置
  async deleteCommission(params: CommissionDetailParams): Promise<ApiResponse<void>> {
    try {
      const response = await api.post<void>('/cashier/commission/delete', params);
      return {
        code: response.code,
        msg: response.msg,
        data: response.data,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('删除佣金配置失败:', error);
      return {
        code: '9999',
        msg: error.message || '删除佣金配置失败',
        data: undefined,
        success: false
      };
    }
  }
}

export const commissionManagementService = new CommissionManagementService();
