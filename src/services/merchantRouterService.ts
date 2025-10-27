import { api, ApiResponse } from './api';

export interface MerchantRouter {
  id: number;
  mid: string; // 商户ID，空表示全局配置
  pkg: string;
  did: string;
  trx_type: string;
  trx_sub_type: string;
  trx_method: string;
  trx_mode: string;
  trx_app: string;
  ccy: string;
  country: string;
  min_amount: number;
  max_amount: number;
  min_usd_amount: number;
  max_usd_amount: number;
  channel_code: string;
  channel_account: string;
  channel_group: string;
  priority: number;
  status: number; // 0=禁用, 1=启用
  version: number;
  created_at: number;
  updated_at: number;
}

export interface MerchantRouterListParams {
  mid?: string;
  trx_type?: string;
  channel_code?: string;
  status?: number;
  current: number;
  size: number;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  pagination: {
    page: number;
    size: number;
  };
}

export interface CreateMerchantRouterParams {
  mid?: string;
  pkg?: string;
  did?: string;
  trx_type: string;
  trx_sub_type?: string;
  trx_method?: string;
  trx_mode?: string;
  trx_app?: string;
  ccy?: string;
  country?: string;
  min_amount?: number;
  max_amount?: number;
  min_usd_amount?: number;
  max_usd_amount?: number;
  channel_code: string;
  channel_account?: string;
  channel_group?: string;
  priority?: number;
  status: number;
}

export interface UpdateMerchantRouterParams {
  id: number;
  mid?: string;
  pkg?: string;
  did?: string;
  trx_type?: string;
  trx_sub_type?: string;
  trx_method?: string;
  trx_mode?: string;
  trx_app?: string;
  ccy?: string;
  country?: string;
  min_amount?: number;
  max_amount?: number;
  min_usd_amount?: number;
  max_usd_amount?: number;
  channel_code?: string;
  channel_account?: string;
  channel_group?: string;
  priority?: number;
  status?: number;
}

class MerchantRouterService {
  // 获取商户路由列表
  async list(params: MerchantRouterListParams): Promise<ApiResponse<PaginatedResponse<MerchantRouter>>> {
    try {
      const response = await api.post<any>('/merchant-router/list', params);
      const data: PaginatedResponse<MerchantRouter> = {
        list: response.data?.records || [],
        total: response.data?.total || 0,
        pagination: {
          page: response.data?.current || params.current,
          size: response.data?.size || params.size,
        },
      };
      return {
        code: response.code,
        msg: response.msg,
        data,
        success: response.code === '0000',
      };
    } catch (error: any) {
      console.error('获取商户路由列表失败:', error);
      return {
        code: '9999',
        msg: error.message || '获取商户路由列表失败',
        data: {
          list: [],
          pagination: { page: params.current, size: params.size },
          total: 0,
        },
        success: false,
      };
    }
  }

  // 获取商户路由详情
  async detail(id: number): Promise<ApiResponse<MerchantRouter>> {
    try {
      const response = await api.post<MerchantRouter>('/merchant-router/detail', { id });
      return {
        ...response,
        success: response.code === '0000',
      };
    } catch (error: any) {
      console.error('获取商户路由详情失败:', error);
      return {
        code: '9999',
        msg: error.message || '获取商户路由详情失败',
        data: {} as MerchantRouter,
        success: false,
      };
    }
  }

  // 创建商户路由
  async create(params: CreateMerchantRouterParams): Promise<ApiResponse<MerchantRouter>> {
    try {
      const response = await api.post<MerchantRouter>('/merchant-router/create', params);
      return {
        ...response,
        success: response.code === '0000',
      };
    } catch (error: any) {
      console.error('创建商户路由失败:', error);
      return {
        code: '9999',
        msg: error.message || '创建商户路由失败',
        data: {} as MerchantRouter,
        success: false,
      };
    }
  }

  // 更新商户路由
  async update(params: UpdateMerchantRouterParams): Promise<ApiResponse<MerchantRouter>> {
    try {
      const response = await api.post<MerchantRouter>('/merchant-router/update', params);
      return {
        ...response,
        success: response.code === '0000',
      };
    } catch (error: any) {
      console.error('更新商户路由失败:', error);
      return {
        code: '9999',
        msg: error.message || '更新商户路由失败',
        data: {} as MerchantRouter,
        success: false,
      };
    }
  }

  // 更新商户路由状态
  async updateStatus(id: number, status: number): Promise<ApiResponse<void>> {
    try {
      const response = await api.post<void>('/merchant-router/status', { id, status });
      return {
        ...response,
        success: response.code === '0000',
      };
    } catch (error: any) {
      console.error('更新商户路由状态失败:', error);
      return {
        code: '9999',
        msg: error.message || '更新商户路由状态失败',
        data: undefined,
        success: false,
      };
    }
  }

  // 删除商户路由
  async delete(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await api.post<void>('/merchant-router/delete', { id });
      return {
        ...response,
        success: response.code === '0000',
      };
    } catch (error: any) {
      console.error('删除商户路由失败:', error);
      return {
        code: '9999',
        msg: error.message || '删除商户路由失败',
        data: undefined,
        success: false,
      };
    }
  }
}

export const merchantRouterService = new MerchantRouterService();
