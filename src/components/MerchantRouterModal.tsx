import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, X, Save, Power, PowerOff } from 'lucide-react';
import { merchantService, Merchant, MerchantRouter } from '../services/merchantService';
import { routerService, CreateRouterParams } from '../services/routerService';
import { toast } from '../utils/toast';
import { UserTypeLabel } from './UserTypeLabel';
import { StatusBadge } from './StatusBadge';
import { Badge } from './ui/badge';
import { ConfirmDialog } from './ui/confirm-dialog';
import { MERCHANT_TRX_TYPE_OPTIONS, TRX_METHOD_OPTIONS, CCY_OPTIONS, COUNTRY_OPTIONS, CHANNEL_CODE_OPTIONS, getCcyLabel, getCountryLabel, getChannelCodeLabel } from '../constants/business';

interface MerchantRouterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchant: Merchant | null;
}

export function MerchantRouterModal({ open, onOpenChange, merchant }: MerchantRouterModalProps) {
  const [merchantRouters, setMerchantRouters] = useState<MerchantRouter[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddingRouter, setIsAddingRouter] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newRouter, setNewRouter] = useState<CreateRouterParams>({
    mid: '',
    trx_type: 'payin',
    trx_method: '',
    ccy: 'INR',
    country: 'IND',
    channel_code: '',
    priority: 100,
    status: 'active'
  });

  // 当弹窗打开时加载路由列表
  const loadRouters = useCallback(async () => {
    if (!merchant) return;
    
    setLoading(true);
    try {
      const response = await merchantService.getMerchantRouters({ mid: merchant.mid });
      if (response.success) {
        setMerchantRouters(response.data || []);
      } else {
        toast.error('获取商户路由失败', response.msg);
      }
    } catch (error) {
      console.error('获取商户路由失败:', error);
      toast.error('获取商户路由失败', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [merchant]);

  // 监听弹窗打开
  useEffect(() => {
    if (open && merchant) {
      loadRouters();
      setIsAddingRouter(false);
    }
  }, [open, merchant, loadRouters]);

  // 新增路由
  const handleAddNewRouter = () => {
    setIsAddingRouter(true);
    setNewRouter({
      mid: merchant?.mid || '',
      trx_type: 'payin',
      trx_method: '',
      ccy: 'INR',
      country: 'IND',
      channel_code: '',
      priority: 100,
      status: 'active'
    });
  };

  // 取消新增路由
  const handleCancelNewRouter = () => {
    setIsAddingRouter(false);
    setNewRouter({
      mid: '',
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
    if (!merchant || !newRouter.channel_code.trim()) {
      toast.error('保存失败', '渠道不能为空');
      return;
    }
    if (!newRouter.trx_type || !newRouter.trx_method) {
      toast.error('保存失败', '交易类型和支付方式不能为空');
      return;
    }
    setShowConfirm(true);
  };

  // 确认创建路由
  const confirmCreateRouter = async () => {
    if (!merchant) return;

    try {
      const response = await routerService.createMerchantRouter({
        ...newRouter,
        mid: merchant.mid
      });

      if (response.success) {
        toast.success('创建路由成功', '');
        handleCancelNewRouter();
        await loadRouters();
      } else {
        toast.error('创建路由失败', response.msg);
      }
    } catch (error) {
      console.error('创建路由失败:', error);
      toast.error('创建路由失败', '网络错误，请稍后重试');
    }
  };

  // 启用路由
  const handleEnableRouter = async (router: MerchantRouter) => {
    if (!router.id) return;
    
    try {
      const response = await routerService.updateMerchantRouterStatus(router.id, 'active');
      if (response.success) {
        toast.success('启用路由成功', '');
        await loadRouters();
      } else {
        toast.error('启用路由失败', response.msg);
      }
    } catch (error) {
      console.error('启用路由失败:', error);
      toast.error('启用路由失败', '网络错误，请稍后重试');
    }
  };

  // 禁用路由
  const handleDisableRouter = async (router: MerchantRouter) => {
    if (!router.id) return;
    
    try {
      const response = await routerService.updateMerchantRouterStatus(router.id, 'inactive');
      if (response.success) {
        toast.success('禁用路由成功', '');
        await loadRouters();
      } else {
        toast.error('禁用路由失败', response.msg);
      }
    } catch (error) {
      console.error('禁用路由失败:', error);
      toast.error('禁用路由失败', '网络错误，请稍后重试');
    }
  };

  // 格式化时间
  const formatDateTime = (timestamp: number) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString('zh-CN');
  };

  // 路由类型徽章
  const renderRouterTypeBadge = (router: MerchantRouter) => {
    if (!router.mid || router.mid === '') {
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">全局路由</Badge>;
    } else {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">专属路由</Badge>;
    }
  };

  // 交易类型显示
  const getTrxTypeDisplay = (trxType: string, trxMethod?: string) => {
    const typeMap: Record<string, string> = {
      'payin': '代收',
      'payout': '代付'
    };
    const methodMap: Record<string, string> = {
      'bankcard': '银行卡',
      'upi': 'UPI',
      'wallet': '钱包',
      'usdt': 'USDT'
    };
    
    let display = typeMap[trxType] || trxType;
    if (trxMethod) {
      display += ` - ${methodMap[trxMethod] || trxMethod}`;
    }
    return display;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[75vw] w-[75vw] min-w-[900px] max-h-[85vh] overflow-y-auto" style={{width: '75vw', maxWidth: '75vw'}}>
        <DialogHeader>
          <DialogTitle>路由管理</DialogTitle>
          <DialogDescription>
            <div className="flex items-center justify-between gap-2 mt-1">
              <div className="flex items-center gap-2">
                <UserTypeLabel type={merchant?.type || ''} />
                <span>{merchant?.name}</span>
                <span className="text-muted-foreground">({merchant?.mid})</span>
              </div>
              {!isAddingRouter && (
                <Button size="sm" onClick={handleAddNewRouter}>
                  <Plus className="h-4 w-4 mr-1" />
                  新建
                </Button>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">加载中...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>路由类型</TableHead>
                  <TableHead>交易类型</TableHead>
                  <TableHead>渠道</TableHead>
                  <TableHead>币种</TableHead>
                  <TableHead>国家</TableHead>
                  <TableHead>金额范围</TableHead>
                  <TableHead>优先级</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {merchantRouters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      暂无路由数据
                    </TableCell>
                  </TableRow>
                ) : (
                  merchantRouters.map((router, index) => (
                    <TableRow key={router.id || `router-${index}`}>
                      <TableCell>{renderRouterTypeBadge(router)}</TableCell>
                      <TableCell>{getTrxTypeDisplay(router.trx_type, router.trx_method)}</TableCell>
                      <TableCell>{getChannelCodeLabel(router.channel_code)}</TableCell>
                      <TableCell>{getCcyLabel(router.ccy || '')}</TableCell>
                      <TableCell>{getCountryLabel(router.country || '')}</TableCell>
                      <TableCell>
                        {router.min_amount && router.max_amount 
                          ? `${router.min_amount} - ${router.max_amount}`
                          : '-'
                        }
                      </TableCell>
                      <TableCell>{router.priority || 0}</TableCell>
                      <TableCell><StatusBadge status={router.status} type="account" /></TableCell>
                      <TableCell>{formatDateTime(router.created_at)}</TableCell>
                      <TableCell>
                        {router.mid && router.mid !== '' ? (
                          router.status === 'active' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDisableRouter(router)}
                              className="h-7 px-2 text-orange-600 hover:text-orange-700 hover:border-orange-600"
                            >
                              <PowerOff className="h-3 w-3 mr-1" />
                              禁用
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEnableRouter(router)}
                              className="h-7 px-2 text-green-600 hover:text-green-700 hover:border-green-600"
                            >
                              <Power className="h-3 w-3 mr-1" />
                              启用
                            </Button>
                          )
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
                
                {isAddingRouter && (
                  <TableRow>
                    <TableCell className="text-muted-foreground">专属路由</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Select
                          value={newRouter.trx_type}
                          onValueChange={(value) => setNewRouter({...newRouter, trx_type: value})}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MERCHANT_TRX_TYPE_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={newRouter.trx_method || 'all'}
                          onValueChange={(value) => setNewRouter({...newRouter, trx_method: value === 'all' ? '' : value})}
                        >
                          <SelectTrigger className="w-24">
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
                    </TableCell>
                    <TableCell>
                      <Select
                        value={newRouter.channel_code || 'all'}
                        onValueChange={(value) => setNewRouter({...newRouter, channel_code: value === 'all' ? '' : value})}
                      >
                        <SelectTrigger className="w-28">
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
                    </TableCell>
                    <TableCell>
                      <Select
                        value={newRouter.ccy || 'INR'}
                        onValueChange={(value) => setNewRouter({...newRouter, ccy: value})}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CCY_OPTIONS.filter(opt => opt.value !== 'all').map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={newRouter.country || 'IN'}
                        onValueChange={(value) => setNewRouter({...newRouter, country: value})}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRY_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 items-center">
                        <Input
                          type="number"
                          placeholder="最小"
                          value={newRouter.min_amount || ''}
                          onChange={(e) => setNewRouter({...newRouter, min_amount: parseFloat(e.target.value) || undefined})}
                          className="w-20"
                        />
                        <span>-</span>
                        <Input
                          type="number"
                          placeholder="最大"
                          value={newRouter.max_amount || ''}
                          onChange={(e) => setNewRouter({...newRouter, max_amount: parseFloat(e.target.value) || undefined})}
                          className="w-20"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={newRouter.priority}
                        onChange={(e) => setNewRouter({...newRouter, priority: parseInt(e.target.value) || 100})}
                        className="w-16"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newRouter.status === 'active'}
                          onChange={(e) => setNewRouter({...newRouter, status: e.target.checked ? 'active' : 'inactive'})}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span className="text-sm">启用</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" onClick={handleSaveNewRouter} className="h-7 px-2">
                          <Save className="h-3 w-3 mr-1" />
                          保存
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelNewRouter} className="h-7 px-2">
                          <X className="h-3 w-3 mr-1" />
                          取消
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="确认创建新路由？"
        description="请确认路由信息无误，创建后将立即生效"
        confirmText="确认创建"
        cancelText="取消"
        onConfirm={confirmCreateRouter}
      />
    </Dialog>
  );
}
