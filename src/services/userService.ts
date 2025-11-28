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
