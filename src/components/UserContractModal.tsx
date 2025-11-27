import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, ChevronDown, ChevronUp, Save, X, RefreshCw } from 'lucide-react';
import { merchantService } from '../services/merchantService';
import { contractService, Contract, ContractConfig } from '../services/contractService';
import { toast } from '../utils/toast';
import { UserTypeLabel } from './UserTypeLabel';
import { StatusBadge } from './StatusBadge';
import { ConfirmDialog } from './ui/confirm-dialog';
import { ContractConfigEditor } from './ContractConfigEditor';
import { ContractDetail } from './ContractDetail';

// 编辑合同时的类型
interface EditingContract {
  contract_id_suffix?: string;
  start_at: string;
  expired_at: string;
  status: string;
  payin?: ContractConfig;
  payout?: ContractConfig;
}

interface UserContractModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  userType: 'merchant' | 'cashier_team';
}

export function UserContractModal({ open, onOpenChange, userId, userName, userType }: UserContractModalProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [expandedContractId, setExpandedContractId] = useState<string | null>(null);
  const [newContract, setNewContract] = useState<EditingContract>({
    contract_id_suffix: '',
    start_at: '',
    expired_at: '',
    status: 'active',
    payin: undefined,
    payout: undefined
  });
  const [showConfigEditor, setShowConfigEditor] = useState(false);
  const [editingConfigType, setEditingConfigType] = useState<'payin' | 'payout'>('payin');

  // 加载合同列表
  const loadContracts = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await merchantService.getMerchantContracts({ 
        user_id: userId,
        user_type: userType 
      });
      if (response.success) {
        setContracts(response.data || []);
      } else {
        toast.error('获取合同失败', response.msg);
      }
    } catch (error) {
      console.error('获取合同失败:', error);
      toast.error('获取合同失败', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [userId, userType]);

  // 监听弹窗打开/关闭
  useEffect(() => {
    if (open && userId) {
      loadContracts();
      setIsAdding(false);
      setExpandedContractId(null);
    } else if (!open) {
      setIsAdding(false);
      setExpandedContractId(null);
      setNewContract({
        start_at: '',
        expired_at: '',
        status: 'active',
        payin: undefined,
        payout: undefined
      });
    }
  }, [open, userId, loadContracts]);

  // 新增合同
  const handleAddContract = () => {
    let maxTime = 0;
    
    contracts.forEach(contract => {
      if (contract.start_at > maxTime) {
        maxTime = contract.start_at;
      }
      if (contract.expired_at && contract.expired_at > maxTime) {
        maxTime = contract.expired_at;
      }
    });

    const startTime = maxTime > 0 ? new Date(maxTime) : new Date();
    const endTime = new Date(startTime);
    endTime.setFullYear(endTime.getFullYear() + 1);

    const formatToDatetimeLocal = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    setIsAdding(true);
    setNewContract({
      contract_id_suffix: '',
      start_at: formatToDatetimeLocal(startTime),
      expired_at: formatToDatetimeLocal(endTime),
      status: 'active',
      payin: undefined,
      payout: undefined
    });
  };

  // 取消新增
  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewContract({
      contract_id_suffix: '',
      start_at: '',
      expired_at: '',
      status: 'active',
      payin: undefined,
      payout: undefined
    });
  };

  // 保存新合同
  const handleSaveContract = () => {
    if (!newContract.start_at || !newContract.expired_at) {
      toast.error('保存失败', '请填写生效时间和过期时间');
      return;
    }

    const startTime = new Date(newContract.start_at).getTime();
    const endTime = new Date(newContract.expired_at).getTime();

    if (startTime >= endTime) {
      toast.error('保存失败', '生效时间必须早于过期时间');
      return;
    }

    setShowConfirm(true);
  };

  // 确认创建合同
  const confirmCreateContract = async () => {
    try {
      const response = await contractService.createMerchantContract({
        user_id: userId,
        user_type: userType,
        start_at: new Date(newContract.start_at).getTime(),
        expired_at: new Date(newContract.expired_at).getTime(),
        status: newContract.status,
        payin: newContract.payin,
        payout: newContract.payout
      });

      if (response.success) {
        toast.success('创建合同成功');
        setIsAdding(false);
        setNewContract({
          contract_id_suffix: '',
          start_at: '',
          expired_at: '',
          status: 'active',
          payin: undefined,
          payout: undefined
        });
        loadContracts();
      } else {
        toast.error('创建合同失败', response.msg);
      }
    } catch (error) {
      console.error('创建合同失败:', error);
      toast.error('创建合同失败', '网络错误，请稍后重试');
    } finally {
      setShowConfirm(false);
    }
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
    setShowConfigEditor(false);
  };

  // 展开/收起合同详情
  const toggleExpand = (contractId: string) => {
    setExpandedContractId(prev => prev === contractId ? null : contractId);
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
      <DialogContent className="max-w-[90vw] w-[90vw] min-w-[900px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>合同管理</DialogTitle>
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
            <Button size="sm" onClick={handleAddContract} disabled={isAdding} className="h-9">
              <Plus className="h-4 w-4 mr-1" />
              新建
            </Button>
            <Button size="sm" variant="outline" onClick={loadContracts} className="h-9">
              <RefreshCw className="h-4 w-4 mr-1" />
              刷新
            </Button>
          </div>

          <div className="overflow-auto max-h-[60vh]">
            {isAdding && (
              <div className="mb-4 p-4 border rounded-lg bg-blue-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">新增合同</h3>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveContract}>
                      <Save className="h-4 w-4 mr-1" />
                      保存
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelAdd}>
                      <X className="h-4 w-4 mr-1" />
                      取消
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">合同ID后缀（可选）</label>
                    <Input
                      placeholder="留空则自动生成"
                      value={newContract.contract_id_suffix || ''}
                      onChange={(e) => setNewContract({...newContract, contract_id_suffix: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">状态</label>
                    <Select value={newContract.status} onValueChange={(value) => setNewContract({...newContract, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">激活</SelectItem>
                        <SelectItem value="inactive">未激活</SelectItem>
                        <SelectItem value="expired">已过期</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">生效时间</label>
                    <Input
                      type="datetime-local"
                      value={newContract.start_at}
                      onChange={(e) => setNewContract({...newContract, start_at: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">过期时间</label>
                    <Input
                      type="datetime-local"
                      value={newContract.expired_at}
                      onChange={(e) => setNewContract({...newContract, expired_at: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">代收配置</label>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleEditConfig('payin')}
                      className="w-full"
                    >
                      {newContract.payin ? '已配置 - 点击编辑' : '点击配置'}
                    </Button>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">代付配置</label>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleEditConfig('payout')}
                      className="w-full"
                    >
                      {newContract.payout ? '已配置 - 点击编辑' : '点击配置'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>合同ID</TableHead>
                  <TableHead>生效时间</TableHead>
                  <TableHead>过期时间</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <>
                    <TableRow key={contract.id}>
                      <TableCell className="font-mono text-xs">{contract.contract_id}</TableCell>
                      <TableCell>{formatDateTime(contract.start_at)}</TableCell>
                      <TableCell>{contract.expired_at ? formatDateTime(contract.expired_at) : '永不过期'}</TableCell>
                      <TableCell><StatusBadge status={contract.status} type="trx" /></TableCell>
                      <TableCell>{formatDateTime(contract.created_at)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleExpand(contract.contract_id)}
                        >
                          {expandedContractId === contract.contract_id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedContractId === contract.contract_id && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-gray-50 p-4">
                          <ContractDetail contract={contract} />
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}

                {!loading && !isAdding && contracts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      暂无合同数据
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
        title="确认创建合同"
        description={`确定要为${userType === 'merchant' ? '商户' : '车队'} ${userName} 创建新合同吗？`}
        onConfirm={confirmCreateContract}
      />

      <Dialog open={showConfigEditor} onOpenChange={setShowConfigEditor}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingConfigType === 'payin' ? '代收' : '代付'}配置</DialogTitle>
          </DialogHeader>
          <ContractConfigEditor
            open={showConfigEditor}
            onOpenChange={setShowConfigEditor}
            type={editingConfigType}
            config={newContract[editingConfigType]}
            onSave={handleSaveConfig}
          />
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
