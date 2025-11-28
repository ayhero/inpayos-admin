import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Plus, Trash2, Route, ArrowUpDown, Save, X, Edit } from 'lucide-react';
import { toast } from '../../utils/toast';
import { 
  MERCHANT_TRX_TYPE_OPTIONS, 
  TRX_METHOD_OPTIONS, 
  CCY_OPTIONS, 
  COUNTRY_OPTIONS, 
  CHANNEL_CODE_OPTIONS,
  getCountryLabel,
  getChannelCodeLabel
} from '../../constants/business';

interface RouterData {
  trx_type: string;
  trx_method: string;
  ccy: string;
  country?: string;
  min_amount: number;
  max_amount: number;
  channel_code: string;
  priority: number;
  status: string;
}

interface RouterStepProps {
  data: RouterData[];
  onChange: (data: RouterData[]) => void;
}

export function RouterStep({ data, onChange }: RouterStepProps) {
  const [localData, setLocalData] = useState<RouterData[]>(data);
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newRouter, setNewRouter] = useState<Partial<RouterData>>({
    trx_type: 'payin',
    trx_method: '',
    ccy: 'INR',
    country: '',
    min_amount: 0,
    max_amount: 0,
    channel_code: '',
    priority: 100,
    status: 'active'
  });

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const updateData = (newData: RouterData[]) => {
    setLocalData(newData);
    onChange(newData);
  };

  // 格式化金额范围显示（币种 + 金额）
  const formatAmountRange = (ccy: string, minAmount: number, maxAmount: number) => {
    const prefix = ccy ? `${ccy} ` : '';
    
    if (minAmount === 0 && maxAmount === 0) {
      return `${prefix}不限`;
    }
    
    if (minAmount === 0) {
      return `${prefix}0 - ${maxAmount.toLocaleString()}`;
    }
    
    if (maxAmount === 0) {
      return `${prefix}${minAmount.toLocaleString()} 起`;
    }
    
    return `${prefix}${minAmount.toLocaleString()} - ${maxAmount.toLocaleString()}`;
  };

  // 开始新增路由
  const handleAddRouter = () => {
    setIsAdding(true);
    setNewRouter({
      trx_type: 'payin',
      trx_method: '',
      ccy: 'INR',
      country: '',
      min_amount: 0,
      max_amount: 0,
      channel_code: '',
      priority: localData.length * 10 + 100, // 基于现有数量设置默认优先级
      status: 'active'
    });
  };

  // 取消新增
  const handleCancelAdd = () => {
    setIsAdding(false);
    setEditingIndex(null);
    setNewRouter({
      trx_type: 'payin',
      trx_method: '',
      ccy: 'INR',
      country: '',
      min_amount: 0,
      max_amount: 0,
      channel_code: '',
      priority: 100,
      status: 'active'
    });
  };

  // 保存路由
  const handleSaveRouter = () => {
    if (!newRouter.trx_type || !newRouter.trx_method || !newRouter.channel_code) {
      toast.error('请填写交易类型、支付方式和渠道代码');
      return;
    }

    // 如果设定了任一金额，那币种不能为空
    if ((newRouter.min_amount !== undefined && newRouter.min_amount > 0) || 
        (newRouter.max_amount !== undefined && newRouter.max_amount > 0)) {
      if (!newRouter.ccy) {
        toast.error('设定金额时必须选择币种');
        return;
      }
    }

    // 确保金额 >= 0
    if (newRouter.min_amount! < 0 || newRouter.max_amount! < 0) {
      toast.error('金额必须大于等于0');
      return;
    }

    // 如果设置了最大金额，确保大于最小金额
    if (newRouter.max_amount! > 0 && newRouter.max_amount! <= newRouter.min_amount!) {
      toast.error('最大金额必须大于最小金额');
      return;
    }

    // 检查是否存在重复的路由配置（编辑时排除自己）
    const isDuplicate = localData.some((router, idx) => {
      if (editingIndex !== null && idx === editingIndex) return false; // 编辑时排除自己
      return router.trx_type === newRouter.trx_type &&
        router.trx_method === newRouter.trx_method &&
        router.ccy === newRouter.ccy &&
        router.country === newRouter.country &&
        router.channel_code === newRouter.channel_code;
    });

    if (isDuplicate) {
      toast.error('已存在相同配置的路由，请修改后重试');
      return;
    }

    const routerToAdd: RouterData = {
      trx_type: newRouter.trx_type!,
      trx_method: newRouter.trx_method!,
      ccy: newRouter.ccy || '',
      country: newRouter.country || undefined,
      min_amount: newRouter.min_amount || 0,
      max_amount: newRouter.max_amount || 0,
      channel_code: newRouter.channel_code!,
      priority: newRouter.priority || 100,
      status: newRouter.status || 'active'
    };

    let updatedData: RouterData[];
    if (editingIndex !== null) {
      // 编辑模式：更新现有路由
      updatedData = localData.map((router, idx) => 
        idx === editingIndex ? routerToAdd : router
      );
    } else {
      // 新增模式：添加新路由
      updatedData = [...localData, routerToAdd];
    }
    
    updateData(updatedData);
    
    // 重置状态
    setIsAdding(false);
    setEditingIndex(null);
  };

  const removeRouter = (index: number) => {
    const updatedData = localData.filter((_, i) => i !== index);
    updateData(updatedData);
  };

  // 编辑路由
  const handleEditRouter = (index: number) => {
    const router = localData[index];
    setNewRouter(router);
    setEditingIndex(index);
    setIsAdding(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-300">启用</Badge>;
      case 'inactive':
        return <Badge variant="secondary">禁用</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">待审核</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTrxTypeBadge = (trxType: string) => {
    switch (trxType) {
      case 'payin':
        return <Badge variant="default">代收</Badge>;
      case 'payout':
        return <Badge variant="secondary">代付</Badge>;
      default:
        return <Badge variant="outline">{trxType}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-h-full overflow-y-auto">
      {/* 路由列表和添加界面 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end mb-4">
            {!isAdding && (
              <Button onClick={handleAddRouter} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                添加路由
              </Button>
            )}
          </div>
          {/* 添加/编辑路由表单 */}
          {isAdding && (
            <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-blue-900">{editingIndex !== null ? '编辑路由' : '新增路由'}</h4>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveRouter}>
                    <Save className="w-4 h-4 mr-1" />
                    保存
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelAdd}>
                    <X className="w-4 h-4 mr-1" />
                    取消
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trx-type">
                    交易类型 <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newRouter.trx_type || 'payin'}
                    onValueChange={(value) => setNewRouter({ ...newRouter, trx_type: value })}
                  >
                    <SelectTrigger>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trx-method">
                    支付方式 <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newRouter.trx_method || ''}
                    onValueChange={(value) => setNewRouter({ ...newRouter, trx_method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择支付方式" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRX_METHOD_OPTIONS.filter(opt => opt.value !== 'all').map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="channel-code">
                    渠道代码 <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newRouter.channel_code || ''}
                    onValueChange={(value) => setNewRouter({ ...newRouter, channel_code: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择渠道" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHANNEL_CODE_OPTIONS.filter(opt => opt.value !== 'all').map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="ccy">币种</Label>
                  <Select
                    value={newRouter.ccy || ''}
                    onValueChange={(value) => setNewRouter({ ...newRouter, ccy: value === '__clear__' ? '' : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择币种（可选）" />
                    </SelectTrigger>
                    <SelectContent>
                      {newRouter.ccy && (
                        <SelectItem value="__clear__" className="text-red-600">
                          清除选择
                        </SelectItem>
                      )}
                      {CCY_OPTIONS.filter(opt => opt.value !== 'all').map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">设定金额时必填</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min-amount">最小金额</Label>
                  <div className="relative">
                    <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="min-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newRouter.min_amount ?? 100}
                      onChange={(e) => setNewRouter({ ...newRouter, min_amount: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-amount">最大金额</Label>
                  <div className="relative">
                    <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="max-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newRouter.max_amount ?? 100000}
                      onChange={(e) => setNewRouter({ ...newRouter, max_amount: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="country">国家/地区</Label>
                  <Select
                    value={newRouter.country || ''}
                    onValueChange={(value) => setNewRouter({ ...newRouter, country: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择国家/地区（可选）" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">优先级</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="0"
                    max="999"
                    value={newRouter.priority || 100}
                    onChange={(e) => setNewRouter({ ...newRouter, priority: parseInt(e.target.value) || 100 })}
                    placeholder="数值越小优先级越高"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 路由列表 */}
          {localData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Route className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂未添加路由</p>
              <p className="text-sm">请至少添加一个路由配置</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>交易类型</TableHead>
                  <TableHead>支付方式</TableHead>
                  <TableHead>交易金额</TableHead>
                  <TableHead>国家/地区</TableHead>
                  <TableHead>渠道</TableHead>
                  <TableHead>优先级</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="w-24">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localData.map((router, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {getTrxTypeBadge(router.trx_type)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {router.trx_method.toUpperCase()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatAmountRange(router.ccy, router.min_amount, router.max_amount)}
                    </TableCell>
                    <TableCell>
                      {router.country ? getCountryLabel(router.country) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {getChannelCodeLabel(router.channel_code)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {router.priority}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(router.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRouter(index)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRouter(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* 提示信息 */}
          {localData.length === 0 && (
            <div className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-md p-3 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs">!</div>
                <span className="font-medium">请至少添加一个路由配置才能继续下一步</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 说明信息 */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">
              ℹ
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-800">路由说明</h4>
              <ul className="mt-2 text-sm text-blue-700 space-y-1">
                <li>• 路由决定了在不同交易场景下选择哪个支付渠道</li>
                <li>• 优先级数值越小，优先级越高（如：10 &gt; 20 &gt; 100）</li>
                <li>• 金额范围决定了路由在哪个金额区间内生效</li>
                <li>• 每个路由配置组合（交易类型+支付方式+币种+国家+渠道）应该是唯一的</li>
                <li>• 建议为每种主要的支付方式配置至少一个路由</li>
                <li>• 代收路由用于处理用户向商户的付款</li>
                <li>• 代付路由用于处理商户向用户的转账</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}