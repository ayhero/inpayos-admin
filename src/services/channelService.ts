import { api, ApiResponse } from './api';

export interface ChannelData {
  id: number;
  channel_code: string;
  account_id: string;
  secret?: string;
  detail?: any;
  pkgs?: string[];
  status: string;
  settings?: any;
  groups?: string[];
  created_at: number;
  updated_at: number;
}

export interface ChannelListParams {
  channel_code?: string;
  account_id?: string;
  status?: string;
  page: number;
  size: number;
}

export interface CreateChannelData {
  channel_code: string;
  account_id: string;
  secret?: string;
  detail?: any;
  pkgs?: string[];
  status: string;
  settings?: any;
  groups?: string[];
}

export interface UpdateChannelData extends CreateChannelData {
  id: number;
}

export interface ChannelListResponse {
  success: boolean;
  message?: string;
  data: {
    records: ChannelData[];
    total: number;
    page: number;
    size: number;
  };
}

export interface ChannelResponse {
  success: boolean;
  message?: string;
  data?: ChannelData;
}

export class ChannelService {
  // 获取渠道列表
  static async getChannelList(params: ChannelListParams): Promise<ChannelListResponse> {
    try {
      const response = await api.post('/channel/list', params);
      
      if (response.code === '0000') {
        return {
          success: true,
          data: {
            records: response.data.records || [],
            total: response.data.total || 0,
            page: response.data.current || 1,
            size: response.data.size || 20
          }
        };
      } else {
        return {
          success: false,
          message: response.msg || '获取渠道列表失败',
          data: {
            records: [],
            total: 0,
            page: 1,
            size: 20
          }
        };
      }
    } catch (error) {
      console.error('获取渠道列表失败:', error);
      return {
        success: false,
        message: '获取渠道列表失败',
        data: {
          records: [],
          total: 0,
          page: 1,
          size: 20
        }
      };
    }
  }

  // 创建渠道
  static async createChannel(data: CreateChannelData): Promise<ChannelResponse> {
    try {
      const response = await api.post('/channel/create', data);
      
      if (response.code === '0000') {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          message: response.msg || '创建渠道失败'
        };
      }
    } catch (error) {
      console.error('创建渠道失败:', error);
      return {
        success: false,
        message: '创建渠道失败'
      };
    }
  }

  // 更新渠道
  static async updateChannel(id: number, data: CreateChannelData): Promise<ChannelResponse> {
    try {
      const updateData = { ...data, id };
      const response = await api.post('/channel/update', updateData);
      
      if (response.code === '0000') {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          message: response.msg || '更新渠道失败'
        };
      }
    } catch (error) {
      console.error('更新渠道失败:', error);
      return {
        success: false,
        message: '更新渠道失败'
      };
    }
  }

  // 删除渠道
  static async deleteChannel(id: number): Promise<ChannelResponse> {
    try {
      const response = await api.post('/channel/delete', { id });
      
      if (response.code === '0000') {
        return {
          success: true
        };
      } else {
        return {
          success: false,
          message: response.msg || '删除渠道失败'
        };
      }
    } catch (error) {
      console.error('删除渠道失败:', error);
      return {
        success: false,
        message: '删除渠道失败'
      };
    }
  }
}