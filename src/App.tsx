import { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog';
import { useAuthStore, User as UserType } from './store/authStore';
import { UserService, UserInfo } from './services/userService';
import { 
  Home, 
  ArrowDownLeft, 
  ArrowUpRight,
  ArrowDownCircle,
  ArrowUpCircle,
  // Calculator,
  Wallet, 
  LogOut,
  Building2,
  Menu,
  KeyRound,
  Users,
  Store,
  FileText,
  Clock,
  Smartphone,
  Route,
  Percent,
  Database,
  ChevronDown
} from 'lucide-react';

import { AuthContainer } from './components/AuthContainer';
import { Dashboard } from './components/Dashboard';
import { PayinRecords } from './components/Payin';
import { PayoutRecords } from './components/Payout';
import { DepositRecords } from './components/DepositRecords';
import { WithdrawRecords } from './components/WithdrawRecords';
// import { Config } from './components/Config';
// import { RefundRecords } from './components/RefundRecords';
// import { RechargeRecords } from './components/RechargeRecords';
// import { SettlementRecords } from './components/SettlementRecords';
import { ChangePasswordPage } from './components/ChangePasswordPage';
import { ToastContainer } from './components/Toast';
import { CashierAccountManagement } from './components/CashierAccountManagement';
import { CashierUserManagement } from './components/CashierUserManagement';
import { MerchantManagement } from './components/MerchantManagement';
import { CashierTeamManagement } from './components/CashierTeamManagement';
import { MerchantContract } from './components/MerchantContract';
import { FleetContract } from './components/FleetContract';
import { MerchantAccount } from './components/MerchantAccount';
import { AccountManagement } from './components/AccountManagement';
// import { MerchantSettlement } from './components/MerchantSettlement';
// import { FleetSettlement } from './components/FleetSettlement';
import { AppAccountManagement } from './components/AppAccountManagement';
import TaskManagement from './components/TaskManagement';
import { MerchantRouter } from './components/MerchantRouter';
import { FleetRouter } from './components/FleetRouter';
import { ChannelManagement } from './components/ChannelManagement';
import { ChannelGroupManagement } from './components/ChannelGroupManagement';
import DictionaryManagement from './components/DictionaryManagement';
import { DispatchStrategyManagement } from './components/DispatchStrategyManagement';
import { CommissionManagementPage } from './components/CommissionManagementPage';

export default function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [merchantInfo, setMerchantInfo] = useState<UserInfo | null>(null);
  const { isLoggedIn, currentUser, login, logout } = useAuthStore();

  const handleLogin = (userInfo: UserType, token: string, refreshToken?: string) => {
    login(userInfo, token, refreshToken);
  };

  const handleLogout = () => {
    logout();
    setActiveMenu('dashboard');
    setMerchantInfo(null);
  };

  const handlePasswordChanged = () => {
    // 密码修改成功后，关闭弹窗，退出登录并跳转到登录页面
    setShowChangePasswordDialog(false);
    logout();
    setActiveMenu('dashboard');
    setMerchantInfo(null);
  };

  // 获取商户信息
  useEffect(() => {
    if (isLoggedIn) {
      UserService.getUserInfo()
        .then(response => {
          if (response.code === '0000') {
            setMerchantInfo(response.data);
          }
        })
        .catch(error => {
          console.error('获取商户信息失败:', error);
        });
    }
  }, [isLoggedIn]);

  // 切换菜单组折叠状态
  const toggleGroupCollapse = (groupId: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupId)) {
      newCollapsed.delete(groupId);
    } else {
      newCollapsed.add(groupId);
    }
    setCollapsedGroups(newCollapsed);
  };

  const menuGroups = [
    {
      id: 'main',
      label: '',
      items: [
        {
          id: 'dashboard',
          label: '首页',
          icon: Home,
          component: Dashboard
        }
      ]
    },
    {
      id: 'payment',
      label: '交易管理',
      items: [
        {
          id: 'payin',
          label: '代收',
          icon: ArrowDownLeft,
          component: PayinRecords
        },
        {
          id: 'payout',
          label: '代付',
          icon: ArrowUpRight,
          component: PayoutRecords
        }
      ]
    },
    {
      id: 'finance',
      label: '资金管理',
      items: [
        {
          id: 'deposit-records',
          label: '充值',
          icon: ArrowDownCircle,
          component: DepositRecords
        },
        {
          id: 'withdraw-records',
          label: '提现',
          icon: ArrowUpCircle,
          component: WithdrawRecords
        }
      ]
    },
    {
      id: 'merchant',
      label: '商户管理',
      items: [
        {
          id: 'merchant',
          label: '商户',
          icon: Store,
          component: MerchantManagement
        },
        {
          id: 'merchant-contract',
          label: '商户合约',
          icon: FileText,
          component: MerchantContract
        },
        {
          id: 'merchant-account',
          label: '商户账户',
          icon: Wallet,
          component: MerchantAccount
        },
        {
          id: 'merchant-router',
          label: '商户路由',
          icon: Route,
          component: MerchantRouter
        },
        {
          id: 'channel-management',
          label: '渠道账户',
          icon: Route,
          component: ChannelManagement
        },
        {
          id: 'channel-group-management',
          label: '渠道组',
          icon: Route,
          component: ChannelGroupManagement
        }
      ]
    },
    {
      id: 'fleet',
      label: '车队管理',
      items: [
        {
          id: 'cashier-team',
          label: '车队',
          icon: Users,
          component: CashierTeamManagement
        },
        {
          id: 'cashier',
          label: '出纳员',
          icon: Users,
          component: CashierUserManagement
        },
        {
          id: 'cashier-account',
          label: '出纳员账户',
          icon: Users,
          component: CashierAccountManagement
        },
        {
          id: 'app-account',
          label: '应用账户',
          icon: Smartphone,
          component: AppAccountManagement
        },
        {
          id: 'fleet-contract',
          label: '车队合约',
          icon: FileText,
          component: FleetContract
        },
        {
          id: 'fleet-account',
          label: '车队账户',
          icon: Wallet,
          component: AccountManagement
        },
        {
          id: 'fleet-router',
          label: '车队路由',
          icon: Route,
          component: FleetRouter
        },
        {
          id: 'commission-management',
          label: '佣金管理',
          icon: Percent,
          component: CommissionManagementPage
        },
        {
          id: 'dispatch-strategy',
          label: '派单策略',
          icon: Route,
          component: DispatchStrategyManagement
        }
      ]
    },
    {
      id: 'system',
      label: '系统管理',
      items: [
        {
          id: 'task-management',
          label: '定时任务',
          icon: Clock,
          component: TaskManagement
        },
        {
          id: 'dictionary-management',
          label: '数据字典',
          icon: Database,
          component: DictionaryManagement
        }
      ]
    }
  ];

  // 为了保持向后兼容，创建扁平的menuItems数组
  const menuItems = menuGroups.flatMap(group => group.items);

  const ActiveComponent = menuItems.find(item => item.id === activeMenu)?.component || Dashboard;

  if (!isLoggedIn) {
    return <AuthContainer onLogin={handleLogin} />;
  }

  return (
    <>
      <div className="flex h-screen w-full">
        {/* 侧边栏 */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 border-r bg-background flex flex-col`}>
          <div className="border-b h-14 flex items-center px-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 flex-shrink-0" />
              {sidebarOpen && (
                <div>
                  <h2 className="font-semibold">InPayOS</h2>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            {menuGroups.map((group) => {
              const isCollapsed = collapsedGroups.has(group.id);
              return (
                <div key={group.id} className="px-3 mb-4">
                  {group.label && sidebarOpen && (
                    <div 
                      className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-3 py-2 uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => toggleGroupCollapse(group.id)}
                    >
                      <span>{group.label}</span>
                      <ChevronDown className={`h-3 w-3 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                    </div>
                  )}
                  {(!isCollapsed || !sidebarOpen) && (
                    <div className="space-y-1">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                            activeMenu === item.id 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => setActiveMenu(item.id)}
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          {sidebarOpen && <span>{item.label}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="flex-1 flex flex-col">
          {/* 顶部导航栏 */}
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4 gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="h-10 w-10 p-0"
              >
                <Menu className="h-6 w-6" />
              </Button>
              
              <div className="flex-1" />
              
              {/* 用户菜单 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatar.png" alt={merchantInfo?.name || currentUser?.companyName} />
                      <AvatarFallback>
                        {(merchantInfo?.name || currentUser?.companyName)?.charAt(0)?.toUpperCase() || 'M'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="font-medium leading-none">{merchantInfo?.name || currentUser?.companyName || '商户'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {merchantInfo?.email || currentUser?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowChangePasswordDialog(true)}>
                    <KeyRound className="mr-2 h-4 w-4" />
                    修改密码
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* 主内容 */}
          <main className="flex-1 overflow-auto">
            <ActiveComponent />
          </main>
        </div>
      </div>
      
      {/* Toast容器 */}
      <ToastContainer />

      {/* 修改密码弹窗 */}
      <Dialog open={showChangePasswordDialog} onOpenChange={() => {}}>
        <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>修改密码</DialogTitle>
          </DialogHeader>
          <ChangePasswordPage 
            onBack={() => setShowChangePasswordDialog(false)}
            onPasswordChanged={handlePasswordChanged}
            isDialog={true}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
