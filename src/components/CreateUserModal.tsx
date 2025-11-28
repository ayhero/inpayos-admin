import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { ConfirmDialog } from './ui/confirm-dialog';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Check, Building2, User, FileText, Route } from 'lucide-react';
import { cn } from '../utils/utils';
import { UserInfoStep, AccountStep, ContractStep, RouterStep, PreviewStep } from './user-steps/index';

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
  const [loading, setLoading] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

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
    setLoading(true);
    try {
      // 处理手机号验证，如果手机号或国家码任一为空，则不提交这些字段
      const submitData = { ...formData };
      const userInfo = { ...submitData.userInfo };
      
      // 检查手机号和国家码是否都有值
      const hasPhone = userInfo.phone && userInfo.phone.trim() !== '';
      const hasCountryCode = userInfo.phone_country_code && userInfo.phone_country_code.trim() !== '';
      
      if (!hasPhone || !hasCountryCode) {
        // 如果任一为空，则将这两个字段设为空字符串
        userInfo.phone = '';
        userInfo.phone_country_code = '';
      }
      
      submitData.userInfo = userInfo;
      
      // TODO: 实现提交逻辑，根据 userType 调用不同的 API
      console.log('提交数据:', { userType, formData: submitData });
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess?.();
      onOpenChange(false);
      setCurrentStep(1);
      setFormData(INITIAL_FORM_DATA);
    } catch (error) {
      console.error('创建失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData(INITIAL_FORM_DATA);
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
                <Button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2">
                  {loading ? '提交中...' : '提交'}
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
  </>
  );
}