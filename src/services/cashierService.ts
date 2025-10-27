import { api, ApiResponse } from './api';

// 出纳员交易配置
export interface CashierTrxConfig {
  trx_type?: string;
  max_daily_count?: number;
  max_daily_sum?: number;
  max_monthly_count?: number;
  max_monthly_sum?: number;
  min_trx_amount?: number;
  max_trx_amount?: number;
  max_current_count?: number;
  max_current_sum?: number;
  max_failures?: number;
  support_trx_methods?: string[];
}

// 出纳员信息接口
export interface Cashier {
  id: number;
  cid: string; // 后端返回 cid
  type: string;
  bank_code: string;
  bank_name: string;
  card_number: string;
  holder_name: string;
  holder_phone: string;
  holder_email: string;
  country: string;
  country_code: string;
  province: string;
  city: string;
  ccy: string;
  status: string;
  online_status?: string;
  payin_status?: string;
  payout_status?: string;
  payin_config?: CashierTrxConfig; // 收款配置
  payout_config?: CashierTrxConfig; // 付款配置
  expire_at: number;
  logo: string;
  remark: string;
  created_at: number;
  updated_at: number;
}

// 为了向后兼容，保留 CashierTeam 类型别名
export type CashierTeam = Cashier;

// 出纳员列表查询参数
export interface CashierListParams {
  cid?: string; // 后端列表用 cid
  type?: string;
  bank_code?: string;
  card_number?: string;
  holder_name?: string;
  holder_phone?: string;
  holder_email?: string;
  status?: string;
  payin_status?: string;
  payout_status?: string;
  online_status?: string;
  country?: string;
  ccy?: string;
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

// 出纳员详情参数
export interface CashierDetailParams {
  cid: string;
}

// 出纳员统计数据
export interface CashierStats {
  total: number;
  active: number;
  online: number;
  suspended: number;
}

// 创建出纳员参数
export interface CreateCashierParams {
  tid: string; // 团队ID
  type: string; // private(私户), corporate(公户)
  upi?: string;
  bank_code?: string;
  bank_name?: string;
  card_number?: string;
  holder_name?: string;
  holder_phone?: string;
  holder_email?: string;
  country?: string;
  country_code?: string;
  province?: string;
  city?: string;
  ccy?: string;
  payin_config?: CashierTrxConfig;
  payout_config?: CashierTrxConfig;
  status?: string;
  logo?: string;
  remark?: string;
}

// 更新出纳员参数
export interface UpdateCashierParams {
  cid: string;
  bank_name?: string;
  holder_name?: string;
  holder_phone?: string;
  holder_email?: string;
  province?: string;
  city?: string;
  ccy?: string;
  payin_config?: CashierTrxConfig;
  payout_config?: CashierTrxConfig;
  status?: string;
  logo?: string;
  remark?: string;
}

// 更新出纳员状态参数
export interface UpdateCashierStatusParams {
  cid: string;
  payin_status?: string;
  payout_status?: string;
  status?: string;
  online_status?: string;
}

class CashierService {
  // 获取出纳员列表
  async getCashierList(params: CashierListParams): Promise<ApiResponse<PaginatedResponse<Cashier>>> {
    try {
      const response = await api.post<any>('/cashier/list', params);
      // 后端返回的是 records，需要转换为 list
      const data: PaginatedResponse<Cashier> = {
        list: response.data?.records || [],
        pagination: {
          page: response.data?.current || params.page,
          size: response.data?.size || params.size
        },
        total: response.data?.total || 0
      };
      return {
        code: response.code,
        msg: response.msg,
        data,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('获取出纳员列表失败:', error);
      return {
        code: '9999',
        msg: error.message || '获取出纳员列表失败',
        data: {
          list: [],
          pagination: { page: params.page, size: params.size },
          total: 0
        },
        success: false
      };
    }
  }

  // 获取出纳员详情
  async getCashierDetail(params: CashierDetailParams): Promise<ApiResponse<CashierTeam>> {
    try {
      const response = await api.post<CashierTeam>('/cashier/detail', params);
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('获取出纳员详情失败:', error);
      return {
        code: '9999',
        msg: error.message || '获取出纳员详情失败',
        data: {} as CashierTeam,
        success: false
      };
    }
  }

  // 获取出纳员统计
  async getCashierStats(): Promise<ApiResponse<CashierStats>> {
    try {
      const response = await api.post<CashierStats>('/cashier/stats', {});
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('获取出纳员统计失败:', error);
      return {
        code: '9999',
        msg: error.message || '获取出纳员统计失败',
        data: {
          total: 0,
          active: 0,
          online: 0,
          suspended: 0
        },
        success: false
      };
    }
  }

  // 创建出纳员
  async createCashier(params: CreateCashierParams): Promise<ApiResponse<Cashier>> {
    try {
      const response = await api.post<Cashier>('/cashier/create', params);
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('创建出纳员失败:', error);
      return {
        code: '9999',
        msg: error.message || '创建出纳员失败',
        data: {} as Cashier,
        success: false
      };
    }
  }

  // 更新出纳员
  async updateCashier(params: UpdateCashierParams): Promise<ApiResponse<Cashier>> {
    try {
      const response = await api.post<Cashier>('/cashier/update', params);
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('更新出纳员失败:', error);
      return {
        code: '9999',
        msg: error.message || '更新出纳员失败',
        data: {} as Cashier,
        success: false
      };
    }
  }

  // 更新出纳员状态
  async updateCashierStatus(params: UpdateCashierStatusParams): Promise<ApiResponse<void>> {
    try {
      const response = await api.post<void>('/cashier/status', params);
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('更新出纳员状态失败:', error);
      return {
        code: '9999',
        msg: error.message || '更新出纳员状态失败',
        data: undefined,
        success: false
      };
    }
  }
}

export const cashierService = new CashierService();