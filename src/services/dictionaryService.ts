import { api, ApiResponse } from './api'

export interface Dictionary {
  id: number
  key: string
  parent?: string
  label_en?: string
  label_cn?: string
  value?: string
  status: string
  type?: string
  category?: string
  sort_order: number
  is_system: boolean
  description?: string
  metadata?: string
  data_type?: string
  default_value?: string
  validation?: string
  is_editable: boolean
  created_by?: string
  updated_by?: string
  created_at: number
  updated_at: number
}

export interface DictionaryListRequest {
  page: number
  size: number
  key?: string
  parent?: string
  label_en?: string
  label_cn?: string
  status?: string
  type?: string
  category?: string
  is_system?: boolean
  is_editable?: boolean
  created_by?: string
}

export interface DictionaryCreateRequest {
  key: string
  parent?: string
  label_en?: string
  label_cn?: string
  value?: string
  status?: string
  type?: string
  category?: string
  sort_order?: number
  is_system?: boolean
  description?: string
  metadata?: string
  data_type?: string
  default_value?: string
  validation?: string
  is_editable?: boolean
  created_by: string
}

export interface DictionaryUpdateRequest {
  id: number
  key?: string
  parent?: string
  label_en?: string
  label_cn?: string
  value?: string
  status?: string
  type?: string
  category?: string
  sort_order?: number
  is_system?: boolean
  description?: string
  metadata?: string
  data_type?: string
  default_value?: string
  validation?: string
  is_editable?: boolean
  updated_by?: string
}

export interface DictionaryDeleteRequest {
  id: number
}

export interface DictionaryGetRequest {
  id: number
}

export interface PageResult<T> {
  records: T[]
  total: number
  current: number
  size: number
  count: number
  result_type: string
  metadata?: Record<string, any>
}

class DictionaryService {
  // 获取数据字典列表
  async getDictionaries(params: DictionaryListRequest): Promise<PageResult<Dictionary>> {
    const response = await api.post<PageResult<Dictionary>>(
      '/dictionary/list',
      params
    )
    if (response.code !== '0000') {
      throw new Error(response.msg)
    }
    return response.data
  }

  // 创建数据字典
  async createDictionary(data: DictionaryCreateRequest): Promise<Dictionary> {
    const response = await api.post<Dictionary>(
      '/dictionary/create',
      data
    )
    if (response.code !== '0000') {
      throw new Error(response.msg)
    }
    return response.data
  }

  // 更新数据字典
  async updateDictionary(id: number, data: DictionaryUpdateRequest): Promise<Dictionary> {
    const requestData = { ...data, id }
    const response = await api.post<Dictionary>(
      '/dictionary/update',
      requestData
    )
    if (response.code !== '0000') {
      throw new Error(response.msg)
    }
    return response.data
  }

  // 删除数据字典
  async deleteDictionary(id: number): Promise<void> {
    const response = await api.post<null>(
      '/dictionary/delete',
      { id }
    )
    if (response.code !== '0000') {
      throw new Error(response.msg)
    }
  }

  // 获取数据字典详情
  async getDictionary(data: DictionaryGetRequest): Promise<Dictionary> {
    const response = await api.post<Dictionary>(
      '/dictionary/get',
      data
    )
    if (response.code !== '0000') {
      throw new Error(response.msg)
    }
    return response.data
  }

  // 根据key获取数据字典
  async getDictionaryByKey(key: string): Promise<Dictionary> {
    const response = await api.get<Dictionary>(
      `/dictionary/key?key=${encodeURIComponent(key)}`
    )
    if (response.code !== '0000') {
      throw new Error(response.msg)
    }
    return response.data
  }

  // 获取指定父键的子字典项
  async getDictionariesByParent(parent: string): Promise<Dictionary[]> {
    const response = await api.get<Dictionary[]>(
      `/dictionary/parent?parent=${encodeURIComponent(parent)}`
    )
    if (response.code !== '0000') {
      throw new Error(response.msg)
    }
    return response.data
  }

  // 获取指定类型的字典项
  async getDictionariesByType(type: string): Promise<Dictionary[]> {
    const response = await api.get<Dictionary[]>(
      `/dictionary/type?type=${encodeURIComponent(type)}`
    )
    if (response.code !== '0000') {
      throw new Error(response.msg)
    }
    return response.data
  }

  // 获取指定分类的字典项
  async getDictionariesByCategory(category: string): Promise<Dictionary[]> {
    const response = await api.get<Dictionary[]>(
      `/dictionary/category?category=${encodeURIComponent(category)}`
    )
    if (response.code !== '0000') {
      throw new Error(response.msg)
    }
    return response.data
  }
}

export const dictionaryService = new DictionaryService()
export default dictionaryService