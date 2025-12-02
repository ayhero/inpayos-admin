import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Plus, Search, RefreshCw, Edit, Trash2 } from 'lucide-react';
import { ToastContainer } from './Toast';
import { toast } from '../utils/toast';
import { ChannelService, ChannelData, ChannelListParams } from '../services/channelService';
import { formatTimestamp } from '../utils/dateUtils';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { CreateChannelModal } from './CreateChannelModal';
import { EditChannelModal } from './EditChannelModal';

interface ChannelManagementProps {}

export function ChannelManagement(props: ChannelManagementProps) {
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<ChannelData | null>(null);
  const [searchParams, setSearchParams] = useState({
    channel_code: '',
    account_id: '',
    status: 'all'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  });

  // 获取状态的样式配置
  const getStatusBadgeConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { variant: 'default' as const, label: '激活' };
      case 'inactive':
        return { variant: 'secondary' as const, label: '未激活' };
      case 'disabled':
        return { variant: 'destructive' as const, label: '禁用' };
      default:
        return { variant: 'outline' as const, label: status || '未知' };
    }
  };

  // 获取渠道列表
  const fetchChannels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: ChannelListParams = {
        page: pagination.page,
        size: pagination.size,
        channel_code: searchParams.channel_code || undefined,
        account_id: searchParams.account_id || undefined,
        status: searchParams.status === 'all' ? undefined : searchParams.status
      };

      const response = await ChannelService.getChannelList(params);
      if (response.success) {
        setChannels(response.data.records);
        setPagination(prev => ({
          ...prev,
          total: response.data.total,
          totalPages: Math.ceil(response.data.total / prev.size)
        }));
      } else {
        setError(response.message || '获取渠道列表失败');
        toast.error(response.message || '获取渠道列表失败');
      }
    } catch (error) {
      console.error('获取渠道列表失败:', error);
      setError('获取渠道列表失败');
      toast.error('获取渠道列表失败');
    }
    setLoading(false);
  }, [pagination.page, pagination.size, searchParams]);

  // 首次加载
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  // 搜索
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchChannels();
  };

  // 重置搜索条件
  const handleReset = () => {
    setSearchParams({
      channel_code: '',
      account_id: '',
      status: 'all'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // 页码变化
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // 页大小变化
  const handlePageSizeChange = (newSize: number) => {
    setPagination(prev => ({ ...prev, page: 1, size: newSize }));
  };

  // 创建渠道
  const handleCreateChannel = async (channelData: any) => {
    try {
      const response = await ChannelService.createChannel(channelData);
      if (response.success) {
        toast.success('渠道创建成功');
        setShowCreateModal(false);
        fetchChannels();
      } else {
        toast.error(response.message || '创建渠道失败');
      }
    } catch (error) {
      console.error('创建渠道失败:', error);
      toast.error('创建渠道失败');
    }
  };

  // 编辑渠道
  const handleEditChannel = (channel: ChannelData) => {
    setSelectedChannel(channel);
    setShowEditModal(true);
  };

  // 更新渠道
  const handleUpdateChannel = async (channelData: any) => {
    if (!selectedChannel) return;

    try {
      const response = await ChannelService.updateChannel(selectedChannel.id, channelData);
      if (response.success) {
        toast.success('渠道更新成功');
        setShowEditModal(false);
        setSelectedChannel(null);
        fetchChannels();
      } else {
        toast.error(response.message || '更新渠道失败');
      }
    } catch (error) {
      console.error('更新渠道失败:', error);
      toast.error('更新渠道失败');
    }
  };

  // 删除渠道
  const handleDeleteChannel = (channel: ChannelData) => {
    setSelectedChannel(channel);
    setShowDeleteConfirmation(true);
  };

  // 确认删除渠道
  const handleConfirmDelete = async () => {
    if (!selectedChannel) return;

    try {
      const response = await ChannelService.deleteChannel(selectedChannel.id);
      if (response.success) {
        toast.success('渠道删除成功');
        setShowDeleteConfirmation(false);
        setSelectedChannel(null);
        fetchChannels();
      } else {
        toast.error(response.message || '删除渠道失败');
      }
    } catch (error) {
      console.error('删除渠道失败:', error);
      toast.error('删除渠道失败');
    }
  };

  const renderPagination = () => {
    const startItem = (pagination.page - 1) * pagination.size + 1;
    const endItem = Math.min(pagination.page * pagination.size, pagination.total);

    return (
      <div className="flex items-center justify-between space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">
            显示 {startItem}-{endItem} 条，共 {pagination.total} 条
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={pagination.page === 1}
          >
            首页
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            上一页
          </Button>
          <span className="text-sm">
            第 {pagination.page} 页，共 {pagination.totalPages} 页
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            下一页
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.totalPages)}
            disabled={pagination.page === pagination.totalPages}
          >
            末页
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">渠道管理</h2>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              新增渠道
            </Button>
          </div>

          {/* 搜索条件 */}
          <div className="flex items-center space-x-4 mb-6">
            <Input
              placeholder="渠道代码"
              value={searchParams.channel_code}
              onChange={(e) => setSearchParams(prev => ({ ...prev, channel_code: e.target.value }))}
              className="w-48"
            />
            <Input
              placeholder="账户ID"
              value={searchParams.account_id}
              onChange={(e) => setSearchParams(prev => ({ ...prev, account_id: e.target.value }))}
              className="w-48"
            />
            <Select
              value={searchParams.status}
              onValueChange={(value) => setSearchParams(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">激活</SelectItem>
                <SelectItem value="inactive">未激活</SelectItem>
                <SelectItem value="disabled">禁用</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              搜索
            </Button>
            <Button variant="outline" onClick={handleReset}>
              重置
            </Button>
            <Button variant="outline" onClick={fetchChannels} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>

          {/* 渠道列表 */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>渠道代码</TableHead>
                  <TableHead>账户ID</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>支持包</TableHead>
                  <TableHead>分组</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : channels.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  channels.map((channel) => {
                    const statusConfig = getStatusBadgeConfig(channel.status);
                    return (
                      <TableRow key={channel.id}>
                        <TableCell className="font-medium">{channel.id}</TableCell>
                        <TableCell>{channel.channel_code}</TableCell>
                        <TableCell>{channel.account_id}</TableCell>
                        <TableCell>
                          <Badge variant={statusConfig.variant}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {channel.pkgs && channel.pkgs.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {channel.pkgs.map((pkg, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {pkg}
                                </Badge>
                              ))}
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {channel.groups && channel.groups.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {channel.groups.map((group, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {group}
                                </Badge>
                              ))}
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell>{formatTimestamp(channel.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditChannel(channel)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteChannel(channel)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页 */}
          {channels.length > 0 && (
            <div className="mt-4">
              {renderPagination()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 创建渠道模态框 */}
      <CreateChannelModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateChannel}
      />

      {/* 编辑渠道模态框 */}
      <EditChannelModal
        open={showEditModal}
        channel={selectedChannel}
        onClose={() => {
          setShowEditModal(false);
          setSelectedChannel(null);
        }}
        onSubmit={handleUpdateChannel}
      />

      {/* 删除确认对话框 */}
      <DeleteConfirmationDialog
        open={showDeleteConfirmation}
        title="删除渠道"
        description={`确定要删除渠道 "${selectedChannel?.channel_code}" 吗？此操作无法撤销。`}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setSelectedChannel(null);
        }}
        onConfirm={handleConfirmDelete}
      />
      
      <ToastContainer />
    </div>
  );
}