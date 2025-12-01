import { api, ApiResponse } from './api';
import { Account, Contract, Router } from './merchantService';
import { DispatchRouter } from './dispatchRouterService';

// CashierTeam 信息接口 - 现在使用统一的 User 结构
export interface CashierTeamMember {
  id: number;
  user_id: string;
  user_type: string;
  status: string;
  online_status?: string;
  name?: string;
  phone?: string;
  has_g2fa?: boolean;
  created_at?: number;
  updated_at?: number;
}

export interface CashierTeam {
  id: number;
  user_id: string;
  user_type: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  status: string;
  region?: string;
  avatar?: string;
  has_g2fa?: boolean;
  accounts?: Account[];
  contracts?: Contract[];
  routers?: Router[];
  dispatch_routers?: DispatchRouter[];
  members?: CashierTeamMember[];
}

// CashierTeam 列表查询参数
export interface CashierTeamListParams {
  user_id?: string;
  user_type?: string;
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

// 分页响应
export interface PaginatedResponse<T> {
  list: T[];
  pagination: {
    page: number;
    size: number;
  };
  total: number;
}

// CashierTeam 详情参数
export interface CashierTeamDetailParams {
  user_id: string;
  user_type?: string;
}

// CashierTeam 统计数据
export interface CashierTeamStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
}

class CashierTeamService {
  // 获取 CashierTeam 列表
  async getCashierTeamList(params: CashierTeamListParams): Promise<ApiResponse<PaginatedResponse<CashierTeam>>> {
    try {
      const response = await api.post<any>('/cashier-team/list', params);
      
      if (!response.data) {
        return {
          success: false,
          code: response.code || '9999',
          msg: response.msg || '获取 CashierTeam 列表失败',
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
      console.error('获取 CashierTeam 列表失败:', error);
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

  // 获取 CashierTeam 详情
  async getCashierTeamDetail(params: CashierTeamDetailParams): Promise<ApiResponse<CashierTeam>> {
    try {
      const response = await api.post<CashierTeam>('/cashier-team/detail', params);
      return {
        success: response.code === '0000',
        code: response.code,
        msg: response.msg,
        data: response.data
      };
    } catch (error: any) {
      console.error('获取 CashierTeam 详情失败:', error);
      throw error;
    }
  }

  // 获取 CashierTeam 统计数据
  async getCashierTeamStats(): Promise<ApiResponse<CashierTeamStats>> {
    try {
      const response = await api.post<CashierTeamStats>('/cashier-team/stats', {});
      return {
        success: response.code === '0000',
        code: response.code,
        msg: response.msg,
        data: response.data || {
          total: 0,
          active: 0,
          inactive: 0,
          suspended: 0
        }
      };
    } catch (error: any) {
      console.error('获取 CashierTeam 统计数据失败:', error);
      return {
        success: false,
        code: '9999',
        msg: error.message || '获取统计数据失败',
        data: {
          total: 0,
          active: 0,
          inactive: 0,
          suspended: 0
        }
      };
    }
  }
}

export const cashierTeamService = new CashierTeamService();
