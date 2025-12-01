import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { routerService, RouterData, RouterListParams, CreateRouterParams } from '../services/routerService';
import { RefreshCw, Plus, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { toast } from '../utils/toast';
import { formatAmountRangeWithCurrency } from '../utils/amountRange';
import { 
  getTrxTypeLabel, 
  getChannelCodeLabel,
  getTrxMethodLabel,
  getCcyLabel,
  FLEET_TRX_TYPE_OPTIONS,
  TRX_METHOD_OPTIONS,
  CCY_OPTIONS,
  CHANNEL_CODE_OPTIONS,
  STATUS_OPTIONS,
} from '../constants/business';
import { getTrxTypeBadgeConfig } from '../constants/status';

export function FleetRouter() {
  const [routers, setRouters] = useState<RouterData[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedRouter, setSelectedRouter] = useState<RouterData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [routerToDelete, setRouterToDelete] = useState<RouterData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [ccyError, setCcyError] = useState(false);
  const [formData, setFormData] = useState<CreateRouterParams>({
    user_id: '',
    user_type: 'cashier_team',
    trx_type: '',
    trx_method: '',
    ccy: '',
    channel_code: '',
    channel_account: '',
    channel_group: '',
    min_amount: 0,
    max_amount: 0,
    priority: 0,
    status: 'inactive',
  });
  
  const [searchParams, setSearchParams] = useState({
    tid: '',
    trx_type: '',
    channel_code: '',
    status: ''
  });

  const fetchRouters = async () => {
    setLoading(true);
    try {
      const params: RouterListParams = {
        page: currentPage,
        size: pageSize,
        ...(searchParams.tid && { tid: searchParams.tid }),
        ...(searchParams.trx_type && { trx_type: searchParams.trx_type }),
        ...(searchParams.channel_code && { channel_code: searchParams.channel_code }),
        ...(searchParams.status && { status: searchParams.status })
      };

      const response = await routerService.listFleetRouters(params);
      if (response.success && response.data) {
        setRouters(response.data.records || []);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error('获取路由列表失败:', error);
      toast.error('获取路由列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async (router: RouterData) => {
    try {
      const response = await routerService.updateFleetRouterStatus(router.id, 'active');
      if (response.success) {
        toast.success('启用路由成功');
        fetchRouters();
      } else {
        toast.error(response.msg || '启用路由失败');
      }
    } catch (error) {
      console.error('启用路由失败:', error);
      toast.error('启用路由失败');
    }
  };

  const handleDisable = async (router: RouterData) => {
    try {
      const response = await routerService.updateFleetRouterStatus(router.id, 'inactive');
      if (response.success) {
        toast.success('禁用路由成功');
        fetchRouters();
      } else {
        toast.error(response.msg || '禁用路由失败');
      }
    } catch (error) {
      console.error('禁用路由失败:', error);
      toast.error('禁用路由失败');
    }
  };

  const handleEdit = (router: RouterData) => {
    setSelectedRouter(router);
    setFormData({
      tid: router.tid || '',
      pkg: router.pkg || '',
      did: router.did || '',
      trx_type: router.trx_type || '',
      trx_sub_type: router.trx_sub_type || '',
      trx_method: router.trx_method || '',
      trx_mode: router.trx_mode || '',
      trx_app: router.trx_app || '',
      ccy: router.ccy || '',
      country: router.country || '',
      min_amount: router.min_amount || 0,
      max_amount: router.max_amount || 0,
      min_usd_amount: router.min_usd_amount || 0,
      max_usd_amount: router.max_usd_amount || 0,
      channel_code: router.channel_code || '',
      channel_account: router.channel_account || '',
      channel_group: router.channel_group || '',
      priority: router.priority || 0,
      status: router.status || 'inactive',
    });
    setDialogOpen(true);
  };

  const handleDelete = (router: RouterData) => {
    setRouterToDelete(router);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!routerToDelete) return;
    
    try {
      const response = await routerService.deleteFleetRouter(routerToDelete.id);
      if (response.success) {
        toast.success('删除路由成功');
        fetchRouters();
      } else {
        toast.error(response.msg || '删除路由失败');
      }
    } catch (error) {
      console.error('删除路由失败:', error);
      toast.error('删除路由失败');
    } finally {
      setDeleteDialogOpen(false);
      setRouterToDelete(null);
    }
  };

  const handleAdd = () => {
    setSelectedRouter(null);
    setFormData({
      user_id: '',
      user_type: 'cashier_team',
      pkg: '',
      did: '',
      trx_type: '',
      trx_sub_type: '',
      trx_method: '',
      trx_mode: '',
      trx_app: '',
      ccy: '',
      country: '',
      min_amount: 0,
      max_amount: 0,
      min_usd_amount: 0,
      max_usd_amount: 0,
      channel_code: '',
      channel_account: '',
      channel_group: '',
      priority: 0,
      status: 'inactive',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    // 重置错误状态
    setCcyError(false);
    
    // 验证必填字段
    if (!formData.trx_type) {
      toast.error('请选择交易类型');
      return;
    }
    
    // 如果交易金额任一有值，货币单位必填
    const hasAmount = (formData.min_amount || 0) > 0 || (formData.max_amount || 0) > 0;
    if (hasAmount && !formData.ccy) {
      setCcyError(true);
      toast.error('已设置交易金额，请选择货币单位');
      return;
    }

    setIsCreating(true);
    try {
      const response = selectedRouter
        ? await routerService.updateFleetRouter({
            id: selectedRouter.id,
            ...formData
          })
        : await routerService.createFleetRouter(formData);
      
      if (response.success) {
        toast.success(selectedRouter ? '更新路由成功' : '创建路由成功');
        setDialogOpen(false);
        fetchRouters();
      } else {
        toast.error(response.msg || (selectedRouter ? '更新路由失败' : '创建路由失败'));
      }
    } catch (error) {
      console.error('提交失败:', error);
      toast.error(selectedRouter ? '更新路由失败' : '创建路由失败');
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    if (status === 'active') {
      return <Badge variant="default" className="bg-green-500">启用</Badge>;
    }
    return <Badge variant="secondary">禁用</Badge>;
  };

  useEffect(() => {
    fetchRouters();
  }, [currentPage]);

  // Auto-search when searchParams change
  useEffect(() => {
    setCurrentPage(1);
    fetchRouters();
  }, [searchParams.tid, searchParams.trx_type, searchParams.channel_code, searchParams.status]);

  const handleReset = () => {
    setSearchParams({
      tid: '',
      trx_type: '',
      channel_code: '',
      status: ''
    });
    setCurrentPage(1);
  };

  const formatDateTime = (timestamp?: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">车队路由</h1>
        <Button onClick={handleAdd} className="gap-2">
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
                placeholder="车队ID"
                value={searchParams.tid}
                onChange={(e) => setSearchParams({ ...searchParams, tid: e.target.value })}
                maxLength={50}
              />
            </div>
            <Select
              value={searchParams.trx_type || 'all'}
              onValueChange={(value) => setSearchParams({ ...searchParams, trx_type: value === 'all' ? '' : value })}
            >
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="交易类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有类型</SelectItem>
                {FLEET_TRX_TYPE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex-1 md:flex-initial md:w-48">
              <Input
                placeholder="通道编码"
                value={searchParams.channel_code}
                onChange={(e) => setSearchParams({ ...searchParams, channel_code: e.target.value })}
                maxLength={50}
              />
            </div>
            <Select
              value={searchParams.status || 'all'}
              onValueChange={(value) => setSearchParams({ ...searchParams, status: value === 'all' ? '' : value })}
            >
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                {STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleReset} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 路由列表 */}
      <Card>
        <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>车队</TableHead>
                  <TableHead>交易类型</TableHead>
                  <TableHead>支付方式</TableHead>
                  <TableHead>渠道</TableHead>
                  <TableHead>渠道账户</TableHead>
                  <TableHead>渠道组</TableHead>
                  <TableHead>交易金额</TableHead>
                  <TableHead>优先级</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : routers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  routers.map((router) => (
                    <TableRow key={router.id}>
                      <TableCell>{router.tid || '-'}</TableCell>
                      <TableCell>
                        {(() => {
                          const config = getTrxTypeBadgeConfig(router.trx_type || '');
                          return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
                        })()}
                      </TableCell>
                      <TableCell>{getTrxMethodLabel(router.trx_method)}</TableCell>
                      <TableCell>{getChannelCodeLabel(router.channel_code)}</TableCell>
                      <TableCell>{router.channel_account || '-'}</TableCell>
                      <TableCell>{router.channel_group || '-'}</TableCell>
                      <TableCell>
                        {formatAmountRangeWithCurrency(router.ccy, router.min_amount, router.max_amount, getCcyLabel)}
                      </TableCell>
                      <TableCell>{router.priority || '-'}</TableCell>
                      <TableCell>{getStatusBadge(router.status)}</TableCell>
                      <TableCell>{formatDateTime(router.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          {router.status === 'active' ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDisable(router)}
                              className="text-orange-600 hover:text-orange-700"
                              title="禁用"
                            >
                              <PowerOff className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEnable(router)}
                              className="text-green-600 hover:text-green-700"
                              title="启用"
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(router)}
                            className="text-blue-600 hover:text-blue-700"
                            title="编辑"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(router)}
                            className="text-red-600 hover:text-red-700"
                            title="删除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              共 {total} 条记录
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
              >
                上一页
              </Button>
              <div className="flex items-center gap-2 px-4">
                <span className="text-sm">
                  第 {currentPage} / {Math.ceil(total / pageSize) || 1} 页
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage >= Math.ceil(total / pageSize) || loading}
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="!w-[40vw] !max-w-[40vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRouter ? '编辑路由' : '新增路由'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* 第一行：车队ID、优先级、状态 */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-6">
                <Input
                  placeholder="车队ID（留空表示全局配置）"
                  value={formData.tid}
                  onChange={(e) => setFormData({ ...formData, tid: e.target.value })}
                />
              </div>
              <div className="col-span-3">
                <Input
                  type="number"
                  placeholder="优先级"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="col-span-3 flex items-center gap-2">
                <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer"
                  style={{ backgroundColor: formData.status === 'active' ? '#22c55e' : '#e5e7eb' }}
                  onClick={() => setFormData({ ...formData, status: formData.status === 'active' ? 'inactive' : 'active' })}
                >
                  <span 
                    className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    style={{ transform: formData.status === 'active' ? 'translateX(24px)' : 'translateX(4px)' }}
                  />
                </div>
                <span className={`text-sm font-medium ${formData.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                  {formData.status === 'active' ? '激活' : '禁用'}
                </span>
              </div>
            </div>

            {/* 支付方式模块 */}
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm">支付方式</h3>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  value={formData.trx_type}
                  onValueChange={(value) => setFormData({ ...formData, trx_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="交易类型（必填）" />
                  </SelectTrigger>
                  <SelectContent>
                    {FLEET_TRX_TYPE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={formData.trx_method || 'all'}
                  onValueChange={(value) => setFormData({ ...formData, trx_method: value === 'all' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="支付方式" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRX_METHOD_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 交易金额模块 */}
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm">交易金额</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Select
                    value={formData.ccy || 'all'}
                    onValueChange={(value) => {
                      setFormData({ ...formData, ccy: value === 'all' ? '' : value });
                      setCcyError(false);
                    }}
                  >
                    <SelectTrigger className={ccyError ? "border-red-500 border-2 focus:ring-red-500" : ""}>
                      <SelectValue placeholder="货币" />
                    </SelectTrigger>
                    <SelectContent>
                      {CCY_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {ccyError && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      请选择货币单位
                    </p>
                  )}
                </div>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="最小交易金额"
                  value={formData.min_amount}
                  onChange={(e) => setFormData({ ...formData, min_amount: parseFloat(e.target.value) || 0 })}
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="最大交易金额"
                  value={formData.max_amount}
                  onChange={(e) => setFormData({ ...formData, max_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* 目标渠道模块 */}
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm">目标渠道</h3>
              <div className="grid grid-cols-3 gap-4">
                <Select
                  value={formData.channel_code || 'all'}
                  onValueChange={(value) => setFormData({ ...formData, channel_code: value === 'all' ? '' : value })}
                >
                  <SelectTrigger>
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
                <Input
                  placeholder="渠道账户"
                  value={formData.channel_account}
                  onChange={(e) => setFormData({ ...formData, channel_account: e.target.value })}
                />
                <Input
                  placeholder="渠道组"
                  value={formData.channel_group}
                  onChange={(e) => setFormData({ ...formData, channel_group: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSubmit} disabled={isCreating}>
                {isCreating ? '提交中...' : '确定'}
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
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              确认删除路由
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 pt-2">
              <p className="text-base text-gray-700">您即将删除以下路由配置，此操作无法撤销：</p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2 text-sm">
                {routerToDelete?.tid && (
                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-700 min-w-[80px]">车队ID:</span>
                    <span className="text-gray-900">{routerToDelete.tid}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="font-semibold text-gray-700 min-w-[80px]">交易类型:</span>
                  <span className="text-gray-900">{getTrxTypeLabel(routerToDelete?.trx_type)}</span>
                </div>
                {routerToDelete?.trx_method && (
                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-700 min-w-[80px]">支付方式:</span>
                    <span className="text-gray-900">{getTrxMethodLabel(routerToDelete.trx_method)}</span>
                  </div>
                )}
                {routerToDelete?.channel_code && (
                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-700 min-w-[80px]">渠道:</span>
                    <span className="text-gray-900">{getChannelCodeLabel(routerToDelete.channel_code)}</span>
                  </div>
                )}
                {(routerToDelete?.ccy || routerToDelete?.min_amount || routerToDelete?.max_amount) && (
                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-700 min-w-[80px]">交易金额:</span>
                    <span className="text-gray-900">
                      {formatAmountRangeWithCurrency(routerToDelete?.ccy, routerToDelete?.min_amount, routerToDelete?.max_amount, getCcyLabel)}
                    </span>
                  </div>
                )}
              </div>
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
