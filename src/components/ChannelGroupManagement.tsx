import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Plus, Edit, Trash2, Eye, Trash, PlusCircle, RefreshCw } from 'lucide-react';
import { toast } from '../utils/toast';
import { StatusBadge } from './StatusBadge';
import { 
  ChannelGroupService, 
  ChannelGroupData, 
  ChannelGroupListParams,
  CreateChannelGroupData,
  GroupMember
} from '../services/channelGroupService';
import { formatTimestamp } from '../utils/dateUtils';

export function ChannelGroupManagement() {
  const [channelGroups, setChannelGroups] = useState<ChannelGroupData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [channelGroupToDelete, setChannelGroupToDelete] = useState<ChannelGroupData | null>(null);
  const [selectedChannelGroup, setSelectedChannelGroup] = useState<ChannelGroupData | null>(null);
  const [formData, setFormData] = useState<CreateChannelGroupData>({
    code: '',
    name: '',
    status: 'active',
    setting: {
      strategy: '',
      weight: '0',
      rank_type: '',
      time_index: '0',
      data_index: '0',
      timezone: ''
    },
    members: []
  });
  
  // 搜索参数
  const [searchParams, setSearchParams] = useState({
    code: '',
    name: '',
    status: ''
  });

  // 分页参数
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0
  });

  // 获取渠道组列表
  const fetchChannelGroups = useCallback(async () => {
    setLoading(true);
    try {
      const params: ChannelGroupListParams = {
        page: pagination.page,
        size: pagination.size,
        ...(searchParams.code && { code: searchParams.code }),
        ...(searchParams.name && { name: searchParams.name }),
        ...(searchParams.status && searchParams.status !== 'all' && { status: searchParams.status }),
      };

      const response = await ChannelGroupService.getChannelGroupList(params);
      
      if (response.success && response.data) {
        const { records, total, page, size } = response.data;
        setChannelGroups(records || []);
        setPagination(prev => ({
          ...prev,
          total,
          page,
          size,
          totalPages: Math.ceil(total / size)
        }));
      } else {
        toast.error(response.message || '获取渠道组列表失败');
      }
    } catch (error) {
      console.error('Error fetching channel groups:', error);
      toast.error('获取渠道组列表失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, searchParams]);

  useEffect(() => {
    fetchChannelGroups();
  }, [fetchChannelGroups]);

  // 输入即搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchParams]);

  // 页面切换
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // 查看详情
  const handleViewChannelGroup = (channelGroup: ChannelGroupData) => {
    setSelectedChannelGroup(channelGroup);
    setShowDetailModal(true);
  };

  // 编辑渠道组
  const handleEditChannelGroup = (channelGroup: ChannelGroupData) => {
    setSelectedChannelGroup(channelGroup);
    setFormData({
      code: channelGroup.code,
      name: channelGroup.name,
      status: channelGroup.status,
      setting: channelGroup.setting || {
        strategy: '',
        weight: '0',
        rank_type: '',
        time_index: '0',
        data_index: '0',
        timezone: ''
      },
      members: channelGroup.members || []
    });
    setShowEditModal(true);
  };

  // 删除组
  const handleDeleteChannelGroup = (channelGroup: ChannelGroupData) => {
    setChannelGroupToDelete(channelGroup);
    setDeleteDialogOpen(true);
  };

  // 确认删除
  const confirmDelete = async () => {
    if (!channelGroupToDelete) return;
    
    try {
      const response = await ChannelGroupService.deleteChannelGroup(channelGroupToDelete.id);
      if (response.success) {
        toast.success('删除成功');
        fetchChannelGroups();
      } else {
        toast.error(response.message || '删除失败');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('删除失败');
    } finally {
      setDeleteDialogOpen(false);
      setChannelGroupToDelete(null);
    }
  };

  // 表单提交处理
  const handleFormSubmit = async () => {
    try {
      if (selectedChannelGroup) {
        // 编辑模式
        const response = await ChannelGroupService.updateChannelGroup(selectedChannelGroup.id, formData);
        if (response.success) {
          toast.success('更新成功');
          setShowEditModal(false);
          fetchChannelGroups();
        } else {
          toast.error(response.message || '更新失败');
        }
      } else {
        // 创建模式
        const response = await ChannelGroupService.createChannelGroup(formData);
        if (response.success) {
          toast.success('创建成功');
          setShowCreateModal(false);
          fetchChannelGroups();
        } else {
          toast.error(response.message || '创建失败');
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('操作失败');
    }
  };

  // 添加成员
  const addMember = () => {
    setFormData(prev => ({
      ...prev,
      members: [...(prev.members || []), { member: '', target: 0, current: 0, distance: 0, weight: 0 }]
    }));
  };

  // 删除成员
  const removeMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members?.filter((_, i) => i !== index) || []
    }));
  };

  // 更新成员
  const updateMember = (index: number, field: keyof GroupMember, value: string | number) => {
    setFormData(prev => {
      const newMembers = [...(prev.members || [])];
      newMembers[index] = { ...newMembers[index], [field]: value };
      return { ...prev, members: newMembers };
    });
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      status: 'active',
      setting: {
        strategy: '',
        weight: '0',
        rank_type: '',
        time_index: '0',
        data_index: '0',
        timezone: ''
      },
      members: []
    });
    setSelectedChannelGroup(null);
  };

  // 打开创建弹窗
  const handleOpenCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">渠道组</h1>
        <Button onClick={handleOpenCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          新建
        </Button>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 md:flex-initial md:w-64">
              <Input
                placeholder="编码"
                value={searchParams.code}
                onChange={(e) => setSearchParams(prev => ({ ...prev, code: e.target.value }))}
                maxLength={50}
              />
            </div>
            <div className="flex-1 md:flex-initial md:w-64">
              <Input
                placeholder="名称"
                value={searchParams.name}
                onChange={(e) => setSearchParams(prev => ({ ...prev, name: e.target.value }))}
                maxLength={50}
              />
            </div>
            <Select
              value={searchParams.status || 'all'}
              onValueChange={(value) => setSearchParams(prev => ({ ...prev, status: value === 'all' ? '' : value }))}
            >
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="active">启用</SelectItem>
                <SelectItem value="inactive">禁用</SelectItem>
                <SelectItem value="maintenance">维护</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => setSearchParams({ code: '', name: '', status: '' })}
              className="w-full md:w-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 组列表 */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>编码</TableHead>
                <TableHead>名称</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>成员数量</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : channelGroups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                channelGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.code}</TableCell>
                    <TableCell>{group.name}</TableCell>
                    <TableCell>
                      <StatusBadge status={group.status} />
                    </TableCell>
                    <TableCell>{group.members?.length || 0}</TableCell>
                    <TableCell>{formatTimestamp(group.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewChannelGroup(group)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditChannelGroup(group)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {group.status !== 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteChannelGroup(group)}
                            className="text-red-500 hover:text-red-700"
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

          {/* 分页 */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                共 {pagination.total} 条记录，第 {pagination.page} 页，共 {pagination.totalPages} 页
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 详情弹窗 */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>详情</DialogTitle>
          </DialogHeader>
          {selectedChannelGroup && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">编码</label>
                  <p>{selectedChannelGroup.code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">名称</label>
                  <p>{selectedChannelGroup.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">状态</label>
                  <p><StatusBadge status={selectedChannelGroup.status} /></p>
                </div>
              </div>

              {selectedChannelGroup.setting && (
                <div>
                  <label className="text-sm font-medium">配置信息</label>
                  <div className="mt-2 p-3 bg-gray-50 rounded">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>策略: {selectedChannelGroup.setting.strategy || 'N/A'}</div>
                      <div>权重: {selectedChannelGroup.setting.weight || 0}</div>
                      <div>排序类型: {selectedChannelGroup.setting.rank_type || 'N/A'}</div>
                      <div>时间索引: {selectedChannelGroup.setting.time_index || 0}</div>
                      <div>数据索引: {selectedChannelGroup.setting.data_index || 0}</div>
                      <div>时区: {selectedChannelGroup.setting.timezone || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              )}

              {selectedChannelGroup.members && selectedChannelGroup.members.length > 0 && (
                <div>
                  <label className="text-sm font-medium">成员列表</label>
                  <div className="mt-2 space-y-2">
                    {selectedChannelGroup.members.map((member, index) => (
                      <div key={index} className="p-3 border rounded bg-gray-50">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>成员: {member.member}</div>
                          <div>目标: {member.target || 0}</div>
                          <div>当前: {member.current || 0}</div>
                          <div>距离: {member.distance || 0}</div>
                          <div>权重: {member.weight || 0}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">创建时间</label>
                  <p>{formatTimestamp(selectedChannelGroup.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">更新时间</label>
                  <p>{formatTimestamp(selectedChannelGroup.updated_at)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 创建/编辑弹窗 */}
      <Dialog open={showCreateModal || showEditModal} onOpenChange={(open) => {
        if (!open) {
          setShowCreateModal(false);
          setShowEditModal(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedChannelGroup ? '编辑渠道组' : '新增渠道组'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* 基本信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="请输入编码 *"
                />
              </div>
              <div>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="请输入名称 *"
                />
              </div>
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.status === 'active'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'active' : 'inactive' }))}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">启用状态</span>
                </label>
              </div>
            </div>

            {/* 配置信息 */}
            <div>
              <label className="text-sm font-medium">配置信息</label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Input
                    value={formData.setting?.strategy || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      setting: { ...prev.setting, strategy: e.target.value }
                    }))}
                    placeholder="策略"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    value={formData.setting?.weight || '0'}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      setting: { ...prev.setting, weight: e.target.value }
                    }))}
                    placeholder="权重"
                  />
                </div>
                <div>
                  <Input
                    value={formData.setting?.rank_type || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      setting: { ...prev.setting, rank_type: e.target.value }
                    }))}
                    placeholder="排序类型"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    value={formData.setting?.time_index || '0'}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      setting: { ...prev.setting, time_index: e.target.value }
                    }))}
                    placeholder="时间索引"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    value={formData.setting?.data_index || '0'}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      setting: { ...prev.setting, data_index: e.target.value }
                    }))}
                    placeholder="数据索引"
                  />
                </div>
                <div>
                  <Input
                    value={formData.setting?.timezone || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      setting: { ...prev.setting, timezone: e.target.value }
                    }))}
                    placeholder="时区"
                  />
                </div>
              </div>
            </div>

            {/* 成员管理 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">成员列表</label>
                <Button type="button" variant="outline" size="sm" onClick={addMember}>
                  <PlusCircle className="h-4 w-4 mr-1" />
                  添加成员
                </Button>
              </div>
              <div className="space-y-2">
                {formData.members?.map((member, index) => (
                  <div key={index} className="grid grid-cols-6 gap-2 p-2 border rounded">
                    <Input
                      value={member.member || ''}
                      onChange={(e) => updateMember(index, 'member', e.target.value)}
                      placeholder="成员编码"
                    />
                    <Input
                      type="number"
                      value={member.target || 0}
                      onChange={(e) => updateMember(index, 'target', Number(e.target.value))}
                      placeholder="目标"
                    />
                    <Input
                      type="number"
                      value={member.current || 0}
                      onChange={(e) => updateMember(index, 'current', Number(e.target.value))}
                      placeholder="当前"
                    />
                    <Input
                      type="number"
                      value={member.distance || 0}
                      onChange={(e) => updateMember(index, 'distance', Number(e.target.value))}
                      placeholder="距离"
                    />
                    <Input
                      type="number"
                      value={member.weight || 0}
                      onChange={(e) => updateMember(index, 'weight', Number(e.target.value))}
                      placeholder="权重"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMember(index)}
                      className="text-red-500"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(!formData.members || formData.members.length === 0) && (
                  <div className="text-center text-gray-500 py-4">暂无成员，点击"添加成员"添加</div>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                resetForm();
              }}>
                取消
              </Button>
              <Button onClick={handleFormSubmit}>
                {selectedChannelGroup ? '更新' : '创建'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              确认删除渠道组
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 pt-2">
              <p className="text-base text-gray-700">您即将删除以下渠道组，此操作无法撤销：</p>
              {channelGroupToDelete && (
                <div className="bg-muted p-3 rounded-md text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">渠道组名称:</span>
                    <span className="font-semibold">{channelGroupToDelete.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">渠道组代码:</span>
                    <span className="font-mono">{channelGroupToDelete.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">状态:</span>
                    <StatusBadge status={channelGroupToDelete.status} />
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">成员数量:</span>
                    <span>{channelGroupToDelete.members?.length || 0} 个</span>
                  </div>
                </div>
              )}
              <p className="text-sm text-orange-600 mt-3">
                ⚠️ 删除后该渠道组的所有配置将丢失，请确认是否继续。
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}