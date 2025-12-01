import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Plus, X, Save, Power, PowerOff, RefreshCw } from 'lucide-react';
import { merchantService, MerchantRouter } from '../services/merchantService';
import { routerService, CreateRouterParams } from '../services/routerService';
import { toast } from '../utils/toast';
import { formatAmountRange } from '../utils/amountRange';
import { UserTypeLabel } from './UserTypeLabel';
import { Badge } from './ui/badge';
import { ConfirmDialog } from './ui/confirm-dialog';
import { MERCHANT_TRX_TYPE_OPTIONS, TRX_METHOD_OPTIONS, CCY_OPTIONS, COUNTRY_OPTIONS, CHANNEL_CODE_OPTIONS, getCcyLabel, getCountryLabel, getChannelCodeLabel } from '../constants/business';
import { getTrxTypeBadgeConfig } from '../constants/status';

interface UserRouterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  userType: 'merchant' | 'cashier_team';
}

export function UserRouterModal({ open, onOpenChange, userId, userName, userType }: UserRouterModalProps) {
  const [routers, setRouters] = useState<MerchantRouter[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddingRouter, setIsAddingRouter] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [routerToDelete, setRouterToDelete] = useState<number | null>(null);
  const [newRouter, setNewRouter] = useState<CreateRouterParams>({
    user_id: '',
    user_type: 'merchant',
    trx_type: 'payin',
    trx_method: '',
    ccy: 'INR',
    country: 'IND',
    channel_code: '',
    priority: 100,
    status: 'active'
  });

  // 加载路由列表
  const loadRouters = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await merchantService.getMerchantRouters({ user_id: userId, user_type: userType });
      if (response.success) {
        setRouters(response.data || []);
      } else {
        toast.error('获取路由失败', response.msg);
      }
    } catch (error) {
      console.error('获取路由失败:', error);
      toast.error('获取路由失败', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [userId, userType]);

  // 监听弹窗打开
  useEffect(() => {
    if (open && userId) {
      loadRouters();
      setIsAddingRouter(false);
    }
  }, [open, userId, loadRouters]);

  // 新增路由
  const handleAddNewRouter = () => {
    setIsAddingRouter(true);
    setNewRouter({
      user_id: userId,
      user_type: userType,
      trx_type: 'payin',
      trx_method: '',
      ccy: 'INR',
      country: 'IND',
      channel_code: '',
      priority: 100,
      status: 'active'
    });
  };

  // 取消新增
  const handleCancelNewRouter = () => {
    setIsAddingRouter(false);
    setNewRouter({
      user_id: '',
      user_type: 'merchant',
      trx_type: 'payin',
      trx_method: '',
      ccy: 'INR',
      country: 'IND',
      channel_code: '',
      priority: 100,
      status: 'active'
    });
  };

  // 保存新路由
  const handleSaveNewRouter = () => {
    if (!userId || !newRouter.channel_code.trim()) {
      toast.error('保存失败', '渠道不能为空');
      return;
    }
    setShowConfirm(true);
  };

  const confirmSaveRouter = async () => {
    try {
      const response = userType === 'merchant' 
        ? await routerService.createMerchantRouter(newRouter)
        : await routerService.createFleetRouter(newRouter);
      if (response.success) {
        toast.success('新增路由成功');
        setIsAddingRouter(false);
        loadRouters();
      } else {
        toast.error('新增路由失败', response.msg);
      }
    } catch (error) {
      console.error('新增路由失败:', error);
      toast.error('新增路由失败', '网络错误，请稍后重试');
    } finally {
      setShowConfirm(false);
    }
  };

  // 切换路由状态
  const toggleRouterStatus = async (router: MerchantRouter) => {
    try {
      const newStatus = router.status === 'active' ? 'inactive' : 'active';
      const response = await routerService.updateMerchantRouterStatus(router.id, newStatus);
      if (response.success) {
        toast.success(`路由已${newStatus === 'active' ? '启用' : '停用'}`);
        loadRouters();
      } else {
        toast.error('更新状态失败', response.msg);
      }
    } catch (error) {
      console.error('更新路由状态失败:', error);
      toast.error('更新路由状态失败', '网络错误，请稍后重试');
    }
  };

  // 删除路由
  const handleDeleteRouter = (routerId: number) => {
    setRouterToDelete(routerId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteRouter = async () => {
    if (!routerToDelete) return;
    
    try {
      const response = await routerService.deleteMerchantRouter(routerToDelete);
      if (response.success) {
        toast.success('删除路由成功');
        loadRouters();
      } else {
        toast.error('删除路由失败', response.msg);
      }
    } catch (error) {
      console.error('删除路由失败:', error);
      toast.error('删除路由失败', '网络错误，请稍后重试');
    } finally {
      setShowDeleteConfirm(false);
      setRouterToDelete(null);
    }
  };

  const formatDateTime = (timestamp: number) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none w-[1200px] max-h-[90vh] overflow-hidden" style={{width: '1200px', maxWidth: '1200px'}}>
        <DialogHeader>
          <DialogTitle>路由管理</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2">
              <UserTypeLabel type={userType} />
              <span>{userName}</span>
              <span className="text-muted-foreground">({userId})</span>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleAddNewRouter} disabled={isAddingRouter} className="h-9">
              <Plus className="h-4 w-4 mr-1" />
              新建
            </Button>
            <Button size="sm" variant="outline" onClick={loadRouters} className="h-9">
              <RefreshCw className="h-4 w-4 mr-1" />
              刷新
            </Button>
          </div>

          <div className="overflow-x-auto max-h-[60vh]">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>路由类型</TableHead>
                  <TableHead>交易类型</TableHead>
                  <TableHead>渠道</TableHead>
                  <TableHead>交易金额</TableHead>
                  <TableHead>国家</TableHead>
                  <TableHead>优先级</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isAddingRouter && (
                  <TableRow>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                        专属路由
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Select value={newRouter.trx_type} onValueChange={(value) => setNewRouter({...newRouter, trx_type: value})}>
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MERCHANT_TRX_TYPE_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={newRouter.trx_method} onValueChange={(value) => setNewRouter({...newRouter, trx_method: value})}>
                          <SelectTrigger className="w-20">
                            <SelectValue placeholder="UPI" />
                          </SelectTrigger>
                          <SelectContent>
                            {TRX_METHOD_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select value={newRouter.channel_code} onValueChange={(value) => setNewRouter({...newRouter, channel_code: value})}>
                        <SelectTrigger className="w-28">
                          <SelectValue placeholder="选择渠道" />
                        </SelectTrigger>
                        <SelectContent>
                          {CHANNEL_CODE_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select value={newRouter.ccy} onValueChange={(value) => setNewRouter({...newRouter, ccy: value})}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CCY_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select value={newRouter.country} onValueChange={(value) => setNewRouter({...newRouter, country: value})}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRY_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 items-center whitespace-nowrap">
                        <Input
                          type="number"
                          className="w-16"
                          placeholder="最小"
                          value={newRouter.min_amount || ''}
                          onChange={(e) => setNewRouter({...newRouter, min_amount: parseInt(e.target.value) || undefined})}
                        />
                        <span className="text-xs">-</span>
                        <Input
                          type="number"
                          className="w-16"
                          placeholder="最大"
                          value={newRouter.max_amount || ''}
                          onChange={(e) => setNewRouter({...newRouter, max_amount: parseInt(e.target.value) || undefined})}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="w-16"
                        value={newRouter.priority}
                        onChange={(e) => setNewRouter({...newRouter, priority: parseInt(e.target.value) || 100})}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Checkbox
                          id="new-router-status"
                          checked={newRouter.status === 'active'}
                          onCheckedChange={(checked) => setNewRouter({...newRouter, status: checked ? 'active' : 'inactive'})}
                        />
                        <Label htmlFor="new-router-status" className="ml-2 text-xs cursor-pointer">
                          激活
                        </Label>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">-</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={handleSaveNewRouter} title="保存">
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleCancelNewRouter} title="取消">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {routers.map((router) => {
                  // 判断是否为专属路由（属于当前用户）
                  const isExclusiveRouter = router.user_id && router.user_id === userId;
                  
                  return (
                    <TableRow key={router.id}>
                      <TableCell>
                        {!router.user_id || router.user_id === '' ? (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                            全局路由
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                            专属路由
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const config = getTrxTypeBadgeConfig(router.trx_type || '');
                          return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
                        })()}
                        {router.trx_method && <span className="ml-2 text-muted-foreground">- {router.trx_method.toUpperCase()}</span>}
                      </TableCell>
                      <TableCell>{getChannelCodeLabel(router.channel_code)}</TableCell>
                      <TableCell>
                        <div>
                          <div>{getCcyLabel(router.ccy || '')}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatAmountRange(router.min_amount, router.max_amount)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getCountryLabel(router.country || '')}</TableCell>
                      <TableCell>{router.priority || 0}</TableCell>
                      <TableCell>
                        {router.status === 'active' ? (
                          <Badge variant="default" className="bg-green-500">启用</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-500">禁用</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">{formatDateTime(router.created_at)}</TableCell>
                      <TableCell>
                        {isExclusiveRouter && (
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => toggleRouterStatus(router)}
                              title={router.status === 'active' ? '停用' : '启用'}
                            >
                              {router.status === 'active' ? 
                                <PowerOff className="h-4 w-4 text-orange-500" /> : 
                                <Power className="h-4 w-4 text-green-500" />
                              }
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDeleteRouter(router.id)}
                              title="删除"
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {!loading && !isAddingRouter && routers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      暂无路由数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="确认新增路由"
        description={`确定要为${userType === 'merchant' ? '商户' : '车队'} ${userName} 新增路由吗？`}
        onConfirm={confirmSaveRouter}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="确认删除路由"
        description="确定要删除这条路由吗？此操作不可恢复。"
        onConfirm={confirmDeleteRouter}
      />
    </Dialog>
  );
}
