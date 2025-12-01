/**
 * 格式化金额范围显示
 * @param minAmount 最小金额
 * @param maxAmount 最大金额
 * @returns 格式化后的金额范围字符串
 */
export const formatAmountRange = (
  minAmount?: string | number | null,
  maxAmount?: string | number | null
): string => {
  const min = minAmount?.toString();
  const max = maxAmount?.toString();
  
  // 都没有或都为0：不限
  if ((!min || min === '0') && (!max || max === '0')) {
    return '不限';
  }
  
  // 只有最小值：xxx起
  if (min && min !== '0' && (!max || max === '0')) {
    return `${min} 起`;
  }
  
  // 只有最大值：xxx以下
  if ((!min || min === '0') && max && max !== '0') {
    return `${max} 以下`;
  }
  
  // 都有：xxx - xxx
  return `${min} - ${max}`;
};

/**
 * 格式化带币种的金额范围显示
 * @param ccy 币种代码
 * @param minAmount 最小金额
 * @param maxAmount 最大金额
 * @param getCcyLabel 获取币种标签的函数（可选）
 * @returns 格式化后的带币种金额范围字符串
 */
export const formatAmountRangeWithCurrency = (
  ccy: string,
  minAmount?: string | number | null,
  maxAmount?: string | number | null,
  getCcyLabel?: (ccy: string) => string
): string => {
  const ccyDisplay = getCcyLabel ? getCcyLabel(ccy) : ccy;
  const range = formatAmountRange(minAmount, maxAmount);
  return `${ccyDisplay} ${range}`;
};
