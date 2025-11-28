import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Plus, Trash2, Route, ArrowUpDown } from 'lucide-react';
import { CCY_OPTIONS, COUNTRY_OPTIONS, CHANNEL_CODE_OPTIONS } from '../../constants/business';

interface RouterData {
  trx_type: string;
  trx_method: string;
  ccy: string;
  country: string;
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

const TRX_TYPE_OPTIONS = [
  { value: 'payin', label: '代收' },
  { value: 'payout', label: '代付' }
];

const TRX_METHOD_OPTIONS = [
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: '银行转账' },
  { value: 'credit_card', label: '信用卡' },
  { value: 'debit_card', label: '借记卡' },
  { value: 'usdt', label: 'USDT' }
];

export function RouterStep({ data, onChange }: RouterStepProps) {
  const [localData, setLocalData] = useState<RouterData[]>(data);
  const [newRouter, setNewRouter] = useState<Partial<RouterData>>({
    trx_type: 'payin',
    trx_method: '',
    ccy: '',
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

  const addRouter = () => {
    if (!newRouter.trx_type || !newRouter.trx_method || !newRouter.ccy || 
        !newRouter.country || !newRouter.channel_code) {
      alert('请填写完整的路由信息');
      return;
    }

    if (newRouter.min_amount! < 0 || newRouter.max_amount! <= 0 || 
        newRouter.max_amount! <= newRouter.min_amount!) {
      alert('请设置正确的金额范围');
      return;
    }

    const routerToAdd: RouterData = {
      trx_type: newRouter.trx_type!,
      trx_method: newRouter.trx_method!,
      ccy: newRouter.ccy!,
      country: newRouter.country!,
      min_amount: newRouter.min_amount || 0,
      max_amount: newRouter.max_amount || 0,
      channel_code: newRouter.channel_code!,
      priority: newRouter.priority || 100,
      status: newRouter.status || 'active'
    };

    const updatedData = [...localData, routerToAdd];
    updateData(updatedData);
    
    // 重置表单
    setNewRouter({
      trx_type: 'payin',
      trx_method: '',
      ccy: '',
      country: '',
      min_amount: 0,
      max_amount: 0,
      channel_code: '',
      priority: 100,
      status: 'active'
    });
  };

  const removeRouter = (index: number) => {
    const updatedData = localData.filter((_, i) => i !== index);
    updateData(updatedData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-300">激活</Badge>;
      case 'inactive':
        return <Badge variant="secondary">未激活</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 border-red-300">暂停</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTrxTypeBadge = (trxType: string) => {
    switch (trxType) {
      case 'payin':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">代收</Badge>;
      case 'payout':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300">代付</Badge>;
      default:
        return <Badge variant="outline">{trxType}</Badge>;
    }
  };

  const getCcyLabel = (ccy: string) => {
    const option = CCY_OPTIONS.find(opt => opt.value === ccy);
    return option ? option.label : ccy;
  };

  const getCountryLabel = (country: string) => {
    const option = COUNTRY_OPTIONS?.find(opt => opt.value === country);
    return option ? option.label : country;
  };

  const getChannelLabel = (channelCode: string) => {
    const option = CHANNEL_CODE_OPTIONS?.find(opt => opt.value === channelCode);
    return option ? option.label : channelCode;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Route className="h-6 w-6 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">路由配置</h3>
          <p className="text-sm text-muted-foreground">
            配置支付路由规则，决定不同场景下的支付渠道选择
          </p>
        </div>
      </div>

      {/* 添加路由 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">新增路由</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="trx-type">
                交易类型 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newRouter.trx_type || ''}
                onValueChange={(value) => setNewRouter({ ...newRouter, trx_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择交易类型" />
                </SelectTrigger>
                <SelectContent>
                  {TRX_TYPE_OPTIONS.map(option => (
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
                  {TRX_METHOD_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ccy">
                币种 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newRouter.ccy || ''}
                onValueChange={(value) => setNewRouter({ ...newRouter, ccy: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择币种" />
                </SelectTrigger>
                <SelectContent>
                  {CCY_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">
                国家/地区 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newRouter.country || ''}
                onValueChange={(value) => setNewRouter({ ...newRouter, country: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择国家/地区" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_OPTIONS?.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  )) || (
                    <SelectItem value="IN">印度</SelectItem>
                  )}
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
                  {CHANNEL_CODE_OPTIONS?.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  )) || (
                    <>
                      <SelectItem value="razorpay">Razorpay</SelectItem>
                      <SelectItem value="paytm">Paytm</SelectItem>
                      <SelectItem value="phonepe">PhonePe</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-amount">
                最小金额 <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="min-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newRouter.min_amount || ''}
                  onChange={(e) => setNewRouter({ ...newRouter, min_amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-amount">
                最大金额 <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="max-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newRouter.max_amount || ''}
                  onChange={(e) => setNewRouter({ ...newRouter, max_amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">优先级</Label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="999"
                value={newRouter.priority || 100}
                onChange={(e) => setNewRouter({ ...newRouter, priority: parseInt(e.target.value) || 100 })}
                placeholder="100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="router-status">路由状态</Label>
            <Select
              value={newRouter.status || 'active'}
              onValueChange={(value) => setNewRouter({ ...newRouter, status: value })}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">激活</SelectItem>
                <SelectItem value="inactive">未激活</SelectItem>
                <SelectItem value="suspended">暂停</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={addRouter}
            disabled={!newRouter.trx_type || !newRouter.trx_method || !newRouter.ccy || 
                     !newRouter.country || !newRouter.channel_code}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-1" />
            添加路由
          </Button>
        </CardContent>
      </Card>

      {/* 路由列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">路由列表</CardTitle>
        </CardHeader>
        <CardContent>
          {localData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Route className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂未添加路由</p>
              <p className="text-sm">请至少添加一个路由规则</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>类型</TableHead>
                    <TableHead>支付方式</TableHead>
                    <TableHead>币种</TableHead>
                    <TableHead>国家</TableHead>
                    <TableHead>渠道</TableHead>
                    <TableHead>金额范围</TableHead>
                    <TableHead>优先级</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="w-20">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {localData.map((router, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {getTrxTypeBadge(router.trx_type)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {router.trx_method.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {getCcyLabel(router.ccy)}
                      </TableCell>
                      <TableCell>
                        {getCountryLabel(router.country)}
                      </TableCell>
                      <TableCell>
                        {getChannelLabel(router.channel_code)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {router.min_amount} - {router.max_amount}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {router.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(router.status)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRouter(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 说明信息 */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">
              ✓
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-green-800">路由说明</h4>
              <ul className="mt-2 text-sm text-green-700 space-y-1">
                <li>• 路由规则决定用户支付时选择哪个渠道处理</li>
                <li>• 系统会根据交易类型、币种、国家等条件匹配路由</li>
                <li>• 优先级数字越小，优先级越高（1 最高，999 最低）</li>
                <li>• 金额范围限制该路由适用的交易金额</li>
                <li>• 建议为主要业务场景创建对应的路由规则</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}