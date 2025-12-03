import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'
import { Textarea } from './ui/textarea'
import { ConfirmDialog } from './ui/confirm-dialog'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { toast } from '../utils/toast'
import dictionaryService, {
  Dictionary,
  DictionaryListRequest,
  DictionaryCreateRequest,
  DictionaryUpdateRequest
} from '../services/dictionaryService'

interface DictionaryManagementProps {}

const DictionaryManagement: React.FC<DictionaryManagementProps> = () => {
  const [dictionaries, setDictionaries] = useState<Dictionary[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(false)
  
  // 搜索表单状态
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    parent: '',
    status: '',
    type: '',
    category: ''
  })
  
  // 编辑表单状态
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingDictionary, setEditingDictionary] = useState<Dictionary | null>(null)
  const [editFormData, setEditFormData] = useState({
    key: '',
    parent: '',
    label_en: '',
    label_cn: '',
    value: '',
    status: 'active',
    type: '',
    category: '',
    sort_order: 0,
    is_system: false,
    description: '',
    metadata: '',
    data_type: '',
    default_value: '',
    validation: '',
    is_editable: true,
    created_by: '',
    updated_by: ''
  })
  
  // 删除确认对话框
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false)
  const [deletingDictionary, setDeletingDictionary] = useState<Dictionary | null>(null)

  // 获取数据字典列表
  const fetchDictionaries = async (page?: number, size?: number) => {
    setLoading(true)
    try {
      const params: DictionaryListRequest = {
        page: page || currentPage,
        size: size || pageSize,
        // 将关键字映射到key字段进行搜索
        key: searchParams.keyword || undefined,
        parent: searchParams.parent || undefined,
        status: searchParams.status || undefined,
        type: searchParams.type || undefined,
        category: searchParams.category || undefined
      }

      const result = await dictionaryService.getDictionaries(params)
      setDictionaries(result.records)
      setTotal(result.count)
      if (page) setCurrentPage(page)
      if (size) setPageSize(size)
    } catch (error: any) {
      toast.error(`获取数据字典列表失败: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 组件挂载时获取数据
  useEffect(() => {
    fetchDictionaries()
  }, [])

  // 搜索参数变化时自动搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1)
      fetchDictionaries(1, pageSize)
    }, 300) // 防抖
    
    return () => clearTimeout(timer)
  }, [searchParams, pageSize])

  // 重置搜索
  const handleReset = () => {
    setSearchParams({
      keyword: '',
      parent: '',
      status: '',
      type: '',
      category: ''
    })
  }

  // 打开创建/编辑模态框
  const openModal = (dictionary?: Dictionary) => {
    setEditingDictionary(dictionary || null)
    if (dictionary) {
      setEditFormData({
        key: dictionary.key || '',
        parent: dictionary.parent || '',
        label_en: dictionary.label_en || '',
        label_cn: dictionary.label_cn || '',
        value: dictionary.value || '',
        status: dictionary.status || 'active',
        type: dictionary.type || '',
        category: dictionary.category || '',
        sort_order: dictionary.sort_order || 0,
        is_system: dictionary.is_system || false,
        description: dictionary.description || '',
        metadata: dictionary.metadata || '',
        data_type: dictionary.data_type || '',
        default_value: dictionary.default_value || '',
        validation: dictionary.validation || '',
        is_editable: dictionary.is_editable !== false,
        created_by: dictionary.created_by || '',
        updated_by: ''
      })
    } else {
      setEditFormData({
        key: '',
        parent: '',
        label_en: '',
        label_cn: '',
        value: '',
        status: 'active',
        type: '',
        category: '',
        sort_order: 0,
        is_system: false,
        description: '',
        metadata: '',
        data_type: '',
        default_value: '',
        validation: '',
        is_editable: true,
        created_by: '',
        updated_by: ''
      })
    }
    setIsModalVisible(true)
  }

  // 关闭模态框
  const closeModal = () => {
    setIsModalVisible(false)
    setEditingDictionary(null)
  }

  // 保存数据字典
  const handleSave = async () => {
    try {
      if (editingDictionary) {
        // 更新
        const updateData: DictionaryUpdateRequest = { ...editFormData, id: editingDictionary.id }
        await dictionaryService.updateDictionary(editingDictionary.id, updateData)
        toast.success('更新成功')
      } else {
        // 创建
        const createData: DictionaryCreateRequest = editFormData
        await dictionaryService.createDictionary(createData)
        toast.success('创建成功')
      }
      
      closeModal()
      fetchDictionaries()
    } catch (error: any) {
      toast.error(`保存失败: ${error.message}`)
    }
  }

  // 删除数据字典
  const handleDelete = (dictionary: Dictionary) => {
    setDeletingDictionary(dictionary)
    setDeleteDialogVisible(true)
  }

  const confirmDelete = async () => {
    if (!deletingDictionary) return
    
    try {
      await dictionaryService.deleteDictionary(deletingDictionary.id)
      toast.success('删除成功')
      fetchDictionaries()
    } catch (error: any) {
      toast.error(`删除失败: ${error.message}`)
    } finally {
      setDeleteDialogVisible(false)
      setDeletingDictionary(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* 搜索和筛选区域 */}
      <Card>
        <CardHeader>
          <CardTitle>数据字典管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索键名..."
                  value={searchParams.keyword}
                  onChange={(e) => setSearchParams({...searchParams, keyword: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>
            <Input
              placeholder="父键"
              value={searchParams.parent}
              onChange={(e) => setSearchParams({...searchParams, parent: e.target.value})}
              className="w-full md:w-32"
            />
            <Select value={searchParams.status || undefined} onValueChange={(value) => setSearchParams({...searchParams, status: value || ''})}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">启用</SelectItem>
                <SelectItem value="inactive">禁用</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="类型"
              value={searchParams.type}
              onChange={(e) => setSearchParams({...searchParams, type: e.target.value})}
              className="w-full md:w-32"
            />
            <Input
              placeholder="分类"
              value={searchParams.category}
              onChange={(e) => setSearchParams({...searchParams, category: e.target.value})}
              className="w-full md:w-32"
            />
            <Button variant="outline" onClick={handleReset}>
              重置
            </Button>
            <Button onClick={() => openModal()} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              新增
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 表格区域 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>键名</TableHead>
                <TableHead>父键</TableHead>
                <TableHead>英文标签</TableHead>
                <TableHead>中文标签</TableHead>
                <TableHead>值</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>排序</TableHead>
                <TableHead>系统内置</TableHead>
                <TableHead>可编辑</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={13} className="text-center py-8">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : dictionaries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                dictionaries.map((dictionary) => (
                  <TableRow key={dictionary.id}>
                    <TableCell className="font-medium">{dictionary.key}</TableCell>
                    <TableCell>{dictionary.parent || '-'}</TableCell>
                    <TableCell>{dictionary.label_en || '-'}</TableCell>
                    <TableCell>{dictionary.label_cn || '-'}</TableCell>
                    <TableCell>{dictionary.value || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={dictionary.status === 'active' ? 'default' : 'secondary'}>
                        {dictionary.status === 'active' ? '启用' : '禁用'}
                      </Badge>
                    </TableCell>
                    <TableCell>{dictionary.type || '-'}</TableCell>
                    <TableCell>{dictionary.category || '-'}</TableCell>
                    <TableCell>{dictionary.sort_order}</TableCell>
                    <TableCell>
                      <Badge variant={dictionary.is_system ? 'destructive' : 'outline'}>
                        {dictionary.is_system ? '是' : '否'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={dictionary.is_editable ? 'default' : 'secondary'}>
                        {dictionary.is_editable ? '是' : '否'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(dictionary.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openModal(dictionary)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!dictionary.is_system && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(dictionary)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 分页信息 */}
      <div className="text-sm text-muted-foreground">
        共 {total} 条记录
      </div>

      {/* 编辑模态框 */}
      <Dialog open={isModalVisible} onOpenChange={setIsModalVisible}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingDictionary ? '编辑数据字典' : '新增数据字典'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key">键名 *</Label>
              <Input
                id="key"
                value={editFormData.key}
                onChange={(e) => setEditFormData({...editFormData, key: e.target.value})}
                placeholder="请输入键名"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="parent">父键</Label>
              <Input
                id="parent"
                value={editFormData.parent}
                onChange={(e) => setEditFormData({...editFormData, parent: e.target.value})}
                placeholder="请输入父键"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="label_en">英文标签</Label>
              <Input
                id="label_en"
                value={editFormData.label_en}
                onChange={(e) => setEditFormData({...editFormData, label_en: e.target.value})}
                placeholder="请输入英文标签"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="label_cn">中文标签</Label>
              <Input
                id="label_cn"
                value={editFormData.label_cn}
                onChange={(e) => setEditFormData({...editFormData, label_cn: e.target.value})}
                placeholder="请输入中文标签"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="value">值</Label>
              <Input
                id="value"
                value={editFormData.value}
                onChange={(e) => setEditFormData({...editFormData, value: e.target.value})}
                placeholder="请输入值"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">状态</Label>
              <Select value={editFormData.status} onValueChange={(value) => setEditFormData({...editFormData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">启用</SelectItem>
                  <SelectItem value="inactive">禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">类型</Label>
              <Input
                id="type"
                value={editFormData.type}
                onChange={(e) => setEditFormData({...editFormData, type: e.target.value})}
                placeholder="请输入类型"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">分类</Label>
              <Input
                id="category"
                value={editFormData.category}
                onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                placeholder="请输入分类"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sort_order">排序</Label>
              <Input
                id="sort_order"
                type="number"
                value={editFormData.sort_order}
                onChange={(e) => setEditFormData({...editFormData, sort_order: parseInt(e.target.value) || 0})}
                placeholder="请输入排序"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="created_by">创建者</Label>
              <Input
                id="created_by"
                value={editFormData.created_by}
                onChange={(e) => setEditFormData({...editFormData, created_by: e.target.value})}
                placeholder="请输入创建者"
              />
            </div>
            
            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                placeholder="请输入描述"
                className="min-h-[80px]"
              />
            </div>
            
            <div className="col-span-2 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_system"
                  checked={editFormData.is_system}
                  onCheckedChange={(checked) => setEditFormData({...editFormData, is_system: checked})}
                />
                <Label htmlFor="is_system">系统内置</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_editable"
                  checked={editFormData.is_editable}
                  onCheckedChange={(checked) => setEditFormData({...editFormData, is_editable: checked})}
                />
                <Label htmlFor="is_editable">可编辑</Label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={closeModal}>
              取消
            </Button>
            <Button onClick={handleSave}>
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={deleteDialogVisible}
        onOpenChange={setDeleteDialogVisible}
        title="确认删除"
        description={`确定要删除数据字典 "${deletingDictionary?.key}" 吗？此操作不可撤销。`}
        onConfirm={confirmDelete}
        variant="destructive"
        confirmText="删除"
        cancelText="取消"
      />
    </div>
  )
}

export default DictionaryManagement