import { api, ApiResponse } from './api';

// 出纳员用户交易配置
export interface CashierUserTrxConfig {
  ccy?: string;
  trx_type?: string;
  min_trx_amount?: string;
  max_trx_amount?: string;
  max_daily_count?: number;
  max_daily_sum?: string;
  max_monthly_count?: number;
  max_monthly_sum?: string;
  max_current_count?: number;
  max_current_sum?: string;
  max_failures?: number;
  support_trx_methods?: string[];
}

// APP账户信息
export interface AppAccount {
  app_type: string;
  account_id: string;
  user_id: string;
  status: string;
  verify_status?: string;
  ccy: string;
  created_at: number;
  updated_at: number;
  bound_at?: number;
}

// 收银账户信息
export interface CashierAccount {
  account_id: string;
  user_id: string;
  app_type: string;
  app_account_id: string;
  type: string;
  upi: string;
  provider: string;
  primary?: boolean;
  status: string;
  online_status?: string;
  payin_status: string;
  payout_status: string;
  payin_config?: CashierUserTrxConfig;
  payout_config?: CashierUserTrxConfig;
  created_at: number;
  updated_at: number;
  bound_at?: number;
}

// 余额账户信息
export interface BalanceAccount {
  balance: string;
  available_balance: string;
  frozen_balance: string;
  margin_balance: string;
  available_margin_balance: string;
  frozen_margin_balance: string;
  account_id: string;
  user_id: string;
  user_type: string;
  is_default: boolean;
  ccy: string;
  status: string;
  version: number;
  last_active_at: number;
  user: any;
  created_at: number;
  updated_at: number;
}

// 车队信息
export interface TeamInfo {
  id: number;
  user_id: string;
  user_type: string;
  type: string;
  status: string;
  name: string;
  email?: string;
  region?: string;
  has_g2fa: boolean;
  created_at: number;
  updated_at: number;
  primary_account?: any;
}

// 出纳员用户信息接口 (Cashier User)
export interface CashierUser {
  id: number;
  user_id: string;              // 用户ID
  user_type: string;            // 用户类型
  org_id?: string;              // 组织ID（车队ID）
  tid?: string;                 // 车队ID (兼容旧字段)
  phone?: string;               // 手机号
  email?: string;               // 邮箱
  name?: string;                // 姓名
  avatar?: string;              // 头像
  country?: string;             // 国家
  country_code?: string;        // 国家代码
  province?: string;            // 省份
  city?: string;                // 城市
  ccy?: string;                 // 币种
  payin_status?: string;        // 代收状态
  payout_status?: string;       // 代付状态
  payin_config?: CashierUserTrxConfig;   // 用户级别代收配置
  payout_config?: CashierUserTrxConfig;  // 用户级别代付配置
  status: string;               // 用户状态
  online_status: string;        // 在线状态
  created_at: number;           // 创建时间
  updated_at: number;           // 更新时间
  last_login_at?: number;       // 最后登录时间
  has_g2fa: boolean;            // 是否启用二次验证
  team?: TeamInfo;              // 车队信息
  app_accounts?: AppAccount[];  // APP账户列表
  cashier_accounts?: CashierAccount[]; // 收银账户列表
  accounts?: BalanceAccount[];  // 余额账户列表
  primary_account?: CashierAccount; // 主账户信息 (兼容旧字段)
  commissions?: CommissionConfig[]; // 佣金配置列表
}

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

// 出纳员用户列表查询参数
export interface CashierUserListParams {
  tid?: string;                 // 车队ID
  user_id?: string;             // 用户ID
  user_name?: string;           // 用户名
  status?: string;              // 状态
  payin_status?: string;        // 收款状态
  payout_status?: string;       // 付款状态
  online_status?: string;       // 在线状态
  country?: string;             // 国家
  ccy?: string;                 // 币种
  created_at_start?: number;    // 创建开始时间
  created_at_end?: number;      // 创建结束时间
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

// 出纳员用户详情参数
export interface CashierUserDetailParams {
  user_id: string;
}

// 出纳员用户统计数据
export interface CashierUserStats {
  total: number;
  active: number;
  online: number;
  suspended: number;
}

class CashierUserService {
  // 获取出纳员用户列表
  async getCashierUserList(params: CashierUserListParams): Promise<ApiResponse<PaginatedResponse<CashierUser>>> {
    try {
      const response = await api.post<any>('/cashier/list', params);
      // 后端返回的是 records，需要转换为 list
      const data: PaginatedResponse<CashierUser> = {
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
      console.error('获取出纳员用户列表失败:', error);
      return {
        code: '9999',
        msg: error.message || '获取出纳员用户列表失败',
        data: {
          list: [],
          pagination: { page: params.page, size: params.size },
          total: 0
        },
        success: false
      };
    }
  }

  // 获取出纳员用户详情
  async getCashierUserDetail(params: CashierUserDetailParams): Promise<ApiResponse<CashierUser>> {
    try {
      const response = await api.post<CashierUser>('/cashier/detail', params);
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('获取出纳员用户详情失败:', error);
      return {
        code: '9999',
        msg: error.message || '获取出纳员用户详情失败',
        data: {} as CashierUser,
        success: false
      };
    }
  }

  // 获取出纳员用户统计
  async getCashierUserStats(): Promise<ApiResponse<CashierUserStats>> {
    try {
      const response = await api.post<CashierUserStats>('/cashier/stats', {});
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('获取出纳员用户统计失败:', error);
      return {
        code: '9999',
        msg: error.message || '获取出纳员用户统计失败',
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
}

export const cashierUserService = new CashierUserService();
