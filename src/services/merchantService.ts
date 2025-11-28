import { api, ApiResponse } from './api';
import { Contract } from './contractService';

// 商户密钥接口
export interface MerchantSecret {
  id: number;
  user_id: string;
  app_id: string;
  app_name: string;
  secret_key: string;
  sandbox: boolean;
  status: string;
  expires_at: number;
  created_at: number;
  updated_at: number;
}

// 商户账户接口
export interface MerchantAccount {
  balance: string;
  available_balance: string;
  frozen_balance: string;
  margin_balance: string;
  available_margin_balance: string;
  frozen_margin_balance: string;
  account_id: string;
  user_id: string;
  user_type: string;
  ccy: string;
  status: string;
  version: number;
  last_active_at: number;
  user: any;
  created_at: number;
  updated_at: number;
}

// 商户路由接口
export interface MerchantRouter {
  id: number;
  user_id?: string;
  mid?: string;  // 保留向后兼容
  tid?: string;  // 保留向后兼容
  trx_type: string;
  trx_method: string;
  ccy?: string;
  country?: string;
  min_amount?: number;
  max_amount?: number;
  channel_code: string;
  channel_account?: string;
  channel_group?: string;
  priority: number;
  status: string;
  version: number;
  created_at: number;
  updated_at: number;
}

// 为了兼容性，将 Router 别名导出为 MerchantRouter
export type Router = MerchantRouter;
export type Account = MerchantAccount;

// 商户信息接口
export interface Merchant {
  id: number;
  user_id: string;
  name: string;
  type: string;
  email: string;
  phone: string;
  status: string;
  has_g2fa?: boolean;
  secrets?: MerchantSecret[];
  accounts?: MerchantAccount[];
  contracts?: Contract[];
  routers?: MerchantRouter[];
  created_at: number;
  updated_at: number;
}

// 商户列表查询参数
export interface MerchantListParams {
  user_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  type?: string;
  status?: string;
  created_at_start?: number;
  created_at_end?: number;
  page: number;
  size: number;
}

// 分页响应
export interface PaginatedResponse<T> {
  list: T[];
  pagination: {
    page: number;
    size: number;
  };
  total: number;
}

// 商户详情参数
export interface MerchantDetailParams {
  user_id: string;
}

// 商户统计数据
export interface MerchantStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
}

// 创建商户密钥参数
export interface CreateMerchantSecretParams {
  user_id: string;
  app_name: string;
  sandbox: boolean;
}

class MerchantService {
  // 获取商户列表
  async getMerchantList(params: MerchantListParams): Promise<ApiResponse<PaginatedResponse<Merchant>>> {
    try {
      const response = await api.post<any>('/merchant/list', params);
      
      if (!response.data) {
        return {
          success: false,
          code: response.code || '9999',
          msg: response.msg || '获取商户列表失败',
          data: {
            list: [],
            pagination: { page: params.page, size: params.size },
            total: 0
          }
        };
      }

      // 转换后端返回的数据格式: { records, total, current, size } -> { list, pagination, total }
      return {
        success: true,
        code: response.code,
        msg: response.msg || '成功',
        data: {
          list: response.data.records || [],
          pagination: { 
            page: response.data.current || params.page, 
            size: response.data.size || params.size 
          },
          total: response.data.total || 0
        }
      };
    } catch (error: any) {
      console.error('获取商户列表失败:', error);
      return {
        success: false,
        code: '9999',
        msg: error.message || '网络错误',
        data: {
          list: [],
          pagination: { page: params.page, size: params.size },
          total: 0
        }
      };
    }
  }

  // 获取商户详情
  async getMerchantDetail(params: MerchantDetailParams): Promise<ApiResponse<Merchant>> {
    try {
      const response = await api.post<Merchant>('/merchant/detail', params);
      return {
        success: response.code === '0000',
        code: response.code,
        msg: response.msg,
        data: response.data
      };
    } catch (error: any) {
      console.error('获取商户详情失败:', error);
      throw error;
    }
  }

  // 获取商户统计数据
  async getMerchantStats(): Promise<ApiResponse<MerchantStats>> {
    try {
      const response = await api.post<MerchantStats>('/merchant/stats', {});
      return {
        success: response.code === '0000',
        code: response.code,
        msg: response.msg,
        data: response.data || {
          total: 0,
          active: 0,
          inactive: 0,
          suspended: 0
        }
      };
    } catch (error: any) {
      console.error('获取商户统计数据失败:', error);
      return {
        success: false,
        code: '9999',
        msg: error.message || '获取统计数据失败',
        data: {
          total: 0,
          active: 0,
          inactive: 0,
          suspended: 0
        }
      };
    }
  }

  // 创建商户密钥
  async createMerchantSecret(params: CreateMerchantSecretParams): Promise<ApiResponse<MerchantSecret>> {
    try {
      const response = await api.post<MerchantSecret>('/merchant/secret/create', params);
      return {
        success: response.code === '0000',
        code: response.code,
        msg: response.msg,
        data: response.data
      };
    } catch (error: any) {
      console.error('创建商户密钥失败:', error);
      throw error;
    }
  }

  // 获取默认合同
  async getDefaultContract(params: { user_id: string }): Promise<ApiResponse<Contract>> {
    try {
      const response = await api.post<Contract>('/contract/default', params);
      return {
        success: response.code === '0000',
        code: response.code,
        msg: response.msg,
        data: response.data
      };
    } catch (error: any) {
      console.error('获取默认合同失败:', error);
      throw error;
    }
  }

  // 获取商户密钥列表
  async getMerchantSecrets(params: { user_id: string }): Promise<ApiResponse<MerchantSecret[]>> {
    try {
      const response = await api.post<MerchantSecret[]>('/merchant/secret/list', params);
      return {
        success: response.code === '0000',
        code: response.code,
        msg: response.msg,
        data: response.data || []
      };
    } catch (error: any) {
      console.error('获取商户密钥列表失败:', error);
      throw error;
    }
  }

  // 获取商户合同列表
  async getMerchantContracts(params: { user_id: string; user_type?: string }): Promise<ApiResponse<Contract[]>> {
    try {
      const response = await api.post<Contract[]>('/user/contracts', {
        user_id: params.user_id,
        user_type: params.user_type || 'merchant'
      });
      return {
        success: response.code === '0000',
        code: response.code,
        msg: response.msg,
        data: response.data || []
      };
    } catch (error: any) {
      console.error('获取商户合同列表失败:', error);
      throw error;
    }
  }

  // 获取商户路由列表
  async getMerchantRouters(params: { user_id: string }): Promise<ApiResponse<MerchantRouter[]>> {
    try {
      const response = await api.post<MerchantRouter[]>('/user/routers', {
        user_id: params.user_id,
        user_type: 'merchant'
      });
      return {
        success: response.code === '0000',
        code: response.code,
        msg: response.msg,
        data: response.data || []
      };
    } catch (error: any) {
      console.error('获取商户路由列表失败:', error);
      throw error;
    }
  }
}

export const merchantService = new MerchantService();
