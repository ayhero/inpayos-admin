import { api, ApiResponse } from './api';

// 用户信息接口（Cashier）
export interface CashierUser {
  user_id: string;          // 用户ID
  name: string;             // 用户名
  phone: string;            // 手机号
  email: string;            // 邮箱
  status: string;           // 状态
}

// 应用账户信息接口
export interface AppAccount {
  app_type: string;           // 应用类型
  account_id: string;         // 账户ID
  user_id: string;           // 用户ID
  user?: CashierUser;        // 用户信息（新增）
  phone: string;             // 手机号
  account_name: string;      // 账户名称
  status: string;            // 状态 (active, inactive, frozen, canceled)
  verify_status: string;     // 验证状态 (unverified, verified, rejected)
  ccy: string;              // 币种
  balance: number;          // 余额
  total_cashier_balance: number; // 出纳员总余额
  total_cashier_count: number;   // 出纳员总数
  active_cashier_count: number;  // 活跃出纳员数
  created_at: number;       // 创建时间
  updated_at: number;       // 更新时间
  bound_at: number;         // 绑定时间
}

// 应用账户列表查询参数
export interface AppAccountListParams {
  user_id?: string;           // 用户ID筛选
  app_type?: string;          // 应用类型筛选 (freecharge, paytm, phonepe, gpay等)
  account_id?: string;        // 账户ID搜索
  phone?: string;             // 手机号搜索
  account_name?: string;      // 账户名称搜索
  status?: string;            // 状态筛选 (active, inactive, frozen, canceled)
  verify_status?: string;     // 验证状态筛选 (unverified, verified, rejected)
  payin_status?: string;      // 代收状态筛选 (active, inactive)
  payout_status?: string;     // 代付状态筛选 (active, inactive)
  ccy?: string;               // 币种筛选
  created_at_start?: number;  // 创建开始时间
  created_at_end?: number;    // 创建结束时间
  bound_at_start?: number;    // 绑定开始时间
  bound_at_end?: number;      // 绑定结束时间
  page: number;              // 页码
  size: number;              // 每页记录数
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

// 应用账户详情参数
export interface AppAccountDetailParams {
  app_type: string; // 应用类型
  account_id: string; // 账户ID
}

class AppAccountService {
  // 获取应用账户列表
  async getAppAccountList(params: AppAccountListParams): Promise<ApiResponse<PaginatedResponse<AppAccount>>> {
    try {
      const response = await api.post<any>('/app-account/list', params);
      
      if (!response.data) {
        return {
          success: false,
          code: response.code || '9999',
          msg: response.msg || '获取应用账户列表失败',
          data: {
            list: [],
            pagination: { page: params.page, size: params.size },
            total: 0
          }
        };
      }

      // 转换后端返回的数据格式
      return {
        success: true,
        code: response.code,
        msg: response.msg || '成功',
        data: {
          list: response.data.records || [], // 后端PageResult返回的是records字段
          pagination: { 
            page: response.data.current || params.page, 
            size: response.data.size || params.size 
          },
          total: response.data.total || 0 // 使用total字段作为总记录数
        }
      };
    } catch (error: any) {
      console.error('获取应用账户列表失败:', error);
      return {
        success: false,
        code: '9999',
        msg: error.message || '获取应用账户列表失败',
        data: {
          list: [],
          pagination: { page: params.page, size: params.size },
          total: 0
        }
      };
    }
  }

  // 获取应用账户详情
  async getAppAccountDetail(params: AppAccountDetailParams): Promise<ApiResponse<AppAccount>> {
    try {
      const response = await api.post<AppAccount>('/app-account/detail', params);
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('获取应用账户详情失败:', error);
      return {
        code: 'ERROR',
        msg: error.message || '获取应用账户详情失败',
        data: {} as AppAccount,
        success: false
      };
    }
  }
  
  // 获取应用账户今日统计
  async getAppAccountTodayStats(): Promise<ApiResponse<AppAccountTodayStats>> {
    try {
      console.log('正在获取应用账户统计数据...');
      
      const response = await api.post<ApiResponse<AppAccountTodayStats>>('/app-account/today-stats', {});
      console.log('应用账户统计数据响应:', response);
      
      return {
        ...response.data,
        success: response.data.code === '0000'
      };
    } catch (error: any) {
      console.error('获取应用账户统计失败:', error);
      return {
        code: 'ERROR',
        msg: error.message || '获取应用账户统计失败',
        data: {
          totalCount: 0,
          activeCount: 0,
          verifiedCount: 0,
          totalBalance: '0.00',
          todayNewCount: 0
        } as AppAccountTodayStats,
        success: false
      };
    }
  }
}

// 应用账户今日统计接口
export interface AppAccountTodayStats {
  totalCount: number;      // 总账户数
  activeCount: number;     // 活跃账户数
  verifiedCount: number;   // 已验证账户数
  totalBalance: string;    // 总余额
  todayNewCount: number;   // 今日新增账户数
}

export const appAccountService = new AppAccountService();