import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, RefreshCw, Users, Wallet, FileText, Route, Plus, GitBranch } from 'lucide-react';
import { cashierTeamService, CashierTeam, CashierTeamListParams, CashierTeamStats } from '../services/cashierTeamService';
import { toast } from '../utils/toast';
import { UserAccountModal } from './UserAccountModal';
import { UserContractModal } from './UserContractModal';
import { UserRouterModal } from './UserRouterModal';
import { DispatchRouterModal } from './DispatchRouterModal';
import { StatusBadge } from './StatusBadge';
import { getChannelCodeLabel, getCcyLabel, getCountryLabel } from '../constants/business';
import { CreateUserModal } from './CreateUserModal';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

export function CashierTeamManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<CashierTeam | null>(null);
  const [teams, setTeams] = useState<CashierTeam[]>([]);
  const [stats, setStats] = useState<CashierTeamStats>({
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

  // 独立模块弹窗状态
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const [selectedTeamForAccounts, setSelectedTeamForAccounts] = useState<CashierTeam | null>(null);

  const [showContractsModal, setShowContractsModal] = useState(false);
  const [selectedTeamForContracts, setSelectedTeamForContracts] = useState<CashierTeam | null>(null);

  const [showRoutersModal, setShowRoutersModal] = useState(false);
  const [selectedTeamForRouters, setSelectedTeamForRouters] = useState<CashierTeam | null>(null);

  // 派单路由模态窗状态
  const [showDispatchRoutersModal, setShowDispatchRoutersModal] = useState(false);
  const [selectedTeamForDispatchRouters, setSelectedTeamForDispatchRouters] = useState<CashierTeam | null>(null);

  // 新建车队模态窗状态
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);

  // 获取CashierTeam统计
  const fetchStats = useCallback(async () => {
    try {
      const response = await cashierTeamService.getCashierTeamStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('获取统计数据失败:', error);
    }
  }, []);

  // 获取CashierTeam列表
  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: CashierTeamListParams = {
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

      const response = await cashierTeamService.getCashierTeamList(params);
      if (response.success) {
        setTeams(response.data.list);
        setPagination(prev => ({
          ...prev,
          total: response.data.total,
          totalPages: Math.ceil(response.data.total / prev.size)
        }));
      } else {
        setTeams([]);
        setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
        setError(response.msg || '获取数据失败');
      }
    } catch (error: any) {
      console.error('获取CashierTeam列表失败:', error);
      setTeams([]);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
      setError(error.message || '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, statusFilter, searchTerm]);

  useEffect(() => {
    fetchTeams();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.size, statusFilter, searchTerm]);

  const handleRefresh = () => {
    fetchTeams();
    fetchStats();
  };

  const formatDateTime = (timestamp: number) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString('zh-CN');
  };

  const handleViewDetail = async (team: CashierTeam) => {
    try {
      const response = await cashierTeamService.getCashierTeamDetail({ user_id: team.user_id });
      if (response.success) {
        setSelectedTeam(response.data);
      } else {
        toast.error('获取车队详情失败', response.msg);
      }
    } catch (error) {
      console.error('获取车队详情失败:', error);
      toast.error('获取车队详情失败', '网络错误，请稍后重试');
    }
  };

  const handleViewAccounts = (team: CashierTeam) => {
    setSelectedTeamForAccounts(team);
    setShowAccountsModal(true);
  };

  const handleViewContracts = (team: CashierTeam) => {
    setSelectedTeamForContracts(team);
    setShowContractsModal(true);
  };

  const handleViewRouters = (team: CashierTeam) => {
    setSelectedTeamForRouters(team);
    setShowRoutersModal(true);
  };

  const handleViewDispatchRouters = (team: CashierTeam) => {
    setSelectedTeamForDispatchRouters(team);
    setShowDispatchRoutersModal(true);
  };

  // 处理新建车队成功
  const handleCreateTeamSuccess = () => {
    fetchTeams();
    fetchStats();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">车队</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateTeamModal(true)} className="gap-2">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">激活</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">未激活</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索车队名称、邮箱或电话..."
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
                <SelectItem value="active">激活</SelectItem>
                <SelectItem value="inactive">未激活</SelectItem>
                <SelectItem value="suspended">暂停</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* CashierTeam列表 */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-12">加载中...</div>
          ) : !teams || teams.length === 0 ? (
            <div className="text-center py-12 text-gray-500">暂无数据</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>手机号</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>成员</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>
                      <div className="font-semibold">{team.name}</div>
                      <div className="font-mono text-xs text-muted-foreground">{team.user_id}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm">{team.email}</div>
                    </TableCell>
                    <TableCell>
                      <div 
                        className="font-mono text-sm cursor-pointer hover:text-blue-600" 
                        title={`用户信息：${team.name} (${team.user_id})\n邮箱：${team.email}\n状态：${team.status}`}
                      >
                        {team.phone}
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge status={team.status} type="account" /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">
                          <span className="text-green-600 font-semibold">
                            {
                              Array.isArray(team.members)
                                ? team.members.filter(m => m.status === 'active').length
                                : 0
                            }
                          </span>
                          <span className="text-muted-foreground">/</span>
                          <span className="font-semibold">
                            {Array.isArray(team.members) ? team.members.length : 0}
                          </span>
                        </span>
                        {team.members && team.members.length > 0 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Users className="h-4 w-4 text-blue-500 cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                                <div className="space-y-1 text-xs">
                                {team.members.map((m, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <span>{m.name || m.user_id}</span>
                                    <StatusBadge status={m.status} type="account" />
                                    <StatusBadge status={m.online_status || 'offline'} type="online" />
                                  </div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetail(team)}>
                          查看
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleViewAccounts(team)}>
                          <Wallet className="h-3 w-3 mr-1" />
                          账户
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleViewContracts(team)}>
                          <FileText className="h-3 w-3 mr-1" />
                          合同
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleViewRouters(team)}>
                          <Route className="h-3 w-3 mr-1" />
                          路由
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleViewDispatchRouters(team)}>
                          <GitBranch className="h-3 w-3 mr-1" />
                          派单
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

      {/* 分页 */}
      {!loading && teams && teams.length > 0 && (
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

      {/* CashierTeam详情对话框 */}
      <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
        <DialogContent className="max-w-[60vw] w-[60vw] min-w-[700px] max-h-[90vh]" style={{width: '60vw', maxWidth: '60vw'}}>
          <DialogHeader>
            <DialogTitle>车队详情</DialogTitle>
          </DialogHeader>
          {selectedTeam && (
            <div className="space-y-6 py-4 max-h-[75vh] overflow-y-auto">
              {/* 基本信息 - 顶部模块 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">基本信息</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">车队ID</label>
                    <p className="text-base font-semibold font-mono mt-1">{selectedTeam.user_id}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">车队名称</label>
                    <p className="text-base font-semibold mt-1">{selectedTeam.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">邮箱</label>
                    <p className="text-base font-semibold mt-1">{selectedTeam.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">电话</label>
                    <p className="text-base font-semibold mt-1">{selectedTeam.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">状态</label>
                    <p className="mt-1"><StatusBadge status={selectedTeam.status} type="account" /></p>
                  </div>
                </div>
              </div>

              {/* Tab 页面 */}
              <Tabs defaultValue="accounts" className="w-full">
                <TabsList>
                  <TabsTrigger value="accounts">
                    账户 ({selectedTeam.accounts?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="contracts">
                    合同 ({selectedTeam.contracts?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="routers">
                    路由 ({selectedTeam.routers?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="dispatch-routers">
                    派单路由 ({selectedTeam.dispatch_routers?.length || 0})
                  </TabsTrigger>
                </TabsList>

                {/* 账户列表 Tab */}
                <TabsContent value="accounts" className="mt-4">
                  {selectedTeam.accounts && selectedTeam.accounts.length > 0 ? (
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
                          {selectedTeam.accounts.map((account) => (
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
                  {selectedTeam.contracts && selectedTeam.contracts.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>合同ID</TableHead>
                            <TableHead>生效时间</TableHead>
                            <TableHead>过期时间</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>创建时间</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedTeam.contracts.map((contract) => (
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
                  {selectedTeam.routers && selectedTeam.routers.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
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
                          {selectedTeam.routers.map((router) => (
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
                                {router.min_amount && router.max_amount 
                                  ? `${router.min_amount} - ${router.max_amount}`
                                  : '-'
                                }
                              </TableCell>
                              <TableCell>{router.priority || 0}</TableCell>
                              <TableCell><StatusBadge status={router.status} type="account" /></TableCell>
                              <TableCell>{formatDateTime(router.updated_at)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">暂无路由</div>
                  )}
                </TabsContent>

                {/* 派单路由列表 Tab */}
                <TabsContent value="dispatch-routers" className="mt-4">
                  {selectedTeam.dispatch_routers && selectedTeam.dispatch_routers.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>路由类型</TableHead>
                            <TableHead>策略名称</TableHead>
                            <TableHead>交易类型</TableHead>
                            <TableHead>币种</TableHead>
                            <TableHead>国家</TableHead>
                            <TableHead>金额范围</TableHead>
                            <TableHead>优先级</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead>生效时间</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedTeam.dispatch_routers.map((router) => (
                            <TableRow key={router.id}>
                              <TableCell>
                                {router.user_id ? (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                                    专属路由
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                                    全局路由
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>{router.strategy?.name || '-'}</TableCell>
                              <TableCell>
                                <Badge variant={router.trx_type === 'payin' ? 'default' : 'secondary'}>
                                  {router.trx_type === 'payin' ? '代收' : '代付'}
                                </Badge>
                                {router.trx_method && <span className="ml-2 text-muted-foreground">- {router.trx_method.toUpperCase()}</span>}
                              </TableCell>
                              <TableCell>{getCcyLabel(router.trx_ccy || '')}</TableCell>
                              <TableCell>{getCountryLabel(router.country || '')}</TableCell>
                              <TableCell>
                                {router.min_amount && router.max_amount 
                                  ? `${router.min_amount} - ${router.max_amount}`
                                  : '-'
                                }
                              </TableCell>
                              <TableCell>{router.priority || 0}</TableCell>
                              <TableCell className="text-xs">
                                {router.status === 'active' ? (
                                  <Badge variant="default" className="bg-green-500">启用</Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-gray-500">禁用</Badge>
                                )}
                              </TableCell>
                              <TableCell>{formatDateTime(router.start_at)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">暂无派单路由</div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 账户管理模态窗 */}
      {selectedTeamForAccounts && (
        <UserAccountModal
          open={showAccountsModal}
          onOpenChange={(open) => {
            setShowAccountsModal(open);
            if (!open) setSelectedTeamForAccounts(null);
          }}
          userId={selectedTeamForAccounts.user_id}
          userName={selectedTeamForAccounts.name}
          userType="cashier_team"
        />
      )}

      {/* 合同管理模态窗 */}
      {selectedTeamForContracts && (
        <UserContractModal
          open={showContractsModal}
          onOpenChange={(open) => {
            setShowContractsModal(open);
            if (!open) setSelectedTeamForContracts(null);
          }}
          userId={selectedTeamForContracts.user_id}
          userName={selectedTeamForContracts.name}
          userType="cashier_team"
        />
      )}

      {/* 路由管理模态窗 */}
      {selectedTeamForRouters && (
        <UserRouterModal
          open={showRoutersModal}
          onOpenChange={(open) => {
            setShowRoutersModal(open);
            if (!open) setSelectedTeamForRouters(null);
          }}
          userId={selectedTeamForRouters.user_id}
          userName={selectedTeamForRouters.name}
          userType="cashier_team"
        />
      )}

      {/* 派单路由管理模态窗 */}
      {selectedTeamForDispatchRouters && (
        <DispatchRouterModal
          open={showDispatchRoutersModal}
          onOpenChange={(open) => {
            setShowDispatchRoutersModal(open);
            if (!open) setSelectedTeamForDispatchRouters(null);
          }}
          userId={selectedTeamForDispatchRouters.user_id}
          userName={selectedTeamForDispatchRouters.name}
          userType="cashier_team"
        />
      )}

      {/* 新建车队模态窗 */}
      <CreateUserModal
        open={showCreateTeamModal}
        onOpenChange={setShowCreateTeamModal}
        userType="cashier_team"
        onSuccess={handleCreateTeamSuccess}
      />
    </div>
  );
}
