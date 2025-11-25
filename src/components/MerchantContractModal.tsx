import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus } from 'lucide-react';
import { merchantService, Merchant } from '../services/merchantService';
import { contractService, Contract, ContractConfig } from '../services/contractService';
import { toast } from '../utils/toast';
import { UserTypeLabel } from './UserTypeLabel';
import { StatusBadge } from './StatusBadge';
import { ConfirmDialog } from './ui/confirm-dialog';
import { ContractConfigEditor } from './ContractConfigEditor';

// 编辑合同时的类型
interface EditingContract {
  start_at: string;
  expired_at: string;
  status: string;
  payin?: ContractConfig;
  payout?: ContractConfig;
}

interface MerchantContractModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchant: Merchant | null;
}

export function MerchantContractModal({ open, onOpenChange, merchant }: MerchantContractModalProps) {
  const [merchantContracts, setMerchantContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newContract, setNewContract] = useState<EditingContract>({
    start_at: '',
    expired_at: '',
    status: 'active',
    payin: undefined,
    payout: undefined
  });
  const [showConfigEditor, setShowConfigEditor] = useState(false);
  const [editingConfigType, setEditingConfigType] = useState<'payin' | 'payout'>('payin');

  // 当弹窗打开时加载合同列表
  const loadContracts = useCallback(async () => {
    if (!merchant) return;
    
    setLoading(true);
    try {
      const response = await merchantService.getMerchantContracts({ mid: merchant.mid });
      if (response.success) {
        setMerchantContracts(response.data || []);
      } else {
        toast.error('获取商户合同失败', response.msg);
      }
    } catch (error) {
      console.error('获取商户合同失败:', error);
      toast.error('获取商户合同失败', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [merchant]);

  // 监听弹窗打开/关闭
  useEffect(() => {
    if (open && merchant) {
      loadContracts();
      setIsAdding(false);
    } else if (!open) {
      // 关闭弹窗时重置状态
      setIsAdding(false);
      setNewContract({
        start_at: '',
        expired_at: '',
        status: 'active',
        payin: undefined,
        payout: undefined
      });
    }
  }, [open, merchant, loadContracts]);

  // 新增合同
  const handleAddContract = () => {
    const now = new Date();
    const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    setNewContract({
      start_at: now.toISOString().slice(0, 16),
      expired_at: oneYearLater.toISOString().slice(0, 16),
      status: 'active',
      payin: undefined,
      payout: undefined
    });
    setIsAdding(true);
  };

  // 取消新增
  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewContract({
      start_at: '',
      expired_at: '',
      status: 'active',
      payin: undefined,
      payout: undefined
    });
  };

  // 编辑配置
  const handleEditConfig = (type: 'payin' | 'payout') => {
    setEditingConfigType(type);
    setShowConfigEditor(true);
  };

  // 保存配置
  const handleSaveConfig = (config: ContractConfig) => {
    setNewContract(prev => ({
      ...prev,
      [editingConfigType]: config
    }));
  };

  // 保存新合同
  const handleSaveContract = () => {
    if (!merchant) return;
    if (!newContract.start_at || !newContract.expired_at) {
      toast.error('保存失败', '请填写生效日期和失效日期');
      return;
    }
    setShowConfirm(true);
  };

  // 确认创建合同
  const confirmCreateContract = async () => {
    if (!merchant) return;

    try {
      const params = {
        user_id: merchant.mid,
        user_type: 'merchant',
        start_at: new Date(newContract.start_at).getTime(),
        expired_at: new Date(newContract.expired_at).getTime(),
        status: newContract.status,
        payin: newContract.payin,
        payout: newContract.payout
      };
      const response = await contractService.createMerchantContract(params);

      if (response.success) {
        toast.success('创建合同成功', '');
        handleCancelAdd();
        await loadContracts();
      } else {
        toast.error('创建合同失败', response.msg);
      }
    } catch (error) {
      console.error('创建合同失败:', error);
      toast.error('创建合同失败', '网络错误，请稍后重试');
    }
  };

  // 格式化时间
  const formatDateTime = (timestamp: number) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString('zh-CN');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[75vw] w-[75vw] min-w-[900px] max-h-[85vh] overflow-y-auto" style={{width: '75vw', maxWidth: '75vw'}}>
        <DialogHeader>
          <DialogTitle>合同管理</DialogTitle>
          <DialogDescription>
            <div className="flex items-center justify-between gap-2 mt-1">
              <div className="flex items-center gap-2">
                <UserTypeLabel type={merchant?.type || ''} />
                <span>{merchant?.name}</span>
                <span className="text-muted-foreground">({merchant?.mid})</span>
              </div>
              {!isAdding && (
                <Button size="sm" onClick={handleAddContract}>
                  <Plus className="h-4 w-4 mr-1" />
                  新建
                </Button>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">            {loading ? (
              <div className="text-center py-8 text-muted-foreground">加载中...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>合同ID</TableHead>
                    <TableHead>生效日期</TableHead>
                    <TableHead>失效日期</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>代收</TableHead>
                    <TableHead>代付</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {merchantContracts.map((contract, index) => (
                    <TableRow key={contract.contract_id || contract.id || `contract-${index}`}>
                      <TableCell className="font-mono text-xs">{contract.contract_id || '-'}</TableCell>
                      <TableCell>{formatDateTime(contract.start_at)}</TableCell>
                      <TableCell>{contract.expired_at && contract.expired_at > 0 ? formatDateTime(contract.expired_at) : '永久有效'}</TableCell>
                      <TableCell><StatusBadge status={contract.status} type="trx" /></TableCell>
                      <TableCell><StatusBadge status={contract.payin?.status || ''} type="trx" /></TableCell>
                      <TableCell><StatusBadge status={contract.payout?.status || ''} type="trx" /></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => {/* TODO: 查看详情 */}}>
                          查看
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {isAdding && (
                    <TableRow>
                      <TableCell className="text-muted-foreground">自动生成</TableCell>
                      <TableCell>
                        <input
                          type="datetime-local"
                          value={newContract.start_at}
                          onChange={(e) => setNewContract({ ...newContract, start_at: e.target.value })}
                          className="w-full px-2 py-1 text-sm border rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <input
                          type="datetime-local"
                          value={newContract.expired_at}
                          onChange={(e) => setNewContract({ ...newContract, expired_at: e.target.value })}
                          className="w-full px-2 py-1 text-sm border rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newContract.status === 'active'}
                            onChange={(e) => setNewContract({ ...newContract, status: e.target.checked ? 'active' : 'inactive' })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">启用</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditConfig('payin')}
                        >
                          {newContract.payin ? '已配置' : '编辑'}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditConfig('payout')}
                        >
                          {newContract.payout ? '已配置' : '编辑'}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveContract}>
                            保存
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelAdd}>
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
      </Dialog>

      <ContractConfigEditor
        open={showConfigEditor}
        onOpenChange={setShowConfigEditor}
        type={editingConfigType}
        config={newContract[editingConfigType]}
        onSave={handleSaveConfig}
      />

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="确认创建新合同？"
        description="请确认合同信息无误，创建后将立即生效"
        confirmText="确认创建"
        cancelText="取消"
        onConfirm={confirmCreateContract}
      />
    </>
  );
}
