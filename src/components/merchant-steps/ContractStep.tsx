import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Plus, Trash2, FileText, Calendar, Edit, Save, X } from 'lucide-react';
import { toast } from '../../utils/toast';

interface ContractData {
  contract_id_suffix: string;
  start_at: string;
  expired_at: string;
  status: string;
  payin_enabled: boolean;
  payout_enabled: boolean;
}

interface ContractStepProps {
  data: ContractData[];
  onChange: (data: ContractData[]) => void;
}

export function ContractStep({ data, onChange }: ContractStepProps) {
  const [localData, setLocalData] = useState<ContractData[]>(data);
  const [isAdding, setIsAdding] = useState(false);
  
  // 生成默认日期（当前日期和一年后）
  const getDefaultDates = () => {
    const now = new Date();
    const startAt = now.toISOString().split('T')[0];
    const endAt = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString().split('T')[0];
    return { startAt, endAt };
  };

  const defaultDates = getDefaultDates();
  
  const [newContract, setNewContract] = useState<Partial<ContractData>>({
    contract_id_suffix: '',
    start_at: defaultDates.startAt,
    expired_at: defaultDates.endAt,
    status: 'active',
    payin_enabled: true,
    payout_enabled: false
  });

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const updateData = (newData: ContractData[]) => {
    setLocalData(newData);
    onChange(newData);
  };

  // 开始新增合同
  const handleAddContract = () => {
    // 生成默认合同后缀
    const defaultSuffix = String(localData.length + 1).padStart(3, '0');
    
    setIsAdding(true);
    setNewContract({
      contract_id_suffix: defaultSuffix,
      start_at: defaultDates.startAt,
      expired_at: defaultDates.endAt,
      status: 'active',
      payin_enabled: true,
      payout_enabled: false
    });
  };

  // 取消新增
  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewContract({
      contract_id_suffix: '',
      start_at: defaultDates.startAt,
      expired_at: defaultDates.endAt,
      status: 'active',
      payin_enabled: true,
      payout_enabled: false
    });
  };

  // 保存合同
  const handleSaveContract = () => {
    if (!newContract.contract_id_suffix || !newContract.start_at || !newContract.expired_at) {
      toast.error('请填写完整的合同信息');
      return;
    }

    // 检查日期有效性
    const startDate = new Date(newContract.start_at);
    const endDate = new Date(newContract.expired_at);
    
    if (endDate <= startDate) {
      toast.error('结束时间必须晚于开始时间');
      return;
    }

    // 检查是否已存在相同后缀的合同
    const exists = localData.some(contract => contract.contract_id_suffix === newContract.contract_id_suffix);
    if (exists) {
      toast.error('该合同后缀已存在');
      return;
    }

    const contractToAdd: ContractData = {
      contract_id_suffix: newContract.contract_id_suffix!,
      start_at: newContract.start_at!,
      expired_at: newContract.expired_at!,
      status: newContract.status || 'active',
      payin_enabled: newContract.payin_enabled || false,
      payout_enabled: newContract.payout_enabled || false
    };

    const updatedData = [...localData, contractToAdd];
    updateData(updatedData);
    
    // 重置状态
    setIsAdding(false);
    toast.success('合同添加成功');
  };

  // 保留原有的addContract方法用于向后兼容
  const addContract = handleSaveContract;
  };

  const removeContract = (index: number) => {
    const updatedData = localData.filter((_, i) => i !== index);
    updateData(updatedData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-300">激活</Badge>;
      case 'inactive':
        return <Badge variant="secondary">未激活</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800 border-red-300">过期</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-6 w-6 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">合同配置</h3>
          <p className="text-sm text-muted-foreground">
            为商户创建合同，设置代收代付权限和有效期
          </p>
        </div>
      </div>

      {/* 添加合同 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">新增合同</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contract-suffix">
                合同ID后缀 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contract-suffix"
                value={newContract.contract_id_suffix || ''}
                onChange={(e) => setNewContract({ ...newContract, contract_id_suffix: e.target.value })}
                placeholder="如：001, main, standard"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract-status">合同状态</Label>
              <Select
                value={newContract.status || 'active'}
                onValueChange={(value) => setNewContract({ ...newContract, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">激活</SelectItem>
                  <SelectItem value="inactive">未激活</SelectItem>
                  <SelectItem value="expired">过期</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">
                开始时间 <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="start-date"
                  type="date"
                  value={newContract.start_at || defaultDates.startAt}
                  onChange={(e) => setNewContract({ ...newContract, start_at: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">
                结束时间 <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="end-date"
                  type="date"
                  value={newContract.expired_at || defaultDates.endAt}
                  onChange={(e) => setNewContract({ ...newContract, expired_at: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>功能权限</Label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="payin-enabled"
                  checked={newContract.payin_enabled || false}
                  onCheckedChange={(checked: boolean) => 
                    setNewContract({ ...newContract, payin_enabled: !!checked })
                  }
                />
                <Label htmlFor="payin-enabled" className="text-sm">
                  启用代收功能
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="payout-enabled"
                  checked={newContract.payout_enabled || false}
                  onCheckedChange={(checked: boolean) => 
                    setNewContract({ ...newContract, payout_enabled: !!checked })
                  }
                />
                <Label htmlFor="payout-enabled" className="text-sm">
                  启用代付功能
                </Label>
              </div>
            </div>
          </div>

          <Button
            onClick={addContract}
            disabled={!newContract.contract_id_suffix}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-1" />
            添加合同
          </Button>
          
          {localData.length === 0 && (
            <div className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-md p-3 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs">!</div>
                <span className="font-medium">请至少添加一个合同才能继续下一步</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 合同列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">合同列表</CardTitle>
        </CardHeader>
        <CardContent>
          {localData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>暂未添加合同</p>
              <p className="text-sm">请至少添加一个合同</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>合同后缀</TableHead>
                  <TableHead>有效期</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>功能权限</TableHead>
                  <TableHead className="w-20">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localData.map((contract, index) => (
                  <TableRow key={`${contract.contract_id_suffix}-${index}`}>
                    <TableCell className="font-mono">
                      {contract.contract_id_suffix}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{formatDate(contract.start_at)}</div>
                      <div className="text-muted-foreground">
                        至 {formatDate(contract.expired_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(contract.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {contract.payin_enabled && (
                          <Badge variant="outline" className="text-xs">代收</Badge>
                        )}
                        {contract.payout_enabled && (
                          <Badge variant="outline" className="text-xs">代付</Badge>
                        )}
                        {!contract.payin_enabled && !contract.payout_enabled && (
                          <span className="text-muted-foreground text-xs">无权限</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeContract(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 说明信息 */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">
              ℹ
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-purple-800">合同说明</h4>
              <ul className="mt-2 text-sm text-purple-700 space-y-1">
                <li>• 合同ID由系统生成前缀 + 用户ID + 后缀组成</li>
                <li>• 每个商户可以有多个合同，用于不同的业务场景</li>
                <li>• 代收功能允许商户接收用户付款</li>
                <li>• 代付功能允许商户向用户转账</li>
                <li>• 合同过期后将自动停止相关功能</li>
                <li>• 建议创建至少一个包含代收功能的合同</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}