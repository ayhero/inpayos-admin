import { api, ApiResponse } from './api';

// 出纳员用户交易配置
export interface CashierUserTrxConfig {
  min_trx_amount?: number;
  max_trx_amount?: number;
  max_daily_count?: number;
  max_daily_sum?: number;
  max_monthly_count?: number;
  max_monthly_sum?: number;
  max_current_count?: number;
  max_current_sum?: number;
  max_failures?: number;
  support_trx_methods?: string[];
}

// 出纳员用户信息接口 (Cashier User)
export interface CashierUser {
  tid: string;                  // 车队ID
  user_id: string;              // 用户ID
  phone: string;                // 手机号
  email: string;                // 邮箱
  name: string;                 // 姓名
  avatar: string;               // 头像
  country: string;              // 国家
  country_code: string;         // 国家代码
  province: string;             // 省份
  city: string;                 // 城市
  ccy: string;                  // 币种
  payin_status: string;         // 代收状态
  payout_status: string;        // 代付状态
  payin_config: CashierUserTrxConfig;   // 用户级别代收配置
  payout_config: CashierUserTrxConfig;  // 用户级别代付配置
  status: string;               // 用户状态
  online_status: string;        // 在线状态
  created_at: number;           // 创建时间
  updated_at: number;           // 更新时间
  last_login_at: number;        // 最后登录时间
  has_g2fa: boolean;            // 是否启用二次验证
  primary_account?: PrimaryAccount; // 主账户信息
  accounts?: any[];             // 账户列表
}

// 主账户信息
export interface PrimaryAccount {
  account_id: string;           // 账户ID
  user_id: string;              // 用户ID
  app_type: string;             // 应用类型
  app_account_id: string;       // 应用账户ID
  type: string;                 // 账户类型
  upi: string;                  // UPI ID
  provider: string;             // UPI提供商
  bank_name: string;            // 银行名称
  bank_code: string;            // 银行代码
  card_number: string;          // 卡号
  holder_name: string;          // 持卡人姓名
  holder_phone: string;         // 持卡人手机
  holder_email: string;         // 持卡人邮箱
  primary: boolean;             // 是否主账户
  status: string;               // 状态
  online_status: string;        // 在线状态
  payin_status: string;         // 代收状态
  payout_status: string;        // 代付状态
  created_at: number;           // 创建时间
  updated_at: number;           // 更新时间
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
