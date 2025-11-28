import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { FileText, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ContractConfigEditor } from '../ContractConfigEditor';
import type { ContractConfig } from '../../services/contractService';

interface ContractData {
  contract_id?: string;
  start_at: string;
  expired_at?: string;
  status: boolean;
  payin?: ContractConfig;
  payout?: ContractConfig;
}

interface ContractStepProps {
  data: ContractData[];
  onChange: (data: ContractData[]) => void;
}

export function ContractStep({ data, onChange }: ContractStepProps) {
  const [showConfigEditor, setShowConfigEditor] = useState(false);
  const [editingConfigType, setEditingConfigType] = useState<'payin' | 'payout'>('payin');
  
  // 生成默认日期（当前日期）
  const getDefaultStartDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };
  
  // 单个合同数据（从data数组中取第一个，或使用默认值）
  const [contract, setContract] = useState<ContractData>(() => {
    if (data.length > 0) {
      return data[0];
    }
    return {
      contract_id: '',
      start_at: getDefaultStartDate(),
      expired_at: '',
      status: true,
      payin: undefined,
      payout: undefined
    };
  });

  useEffect(() => {
    if (data.length > 0) {
      setContract(data[0]);
    }
  }, [data]);

  // 更新合同数据
  const updateContract = (updates: Partial<ContractData>) => {
    const newContract = { ...contract, ...updates };
    setContract(newContract);
    onChange([newContract]); // 总是返回单元素数组
  };

  // 编辑配置
  const handleEditConfig = (type: 'payin' | 'payout') => {
    setEditingConfigType(type);
    setShowConfigEditor(true);
  };

  // 保存配置
  const handleSaveConfig = (config: ContractConfig) => {
    updateContract({
      [editingConfigType]: config
    });
    setShowConfigEditor(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-6 w-6 text-primary" />
        <h3 className="text-lg font-semibold">合同配置</h3>
      </div>

      {/* 单个合同表单 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">合同信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contract-suffix">合同ID</Label>
              <Input
                id="contract-suffix"
                value={contract.contract_id || ''}
                onChange={(e) => updateContract({ contract_id: e.target.value })}
                placeholder="如：001, main, standard（可选）"
              />
              <p className="text-xs text-muted-foreground">
                留空时系统将自动生成
              </p>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <div className="flex items-center space-x-2 h-10">
                <Checkbox
                  id="contract-status"
                  checked={contract.status}
                  onCheckedChange={(checked: boolean) => updateContract({ status: !!checked })}
                />
                <Label htmlFor="contract-status" className="text-sm font-normal cursor-pointer">
                  启用
                </Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">
                生效时间 <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="start-date"
                  type="date"
                  value={contract.start_at}
                  onChange={(e) => updateContract({ start_at: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">过期时间（留空表示永久有效）</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="end-date"
                  type="date"
                  value={contract.expired_at || ''}
                  onChange={(e) => updateContract({ expired_at: e.target.value })}
                  className="pl-10"
                  placeholder="默认无过期时间"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <Label>代收配置</Label>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleEditConfig('payin')}
                className="w-full mt-1"
              >
                {contract.payin ? '已配置 - 点击编辑' : '点击配置'}
              </Button>
            </div>

            <div>
              <Label>代付配置</Label>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleEditConfig('payout')}
                className="w-full mt-1"
              >
                {contract.payout ? '已配置 - 点击编辑' : '点击配置'}
              </Button>
            </div>
          </div>

          {/* 配置状态提示 */}
          {!contract.payin && !contract.payout && (
            <div className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-md p-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs">!</div>
                <span className="font-medium">请至少配置代收或代付功能</span>
              </div>
            </div>
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
                <li>• 合同ID由系统生成前缀 + 用户ID + 后缀组成（如不填写后缀则自动生成）</li>
                <li>• 代收功能允许商户接收用户付款</li>
                <li>• 代付功能允许商户向用户转账</li>
                <li>• 合同过期后将自动停止相关功能</li>
                <li>• 建议至少配置代收功能以接收用户付款</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 配置编辑器对话框 */}
      <Dialog open={showConfigEditor} onOpenChange={setShowConfigEditor}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingConfigType === 'payin' ? '代收' : '代付'}配置</DialogTitle>
          </DialogHeader>
          <ContractConfigEditor
            open={showConfigEditor}
            onOpenChange={setShowConfigEditor}
            type={editingConfigType}
            config={contract[editingConfigType]}
            onSave={handleSaveConfig}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}