import { api, ApiResponse } from './api';

// 路由数据接口
export interface RouterData {
  id: number;
  mid?: string;
  tid?: string;
  cid?: string;
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
  status?: string;
  version?: number;
  created_at?: number;
  updated_at?: number;
}

// 路由列表查询参数
export interface RouterListParams {
  mid?: string;
  tid?: string;
  cid?: string;
  trx_method?: string;
  trx_type?: string;
  channel_code?: string;
  status?: string;
  page: number;
  size: number;
}

// 创建路由参数
export interface CreateRouterParams {
  mid?: string;
  tid?: string;
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
  status: string;
}

// 更新路由参数
export interface UpdateRouterParams {
  id: number;
  mid?: string;
  tid?: string;
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
  status?: string;
}

// 路由列表响应数据
export interface RouterListResponse {
  result_type: string;
  size: number;
  current: number;
  total: number;
  count: number;
  records: RouterData[];
  attach: object;
}

// 路由服务
export const routerService = {
  // 获取商户路由列表
  listMerchantRouters: async (params: RouterListParams): Promise<ApiResponse<RouterListResponse>> => {
    try {
      const response = await api.post<RouterListResponse>('/router/merchant/list', params);
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('获取商户路由列表失败:', error);
      return {
        code: 'ERROR',
        msg: error.message || '获取商户路由列表失败',
        data: {
          result_type: 'list',
          size: params.size,
          current: params.page,
          total: 0,
          count: 0,
          records: [],
          attach: {}
        },
        success: false
      };
    }
  },

  // 获取车队路由列表
  listFleetRouters: async (params: RouterListParams): Promise<ApiResponse<RouterListResponse>> => {
    try {
      const response = await api.post<RouterListResponse>('/router/cashier-team/list', params);
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('获取车队路由列表失败:', error);
      return {
        code: 'ERROR',
        msg: error.message || '获取车队路由列表失败',
        data: {
          result_type: 'list',
          size: params.size,
          current: params.page,
          total: 0,
          count: 0,
          records: [],
          attach: {}
        },
        success: false
      };
    }
  },

  // 更新商户路由状态
  updateMerchantRouterStatus: async (id: number, status: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/router/merchant/status', { id, status });
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('更新商户路由状态失败:', error);
      return {
        code: 'ERROR',
        msg: error.message || '更新路由状态失败',
        data: null,
        success: false
      };
    }
  },

  // 更新车队路由状态
  updateFleetRouterStatus: async (id: number, status: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/router/cashier-team/status', { id, status });
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('更新车队路由状态失败:', error);
      return {
        code: 'ERROR',
        msg: error.message || '更新路由状态失败',
        data: null,
        success: false
      };
    }
  },

  // 删除商户路由
  deleteMerchantRouter: async (id: number): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/router/merchant/delete', { id });
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('删除商户路由失败:', error);
      return {
        code: 'ERROR',
        msg: error.message || '删除路由失败',
        data: null,
        success: false
      };
    }
  },

  // 删除车队路由
  deleteFleetRouter: async (id: number): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/router/cashier-team/delete', { id });
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('删除车队路由失败:', error);
      return {
        code: 'ERROR',
        msg: error.message || '删除路由失败',
        data: null,
        success: false
      };
    }
  },

  // 创建商户路由
  createMerchantRouter: async (params: CreateRouterParams): Promise<ApiResponse<RouterData>> => {
    try {
      const response = await api.post<RouterData>('/router/merchant/create', params);
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('创建商户路由失败:', error);
      return {
        code: 'ERROR',
        msg: error.message || '创建路由失败',
        data: null as any,
        success: false
      };
    }
  },

  // 创建车队路由
  createFleetRouter: async (params: CreateRouterParams): Promise<ApiResponse<RouterData>> => {
    try {
      const response = await api.post<RouterData>('/router/cashier-team/create', params);
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('创建车队路由失败:', error);
      return {
        code: 'ERROR',
        msg: error.message || '创建路由失败',
        data: null as any,
        success: false
      };
    }
  },

  // 更新商户路由
  updateMerchantRouter: async (params: UpdateRouterParams): Promise<ApiResponse<RouterData>> => {
    try {
      const response = await api.post<RouterData>('/router/merchant/update', params);
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('更新商户路由失败:', error);
      return {
        code: 'ERROR',
        msg: error.message || '更新路由失败',
        data: null as any,
        success: false
      };
    }
  },

  // 更新车队路由
  updateFleetRouter: async (params: UpdateRouterParams): Promise<ApiResponse<RouterData>> => {
    try {
      const response = await api.post<RouterData>('/router/cashier-team/update', params);
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('更新车队路由失败:', error);
      return {
        code: 'ERROR',
        msg: error.message || '更新路由失败',
        data: null as any,
        success: false
      };
    }
  },
};
