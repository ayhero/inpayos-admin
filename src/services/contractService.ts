import { api, ApiResponse } from './api';

// 合约交易配置
export interface ContractTrxConfig {
  pkg: string;
  trx_type: string;
  trx_method: string;
  trx_ccy: string;
  country: string;
  min_amount: number;
  max_amount: number;
  min_usd_amount: number;
  max_usd_amount: number;
}

// 合约结算配置
export interface ContractSettleConfig {
  type: string; // T0、T1、T2、T3、W1、M1
  pkg: string;
  trx_type: string;
  trx_method: string;
  trx_ccy: string;
  country: string;
  min_amount: number;
  max_amount: number;
  min_usd_amount: number;
  max_usd_amount: number;
  strategies: string[];
  strategy_list?: StrategyDetail[];
}

// 策略详情
export interface StrategyDetail {
  id: number;
  code: string;
  sid: string;
  stype: string;
  period: number;
  settle_ccy: string;
  trx_type: string;
  trx_mode: string;
  trx_method: string;
  country: string;
  trx_ccy: string;
  status: string;
  rules: StrategyRule[];
  created_at: number;
  updated_at: number;
}

// 策略规则
export interface StrategyRule {
  period: number;
  rule_id: string;
  trx_type: string;
  trx_mode: string;
  trx_method: string;
  country: string;
  min_amount: string | null;
  max_amount: string | null;
  min_fee: string | null;
  max_fee: string | null;
  min_rate: string | null;
  max_rate: string | null;
  min_usd_fee: string | null;
  max_usd_fee: string | null;
  min_usd_rate: string | null;
  max_usd_rate: string | null;
  ccy: string;
  fixed_fee: string;
  rate: string;
  fixed_usd_fee: string | null;
  usd_rate: string | null;
}

// 用户信息
export interface UserInfo {
  user_id: string;
  user_type: string;
  org_id: string;
  avatar: string;
  status: string;
  online_status: string;
  last_login_at: number;
  last_active_at: number;
  name: string;
  phone: string;
  email: string;
}

// 合约配置
export interface ContractConfig {
  trx_type: string;
  status: string;
  configs: ContractTrxConfig[];
  settle: ContractSettleConfig[];
}

// 合约信息接口 - 完全对齐后端 Protocol
export interface Contract {
  id: number;
  contract_id: string;
  ori_contract_id?: string; // 原始合约ID
  user?: UserInfo; // 用户信息
  sid: string; // 商户ID或车队ID
  stype: string; // 类型: merchant(商户) 或 cashier_team(车队)
  start_at: number; // 生效时间（毫秒时间戳）
  expired_at: number; // 过期时间（毫秒时间戳）
  status: string; // 状态
  payin?: ContractConfig; // 收款配置
  payout?: ContractConfig; // 付款配置
  created_at: number;
  updated_at: number;
}

// 合约列表查询参数
export interface ContractListParams {
  contract_id?: string;
  sid?: string; // 商户ID或车队ID（后端期望 sid）
  stype?: string; // 类型: merchant(商户) 或 cashier_team(车队)（后端期望 stype）
  merchant_name?: string;
  contract_type?: string;
  contract_number?: string;
  status?: string;
  sign_date_start?: number;
  sign_date_end?: number;
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

// 合约详情参数
export interface ContractDetailParams {
  contract_id: string;
}

// 合约统计数据
export interface ContractStats {
  total: number;
  active: number;
  expired: number;
  pending: number;
}

// 创建商户合同参数
export interface CreateMerchantContractParams {
  user_id: string;
  user_type: string;
  start_at: number;
  expired_at: number;
  status: string;
  payin?: ContractConfig;
  payout?: ContractConfig;
}

class ContractService {
  // 获取合约列表
  async getContractList(params: ContractListParams): Promise<ApiResponse<PaginatedResponse<Contract>>> {
    try {
      const response = await api.post<any>('/contract/list', params);
      
      if (!response.data) {
        return {
          success: false,
          code: response.code || '9999',
          msg: response.msg || '获取合约列表失败',
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
      console.error('获取合约列表失败:', error);
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

  // 获取合约详情
  async getContractDetail(params: ContractDetailParams): Promise<ApiResponse<Contract>> {
    try {
      const response = await api.post<Contract>('/contract/detail', params);
      return {
        success: response.code === '0000',
        code: response.code,
        msg: response.msg,
        data: response.data
      };
    } catch (error: any) {
      console.error('获取合约详情失败:', error);
      throw error;
    }
  }

  // 获取合约统计数据
  async getContractStats(sid?: string, stype?: string): Promise<ApiResponse<ContractStats>> {
    try {
      const params: any = {};
      if (sid) params.sid = sid;
      if (stype) params.stype = stype;
      
      const response = await api.post<ContractStats>('/contract/stats', params);
      return {
        success: response.code === '0000',
        code: response.code,
        msg: response.msg,
        data: response.data || {
          total: 0,
          active: 0,
          expired: 0,
          pending: 0
        }
      };
    } catch (error: any) {
      console.error('获取合约统计数据失败:', error);
      return {
        success: false,
        code: '9999',
        msg: error.message || '获取统计数据失败',
        data: {
          total: 0,
          active: 0,
          expired: 0,
          pending: 0
        }
      };
    }
  }

  // 创建商户合同
  async createMerchantContract(params: CreateMerchantContractParams): Promise<ApiResponse<Contract>> {
    try {
      const response = await api.post<Contract>('/contract/create', params);
      return {
        success: response.code === '0000',
        code: response.code,
        msg: response.msg,
        data: response.data
      };
    } catch (error: any) {
      console.error('创建商户合同失败:', error);
      throw error;
    }
  }
}

export const contractService = new ContractService();
