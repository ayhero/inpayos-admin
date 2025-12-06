import { api, ApiResponse } from './api';

// 用户信息类型定义
export interface UserData {
  user_id: string;
  user_type: string;
  org_id?: string;
  avatar?: string;
  status?: string;
  online_status?: string;
  last_login_at?: number;
  last_active_at?: number;
  name?: string;
  phone?: string;
  email?: string;
}

// 账户数据类型定义
export interface AccountData {
  account_id: string;
  user_id: string;
  user_type: string;
  ccy: string; // 后端返回的是ccy，不是currency
  balance: string; // 总余额
  available_balance: string; // 可用余额
  frozen_balance: string; // 冻结余额
  margin_balance: string; // 保证金
  available_margin_balance: string; // 可用保证金
  frozen_margin_balance: string; // 冻结保证金
  status: string; // 状态是字符串，如 "active", "inactive", "frozen" 等
  version: number;
  last_active_at: number;
  user?: UserData; // 用户信息
  created_at: number;
  updated_at: number;
}

// 账户列表请求参数
export interface AccountListParams {
  tid?: string; // 车队ID，用于查询车队成员账户
  user_id?: string; // 商户ID或车队ID
  user_type?: string; // 用户类型: 'merchant' 或 'cashier_team'
  ccy?: string; // 币种
  status?: number; // 状态
  page: number;
  size: number;
}

// 账户列表响应数据
export interface AccountListResponse {
  result_type: string;
  size: number;
  current: number;
  total: number;
  count: number;
  records: AccountData[];
  attach: object;
}

// 账户服务
export const accountService = {
  // 获取账户列表（商户或车队）
  getAccountList: async (params: AccountListParams): Promise<ApiResponse<AccountListResponse>> => {
    try {
      const response = await api.post<AccountListResponse>('/account/list', params);
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('获取账户列表失败:', error);
      return {
        code: 'ERROR',
        msg: error.message || '获取账户列表失败',
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

  // 获取账户详情
  getAccountDetail: async (params: { account_id: string }): Promise<ApiResponse<AccountData>> => {
    try {
      const response = await api.post<AccountData>('/account/detail', params);
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('获取账户详情失败:', error);
      return {
        code: 'ERROR',
        msg: error.message || '获取账户详情失败',
        data: {} as AccountData,
        success: false
      };
    }
  },

  // 创建账户
  createAccount: async (params: { user_id: string; user_type: string; ccy: string }): Promise<ApiResponse<AccountData>> => {
    try {
      const response = await api.post<AccountData>('/account/create', params);
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('创建账户失败:', error);
      return {
        code: 'ERROR',
        msg: error.message || '创建账户失败',
        data: {} as AccountData,
        success: false
      };
    }
  }
};
