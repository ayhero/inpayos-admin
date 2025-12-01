import { formatAmountRange } from '../utils/amountRange';

interface AmountRangeDisplayProps {
  minAmount?: string | number | null;
  maxAmount?: string | number | null;
  className?: string;
}

/**
 * 金额范围显示组件
 * 根据最小值和最大值智能显示：
 * - 都为空或0：不限
 * - 只有最小值：xxx 起
 * - 只有最大值：xxx 以下
 * - 都有：xxx - xxx
 */
export function AmountRangeDisplay({ minAmount, maxAmount, className = '' }: AmountRangeDisplayProps) {
  return (
    <span className={className}>
      {formatAmountRange(minAmount, maxAmount)}
    </span>
  );
}
