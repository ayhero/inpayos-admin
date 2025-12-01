import { useState, useEffect, useCallback, Fragment } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
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
import { RefreshCw, Plus, Save, X, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { commissionService, CommissionConfig, CreateCommissionParams, UpdateCommissionParams } from '../services/commissionService';
import { toast } from '../utils/toast';
import { getCcyLabel, getTrxMethodLabel, CCY_OPTIONS } from '../constants/business';
import { StatusBadge } from './StatusBadge';
import { Label } from './ui/label';
import { formatAmountRange, formatAmountRangeWithCurrency } from '../utils/amountRange';

// 交易类型映射
const getTrxTypeLabel = (trxType: string) => {
  const typeMap: Record<string, string> = {
    'cashier_payin': '代收',
    'cashier_payout': '代付',
  };
  return typeMap[trxType] || trxType;
};

interface CommissionManagementProps {
  userId: string;
  userType: string; // cashier or cashier_team
  teamId?: string; // 出纳员的团队ID
}

export function CommissionManagement({ userId, userType }: CommissionManagementProps) {
  const [commissions, setCommissions] = useState<CommissionConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editData, setEditData] = useState<Partial<CommissionConfig>>({});
  const [createData, setCreateData] = useState<Partial<CreateCommissionParams>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commissionToDelete, setCommissionToDelete] = useState<CommissionConfig | null>(null);

  // 获取佣金配置列表（不分页）
  const fetchCommissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        user_id: userId,
        user_type: userType
      };

      const response = await commissionService.listCommissions(params);
      if (response.success) {
        setCommissions(response.data || []);
      } else {
        setCommissions([]);
        toast.error('获取佣金配置失败', response.msg);
      }
    } catch (error: any) {
      console.error('获取佣金配置列表失败:', error);
      toast.error('获取佣金配置失败', '网络错误');
    } finally {
      setLoading(false);
    }
  }, [userId, userType]);

  useEffect(() => {
    if (userId) {
      fetchCommissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, userType]);

  const handleRefresh = () => {
    fetchCommissions();
  };

  const handleCreate = () => {
    setCreateData({
      user_id: userId,
      user_type: userType,
      cid: userId, // 新增的都是专属佣金
      status: 'active',
      priority: 0,
      trx_type: 'cashier_payin'
    });
    setIsCreating(true);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setCreateData({});
  };

  const handleEdit = (commission: CommissionConfig) => {
    setEditingId(commission.id);
    setEditData({ ...commission });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = (commission: CommissionConfig) => {
    setCommissionToDelete(commission);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!commissionToDelete) return;

    try {
      const response = await commissionService.deleteCommission(commissionToDelete.id);
      if (response.success) {
        toast.success('删除成功', '佣金配置已删除');
        fetchCommissions();
      } else {
        toast.error('删除失败', response.msg);
      }
    } catch (error) {
      console.error('删除佣金配置失败:', error);
      toast.error('删除失败', '网络错误');
    } finally {
      setDeleteDialogOpen(false);
      setCommissionToDelete(null);
    }
  };

  const handleSaveCreate = async () => {
    try {
      const response = await commissionService.createCommission(createData as CreateCommissionParams);
      if (response.success) {
        toast.success('创建成功', '佣金配置已创建');
        setIsCreating(false);
        setCreateData({});
        fetchCommissions();
      } else {
        toast.error('创建失败', response.msg);
      }
    } catch (error) {
      console.error('创建佣金配置失败:', error);
      toast.error('创建失败', '网络错误');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editData.id) return;

    try {
      const { tid, cid, created_at, updated_at, ...updateFields } = editData;
      const updateParams: UpdateCommissionParams = {
        ...updateFields,
        id: editData.id
      };
      
      const response = await commissionService.updateCommission(updateParams);
      if (response.success) {
        toast.success('更新成功', '佣金配置已更新');
        setEditingId(null);
        setEditData({});
        fetchCommissions();
      } else {
        toast.error('更新失败', response.msg);
      }
    } catch (error) {
      console.error('更新佣金配置失败:', error);
      toast.error('更新失败', '网络错误');
    }
  };

  const formatDateTime = (timestamp: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  return (
    <div className="space-y-4">
      {/* 顶部操作按钮 */}
      <div className="flex items-center justify-start gap-2">
        <Button onClick={handleCreate} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          新增
        </Button>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-1" />
          刷新
        </Button>
      </div>

      {/* 佣金配置列表 */}
      {loading ? (
        <div className="text-center py-8">加载中...</div>
      ) : (
        <div className="overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>类型</TableHead>
                <TableHead>交易类型</TableHead>
                <TableHead>交易金额</TableHead>
                <TableHead>佣金</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>优先级</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* 新增行 */}
              {isCreating && (
                <TableRow className="bg-blue-50 dark:bg-blue-950">
                  <TableCell></TableCell>
                  <TableCell>
                    <Badge variant="default" className="bg-blue-500">专属</Badge>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={createData.trx_type} 
                      onValueChange={(value) => setCreateData({...createData, trx_type: value})}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cashier_payin">代收</SelectItem>
                        <SelectItem value="cashier_payout">代付</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Select 
                        value={createData.ccy || ''} 
                        onValueChange={(value) => setCreateData({...createData, ccy: value === 'all' ? '' : value})}
                      >
                        <SelectTrigger className="h-8">
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
                      <div className="flex gap-1">
                        <Input 
                          className="h-8 w-20"
                          type="number"
                          value={createData.min_amount || ''} 
                          onChange={(e) => setCreateData({...createData, min_amount: e.target.value})}
                          placeholder="最小"
                        />
                        <span className="text-muted-foreground text-xs">-</span>
                        <Input 
                          className="h-8 w-20"
                          type="number"
                          value={createData.max_amount || ''} 
                          onChange={(e) => setCreateData({...createData, max_amount: e.target.value})}
                          placeholder="最大"
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Input 
                        className="h-8 w-24"
                        type="number"
                        value={createData.fixed_commission || ''} 
                        onChange={(e) => setCreateData({...createData, fixed_commission: e.target.value})}
                        placeholder="固定佣金"
                      />
                      <Input 
                        className="h-8 w-24"
                        type="number"
                        value={createData.rate || ''} 
                        onChange={(e) => setCreateData({...createData, rate: e.target.value})}
                        placeholder="费率(%)"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        checked={createData.status === 'active'}
                        onCheckedChange={(checked) => setCreateData({...createData, status: checked ? 'active' : 'inactive'})}
                      />
                      <Label className="text-sm cursor-pointer">
                        {createData.status === 'active' ? '启用' : '禁用'}
                      </Label>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input 
                      className="h-8 w-16"
                      type="number"
                      value={createData.priority || 0} 
                      onChange={(e) => setCreateData({...createData, priority: parseInt(e.target.value) || 0})}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={handleSaveCreate}>
                        <Save className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCancelCreate}>
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              
              {/* 数据行 */}
              {commissions.map((commission) => {
                const isEditing = editingId === commission.id;
                const displayData = isEditing ? editData : commission;
                const isExclusive = !!commission.cid; // 是否为专属佣金
                
                return (
                <Fragment key={commission.id}>
                  <TableRow 
                    key={commission.id} 
                    className={isEditing ? 'bg-yellow-50 dark:bg-yellow-950' : 'cursor-pointer hover:bg-gray-50'}
                    onClick={() => !isEditing && setExpandedId(expandedId === commission.id ? null : commission.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {expandedId === commission.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell>
                      {isExclusive ? (
                        <Badge variant="default" className="bg-blue-500">专属</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">全局</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Select 
                          value={editData.trx_type} 
                          onValueChange={(value) => setEditData({...editData, trx_type: value})}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cashier_payin">代收</SelectItem>
                            <SelectItem value="cashier_payout">代付</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge 
                          variant="default" 
                          className={commission.trx_type === 'cashier_payin' ? 'bg-blue-600' : 'bg-orange-600'}
                        >
                          {getTrxTypeLabel(commission.trx_type)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="space-y-1">
                          <Select 
                            value={editData.ccy || 'all'} 
                            onValueChange={(value) => setEditData({...editData, ccy: value === 'all' ? '' : value})}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CCY_OPTIONS.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex gap-1">
                            <Input 
                              className="h-8 w-20"
                              type="number"
                              value={editData.min_amount || ''} 
                              onChange={(e) => setEditData({...editData, min_amount: e.target.value})}
                              placeholder="最小"
                            />
                            <span className="text-muted-foreground text-xs">-</span>
                            <Input 
                              className="h-8 w-20"
                              type="number"
                              value={editData.max_amount || ''} 
                              onChange={(e) => setEditData({...editData, max_amount: e.target.value})}
                              placeholder="最大"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-semibold text-sm">{getCcyLabel(commission.ccy)}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatAmountRange(commission.min_amount, commission.max_amount)}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex flex-col gap-2">
                          <Input 
                            className="h-8 w-24"
                            type="number"
                            placeholder="固定佣金"
                            value={editData.fixed_commission || ''} 
                            onChange={(e) => setEditData({...editData, fixed_commission: e.target.value})}
                          />
                          <Input 
                            className="h-8 w-24"
                            type="number"
                            placeholder="费率(%)"
                            value={editData.rate || ''} 
                            onChange={(e) => setEditData({...editData, rate: e.target.value})}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <div className="text-sm">{commission.fixed_commission ? `固定: ${commission.fixed_commission}` : '-'}</div>
                          <div className="text-sm">{commission.rate ? `费率: ${commission.rate}%` : '-'}</div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={editData.status === 'active'}
                            onCheckedChange={(checked) => setEditData({...editData, status: checked ? 'active' : 'inactive'})}
                          />
                          <Label className="text-sm cursor-pointer">
                            {editData.status === 'active' ? '启用' : '禁用'}
                          </Label>
                        </div>
                      ) : (
                        <StatusBadge status={commission.status} type="account" />
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input 
                          className="h-8 w-16"
                          type="number"
                          value={editData.priority || 0} 
                          onChange={(e) => setEditData({...editData, priority: parseInt(e.target.value) || 0})}
                        />
                      ) : (
                        commission.priority
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {isEditing ? (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                            <Save className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          {isExclusive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(commission)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {isExclusive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(commission)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                  {expandedId === commission.id && (
                    <TableRow>
                      <TableCell colSpan={8} className="bg-muted/30">
                        <div className="p-4 space-y-3">
                          <div className="bg-blue-50 dark:bg-blue-950 rounded p-3">
                            <h5 className="text-sm font-semibold mb-2">明细</h5>
                            <div className="grid grid-cols-4 gap-3 text-xs">
                              <div>
                                <label className="text-muted-foreground">交易类型</label>
                                <p className="mt-1">{getTrxTypeLabel(commission.trx_type)}</p>
                              </div>
                              <div>
                                <label className="text-muted-foreground">币种</label>
                                <p className="mt-1">{getCcyLabel(commission.ccy)}</p>
                              </div>
                              <div>
                                <label className="text-muted-foreground">国家</label>
                                <p className="mt-1">{commission.country || '全部'}</p>
                              </div>
                              <div>
                                <label className="text-muted-foreground">交易方式</label>
                                <p className="mt-1">{commission.trx_method ? getTrxMethodLabel(commission.trx_method) : '全部'}</p>
                              </div>
                              {commission.min_amount && (
                                <div>
                                  <label className="text-muted-foreground">最小金额</label>
                                  <p className="mt-1 font-mono">{commission.min_amount}</p>
                                </div>
                              )}
                              {commission.max_amount && (
                                <div>
                                  <label className="text-muted-foreground">最大金额</label>
                                  <p className="mt-1 font-mono">{commission.max_amount}</p>
                                </div>
                              )}
                              {commission.fixed_commission && (
                                <div>
                                  <label className="text-muted-foreground">固定佣金</label>
                                  <p className="mt-1 font-mono">{commission.fixed_commission}</p>
                                </div>
                              )}
                              {commission.rate && (
                                <div>
                                  <label className="text-muted-foreground">佣金费率</label>
                                  <p className="mt-1 font-mono">{commission.rate}%</p>
                                </div>
                              )}
                              {commission.min_fee && (
                                <div>
                                  <label className="text-muted-foreground">最小手续费</label>
                                  <p className="mt-1 font-mono">{commission.min_fee}</p>
                                </div>
                              )}
                              {commission.max_fee && (
                                <div>
                                  <label className="text-muted-foreground">最大手续费</label>
                                  <p className="mt-1 font-mono">{commission.max_fee}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
                            <div>创建时间: {formatDateTime(commission.created_at)}</div>
                            <div>更新时间: {formatDateTime(commission.updated_at)}</div>
                            <div>优先级: {commission.priority}</div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除这个佣金配置吗？此操作无法撤销。
              {commissionToDelete && (
                <div className="mt-3 p-3 bg-muted rounded-md text-sm space-y-1">
                  <div>交易类型: <span className="font-semibold">{getTrxTypeLabel(commissionToDelete.trx_type)}</span></div>
                  <div>币种: <span className="font-semibold">{getCcyLabel(commissionToDelete.ccy)}</span></div>
                  {commissionToDelete.fixed_commission && (
                    <div>固定佣金: <span className="font-mono">{commissionToDelete.fixed_commission}</span></div>
                  )}
                  {commissionToDelete.rate && (
                    <div>佣金费率: <span className="font-mono">{commissionToDelete.rate}%</span></div>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
