interface CommissionDisplayProps {
  rate?: string | number | null;
  fixedCommission?: string | number | null;
  className?: string;
}

/**
 * 佣金显示组件
 * 格式: 3%+2 (费率%+固定佣金)
 */
export const CommissionDisplay = ({ rate, fixedCommission, className = '' }: CommissionDisplayProps) => {
  const parts: string[] = [];
  
  if (rate) {
    parts.push(`${rate}%`);
  }
  
  if (fixedCommission) {
    parts.push(fixedCommission.toString());
  }
  
  if (parts.length === 0) {
    return <span className={className}>-</span>;
  }
  
  return <span className={className}>{parts.join('+')}</span>;
};
