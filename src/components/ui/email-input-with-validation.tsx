import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from './input';
import { Label } from './label';
import { Mail, Check, X, Loader2 } from 'lucide-react';
import { emailValidationService } from '../../services/emailValidationService';
import { cn } from '../../utils/utils';

interface EmailInputWithValidationProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
  onValidationChange?: (isValid: boolean, isAvailable: boolean) => void;
}

interface ValidationState {
  isChecking: boolean;
  formatValid: boolean;
  available: boolean | null;
  message: string;
}

/**
 * 根据错误码生成用户友好的消息
 */
function getMessageByErrorCode(code: string): string {
  // 只返回统一的消息：邮箱已注册
  return '邮箱已注册';
}

export function EmailInputWithValidation({
  id = 'email',
  label = '邮箱',
  placeholder = '请输入邮箱',
  value,
  onChange,
  required = false,
  disabled = false,
  className = '',
  autoFocus = false,
  onValidationChange
}: EmailInputWithValidationProps) {
  const [validation, setValidation] = useState<ValidationState>({
    isChecking: false,
    formatValid: false,
    available: null,
    message: ''
  });

  const [debouncedValue, setDebouncedValue] = useState(value);

  // 防抖处理
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  // 验证邮箱
  const validateEmail = useCallback(async (email: string) => {
    if (!email || email.trim().length === 0) {
      setValidation({
        isChecking: false,
        formatValid: false,
        available: null,
        message: ''
      });
      onValidationChangeRef.current?.(false, false);
      return;
    }

    // 检查格式
    const formatValid = emailValidationService.validateEmailFormat(email);
    
    if (!formatValid) {
      setValidation({
        isChecking: false,
        formatValid: false,
        available: null,
        message: '邮箱格式错误'
      });
      onValidationChangeRef.current?.(false, false);
      return;
    }

    // 格式正确，开始检查可用性
    setValidation(prev => ({
      ...prev,
      isChecking: true,
      formatValid: true,
      message: '正在检查邮箱可用性...'
    }));

    try {
      const result = await emailValidationService.checkEmailAvailability(email);
      
      const message = result.success 
        ? '邮箱可用'
        : getMessageByErrorCode(result.code);
      
      setValidation({
        isChecking: false,
        formatValid: true,
        available: result.success,
        message
      });

      onValidationChangeRef.current?.(true, result.success);
    } catch (error) {
      setValidation({
        isChecking: false,
        formatValid: true,
        available: false,
        message: '网络错误'
      });
      onValidationChangeRef.current?.(true, false);
    }
  }, []); // 移除 onValidationChange 依赖，避免死循环

  // 使用 useRef 保存最新的 onValidationChange 回调
  const onValidationChangeRef = useRef(onValidationChange);
  useEffect(() => {
    onValidationChangeRef.current = onValidationChange;
  }, [onValidationChange]);

  // 当防抖值变化时触发验证
  useEffect(() => {
    validateEmail(debouncedValue);
  }, [debouncedValue, validateEmail]);

  const getValidationIcon = () => {
    if (validation.isChecking) {
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    }
    
    if (!validation.formatValid && value.trim().length > 0) {
      return <X className="h-4 w-4 text-red-500" />;
    }
    
    if (validation.formatValid && validation.available === true) {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    
    if (validation.formatValid && validation.available === false) {
      return <X className="h-4 w-4 text-red-500" />;
    }
    
    return null;
  };

  const getMessageColor = () => {
    if (validation.isChecking) {
      return 'text-blue-600';
    }
    
    if (!validation.formatValid && value.trim().length > 0) {
      return 'text-red-600';
    }
    
    if (validation.formatValid && validation.available === true) {
      return 'text-green-600';
    }
    
    if (validation.formatValid && validation.available === false) {
      return 'text-red-600';
    }
    
    return 'text-gray-500';
  };

  const getInputBorderColor = () => {
    if (disabled) {
      return 'border-gray-200';
    }
    
    if (!value.trim()) {
      return 'border-gray-200';
    }
    
    if (validation.isChecking) {
      return 'border-blue-300 focus:border-blue-500';
    }
    
    if (!validation.formatValid) {
      return 'border-red-300 focus:border-red-500';
    }
    
    if (validation.formatValid && validation.available === true) {
      return 'border-green-300 focus:border-green-500';
    }
    
    if (validation.formatValid && validation.available === false) {
      return 'border-red-300 focus:border-red-500';
    }
    
    return 'border-gray-200';
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={id}>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id={id}
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={cn(
            'pl-10 pr-10',
            getInputBorderColor()
          )}
        />
        
        {/* 验证状态图标 */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {getValidationIcon()}
        </div>
      </div>
      
      {/* 验证信息 */}
      {validation.message && (
        <p className={cn('text-sm', getMessageColor())}>
          {validation.message}
        </p>
      )}
    </div>
  );
}