import { Input } from './ui/input';

interface CommissionInputProps {
  value?: {
    rate?: string;
    fixedCommission?: string;
  };
  onChange?: (value: { rate?: string; fixedCommission?: string }) => void;
  placeholder?: string;
  className?: string;
}

/**
 * 佣金输入组件
 * 支持格式: 3%+2 或 3% 或 2
 */
export const CommissionInput = ({ 
  value = {}, 
  onChange, 
  placeholder = "如: 3%+2", 
  className = '' 
}: CommissionInputProps) => {
  // 将当前值转换为显示字符串
  const displayValue = () => {
    const parts: string[] = [];
    if (value.rate) parts.push(`${value.rate}%`);
    if (value.fixedCommission) parts.push(value.fixedCommission);
    return parts.join('+');
  };

  // 解析输入字符串
  const parseInput = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) {
      onChange?.({ rate: '', fixedCommission: '' });
      return;
    }

    let rate = '';
    let fixedCommission = '';

    // 分割 + 号
    const parts = trimmed.split('+').map(p => p.trim());

    for (const part of parts) {
      if (part.includes('%')) {
        // 费率部分
        rate = part.replace('%', '').trim();
      } else if (part) {
        // 固定佣金部分
        fixedCommission = part;
      }
    }

    onChange?.({ rate, fixedCommission });
  };

  return (
    <Input
      className={className}
      value={displayValue()}
      onChange={(e) => parseInput(e.target.value)}
      placeholder={placeholder}
    />
  );
};
