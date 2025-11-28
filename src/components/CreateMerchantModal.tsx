import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ChevronLeft, ChevronRight, Check, Building2, User, FileText, Route } from 'lucide-react';
import { cn } from '../utils/utils';
import { MerchantInfoStep, AccountStep, ContractStep, RouterStep, PreviewStep } from './merchant-steps';

export interface MerchantFormData {
  // 商户信息
  merchantInfo: {
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

const INITIAL_FORM_DATA: MerchantFormData = {
  merchantInfo: {
    name: '',
    email: '',
    phone: '',
    phone_country_code: '+91',
    type: 'merchant',
    status: true,
    default_ccy: ''
  },
  accounts: [],
  contracts: [],
  routers: []
};

const STEPS = [
  {
    id: 'merchant-info',
    title: '商户信息',
    icon: Building2,
    description: '填写基本商户信息'
  },
  {
    id: 'accounts',
    title: '账户配置',
    icon: User,
    description: '创建商户账户'
  },
  {
    id: 'contracts',
    title: '合同配置',
    icon: FileText,
    description: '设置合同信息'
  },
  {
    id: 'routers',
    title: '路由配置',
    icon: Route,
    description: '配置支付路由'
  },
  {
    id: 'preview',
    title: '预览确认',
    icon: Check,
    description: '确认所有信息'
  }
];

interface CreateMerchantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateMerchantModal({ open, onOpenChange, onSuccess }: CreateMerchantModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<MerchantFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // 只允许跳转到当前步骤或之前的步骤
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const updateFormData = (section: keyof MerchantFormData, data: MerchantFormData[keyof MerchantFormData]) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: 实现API提交逻辑
      console.log('提交表单数据:', formData);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onSuccess?.();
      onOpenChange(false);
      
      // 重置表单
      setFormData(INITIAL_FORM_DATA);
      setCurrentStep(0);
    } catch (error) {
      console.error('创建商户失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // 重置表单
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep(0);
  };

  const isStepValid = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // 商户信息
        return !!(formData.merchantInfo.name && formData.merchantInfo.email && formData.merchantInfo.phone);
      case 1: // 账户
        return formData.accounts.length > 0;
      case 2: // 合同
        return formData.contracts.length > 0;
      case 3: // 路由
        return formData.routers.length > 0;
      case 4: // 预览
        return true;
      default:
        return false;
    }
  };

  const canProceed = isStepValid(currentStep);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <MerchantInfoStep
            data={formData.merchantInfo}
            onChange={(data: typeof formData.merchantInfo) => updateFormData('merchantInfo', data)}
          />
        );
      case 1:
        return (
          <AccountStep
            data={formData.accounts}
            merchantInfo={formData.merchantInfo}
            onChange={(data: typeof formData.accounts) => updateFormData('accounts', data)}
          />
        );
      case 2:
        return (
          <ContractStep
            data={formData.contracts}
            onChange={(data: typeof formData.contracts) => updateFormData('contracts', data)}
          />
        );
      case 3:
        return (
          <RouterStep
            data={formData.routers}
            onChange={(data: typeof formData.routers) => updateFormData('routers', data)}
          />
        );
      case 4:
        return (
          <PreviewStep
            data={formData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[90vw] w-[90vw] min-w-[1000px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>新建商户</DialogTitle>
        </DialogHeader>
        
        <div className="flex h-[75vh]">
          {/* 左侧步骤导航 */}
          <div className="w-64 border-r pr-6 space-y-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const isClickable = index <= currentStep;
              
              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                    isActive && "bg-primary/10 border border-primary/20",
                    isCompleted && !isActive && "bg-green-50 border border-green-200",
                    !isClickable && "cursor-not-allowed opacity-50"
                  )}
                  onClick={() => isClickable && handleStepClick(index)}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    isActive && "bg-primary text-primary-foreground",
                    isCompleted && !isActive && "bg-green-500 text-white",
                    !isActive && !isCompleted && "bg-muted text-muted-foreground"
                  )}>
                    {isCompleted && !isActive ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "font-medium text-sm",
                      isActive && "text-primary",
                      isCompleted && !isActive && "text-green-700"
                    )}>
                      {step.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 右侧内容区域 */}
          <div className="flex-1 pl-6 flex flex-col">
            {/* 步骤内容 */}
            <div className="flex-1 overflow-y-auto">
              <Card className="h-full">
                <CardContent className="p-6 h-full">
                  {renderStepContent()}
                </CardContent>
              </Card>
            </div>

            {/* 底部操作按钮 */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                上一步
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                >
                  取消
                </Button>
                
                {currentStep === STEPS.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? '创建中...' : '创建商户'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed}
                  >
                    下一步
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}