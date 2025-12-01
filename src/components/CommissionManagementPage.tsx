import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { commissionManagementService, CommissionConfig, CommissionListParams, CreateCommissionParams, UpdateCommissionParams } from '../services/commissionManagementService';
import { toast } from '../utils/toast';
import { StatusBadge } from './StatusBadge';
import { getTrxTypeBadgeConfig } from '../constants/status';
import { CCY_OPTIONS, getCcyLabel } from '../constants/business';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

// 佣金管理专用的交易类型选项（只支持 cashier_payin 和 cashier_payout）
const COMMISSION_TRX_TYPE_OPTIONS = [
  { value: 'cashier_payin', label: '出纳代收' },
  { value: 'cashier_payout', label: '出纳代付' },
];

const formatDateTime = (timestamp: number) => {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleString('zh-CN');
};

const CommissionFormModal = ({
  isOpen,
  onClose,
  onSave,
  commission,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateCommissionParams | UpdateCommissionParams) => void;
  commission: Partial<CommissionConfig> | null;
}) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (commission) {
      setFormData(commission);
    } else {
      setFormData({
        trx_type: 'cashier_payin',
        status: 'active',
        ccy: 'INR',
        priority: 100,
      });
    }
  }, [commission]);

  const handleSave = () => {
    if (!formData.trx_type) {
      toast.error('请选择交易类型');
      return;
    }
    onSave(formData as any);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!w-[40vw] !max-w-[40vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{commission?.id ? '编辑' : '创建'}佣金配置</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* 第一行：团队ID、出纳员ID、优先级、状态 */}
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-4">
              <Input
                placeholder="团队ID（可选）"
                value={formData.tid || ''}
                onChange={(e) => handleChange('tid', e.target.value)}
              />
            </div>
            <div className="col-span-4">
              <Input
                placeholder="出纳员ID（可选）"
                value={formData.cid || ''}
                onChange={(e) => handleChange('cid', e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                placeholder="优先级"
                value={formData.priority || 0}
                onChange={(e) => handleChange('priority', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <div 
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer"
                style={{ backgroundColor: formData.status === 'active' ? '#22c55e' : '#e5e7eb' }}
                onClick={() => handleChange('status', formData.status === 'active' ? 'inactive' : 'active')}
              >
                <span 
                  className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  style={{ transform: formData.status === 'active' ? 'translateX(24px)' : 'translateX(4px)' }}
                />
              </div>
              <span className={`text-sm font-medium ${formData.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                {formData.status === 'active' ? '启用' : '禁用'}
              </span>
            </div>
          </div>

          {/* 交易配置模块 */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-sm">交易配置</h3>
            <div className="grid grid-cols-2 gap-4">
              <Select value={formData.trx_type || ''} onValueChange={(value) => handleChange('trx_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="交易类型（必填）" />
                </SelectTrigger>
                <SelectContent>
                  {COMMISSION_TRX_TYPE_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={formData.ccy || 'all'} onValueChange={(value) => handleChange('ccy', value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="货币" />
                </SelectTrigger>
                <SelectContent>
                  {CCY_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 交易金额模块 */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-sm">交易金额</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                step="0.01"
                placeholder="最小金额"
                value={formData.min_amount || ''}
                onChange={(e) => handleChange('min_amount', parseFloat(e.target.value) || undefined)}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="最大金额"
                value={formData.max_amount || ''}
                onChange={(e) => handleChange('max_amount', parseFloat(e.target.value) || undefined)}
              />
            </div>
          </div>

          {/* 佣金费率模块 */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-sm">佣金费率</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                step="0.01"
                placeholder="固定佣金"
                value={formData.fixed_commission || ''}
                onChange={(e) => handleChange('fixed_commission', parseFloat(e.target.value) || undefined)}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="费率 (%)"
                value={formData.rate || ''}
                onChange={(e) => handleChange('rate', parseFloat(e.target.value) || undefined)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>取消</Button>
            <Button onClick={handleSave}>确定</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export function CommissionManagementPage() {
  const [filters, setFilters] = useState<Omit<CommissionListParams, 'page' | 'size'>>({});
  const [commissions, setCommissions] = useState<CommissionConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, size: 20, total: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<Partial<CommissionConfig> | null>(null);

  const fetchCommissions = useCallback(async () => {
    setLoading(true);
    try {
      const params: CommissionListParams = { ...filters, page: pagination.page, size: pagination.size };
      const res = await commissionManagementService.getCommissionList(params);
      if (res.success && res.data) {
        setCommissions(res.data.records || []);
        setPagination(prev => ({ ...prev, total: res.data!.total }));
      } else {
        setCommissions([]);
        toast.error(res.msg || '获取列表失败');
      }
    } catch (error) {
      setCommissions([]);
      toast.error('网络错误');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.size]);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  const handleFilterChange = (field: string, value: string) => {
    const filterValue = value === 'all' ? '' : value;
    setFilters(prev => ({ ...prev, [field]: filterValue }));
  };

  // Auto-search when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchCommissions();
  }, [filters]);

  const handleOpenModal = (commission: Partial<CommissionConfig> | null = null) => {
    setSelectedCommission(commission);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCommission(null);
  };

  const handleSave = async (data: CreateCommissionParams | UpdateCommissionParams) => {
    try {
      const res = 'id' in data
        ? await commissionManagementService.updateCommission(data as UpdateCommissionParams)
        : await commissionManagementService.createCommission(data as CreateCommissionParams);

      if (res.success) {
        toast.success('保存成功');
        handleCloseModal();
        fetchCommissions();
      } else {
        toast.error(res.msg || '保存失败');
      }
    } catch (error) {
      toast.error('网络错误');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await commissionManagementService.deleteCommission({ id });
      if (res.success) {
        toast.success('删除成功');
        fetchCommissions();
      } else {
        toast.error(res.msg || '删除失败');
      }
    } catch (error) {
      toast.error('网络错误');
    }
  };

  const formatAmountRange = (min?: number, max?: number, ccy?: string) => {
    const ccyLabel = ccy ? `${getCcyLabel(ccy)} ` : '';
    if ((min === undefined || min === null || min <= 0) && (max === undefined || max === null || max <= 0)) return '不限';
    if (min && (max === undefined || max === null || max <= 0)) return `${ccyLabel}${min} 起`;
    if (max && (min === undefined || min === null || min <= 0)) return `${ccyLabel}${max} 以下`;
    return `${ccyLabel}${min} - ${max}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">佣金管理</h1>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="h-4 w-4" />
          创建
        </Button>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 md:flex-initial md:w-48">
              <Input 
                placeholder="团队ID" 
                value={filters.tid || ''} 
                onChange={e => handleFilterChange('tid', e.target.value)} 
                maxLength={50}
              />
            </div>
            <div className="flex-1 md:flex-initial md:w-48">
              <Input 
                placeholder="出纳员ID" 
                value={filters.cid || ''} 
                onChange={e => handleFilterChange('cid', e.target.value)} 
                maxLength={50}
              />
            </div>
            <Select value={filters.trx_type || 'all'} onValueChange={value => handleFilterChange('trx_type', value)}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="交易类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有类型</SelectItem>
                {COMMISSION_TRX_TYPE_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.status || 'all'} onValueChange={value => handleFilterChange('status', value)}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="active">启用</SelectItem>
                <SelectItem value="inactive">禁用</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 数据表格 */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>类型</TableHead>
                <TableHead>金额范围</TableHead>
                <TableHead>费率</TableHead>
                <TableHead>固定费用</TableHead>
                <TableHead>优先级</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center">加载中...</TableCell></TableRow>
              ) : !commissions || commissions.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center">暂无数据</TableCell></TableRow>
              ) : (
                commissions.map(c => (
                  <TableRow key={c.id}>
                    <TableCell>
                      {(() => {
                        const config = getTrxTypeBadgeConfig(c.trx_type);
                        return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
                      })()}
                    </TableCell>
                    <TableCell>{formatAmountRange(c.min_amount, c.max_amount, c.ccy)}</TableCell>
                    <TableCell>{c.rate !== undefined ? `${c.rate}%` : '-'}</TableCell>
                    <TableCell>{c.fixed_commission !== undefined ? `${getCcyLabel(c.ccy)} ${c.fixed_commission}` : '-'}</TableCell>
                    <TableCell>{c.priority}</TableCell>
                    <TableCell><StatusBadge status={c.status} type="account" /></TableCell>
                    <TableCell>{formatDateTime(c.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(c)}><Edit className="h-4 w-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认删除?</AlertDialogTitle>
                              <AlertDialogDescription>
                                此操作无法撤销。确定要删除此佣金配置 (ID: {c.id}) 吗？
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(c.id)}>删除</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isModalOpen && (
        <CommissionFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          commission={selectedCommission}
        />
      )}
    </div>
  );
}