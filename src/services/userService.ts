import { api, ApiResponse } from './api';

// 用户信息接口类型定义
export interface UserInfo {
  mid: string;
  name: string;
  type: string;
  email: string;
  phone: string;
  status: number;
  has_g2fa: boolean;
}

// 用户注册参数
export interface UserRegisterParams {
  user_type: string;
  email: string;
  password: string;
  nickname?: string;
  type: string;
  company_name?: string;
  phone?: string;
  phone_country_code?: string;
  region?: string;
  default_ccy?: string;
  verify_code?: string;
}

// 创建账户参数
export interface CreateAccountParams {
  user_id: string;
  user_type: string;
  ccy: string;
}

// 创建合同参数
export interface CreateContractParams {
  user_id: string;
  user_type: string;
  contract_id?: string;
  start_at: number;
  expired_at?: number;
  status: string;
  payin?: any;
  payout?: any;
}

// 用户列表查询参数
export interface UserListParams {
  keyword?: string; // 关键词（模糊查询用户ID、名称、邮箱等）
  user_id?: string; // 用户ID（精确查询）
  user_type: string; // 必须指定: merchant 或 cashier_team
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

// 用户信息（列表返回）
export interface User {
  id: number;
  user_id: string;
  user_type: string;
  type?: string;
  org_id?: string;
  avatar?: string;
  status: string;
  online_status?: string;
  last_login_at?: number;
  last_active_at?: number;
  name: string;
  phone?: string;
  email?: string;
  region?: string;
  has_g2fa?: boolean;
  created_at: number;
  updated_at: number;
}

// 分页结果
export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  count: number;
}

// 创建路由参数
export interface CreateRouterParams {
  user_id: string;
  user_type: string;
  trx_type: string;
  trx_method?: string;
  ccy?: string;
  country?: string;
  min_amount?: number;
  max_amount?: number;
  channel_code: string;
  priority?: number;
  status: string;
}

// 用户服务类
export class UserService {
  // 获取用户信息
  static async getUserInfo(): Promise<ApiResponse<UserInfo>> {
    try {
      const response = await api.get<UserInfo>('/info');
      return response;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  }

  // 注册用户（商户或车队）
  static async registerUser(params: UserRegisterParams): Promise<ApiResponse<any>> {
    try {
      const response = await api.post('/user/register', params);
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('注册用户失败:', error);
      return {
        code: 'ERROR',
        msg: error.message || '注册用户失败',
        data: null,
        success: false
      };
    }
  }

  // 获取用户列表
  static async listUsers(params: UserListParams): Promise<ApiResponse<PageResult<User>>> {
    try {
      const response = await api.post<PageResult<User>>('/user/list', params);
      return {
        ...response,
        success: response.code === '0000',
        data: response.data || { records: [], total: 0, size: params.size, current: params.page, count: 0 }
      };
    } catch (error: any) {
      console.error('获取用户列表失败:', error);
      return {
        code: 'ERROR',
        msg: error.message || '获取用户列表失败',
        data: { records: [], total: 0, size: params.size, current: params.page, count: 0 },
        success: false
      };
    }
  }

  // 创建账户
  static async createAccount(params: CreateAccountParams): Promise<ApiResponse<any>> {
    try {
      const response = await api.post('/user/account/create', params);
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('创建账户失败:', error);
      return {
        code: 'ERROR',
        msg: error.message || '创建账户失败',
        data: null,
        success: false
      };
    }
  }

  // 创建合同
  static async createContract(params: CreateContractParams): Promise<ApiResponse<any>> {
    try {
      const response = await api.post('/user/contract/create', params);
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('创建合同失败:', error);
      return {
        code: 'ERROR',
        msg: error.message || '创建合同失败',
        data: null,
        success: false
      };
    }
  }

  // 创建路由
  static async createRouter(params: CreateRouterParams): Promise<ApiResponse<any>> {
    try {
      const response = await api.post('/user/router/create', params);
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('创建路由失败:', error);
      return {
        code: 'ERROR',
        msg: error.message || '创建路由失败',
        data: null,
        success: false
      };
    }
  }
}

export default UserService;
