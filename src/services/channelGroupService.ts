import { api } from './api';

export interface GroupSetting {
  strategy?: string;
  weight?: string;
  rank_type?: string;
  time_index?: string;
  data_index?: string;
  timezone?: string;
}

export interface GroupMember {
  member?: string;
  target?: number;
  current?: number;
  distance?: number;
  weight?: number;
}

export interface ChannelGroupData {
  id: number;
  code: string;
  name: string;
  status: string;
  setting?: GroupSetting;
  members?: GroupMember[];
  created_at: number;
  updated_at: number;
}

export interface ChannelGroupListParams {
  code?: string;
  name?: string;
  status?: string;
  page: number;
  size: number;
}

export interface CreateChannelGroupData {
  code: string;
  name: string;
  status: string;
  setting?: GroupSetting;
  members?: GroupMember[];
}

export interface UpdateChannelGroupData extends CreateChannelGroupData {
  id: number;
}

export interface ChannelGroupListResponse {
  success: boolean;
  message?: string;
  data: {
    records: ChannelGroupData[];
    total: number;
    page: number;
    size: number;
  };
}

export interface ChannelGroupResponse {
  success: boolean;
  message?: string;
  data?: ChannelGroupData;
}

export class ChannelGroupService {
  // 获取渠道组列表
  static async getChannelGroupList(params: ChannelGroupListParams): Promise<ChannelGroupListResponse> {
    try {
      const response = await api.post('/channel-group/list', params);
      
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
          message: response.msg || '获取渠道组列表失败',
          data: {
            records: [],
            total: 0,
            page: 1,
            size: 20
          }
        };
      }
    } catch (error) {
      console.error('获取渠道组列表失败:', error);
      return {
        success: false,
        message: '获取渠道组列表失败',
        data: {
          records: [],
          total: 0,
          page: 1,
          size: 20
        }
      };
    }
  }

  // 创建渠道组
  static async createChannelGroup(data: CreateChannelGroupData): Promise<ChannelGroupResponse> {
    try {
      const response = await api.post('/channel-group/create', data);
      
      if (response.code === '0000') {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          message: response.msg || '创建渠道组失败'
        };
      }
    } catch (error) {
      console.error('创建渠道组失败:', error);
      return {
        success: false,
        message: '创建渠道组失败'
      };
    }
  }

  // 更新渠道组
  static async updateChannelGroup(id: number, data: CreateChannelGroupData): Promise<ChannelGroupResponse> {
    try {
      const updateData = { ...data, id };
      const response = await api.post('/channel-group/update', updateData);
      
      if (response.code === '0000') {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          message: response.msg || '更新渠道组失败'
        };
      }
    } catch (error) {
      console.error('更新渠道组失败:', error);
      return {
        success: false,
        message: '更新渠道组失败'
      };
    }
  }

  // 删除渠道组
  static async deleteChannelGroup(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.post('/channel-group/delete', { id });
      
      if (response.code === '0000') {
        return {
          success: true,
          message: '删除成功'
        };
      } else {
        return {
          success: false,
          message: response.msg || '删除渠道组失败'
        };
      }
    } catch (error) {
      console.error('删除渠道组失败:', error);
      return {
        success: false,
        message: '删除渠道组失败'
      };
    }
  }

  // 获取渠道组详情
  static async getChannelGroup(id: number): Promise<ChannelGroupResponse> {
    try {
      const response = await api.post('/channel-group/get', { id });
      
      if (response.code === '0000') {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          message: response.msg || '获取渠道组详情失败'
        };
      }
    } catch (error) {
      console.error('获取渠道组详情失败:', error);
      return {
        success: false,
        message: '获取渠道组详情失败'
      };
    }
  }
}