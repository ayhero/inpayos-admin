import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { ConfirmDialog } from './ui/confirm-dialog';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Check, Building2, User, FileText, Route } from 'lucide-react';
import { cn } from '../utils/utils';
import { UserInfoStep, AccountStep, ContractStep, RouterStep, PreviewStep } from './user-steps/index';
import { ExecutionProgressDialog, ExecutionItem } from './ExecutionProgressDialog';
import { UserService } from '../services/userService';
import { toast } from '../utils/toast';

export type UserType = 'merchant' | 'cashier_team';

export interface UserFormData {
  // 用户信息
  userInfo: {
    name: string;
    email: string;
    phone: string;
    phone_country_code: string;
    type: string;
    status: boolean;
    default_ccy: string;
  };
  // 账户信息
  accounts: Array<{
    ccy: string;
    status: boolean;
    is_default?: boolean;
  }>;
  // 合同信息
  contracts: Array<{
    contract_id?: string;
    start_at: string;
    expired_at?: string;
    status: boolean;
    payin?: any; // ContractConfig type from contractService
    payout?: any; // ContractConfig type from contractService
  }>;
  // 路由信息
  routers: Array<{
    trx_type: string;
    trx_method: string;
    ccy: string;
    country?: string;
    min_amount: number;
    max_amount: number;
    channel_code: string;
    priority: number;
    status: string;
  }>;
}

const INITIAL_FORM_DATA: UserFormData = {
  userInfo: {
    name: '',
    email: '',
    phone: '',
    phone_country_code: '',
    type: 'normal',
    status: true,
    default_ccy: '',
  },
  accounts: [],
  contracts: [{
    start_at: '',
    status: true,
    payin: undefined,
    payout: undefined
  }],
  routers: []
};

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userType: UserType;
  onSuccess?: () => void;
}

