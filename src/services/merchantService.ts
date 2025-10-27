import { api, ApiResponse } from './api';

// 商户信息接口
export interface Merchant {
  id: number;
  mid: string; // 后端返回 mid 而不是 merchant_id
  name: string;
  type: string;
  email: string;
  phone: string;
  status: string;
  created_at: number;
  updated_at: number;
}

// 商户列表查询参数
export interface MerchantListParams {
  mid?: string; // 后端期望 mid 而不是 merchant_id
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
  mid: string; // 后端期望 mid 而不是 merchant_id
}

// 商户统计数据
export interface MerchantStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
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
}

export const merchantService = new MerchantService();
