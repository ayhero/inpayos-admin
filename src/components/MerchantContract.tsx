import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Search, RefreshCw, FileText } from 'lucide-react';
import { contractService, Contract, ContractListParams, ContractStats } from '../services/contractService';
import { toast } from '../utils/toast';

export function MerchantContract() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState<ContractStats>({
    total: 0,
    active: 0,
    expired: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  });

  const fetchStats = useCallback(async () => {
    try {
      const response = await contractService.getContractStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('获取统计数据失败:', error);
    }
  }, []);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: ContractListParams = {
        page: pagination.page,
        size: pagination.size,
        contract_type: 'merchant' // 只获取商户合约
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (typeFilter !== 'all') {
        params.contract_type = typeFilter;
      }
      if (searchTerm) {
        if (searchTerm.startsWith('CT')) {
          params.contract_id = searchTerm;
        } else if (searchTerm.startsWith('M')) {
          params.merchant_id = searchTerm;
        } else {
          params.merchant_name = searchTerm;
        }
      }

      const response = await contractService.getContractList(params);
      if (response.success) {
        setContracts(response.data.list);
        setPagination(prev => ({
          ...prev,
          total: response.data.total,
          totalPages: Math.ceil(response.data.total / prev.size)
        }));
      } else {
        setContracts([]);
        setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
        setError(response.msg || '获取数据失败');
      }
    } catch (error: any) {
      console.error('获取商户合约列表失败:', error);
      setContracts([]);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
      setError(error.message || '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, statusFilter, typeFilter, searchTerm]);

  useEffect(() => {
    fetchContracts();
    fetchStats();
  }, [fetchContracts, fetchStats]);

  const handleRefresh = () => {
    fetchContracts();
    fetchStats();
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
      'active': { label: '生效中', variant: 'default', className: 'bg-green-500' },
      'expired': { label: '已过期', variant: 'secondary', className: 'bg-gray-500' },
      'pending': { label: '待生效', variant: 'secondary', className: 'bg-yellow-500' },
      'terminated': { label: '已终止', variant: 'destructive', className: '' }
    };
    const config = configs[status?.toLowerCase()] || { label: status || '-', variant: 'outline' as const, className: '' };
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN');
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const handleViewDetail = async (contract: Contract) => {
    try {
      const response = await contractService.getContractDetail({ contract_id: contract.contract_id });
      if (response.success) {
        setSelectedContract(response.data);
      } else {
        toast.error('获取合约详情失败', response.msg);
      }
    } catch (error) {
      console.error('获取合约详情失败:', error);
      toast.error('获取合约详情失败', '网络错误，请稍后重试');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">商户合约</h1>
        <Button onClick={handleRefresh} className="gap-2" variant="outline">
          <RefreshCw className="h-4 w-4" />
          刷新
        </Button>
      </div>

      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-500">错误: {error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">生效中</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已过期</CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.expired}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待生效</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索合约ID、商户ID或商户名称..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">生效中</SelectItem>
                <SelectItem value="expired">已过期</SelectItem>
                <SelectItem value="pending">待生效</SelectItem>
                <SelectItem value="terminated">已终止</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-12">加载中...</div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">暂无数据</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>合约ID</TableHead>
                  <TableHead>合约编号</TableHead>
                  <TableHead>商户名称</TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>签订日期</TableHead>
                  <TableHead>有效期</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-mono text-xs">{contract.contract_id}</TableCell>
                    <TableCell>{contract.contract_number}</TableCell>
                    <TableCell>{contract.merchant_name}</TableCell>
                    <TableCell>{formatCurrency(contract.amount, contract.currency)}</TableCell>
                    <TableCell>{formatDateTime(contract.sign_date)}</TableCell>
                    <TableCell>
                      {formatDateTime(contract.start_date)} - {formatDateTime(contract.end_date)}
                    </TableCell>
                    <TableCell>{getStatusBadge(contract.status)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetail(contract)}>
                        查看
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {!loading && contracts.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            共 {pagination.total} 条记录，第 {pagination.page} / {pagination.totalPages} 页
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              disabled={pagination.page >= pagination.totalPages}
            >
              下一页
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!selectedContract} onOpenChange={() => setSelectedContract(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>商户合约详情</DialogTitle>
            <DialogDescription>查看商户合约的详细信息</DialogDescription>
          </DialogHeader>
          {selectedContract && (
            <div className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">合约ID</label>
                  <p className="mt-1 font-mono text-sm">{selectedContract.contract_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">合约编号</label>
                  <p className="mt-1">{selectedContract.contract_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">合约标题</label>
                  <p className="mt-1">{selectedContract.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">商户ID</label>
                  <p className="mt-1 font-mono text-sm">{selectedContract.merchant_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">商户名称</label>
                  <p className="mt-1">{selectedContract.merchant_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">合约金额</label>
                  <p className="mt-1 text-lg font-semibold">
                    {formatCurrency(selectedContract.amount, selectedContract.currency)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">状态</label>
                  <p className="mt-1">{getStatusBadge(selectedContract.status)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">签订日期</label>
                  <p className="mt-1">{formatDateTime(selectedContract.sign_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">生效日期</label>
                  <p className="mt-1">{formatDateTime(selectedContract.start_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">到期日期</label>
                  <p className="mt-1">{formatDateTime(selectedContract.end_date)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
