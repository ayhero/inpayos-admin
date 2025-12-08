import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, RefreshCw, Building2, Eye, EyeOff, Key, FileText, Route, Wallet, Plus, DollarSign, ArrowDownToLine } from 'lucide-react';
import { merchantService, Merchant, MerchantListParams, MerchantStats } from '../services/merchantService';
import { toast } from '../utils/toast';
import { MerchantSecretModal } from './MerchantSecretModal';
import { UserAccountModal } from './UserAccountModal';
import { UserContractModal } from './UserContractModal';
import { UserRouterModal } from './UserRouterModal';
import { RechargeModal } from './RechargeModal';
import { WithdrawModal } from './WithdrawModal';
import { StatusBadge } from './StatusBadge';
import { getChannelCodeLabel, getCcyLabel, getCountryLabel } from '../constants/business';
import { CreateUserModal } from './CreateUserModal';
import { formatAmountRange } from '../utils/amountRange';

export function MerchantManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [stats, setStats] = useState<MerchantStats>({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  });
  const [visibleSecrets, setVisibleSecrets] = useState<Set<number>>(new Set());
  
  // 独立模块弹窗状态
  const [showSecretsModal, setShowSecretsModal] = useState(false);
  const [selectedMerchantForSecrets, setSelectedMerchantForSecrets] = useState<Merchant | null>(null);
  
  const [showContractsModal, setShowContractsModal] = useState(false);
  const [selectedMerchantForContracts, setSelectedMerchantForContracts] = useState<Merchant | null>(null);

  const [showRoutersModal, setShowRoutersModal] = useState(false);
  const [selectedMerchantForRouters, setSelectedMerchantForRouters] = useState<Merchant | null>(null);

  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const [selectedMerchantForAccounts, setSelectedMerchantForAccounts] = useState<Merchant | null>(null);

  // 充值模态窗状态
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [selectedMerchantForRecharge, setSelectedMerchantForRecharge] = useState<Merchant | null>(null);

  // 提现模态窗状态
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedMerchantForWithdraw, setSelectedMerchantForWithdraw] = useState<Merchant | null>(null);

  // 新建商户模态窗状态
  const [showCreateMerchantModal, setShowCreateMerchantModal] = useState(false);

  // 获取商户统计
  const fetchStats = useCallback(async () => {
    try {
      const response = await merchantService.getMerchantStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('获取统计数据失败:', error);
    }
  }, []);

  // 获取商户列表
  const fetchMerchants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: MerchantListParams = {
        page: pagination.page,
        size: pagination.size
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (searchTerm) {
        if (searchTerm.includes('@')) {
          params.email = searchTerm;
        } else if (/^\d+$/.test(searchTerm)) {
          params.phone = searchTerm;
        } else {
          params.name = searchTerm;
        }
      }

      const response = await merchantService.getMerchantList(params);
      if (response.success) {
        setMerchants(response.data.list);
        setPagination(prev => ({
          ...prev,
          total: response.data.total,
          totalPages: Math.ceil(response.data.total / prev.size)
        }));
      } else {
        setMerchants([]);
        setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
        setError(response.msg || '获取数据失败');
      }
    } catch (error: any) {
      console.error('获取商户列表失败:', error);
      setMerchants([]);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
      setError(error.message || '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, statusFilter, searchTerm]);

  useEffect(() => {
    fetchMerchants();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.size, statusFilter, searchTerm]);

  const handleRefresh = () => {
    fetchMerchants();
    fetchStats();
  };

  const formatDateTime = (timestamp: number) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString('zh-CN');
  };

  const handleViewDetail = async (merchant: Merchant) => {
    try {
      const response = await merchantService.getMerchantDetail({ user_id: merchant.user_id });
      if (response.success) {
        setSelectedMerchant(response.data);
        setVisibleSecrets(new Set());
      } else {
        toast.error('获取商户详情失败', response.msg);
      }
    } catch (error) {
      console.error('获取商户详情失败:', error);
      toast.error('获取商户详情失败', '网络错误，请稍后重试');
    }
  };

  const toggleSecretVisibility = (secretId: number) => {
    setVisibleSecrets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(secretId)) {
        newSet.delete(secretId);
      } else {
        newSet.add(secretId);
      }
      return newSet;
    });
  };

  // 打开充值弹窗
  const handleRecharge = (merchant: Merchant) => {
    setSelectedMerchantForRecharge(merchant);
    setShowRechargeModal(true);
  };

  // 充值成功后刷新数据
  const handleRechargeSuccess = () => {
    fetchMerchants();
    // 如果详情窗口打开，也刷新详情
    if (selectedMerchant) {
      handleViewDetail(selectedMerchant);
    }
  };

  // 打开提现弹窗
  const handleWithdraw = (merchant: Merchant) => {
    setSelectedMerchantForWithdraw(merchant);
    setShowWithdrawModal(true);
  };

  // 提现成功后刷新数据
  const handleWithdrawSuccess = () => {
    fetchMerchants();
    // 如果详情窗口打开，也刷新详情
    if (selectedMerchant) {
      handleViewDetail(selectedMerchant);
    }
  };

  const maskSecretKey = (secretKey: string) => {
    if (!secretKey) return '';
    const parts = secretKey.split('_');
    if (parts.length >= 2) {
      // 保留前缀部分，后面的部分用星号替换，星号数量与原始长度一致
      const prefix = `${parts[0]}_${parts[1]}_`;
      const remaining = secretKey.substring(prefix.length);
      return prefix + '*'.repeat(remaining.length);
    }
    // 如果不是标准格式，保留前8个字符，其余用星号替换
    const visiblePart = secretKey.substring(0, 8);
    const hiddenPart = secretKey.substring(8);
    return visiblePart + '*'.repeat(hiddenPart.length);
  };

  // 处理查看商户密钥
  const handleViewSecrets = (merchant: Merchant) => {
    setSelectedMerchantForSecrets(merchant);
    setShowSecretsModal(true);
  };

  // 处理查看商户合同
  const handleViewContracts = (merchant: Merchant) => {
    setSelectedMerchantForContracts(merchant);
    setShowContractsModal(true);
  };

  // 处理查看商户路由
  const handleViewRouters = (merchant: Merchant) => {
    setSelectedMerchantForRouters(merchant);
    setShowRoutersModal(true);
  };

  // 处理查看商户账户
  const handleViewAccounts = (merchant: Merchant) => {
    setSelectedMerchantForAccounts(merchant);
    setShowAccountsModal(true);
  };

  // 处理新建商户成功
  const handleCreateMerchantSuccess = () => {
    fetchMerchants();
    fetchStats();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">商户管理</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateMerchantModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            新建
          </Button>
          <Button onClick={handleRefresh} className="gap-2" variant="outline">
            <RefreshCw className="h-4 w-4" />
            刷新
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-500">错误: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总数</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">激活</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">未激活</CardTitle>
            <Building2 className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">暂停</CardTitle>
            <Building2 className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 md:flex-initial md:w-80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索商户名称、邮箱或电话..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  maxLength={100}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">激活</SelectItem>
                <SelectItem value="inactive">未激活</SelectItem>
                <SelectItem value="suspended">暂停</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-12">加载中...</div>
          ) : !merchants || merchants.length === 0 ? (
            <div className="text-center py-12 text-gray-500">暂无数据</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>商户</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>电话</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {merchants.map((merchant) => (
                  <TableRow key={merchant.user_id}>
                    <TableCell>
                      <div className="font-semibold">{merchant.name}</div>
                      <div className="font-mono text-xs text-muted-foreground">{merchant.user_id}</div>
                    </TableCell>
                    <TableCell>{merchant.email}</TableCell>
                    <TableCell>{merchant.phone}</TableCell>
                    <TableCell><StatusBadge status={merchant.status} type="account" /></TableCell>
                    <TableCell>{formatDateTime(merchant.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetail(merchant)}>
                          查看
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleViewAccounts(merchant)}>
                          <Wallet className="h-4 w-4 mr-1" />
                          账户
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleRecharge(merchant)} className="text-green-600 hover:text-green-700">
                          <DollarSign className="h-4 w-4 mr-1" />
                          充值
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleWithdraw(merchant)} className="text-amber-600 hover:text-amber-700">
                          <ArrowDownToLine className="h-4 w-4 mr-1" />
                          提现
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleViewSecrets(merchant)}>
                          <Key className="h-4 w-4 mr-1" />
                          密钥
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleViewContracts(merchant)}>
                          <FileText className="h-4 w-4 mr-1" />
                          合同
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleViewRouters(merchant)}>
                          <Route className="h-4 w-4 mr-1" />
                          路由
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {!loading && merchants && merchants.length > 0 && (
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

      {/* 商户详情对话框 */}
      <Dialog open={!!selectedMerchant} onOpenChange={() => setSelectedMerchant(null)}>
        <DialogContent className="max-w-[60vw] w-[60vw] min-w-[700px] max-h-[90vh]" style={{width: '60vw', maxWidth: '60vw'}}>
          <DialogHeader>
            <DialogTitle>商户详情</DialogTitle>
          </DialogHeader>
          {selectedMerchant && (
            <div className="space-y-6 py-4 max-h-[75vh] overflow-y-auto">
              {/* 基本信息 - 顶部模块 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">基本信息</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">商户ID</label>
                    <p className="text-base font-semibold font-mono mt-1">{selectedMerchant.user_id}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">商户名称</label>
                    <p className="text-base font-semibold mt-1">{selectedMerchant.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">邮箱</label>
                    <p className="text-base font-semibold mt-1">{selectedMerchant.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">状态</label>
                    <p className="mt-1"><StatusBadge status={selectedMerchant.status} type="account" /></p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">2FA</label>
                    <p className="text-base font-semibold mt-1">{selectedMerchant.has_g2fa ? '已启用' : '未启用'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">创建时间</label>
                    <p className="text-base font-semibold mt-1">{formatDateTime(selectedMerchant.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">更新时间</label>
                    <p className="text-base font-semibold mt-1">{formatDateTime(selectedMerchant.updated_at)}</p>
                  </div>
                </div>
              </div>

              {/* Tab 页面 */}
              <Tabs defaultValue="secrets" className="w-full">
                <TabsList>
                  <TabsTrigger value="secrets">
                    密钥 ({selectedMerchant.secrets?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="accounts">
                    账户 ({selectedMerchant.accounts?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="contracts">
                    合同 ({selectedMerchant.contracts?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="routers">
                    路由 ({selectedMerchant.routers?.length || 0})
                  </TabsTrigger>
                </TabsList>

                {/* 密钥列表 Tab */}
                <TabsContent value="secrets" className="mt-4">
                  {selectedMerchant.secrets && selectedMerchant.secrets.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow key="secret-header">
                            <TableHead>App Name</TableHead>
                            <TableHead>App ID</TableHead>
                            <TableHead>Secret Key</TableHead>
                            <TableHead>环境</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>创建时间</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedMerchant.secrets.map((secret) => (
                            <TableRow key={secret.id}>
                              <TableCell>{secret.app_name}</TableCell>
                              <TableCell className="font-mono text-xs">{secret.app_id}</TableCell>
                              <TableCell className="font-mono text-xs">
                                {visibleSecrets.has(secret.id) ? secret.secret_key : maskSecretKey(secret.secret_key)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="ml-2 h-6 px-2"
                                  onClick={() => toggleSecretVisibility(secret.id)}
                                >
                                  {visibleSecrets.has(secret.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </Button>
                              </TableCell>
                              <TableCell>
                                <Badge variant={secret.sandbox ? "outline" : "default"}>
                                  {secret.sandbox ? "沙箱" : "生产"}
                                </Badge>
                              </TableCell>
                              <TableCell><StatusBadge status={secret.status} type="account" /></TableCell>
                              <TableCell>{formatDateTime(secret.created_at)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">暂无密钥</div>
                  )}
                </TabsContent>

                {/* 账户列表 Tab */}
                <TabsContent value="accounts" className="mt-4">
                  {selectedMerchant.accounts && selectedMerchant.accounts.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>币种</TableHead>
                            <TableHead>总余额</TableHead>
                            <TableHead>可用余额</TableHead>
                            <TableHead>冻结余额</TableHead>
                            <TableHead>保证金</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>最后更新时间</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedMerchant.accounts.map((account) => (
                            <TableRow key={account.account_id}>
                              <TableCell>{account.ccy}</TableCell>
                              <TableCell className="font-mono">{parseFloat(account.balance || '0').toFixed(2)}</TableCell>
                              <TableCell className="font-mono text-green-600">{parseFloat(account.available_balance || '0').toFixed(2)}</TableCell>
                              <TableCell className="font-mono text-red-600">{parseFloat(account.frozen_balance || '0').toFixed(2)}</TableCell>
                              <TableCell className="font-mono">{parseFloat(account.margin_balance || '0').toFixed(2)}</TableCell>
                              <TableCell><StatusBadge status={account.status} type="account" /></TableCell>
                              <TableCell>{formatDateTime(account.updated_at)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">暂无账户</div>
                  )}
                </TabsContent>

                {/* 合同列表 Tab */}
                <TabsContent value="contracts" className="mt-4">
                  {selectedMerchant.contracts && selectedMerchant.contracts.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow key="contract-header">
                            <TableHead>合同ID</TableHead>
                            <TableHead>生效时间</TableHead>
                            <TableHead>过期时间</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>创建时间</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedMerchant.contracts.map((contract) => (
                            <TableRow key={contract.id}>
                              <TableCell className="font-mono text-xs">{contract.contract_id}</TableCell>
                              <TableCell>{formatDateTime(contract.start_at)}</TableCell>
                              <TableCell>{contract.expired_at ? formatDateTime(contract.expired_at) : '永不过期'}</TableCell>
                              <TableCell><StatusBadge status={contract.status} type="trx" /></TableCell>
                              <TableCell>{formatDateTime(contract.created_at)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">暂无合同</div>
                  )}
                </TabsContent>

                {/* 路由列表 Tab */}
                <TabsContent value="routers" className="mt-4">
                  {selectedMerchant.routers && selectedMerchant.routers.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow key="router-header">
                            <TableHead>路由类型</TableHead>
                            <TableHead>交易类型</TableHead>
                            <TableHead>渠道</TableHead>
                            <TableHead>币种</TableHead>
                            <TableHead>国家</TableHead>
                            <TableHead>金额范围</TableHead>
                            <TableHead>优先级</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>创建时间</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedMerchant.routers.map((router) => (
                            <TableRow key={router.id}>
                              <TableCell>
                                {!router.user_id || router.user_id === '' ? (
                                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                                    全局路由
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                                    专属路由
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant={router.trx_type === 'payin' ? 'default' : 'secondary'}>
                                  {router.trx_type === 'payin' ? '代收' : '代付'}
                                </Badge>
                                {router.trx_method && <span className="ml-2 text-muted-foreground">- {router.trx_method.toUpperCase()}</span>}
                              </TableCell>
                              <TableCell>{getChannelCodeLabel(router.channel_code)}</TableCell>
                              <TableCell>{getCcyLabel(router.ccy || '')}</TableCell>
                              <TableCell>{getCountryLabel(router.country || '')}</TableCell>
                              <TableCell>
                                {formatAmountRange(router.min_amount, router.max_amount)}
                              </TableCell>
                              <TableCell>{router.priority || 0}</TableCell>
                              <TableCell><StatusBadge status={router.status} type="account" /></TableCell>
                              <TableCell>{formatDateTime(router.created_at)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">暂无路由</div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 独立的商户密钥管理模块 */}
      {selectedMerchantForSecrets && (
        <MerchantSecretModal
          open={showSecretsModal}
          onOpenChange={setShowSecretsModal}
          merchant={selectedMerchantForSecrets}
        />
      )}

      {/* 独立的商户合同管理模块 */}
      {selectedMerchantForContracts && (
        <UserContractModal
          open={showContractsModal}
          onOpenChange={setShowContractsModal}
          userId={selectedMerchantForContracts.user_id}
          userName={selectedMerchantForContracts.name}
          userType="merchant"
        />
      )}

      {/* 独立的商户路由管理模块 */}
      {selectedMerchantForRouters && (
        <UserRouterModal
          open={showRoutersModal}
          onOpenChange={setShowRoutersModal}
          userId={selectedMerchantForRouters.user_id}
          userName={selectedMerchantForRouters.name}
          userType="merchant"
        />
      )}

      {/* 独立的账户充值模块 */}
      {selectedMerchantForRecharge && (
        <RechargeModal
          open={showRechargeModal}
          onOpenChange={setShowRechargeModal}
          userId={selectedMerchantForRecharge.user_id}
          userName={selectedMerchantForRecharge.name}
          userType="merchant"
          onSuccess={handleRechargeSuccess}
        />
      )}

      {/* 独立的账户提现模块 */}
      {selectedMerchantForWithdraw && (
        <WithdrawModal
          open={showWithdrawModal}
          onOpenChange={setShowWithdrawModal}
          userId={selectedMerchantForWithdraw.user_id}
          userName={selectedMerchantForWithdraw.name}
          userType="merchant"
          onSuccess={handleWithdrawSuccess}
        />
      )}

      {/* 独立的商户账户管理模块 */}
      {selectedMerchantForAccounts && (
        <UserAccountModal
          open={showAccountsModal}
          onOpenChange={setShowAccountsModal}
          userId={selectedMerchantForAccounts.user_id}
          userName={selectedMerchantForAccounts.name}
          userType="merchant"
        />
      )}

      {/* 新建商户模态窗 */}
      <CreateUserModal
        open={showCreateMerchantModal}
        onOpenChange={setShowCreateMerchantModal}
        userType="merchant"
        onSuccess={handleCreateMerchantSuccess}
      />
    </div>
  );
}
