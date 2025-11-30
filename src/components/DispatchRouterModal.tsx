import { useState, useEffect, useCallback, Fragment } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { RefreshCw, AlertCircle, ChevronDown, ChevronUp, Plus, Edit, Trash2, Power, PowerOff, Check, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
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
import { dispatchRouterService, DispatchRouter, SaveDispatchRouterParams } from '../services/dispatchRouterService';
import { dispatchStrategyService, DispatchStrategy } from '../services/dispatchStrategyService';
import { toast } from '../utils/toast';
import { UserTypeLabel } from './UserTypeLabel';
import { 
  getCcyLabel, 
  getCountryLabel,
  CASHIER_TRX_TYPE_OPTIONS,
  TRX_METHOD_OPTIONS,
  CCY_OPTIONS,
  COUNTRY_OPTIONS,
} from '../constants/business';

interface DispatchRouterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  userType: 'merchant' | 'cashier_team';
}

export function DispatchRouterModal({ open, onOpenChange, userId, userName, userType }: DispatchRouterModalProps) {
  const [routers, setRouters] = useState<DispatchRouter[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [routerToDelete, setRouterToDelete] = useState<DispatchRouter | null>(null);
  const [strategies, setStrategies] = useState<DispatchStrategy[]>([]);
  const [editFormData, setEditFormData] = useState<SaveDispatchRouterParams | null>(null);

  // 加载派单路由列表
  const loadDispatchRouters = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await dispatchRouterService.getDispatchRouters({ user_id: userId, user_type: 'cashier_team' });
      console.log('派单路由响应:', response);
      if (response.success) {
        console.log('派单路由数据:', response.data);
        setRouters(response.data || []);
      } else {
        toast.error('获取派单路由失败', response.msg);
      }
    } catch (error) {
      console.error('获取派单路由失败:', error);
      toast.error('获取派单路由失败', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [userId, userType]);

  // 监听弹窗打开
  useEffect(() => {
    if (open && userId) {
      loadDispatchRouters();
      setExpandedId(null); // 重置展开状态
    }
  }, [open, userId, loadDispatchRouters]);

  // 切换展开/收起
  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // 新增路由
  const handleAdd = () => {
    // 添加一个新的编辑行
    const newRouter: Partial<DispatchRouter> = {
      id: -Date.now(), // 使用负数临时ID
      code: '',
      user_id: userId,
      user_type: userType,
      strategy_code: '',
      trx_type: '',
      trx_method: '',
      trx_ccy: '',
      country: '',
      status: 'active',
      priority: 0,
      daily_start_time: 0,
      daily_end_time: 0,
      start_at: 0,
      expired_at: 0,
      created_at: Date.now(),
      updated_at: Date.now(),
    };
    
    setRouters([newRouter as DispatchRouter, ...routers]);
    setEditingId(newRouter.id!);
    setEditFormData({
      user_id: userId,
      user_type: userType,
      strategy_code: '',
      trx_type: '',
      trx_method: '',
      trx_ccy: '',
      country: '',
      status: 'active',
      priority: 0,
    });
    loadStrategies();
  };

  // 编辑路由
  const handleEdit = (router: DispatchRouter, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(router.id);
    setEditFormData({
      id: router.id > 0 ? router.id : undefined,
      user_id: userId,
      user_type: userType,
      strategy_code: router.strategy_code || '',
      trx_type: router.trx_type || '',
      trx_mode: router.trx_mode,
      trx_method: router.trx_method || '',
      trx_ccy: router.trx_ccy || '',
      country: router.country || '',
      min_amount: router.min_amount ? parseFloat(String(router.min_amount)) : undefined,
      max_amount: router.max_amount ? parseFloat(String(router.max_amount)) : undefined,
      min_usd_amount: router.min_usd_amount ? parseFloat(String(router.min_usd_amount)) : undefined,
      max_usd_amount: router.max_usd_amount ? parseFloat(String(router.max_usd_amount)) : undefined,
      start_at: router.start_at,
      expired_at: router.expired_at,
      daily_start_time: router.daily_start_time,
      daily_end_time: router.daily_end_time,
      status: router.status || 'active',
      priority: router.priority || 0,
    });
    loadStrategies();
  };

  // 取消编辑
  const handleCancelEdit = (routerId: number) => {
    if (routerId < 0) {
      // 如果是新增的行，删除它
      setRouters(routers.filter(r => r.id !== routerId));
    }
    setEditingId(null);
    setEditFormData(null);
  };

  // 保存编辑
  const handleSaveEdit = async (routerId: number) => {
    if (!editFormData) return;

    // 验证必填字段
    if (!editFormData.strategy_code) {
      toast.error('请选择派单策略');
      return;
    }
    if (!editFormData.trx_type) {
      toast.error('请选择交易类型');
      return;
    }
    if (!editFormData.trx_ccy) {
      toast.error('请选择币种');
      return;
    }

    try {
      const isNew = routerId < 0;
      const response = isNew
        ? await dispatchRouterService.createDispatchRouter(editFormData)
        : await dispatchRouterService.updateDispatchRouter(editFormData);

      if (response.success) {
        toast.success(isNew ? '创建派单路由成功' : '更新派单路由成功');
        setEditingId(null);
        setEditFormData(null);
        loadDispatchRouters();
      } else {
        toast.error(response.msg || (isNew ? '创建派单路由失败' : '更新派单路由失败'));
      }
    } catch (error) {
      const isNew = routerId < 0;
      console.error('保存派单路由失败:', error);
      toast.error(isNew ? '创建派单路由失败' : '更新派单路由失败');
    }
  };

  // 加载策略列表
  const loadStrategies = async () => {
    try {
      const response = await dispatchStrategyService.listStrategies({
        page: 1,
        size: 100,
        status: 'active',
      });
      if (response.success && response.data) {
        setStrategies(response.data.records || []);
      }
    } catch (error) {
      console.error('加载策略列表失败:', error);
    }
  };

  // 删除路由
  const handleDelete = (router: DispatchRouter, e: React.MouseEvent) => {
    e.stopPropagation();
    setRouterToDelete(router);
    setDeleteDialogOpen(true);
  };

  // 确认删除
  const confirmDelete = async () => {
    if (!routerToDelete) return;
    
    try {
      const response = await dispatchRouterService.deleteDispatchRouter(routerToDelete.id);
      if (response.success) {
        toast.success('删除派单路由成功');
        loadDispatchRouters();
      } else {
        toast.error(response.msg || '删除派单路由失败');
      }
    } catch (error) {
      console.error('删除派单路由失败:', error);
      toast.error('删除派单路由失败');
    } finally {
      setDeleteDialogOpen(false);
      setRouterToDelete(null);
    }
  };

  // 启用路由
  const handleEnable = async (router: DispatchRouter, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await dispatchRouterService.updateDispatchRouterStatus(router.id, 'active');
      if (response.success) {
        toast.success('启用派单路由成功');
        loadDispatchRouters();
      } else {
        toast.error(response.msg || '启用派单路由失败');
      }
    } catch (error) {
      console.error('启用派单路由失败:', error);
      toast.error('启用派单路由失败');
    }
  };

  // 禁用路由
  const handleDisable = async (router: DispatchRouter, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await dispatchRouterService.updateDispatchRouterStatus(router.id, 'inactive');
      if (response.success) {
        toast.success('禁用派单路由成功');
        loadDispatchRouters();
      } else {
        toast.error(response.msg || '禁用派单路由失败');
      }
    } catch (error) {
      console.error('禁用派单路由失败:', error);
      toast.error('禁用派单路由失败');
    }
  };

  // 格式化时间
  const formatDateTime = (timestamp?: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 格式化金额
  const formatAmount = (amount?: any) => {
    if (amount === null || amount === undefined || amount === '') return '-';
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(value)) return '-';
    return value.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  // 格式化每日时间范围（秒数转为时间）
  const formatDailyTime = (seconds?: number) => {
    if (!seconds || seconds === 0) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 获取交易类型显示
  const getTrxTypeLabel = (trxType?: string) => {
    if (!trxType) return '-';
    const map: Record<string, string> = {
      'cashier_payin': '代收',
      'cashier_payout': '代付',
      'cashier_withdraw': '提现'
    };
    return map[trxType] || trxType;
  };

  // 获取交易方式显示
  const getTrxMethodLabel = (trxMethod?: string) => {
    if (!trxMethod) return '-';
    const map: Record<string, string> = {
      'upi': 'UPI',
      'bank_card': '银行卡',
      'bank_transfer': '银行转账'
    };
    return map[trxMethod] || trxMethod;
  };

  // 渲染策略规则Badge
  const renderRulesBadges = (rules?: any) => {
    if (!rules) return <span className="text-muted-foreground text-xs">无规则</span>;

    const badges = [];
    
    if (rules.user_online_required) {
      badges.push(<Badge key="user_online" variant="outline" className="text-xs">用户在线</Badge>);
    }
    if (rules.account_online_required) {
      badges.push(<Badge key="account_online" variant="outline" className="text-xs">账户在线</Badge>);
    }
    if (rules.prevent_same_upi) {
      badges.push(<Badge key="prevent_upi" variant="outline" className="text-xs bg-yellow-50">防UPI冲突</Badge>);
    }
    if (rules.enforce_trx_config) {
      badges.push(<Badge key="enforce_config" variant="outline" className="text-xs bg-blue-50">强制配置</Badge>);
    }
    if (rules.min_balance_ratio) {
      badges.push(<Badge key="balance_ratio" variant="outline" className="text-xs bg-green-50">余额比例≥{rules.min_balance_ratio}</Badge>);
    }

    return badges.length > 0 ? (
      <div className="flex flex-wrap gap-1">{badges}</div>
    ) : (
      <span className="text-muted-foreground text-xs">无规则</span>
    );
  };

  // 渲染排序策略
  const renderSortStrategy = (rules?: any) => {
    if (!rules?.sort_by) return '-';
    const map: Record<string, string> = {
      'score_desc': '评分降序',
      'random': '随机',
      'round_robin': '轮询',
      'weighted_random': '加权随机'
    };
    return map[rules.sort_by] || rules.sort_by;
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none w-[1400px] max-h-[90vh] overflow-hidden" style={{width: '1400px', maxWidth: '1400px'}}>
        <DialogHeader>
          <DialogTitle>派单路由管理</DialogTitle>
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
            <Button size="sm" onClick={handleAdd} className="h-9">
              <Plus className="h-4 w-4 mr-1" />
              新增
            </Button>
            <Button size="sm" variant="outline" onClick={loadDispatchRouters} disabled={loading} className="h-9">
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>          {/* 路由列表 */}
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">加载中...</p>
            </div>
          ) : routers.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">暂无派单路由配置</p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[65vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>路由编码</TableHead>
                    <TableHead>路由类型</TableHead>
                    <TableHead>支付方式</TableHead>
                    <TableHead>国家</TableHead>
                    <TableHead>交易金额</TableHead>
                    <TableHead>时段</TableHead>
                    <TableHead>有效期</TableHead>
                    <TableHead>策略编码</TableHead>
                    <TableHead>优先级</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>生效时间</TableHead>
                    <TableHead className="w-[200px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routers.map((router) => {
                    const isEditing = editingId === router.id;
                    const isNew = router.id < 0;
                    
                    return (
                    <Fragment key={router.id}>
                      {isEditing ? (
                        // 编辑模式行
                        <TableRow className="bg-blue-50">
                          <TableCell colSpan={14}>
                            <div className="p-4 space-y-4">
                              <div className="grid grid-cols-3 gap-4">
                                {/* 策略选择 */}
                                <div>
                                  <label className="text-xs font-medium mb-1 block">派单策略 *</label>
                                  <Select
                                    value={editFormData?.strategy_code || ''}
                                    onValueChange={(value) => setEditFormData({...editFormData!, strategy_code: value})}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue placeholder="选择策略" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {strategies.map((s) => (
                                        <SelectItem key={s.code} value={s.code}>
                                          {s.name} ({s.code})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* 交易类型 */}
                                <div>
                                  <label className="text-xs font-medium mb-1 block">交易类型 *</label>
                                  <Select
                                    value={editFormData?.trx_type || ''}
                                    onValueChange={(value) => setEditFormData({...editFormData!, trx_type: value})}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue placeholder="选择类型" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {CASHIER_TRX_TYPE_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* 支付方式 */}
                                <div>
                                  <label className="text-xs font-medium mb-1 block">支付方式</label>
                                  <Select
                                    value={editFormData?.trx_method || ''}
                                    onValueChange={(value) => setEditFormData({...editFormData!, trx_method: value})}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue placeholder="选择方式" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {TRX_METHOD_OPTIONS.filter(o => o.value !== 'all').map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* 国家 */}
                                <div>
                                  <label className="text-xs font-medium mb-1 block">国家</label>
                                  <Select
                                    value={editFormData?.country || ''}
                                    onValueChange={(value) => setEditFormData({...editFormData!, country: value})}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue placeholder="选择国家" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {COUNTRY_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* 优先级 */}
                                <div>
                                  <label className="text-xs font-medium mb-1 block">优先级</label>
                                  <Input
                                    type="number"
                                    className="h-8"
                                    value={editFormData?.priority || 0}
                                    onChange={(e) => setEditFormData({...editFormData!, priority: Number(e.target.value)})}
                                  />
                                </div>

                                {/* 状态复选框 */}
                                <div className="flex items-center space-x-2 pt-6">
                                  <Checkbox
                                    id="status-checkbox"
                                    checked={editFormData?.status === 'active'}
                                    onCheckedChange={(checked) => setEditFormData({...editFormData!, status: checked ? 'active' : 'inactive'})}
                                  />
                                  <label
                                    htmlFor="status-checkbox"
                                    className="text-xs font-medium cursor-pointer"
                                  >
                                    启用
                                  </label>
                                </div>

                                {/* 币种、最小金额、最大金额同行 - 占满3列 */}
                                <div className="col-span-3 grid grid-cols-3 gap-4">
                                  {/* 币种 */}
                                  <div>
                                    <label className="text-xs font-medium mb-1 block">币种 *</label>
                                    <Select
                                      value={editFormData?.trx_ccy || ''}
                                      onValueChange={(value) => setEditFormData({...editFormData!, trx_ccy: value})}
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue placeholder="选择币种" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {CCY_OPTIONS.filter(o => o.value !== 'all').map((opt) => (
                                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {/* 最小金额 */}
                                  <div>
                                    <label className="text-xs font-medium mb-1 block">最小金额</label>
                                    <Input
                                      type="number"
                                      className="h-8"
                                      placeholder="最小金额"
                                      value={editFormData?.min_amount || ''}
                                      onChange={(e) => setEditFormData({...editFormData!, min_amount: e.target.value ? Number(e.target.value) : undefined})}
                                    />
                                  </div>

                                  {/* 最大金额 */}
                                  <div>
                                    <label className="text-xs font-medium mb-1 block">最大金额</label>
                                    <Input
                                      type="number"
                                      className="h-8"
                                      placeholder="最大金额"
                                      value={editFormData?.max_amount || ''}
                                      onChange={(e) => setEditFormData({...editFormData!, max_amount: e.target.value ? Number(e.target.value) : undefined})}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* 操作按钮 */}
                              <div className="flex items-center gap-2">
                                <Button size="sm" onClick={() => handleSaveEdit(router.id)} className="h-8">
                                  <Check className="h-4 w-4 mr-1" />
                                  保存
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleCancelEdit(router.id)} className="h-8">
                                  <X className="h-4 w-4 mr-1" />
                                  取消
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        // 正常显示模式行
                        <>
                      <TableRow 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => !isNew && toggleExpand(router.id)}
                      >
                        <TableCell>
                          {expandedId === router.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium font-mono text-xs">{router.code}</TableCell>
                        <TableCell>
                          {router.user_id ? (
                            <Badge variant="default" className="bg-blue-500">专属</Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-600">全局</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={router.trx_type === 'cashier_payin' ? 'default' : 'secondary'} className="text-xs">
                              {getTrxTypeLabel(router.trx_type)}
                            </Badge>
                            <span className="text-xs">{getTrxMethodLabel(router.trx_method)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          {getCountryLabel(router.country)}
                        </TableCell>
                        <TableCell className="text-xs">
                          <div>{getCcyLabel(router.trx_ccy)}</div>
                          <div className="font-mono">
                            {formatAmount(router.min_amount)} ~ {formatAmount(router.max_amount)}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {(router.daily_start_time > 0 || router.daily_end_time > 0) ? (
                            <div>
                              <div>{formatDailyTime(router.daily_start_time)}</div>
                              <div className="text-muted-foreground">~ {formatDailyTime(router.daily_end_time)}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">全天</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          {(!router.expired_at || router.expired_at === 0) ? (
                            <span className="text-green-600">永久</span>
                          ) : (
                            <div className="text-orange-600">{formatDateTime(router.expired_at)}</div>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{router.strategy_code}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {router.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {router.status === 'active' ? (
                            <Badge variant="default" className="bg-green-500">启用</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-500">禁用</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          {formatDateTime(router.created_at)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {router.start_at && router.start_at > 0 ? formatDateTime(router.start_at) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => handleEdit(router, e)}
                              className="h-7 px-2"
                              title="编辑"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            {router.status === 'active' ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => handleDisable(router, e)}
                                className="h-7 px-2"
                                title="禁用"
                              >
                                <PowerOff className="h-3 w-3" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => handleEnable(router, e)}
                                className="h-7 px-2"
                                title="启用"
                              >
                                <Power className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => handleDelete(router, e)}
                              className="h-7 px-2 text-red-600 hover:text-red-700"
                              title="删除"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {/* 展开的详情行 */}
                      {expandedId === router.id && (
                        <TableRow key={`${router.id}-detail`} className="bg-gray-50">
                          <TableCell colSpan={12} className="p-0">
                            <div className="p-6 space-y-4">
                              {/* 路由详细信息 */}
                              <div>
                                <h4 className="text-sm font-semibold mb-3 text-gray-900">路由详情</h4>
                                <div className="grid grid-cols-3 gap-x-6 gap-y-2.5 text-xs bg-white rounded p-4">
                                  {(router.daily_start_time > 0 || router.daily_end_time > 0) && (
                                    <div>
                                      <span className="text-muted-foreground">每日时间段: </span>
                                      <span className="font-mono">
                                        {formatDailyTime(router.daily_start_time)} ~ {formatDailyTime(router.daily_end_time)}
                                      </span>
                                    </div>
                                  )}
                                  {(!router.expired_at || router.expired_at === 0) ? (
                                    <div>
                                      <span className="text-muted-foreground">有效期: </span>
                                      <span className="text-green-600">永久有效</span>
                                    </div>
                                  ) : (
                                    <div>
                                      <span className="text-muted-foreground">失效时间: </span>
                                      <span className="text-orange-600">{formatDateTime(router.expired_at)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* 关联策略信息 */}
                              {router.strategy && (
                                <div className="border-t border-gray-200 pt-4">
                                  <h4 className="text-sm font-semibold mb-3 text-gray-900">关联策略</h4>
                                  
                                  <div className="bg-blue-50 rounded p-4 space-y-3">
                                    <div className="grid grid-cols-3 gap-x-6 gap-y-2 text-xs">
                                      <div>
                                        <span className="text-muted-foreground">策略编码: </span>
                                        <span className="font-medium font-mono">{router.strategy.code}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">策略名称: </span>
                                        <span className="font-medium">{router.strategy.name}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">版本: </span>
                                        <span className="font-medium">{router.strategy.version}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">优先级: </span>
                                        <span className="font-medium">{router.strategy.priority}</span>
                                      </div>
                                      {router.strategy.trx_type && (
                                        <div>
                                          <span className="text-muted-foreground">交易类型: </span>
                                          <span className="font-medium">{getTrxTypeLabel(router.strategy.trx_type)}</span>
                                        </div>
                                      )}
                                      {router.strategy.trx_method && (
                                        <div>
                                          <span className="text-muted-foreground">支付方式: </span>
                                          <span className="font-medium">{getTrxMethodLabel(router.strategy.trx_method)}</span>
                                        </div>
                                      )}
                                      {(router.strategy.min_amount || router.strategy.max_amount) && (
                                        <div>
                                          <span className="text-muted-foreground">金额范围: </span>
                                          <span className="font-medium font-mono">
                                            {formatAmount(router.strategy.min_amount)} ~ {formatAmount(router.strategy.max_amount)}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    {router.strategy.description && (
                                      <div className="text-xs border-t border-blue-100 pt-2">
                                        <span className="text-muted-foreground">描述: </span>
                                        <span className="text-gray-700">{router.strategy.description}</span>
                                      </div>
                                    )}

                                    <div className="border-t border-blue-100 pt-2">
                                      <label className="text-xs text-muted-foreground block mb-2">策略规则</label>
                                      {renderRulesBadges(router.strategy.rules)}
                                    </div>

                                    {(router.strategy.rules?.limit_max_candidates || router.strategy.rules?.sort_by) && (
                                      <div className="text-xs border-t border-blue-100 pt-2 space-y-1">
                                        {router.strategy.rules?.sort_by && (
                                          <div>
                                            <span className="text-muted-foreground">排序策略: </span>
                                            <span className="font-medium">{renderSortStrategy(router.strategy.rules)}</span>
                                          </div>
                                        )}
                                        {router.strategy.rules?.limit_max_candidates > 0 && (
                                          <div>
                                            <span className="text-muted-foreground">候选账户: </span>
                                            <span className="font-medium">
                                              {router.strategy.rules.limit_min_candidates || 0} ~ {router.strategy.rules.limit_max_candidates} 个
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      </>
                    )}
                    </Fragment>
                  )})}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>

    {/* 删除确认对话框 */}
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除</AlertDialogTitle>
          <AlertDialogDescription>
            您确定要删除这个派单路由吗？此操作无法撤销。
            {routerToDelete && (
              <div className="mt-2 text-sm">
                <div>路由编码: <span className="font-mono">{routerToDelete.code}</span></div>
                <div>策略编码: <span className="font-mono">{routerToDelete.strategy_code}</span></div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
            删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