export function CreateUserModal({ open, onOpenChange, userType, onSuccess }: CreateUserModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<UserFormData>(INITIAL_FORM_DATA);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [executionItems, setExecutionItems] = useState<ExecutionItem[]>([]);
  const [savedFormData, setSavedFormData] = useState<UserFormData | null>(null);
  const [createdUserId, setCreatedUserId] = useState<string>('');

  const steps = [
    { 
      id: 1, 
      title: '基本信息', 
      icon: userType === 'merchant' ? Building2 : User,
      component: UserInfoStep 
    },
    { id: 2, title: '账户配置', icon: User, component: AccountStep },
    { id: 3, title: '合同配置', icon: FileText, component: ContractStep },
    { id: 4, title: '路由配置', icon: Route, component: RouterStep },
    { id: 5, title: '预览确认', icon: Check, component: PreviewStep }
  ];

  const updateFormData = (field: string, data: any) => {
    setFormData(prev => ({ ...prev, [field]: data }));
  };

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    setShowSubmitConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setShowSubmitConfirm(false);
    
    // 处理手机号验证
    const submitData = { ...formData };
    const userInfo = { ...submitData.userInfo };
    const hasPhone = userInfo.phone && userInfo.phone.trim() !== '';
    const hasCountryCode = userInfo.phone_country_code && userInfo.phone_country_code.trim() !== '';
    
    if (!hasPhone || !hasCountryCode) {
      userInfo.phone = '';
      userInfo.phone_country_code = '';
    }
    submitData.userInfo = userInfo;
    setSavedFormData(submitData);

    // 初始化执行项列表
    const items: ExecutionItem[] = [
      {
        id: 'user',
        type: 'user',
        label: `${userType === 'merchant' ? '商户' : '车队'}: ${userInfo.name || userInfo.email}`,
        status: 'pending',
        data: submitData.userInfo
      },
      ...submitData.accounts.map((acc, idx) => ({
        id: `account-${idx}`,
        type: 'account' as const,
        label: `账户: ${acc.ccy}`,
        status: 'pending' as const,
        data: acc
      })),
      ...submitData.contracts.map((contract, idx) => ({
        id: `contract-${idx}`,
        type: 'contract' as const,
        label: `合同 ${idx + 1}`,
        status: 'pending' as const,
        data: contract
      })),
      ...submitData.routers.map((router, idx) => ({
        id: `router-${idx}`,
        type: 'router' as const,
        label: `路由: ${router.trx_type} - ${router.channel_code}`,
        status: 'pending' as const,
        data: router
      }))
    ];

    setExecutionItems(items);
    setShowProgress(true);

    // 执行创建流程
    await executeCreation(submitData, items);
  };

  const executeCreation = async (submitData: UserFormData, items: ExecutionItem[]) => {
    const updateItemStatus = (id: string, status: ExecutionItem['status'], error?: string) => {
      setExecutionItems(prev => prev.map(item => 
        item.id === id ? { ...item, status, error } : item
      ));
    };

    try {
      // 1. 创建用户
      updateItemStatus('user', 'running');
      const userResponse = await UserService.registerUser({
        user_type: userType,
        email: submitData.userInfo.email,
        password: 'Default@123', // 临时密码，实际应该让用户输入或生成
        nickname: submitData.userInfo.name,
        type: submitData.userInfo.type,
        company_name: submitData.userInfo.name,
        phone: submitData.userInfo.phone,
        phone_country_code: submitData.userInfo.phone_country_code,
        region: '',
        default_ccy: submitData.userInfo.default_ccy,
        verify_code: '' // 管理员创建不需要验证码
      });

      if (!userResponse.success) {
        updateItemStatus('user', 'error', userResponse.msg || '创建用户失败');
        return;
      }

      const userId = userResponse.data?.user_id;
      if (!userId) {
        updateItemStatus('user', 'error', '未获取到用户ID');
        return;
      }

      updateItemStatus('user', 'success');
      setCreatedUserId(userId);

      // 2. 创建账户
      for (let i = 0; i < submitData.accounts.length; i++) {
        const acc = submitData.accounts[i];
        const itemId = `account-${i}`;
        
        updateItemStatus(itemId, 'running');
        const accResponse = await UserService.createAccount({
          user_id: userId,
          user_type: userType,
          ccy: acc.ccy
        });

        if (!accResponse.success) {
          updateItemStatus(itemId, 'error', accResponse.msg || '创建账户失败');
        } else {
          updateItemStatus(itemId, 'success');
        }
      }

      // 3. 创建合同
      for (let i = 0; i < submitData.contracts.length; i++) {
        const contract = submitData.contracts[i];
        const itemId = `contract-${i}`;
        
        updateItemStatus(itemId, 'running');
        const contractResponse = await UserService.createContract({
          user_id: userId,
          user_type: userType,
          contract_id: contract.contract_id,
          start_at: new Date(contract.start_at).getTime(),
          expired_at: contract.expired_at ? new Date(contract.expired_at).getTime() : undefined,
          status: contract.status ? 'active' : 'inactive',
          payin: contract.payin,
          payout: contract.payout
        });

        if (!contractResponse.success) {
          updateItemStatus(itemId, 'error', contractResponse.msg || '创建合同失败');
        } else {
          updateItemStatus(itemId, 'success');
        }
      }

      // 4. 创建路由
      for (let i = 0; i < submitData.routers.length; i++) {
        const router = submitData.routers[i];
        const itemId = `router-${i}`;
        
        updateItemStatus(itemId, 'running');
        const routerResponse = await UserService.createRouter({
          user_id: userId,
          user_type: userType,
          trx_type: router.trx_type,
          trx_method: router.trx_method,
          ccy: router.ccy,
          country: router.country,
          min_amount: router.min_amount,
          max_amount: router.max_amount,
          channel_code: router.channel_code,
          priority: router.priority,
          status: router.status
        });

        if (!routerResponse.success) {
          updateItemStatus(itemId, 'error', routerResponse.msg || '创建路由失败');
        } else {
          updateItemStatus(itemId, 'success');
        }
      }

      // 所有创建完成
      const hasErrors = items.some(item => {
        const current = executionItems.find(ei => ei.id === item.id);
        return current?.status === 'error';
      });

      if (!hasErrors) {
        toast.success('创建成功', '所有配置已成功创建');
        onSuccess?.();
      } else {
        toast.warning('部分创建失败', '请查看详情');
      }

    } catch (error: any) {
      console.error('创建过程出错:', error);
      toast.error('创建失败', error.message || '未知错误');
    }
  };

  const handleRetry = async (item: ExecutionItem) => {
    const updateItemStatus = (id: string, status: ExecutionItem['status'], error?: string) => {
      setExecutionItems(prev => prev.map(item => 
        item.id === id ? { ...item, status, error } : item
      ));
    };

    try {
      updateItemStatus(item.id, 'running');
      
      // 根据项目类型执行相应的重试逻辑
      if (item.type === 'user') {
        const userInfo = item.data;
        const userResponse = await UserService.registerUser({
          user_type: userType,
          email: userInfo.email,
          password: 'Default@123',
          nickname: userInfo.name,
          type: userInfo.type,
          company_name: userInfo.name,
          phone: userInfo.phone,
          phone_country_code: userInfo.phone_country_code,
          region: '',
          default_ccy: userInfo.default_ccy,
          verify_code: ''
        });

        if (!userResponse.success) {
          updateItemStatus(item.id, 'error', userResponse.msg || '创建用户失败');
          return;
        }

        const userId = userResponse.data?.user_id;
        if (userId) {
          setCreatedUserId(userId);
          updateItemStatus(item.id, 'success');
          toast.success('重试成功', '用户创建成功');
        } else {
          updateItemStatus(item.id, 'error', '未获取到用户ID');
        }
      } else if (item.type === 'account') {
        if (!createdUserId) {
          updateItemStatus(item.id, 'error', '用户未创建，无法创建账户');
          return;
        }

        const accResponse = await UserService.createAccount({
          user_id: createdUserId,
          user_type: userType,
          ccy: item.data.ccy
        });

        if (!accResponse.success) {
          updateItemStatus(item.id, 'error', accResponse.msg || '创建账户失败');
        } else {
          updateItemStatus(item.id, 'success');
          toast.success('重试成功', '账户创建成功');
        }
      } else if (item.type === 'contract') {
        if (!createdUserId) {
          updateItemStatus(item.id, 'error', '用户未创建，无法创建合同');
          return;
        }

        const contract = item.data;
        const contractResponse = await UserService.createContract({
          user_id: createdUserId,
          user_type: userType,
          contract_id: contract.contract_id,
          start_at: new Date(contract.start_at).getTime(),
          expired_at: contract.expired_at ? new Date(contract.expired_at).getTime() : undefined,
          status: contract.status ? 'active' : 'inactive',
          payin: contract.payin,
          payout: contract.payout
        });

        if (!contractResponse.success) {
          updateItemStatus(item.id, 'error', contractResponse.msg || '创建合同失败');
        } else {
          updateItemStatus(item.id, 'success');
          toast.success('重试成功', '合同创建成功');
        }
      } else if (item.type === 'router') {
        if (!createdUserId) {
          updateItemStatus(item.id, 'error', '用户未创建，无法创建路由');
          return;
        }

        const router = item.data;
        const routerResponse = await UserService.createRouter({
          user_id: createdUserId,
          user_type: userType,
          trx_type: router.trx_type,
          trx_method: router.trx_method,
          ccy: router.ccy,
          country: router.country,
          min_amount: router.min_amount,
          max_amount: router.max_amount,
          channel_code: router.channel_code,
          priority: router.priority,
          status: router.status
        });

        if (!routerResponse.success) {
          updateItemStatus(item.id, 'error', routerResponse.msg || '创建路由失败');
        } else {
          updateItemStatus(item.id, 'success');
          toast.success('重试成功', '路由创建成功');
        }
      }
    } catch (error: any) {
      console.error('重试失败:', error);
      updateItemStatus(item.id, 'error', error.message || '重试失败');
      toast.error('重试失败', error.message || '未知错误');
    }
  };

  // 批量按顺序重试所有失败项
  const handleRetryAll = async (failedItems: ExecutionItem[]) => {
    // 按照类型顺序排序：user -> account -> contract -> router
    const typeOrder = { 'user': 1, 'account': 2, 'contract': 3, 'router': 4 };
    const sortedItems = [...failedItems].sort((a, b) => 
      typeOrder[a.type as keyof typeof typeOrder] - typeOrder[b.type as keyof typeof typeOrder]
    );

    let hasError = false;
    for (const item of sortedItems) {
      // 如果是依赖项且前置项失败，则跳过
      if (item.type !== 'user' && !createdUserId) {
        continue;
      }

      await handleRetry(item);
      
      // 检查重试后的状态
      const currentItem = executionItems.find(i => i.id === item.id);
      if (currentItem?.status === 'error') {
        hasError = true;
        // 如果是用户创建失败，后续项都不用重试了
        if (item.type === 'user') {
          break;
        }
      }
    }

    if (hasError) {
      toast.warning('批量重试完成', '部分项目仍然失败');
    } else {
      toast.success('批量重试成功', '所有失败项已重试成功');
    }
  };

  const handleProgressClose = () => {
    setShowProgress(false);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData(INITIAL_FORM_DATA);
    setSavedFormData(null);
    setCreatedUserId('');
  };

  const handleClose = () => {
    // 检查是否有数据需要保存
    const hasData = formData.userInfo.name || 
                   formData.userInfo.email || 
                   formData.accounts.length > 0 || 
                   formData.contracts.some(c => c.start_at || c.payin || c.payout) || 
                   formData.routers.length > 0;
    
    if (hasData) {
      setShowCloseConfirm(true);
    } else {
      handleConfirmClose();
    }
  };

  const handleConfirmClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      handleClose();
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;
  const isLastStep = currentStep === steps.length;

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-[90vw] w-[90vw] min-w-[1000px] max-h-[90vh] overflow-hidden p-0">
          <DialogTitle className="sr-only">
            {userType === 'merchant' ? '新建商户' : '新建车队'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {userType === 'merchant' ? '创建新的商户账户和配置' : '创建新的车队账户和配置'}
          </DialogDescription>
        <div className="flex flex-col h-[80vh] max-h-[800px] min-h-[600px]">
          {/* 顶部：步骤进度 - 不显示"步骤***"说明 */}
          <div className="flex items-center justify-between p-6 border-b bg-muted/30">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div 
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all cursor-pointer",
                    "hover:scale-105 hover:shadow-md",
                    currentStep === step.id 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : currentStep > step.id 
                      ? "bg-primary/10 border-primary text-primary hover:bg-primary/20" 
                      : "bg-muted border-muted-foreground/30 text-muted-foreground hover:bg-muted-foreground/10"
                  )}
                  onClick={() => handleStepClick(step.id)}
                  title={`跳转到${step.title}`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <div 
                  className="ml-3 cursor-pointer transition-all hover:scale-105"
                  onClick={() => handleStepClick(step.id)}
                  title={`跳转到${step.title}`}
                >
                  <div className={cn(
                    "text-sm font-medium",
                    currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-16 h-0.5 mx-6 transition-colors",
                    currentStep > step.id ? "bg-primary" : "bg-muted-foreground/30"
                  )} />
                )}
              </div>
            ))}
          </div>

          {/* 中间：具体模块内容 - 不需要Card包装，直接显示内容 */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-6 max-h-full">
              <CurrentStepComponent
                data={formData}
                updateData={updateFormData}
                userType={userType}
              />
            </div>
          </div>

          {/* 底部：工具栏 - 所有操作按钮 */}
          <div className="flex justify-between items-center p-6 border-t bg-muted/30">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              上一步
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                取消
              </Button>
              {isLastStep ? (
                <Button onClick={handleSubmit} className="flex items-center gap-2">
                  提交
                </Button>
              ) : (
                <Button onClick={handleNext} className="flex items-center gap-2">
                  下一步
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* 提交确认对话框 */}
    <ConfirmDialog
      open={showSubmitConfirm}
      onOpenChange={setShowSubmitConfirm}
      title="确认提交"
      description={`确认提交${userType === 'merchant' ? '商户' : '车队'}信息吗？提交后将创建相应的账户、合同和路由配置。`}
      confirmText="确认提交"
      onConfirm={handleConfirmSubmit}
    />

    {/* 关闭确认对话框 */}
    <ConfirmDialog
      open={showCloseConfirm}
      onOpenChange={setShowCloseConfirm}
      title="确认关闭"
      description="您已经填写了一些信息，关闭后所有数据将丢失。确认要关闭吗？"
      confirmText="确认关闭"
      cancelText="继续编辑"
      onConfirm={handleConfirmClose}
      variant="destructive"
    />

    {/* 执行进度对话框 */}
    <ExecutionProgressDialog
      open={showProgress}
      onOpenChange={handleProgressClose}
      items={executionItems}
      title={`创建${userType === 'merchant' ? '商户' : '车队'}进度`}
      autoCloseDelay={6000}
      onRetry={handleRetry}
      onRetryAll={handleRetryAll}
    />
  </>
  );
}