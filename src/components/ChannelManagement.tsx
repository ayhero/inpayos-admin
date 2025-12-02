import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { ToastContainer } from './Toast';
import { toast } from '../utils/toast';
import { StatusBadge } from './StatusBadge';
import { ChannelService, ChannelData, ChannelListParams } from '../services/channelService';
import { formatTimestamp } from '../utils/dateUtils';
import { CHANNEL_CODE_OPTIONS, getChannelCodeLabel } from '../constants/business';

export function ChannelManagement() {
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<ChannelData | null>(null);
  
  // 搜索参数
  const [searchParams, setSearchParams] = useState({
    channel_code: '',
    account_id: '',
    status: ''
  });

  // 分页参数
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0
  });



  // 获取渠道列表
  const fetchChannels = useCallback(async () => {
    setLoading(true);
    try {
      const params: ChannelListParams = {
        page: pagination.page,
        size: pagination.size,
        ...(searchParams.channel_code && { channel_code: searchParams.channel_code }),
        ...(searchParams.account_id && { account_id: searchParams.account_id }),
        ...(searchParams.status && searchParams.status !== 'all' && { status: searchParams.status }),
      };

      const response = await ChannelService.getChannelList(params);
      
      if (response.success && response.data) {
        const { records, total, page, size } = response.data;
        setChannels(records || []);
        setPagination(prev => ({
          ...prev,
          total,
          page,
          size,
          totalPages: Math.ceil(total / size)
        }));
      } else {
        toast.error(response.message || '获取渠道列表失败');
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
      toast.error('获取渠道列表失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, searchParams]);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

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

  // 简化的编辑和删除处理（暂时只显示提示）
  const handleViewChannel = (channel: ChannelData) => {
    setSelectedChannel(channel);
    setShowDetailModal(true);
  };

  const handleEditChannel = (channel: ChannelData) => {
    console.log('Edit channel:', channel);
    toast.info('编辑功能开发中...');
  };

  const handleDeleteChannel = (channel: ChannelData) => {
    console.log('Delete channel:', channel);
    toast.info('删除功能开发中...');
  };

  const handleCreateChannel = () => {
    toast.info('创建功能开发中...');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">渠道管理</h1>
        <Button onClick={handleCreateChannel} className="gap-2">
          <Plus className="h-4 w-4" />
          新建
        </Button>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select
              value={searchParams.channel_code || 'all'}
              onValueChange={(value) => setSearchParams(prev => ({ ...prev, channel_code: value === 'all' ? '' : value }))}
            >
              <SelectTrigger className="flex-1 md:flex-initial md:w-64">
                <SelectValue placeholder="渠道" />
              </SelectTrigger>
              <SelectContent>
                {CHANNEL_CODE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex-1 md:flex-initial md:w-64">
              <Input
                placeholder="账户ID"
                value={searchParams.account_id}
                onChange={(e) => setSearchParams(prev => ({ ...prev, account_id: e.target.value }))}
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
              </SelectContent>
            </Select>

          </div>
        </CardContent>
      </Card>

      {/* 渠道列表 */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>渠道</TableHead>
                <TableHead>账户ID</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>支持包</TableHead>
                <TableHead>分组</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : channels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                channels.map((channel) => {
                  return (
                    <TableRow key={channel.id}>
                      <TableCell className="font-medium">{getChannelCodeLabel(channel.channel_code)}</TableCell>
                      <TableCell>{channel.account_id}</TableCell>
                      <TableCell><StatusBadge status={channel.status} type="account" /></TableCell>
                      <TableCell>
                        {channel.pkgs && Array.isArray(channel.pkgs) && channel.pkgs.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {channel.pkgs.map((pkg: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {pkg}
                              </Badge>
                            ))}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {channel.groups && Array.isArray(channel.groups) && channel.groups.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {channel.groups.map((group: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {group}
                              </Badge>
                            ))}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{formatTimestamp(channel.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewChannel(channel)}
                            className="text-gray-600 hover:text-gray-700"
                            title="查看"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditChannel(channel)}
                            className="text-blue-600 hover:text-blue-700"
                            title="编辑"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteChannel(channel)}
                            className="text-red-600 hover:text-red-700"
                            title="删除"
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

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              共 {pagination.total} 条记录
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
        </CardContent>
      </Card>

      {/* 渠道详情弹窗 */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent 
          className="max-h-[80vh] overflow-y-auto"
          style={{ width: '60vw', maxWidth: '60vw' }}
        >
          <DialogHeader>
            <DialogTitle>渠道详情</DialogTitle>
          </DialogHeader>
          {selectedChannel && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">渠道</label>
                  <p className="mt-1">{getChannelCodeLabel(selectedChannel.channel_code)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">账户ID</label>
                  <p className="mt-1">{selectedChannel.account_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">状态</label>
                  <div className="mt-1">
                    <StatusBadge status={selectedChannel.status} type="account" />
                  </div>
                </div>
                {selectedChannel.secret && (
                  <div className="col-span-3">
                    <label className="text-sm font-medium text-gray-500">密钥</label>
                    <p className="mt-1 font-mono text-sm bg-gray-50 p-2 rounded">
                      {selectedChannel.secret.replace(/./g, '*')}
                    </p>
                  </div>
                )}
                <div className="col-span-1">
                  <label className="text-sm font-medium text-gray-500">支持包</label>
                  <div className="mt-1">
                    {selectedChannel.pkgs && Array.isArray(selectedChannel.pkgs) && selectedChannel.pkgs.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedChannel.pkgs.map((pkg: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {pkg}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">无</span>
                    )}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">分组</label>
                  <div className="mt-1">
                    {selectedChannel.groups && Array.isArray(selectedChannel.groups) && selectedChannel.groups.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedChannel.groups.map((group: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {group}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">无</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">创建时间</label>
                  <p className="mt-1">{formatTimestamp(selectedChannel.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">更新时间</label>
                  <p className="mt-1">{formatTimestamp(selectedChannel.updated_at)}</p>
                </div>
                <div></div>
              </div>
              
              {selectedChannel.detail && (
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">详情</label>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-700 border-b w-1/4">键</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-700 border-b">值</th>
                          </tr>
                        </thead>
                        <tbody>
                          {typeof selectedChannel.detail === 'object' ? (
                            Object.entries(selectedChannel.detail).map(([key, value]) => (
                              <tr key={key} className="border-b last:border-b-0">
                                <td className="px-4 py-2 font-medium text-gray-600 bg-gray-25 w-1/4">{key}</td>
                                <td className="px-4 py-2 text-gray-800 w-3/4">
                                  <div className="max-h-32 max-w-full overflow-auto font-mono text-xs bg-gray-50 p-2 rounded">
                                    {typeof value === 'object' ? (
                                      <pre className="whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
                                    ) : (
                                      String(value)
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td className="px-4 py-2 text-gray-600" colSpan={2}>{String(selectedChannel.detail)}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                </div>
              )}
              
              {selectedChannel.settings && (
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">配置</label>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-700 border-b w-1/4">键</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-700 border-b">值</th>
                          </tr>
                        </thead>
                        <tbody>
                          {typeof selectedChannel.settings === 'object' ? (
                            Object.entries(selectedChannel.settings).map(([key, value]) => (
                              <tr key={key} className="border-b last:border-b-0">
                                <td className="px-4 py-2 font-medium text-gray-600 bg-gray-25 w-1/4">{key}</td>
                                <td className="px-4 py-2 text-gray-800 w-3/4">
                                  <div className="max-h-32 max-w-full overflow-auto font-mono text-xs bg-gray-50 p-2 rounded">
                                    {typeof value === 'object' ? (
                                      <pre className="whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
                                    ) : (
                                      String(value)
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td className="px-4 py-2 text-gray-600" colSpan={2}>{String(selectedChannel.settings)}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ToastContainer />
    </div>
  );
}