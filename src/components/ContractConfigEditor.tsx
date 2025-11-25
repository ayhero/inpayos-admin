import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { ContractConfig } from '../services/contractService';

interface ContractConfigEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'payin' | 'payout';
  config?: ContractConfig | null;
  onSave: (config: ContractConfig) => void;
}

export function ContractConfigEditor({ open, onOpenChange, type, config, onSave }: ContractConfigEditorProps) {
  const [trxType, setTrxType] = useState(type);
  const [status, setStatus] = useState(config?.status || 'active');
  const [settleType, setSettleType] = useState(config?.settle?.[0]?.type || 'T1');
  const [strategies, setStrategies] = useState(config?.settle?.[0]?.strategies?.join(',') || '');

  // 当 type 或 config 变化时，重置表单状态
  useEffect(() => {
    setTrxType(type);
    setStatus(config?.status || 'active');
    setSettleType(config?.settle?.[0]?.type || 'T1');
    setStrategies(config?.settle?.[0]?.strategies?.join(',') || '');
  }, [type, config]);

  const handleSave = () => {
    const newConfig: ContractConfig = {
      trx_type: trxType,
      status,
      configs: [],
      settle: [
        {
          type: settleType,
          pkg: '',
          trx_type: trxType,
          trx_method: '',
          trx_ccy: '',
          country: '',
          min_amount: 0,
          max_amount: 0,
          min_usd_amount: 0,
          max_usd_amount: 0,
          strategies: strategies.split(',').map(s => s.trim()).filter(s => s)
        }
      ]
    };
    onSave(newConfig);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{type === 'payin' ? '代收' : '代付'}配置</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>状态</Label>
            <select
              className="w-full p-2 border rounded"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">启用</option>
              <option value="inactive">禁用</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>结算周期</Label>
            <select
              className="w-full p-2 border rounded"
              value={settleType}
              onChange={(e) => setSettleType(e.target.value)}
            >
              <option value="T0">T+0</option>
              <option value="T1">T+1</option>
              <option value="T2">T+2</option>
              <option value="T3">T+3</option>
              <option value="W1">W+1</option>
              <option value="M1">M+1</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>策略列表（逗号分隔）</Label>
            <Input
              placeholder="例如: default_payin, strategy1"
              value={strategies}
              onChange={(e) => setStrategies(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            确定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
