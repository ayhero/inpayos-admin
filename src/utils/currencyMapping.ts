// 货币代码映射
export const currencyMap: Record<string, string> = {
  'INR': '印度卢比',
  'USD': '美元',
  'CNY': '人民币',
  'GBP': '英镑',
  'EUR': '欧元',
  'SGD': '新加坡元',
  'MYR': '马来西亚林吉特',
  'IDR': '印尼盾',
  'THB': '泰铢',
  'VND': '越南盾',
  'PHP': '菲律宾比索',
  'JPY': '日元',
  'KRW': '韩元',
  'AUD': '澳元',
  'CAD': '加拿大元',
  'CHF': '瑞士法郎',
  'HKD': '港币',
  'TWD': '新台币',
  'NZD': '新西兰元',
  'SEK': '瑞典克朗',
  'NOK': '挪威克朗',
  'DKK': '丹麦克朗',
  'BRL': '巴西雷亚尔',
  'MXN': '墨西哥比索',
  'RUB': '俄罗斯卢布',
  'ZAR': '南非兰特',
  'AED': '阿联酋迪拉姆',
  'SAR': '沙特里亚尔',
  'EGP': '埃及镑',
  'NGN': '尼日利亚奈拉',
  'KES': '肯尼亚先令',
};

/**
 * 格式化货币显示
 * @param code 货币代码
 * @returns 格式化后的货币名称，如：印度卢比(INR)
 */
export function formatCurrency(code: string): string {
  if (!code) return '-';
  const name = currencyMap[code.toUpperCase()];
  return name ? `${name}(${code.toUpperCase()})` : code;
}

/**
 * 获取货币中文名称
 * @param code 货币代码
 * @returns 货币中文名称
 */
export function getCurrencyName(code: string): string {
  if (!code) return '-';
  return currencyMap[code.toUpperCase()] || code;
}

/**
 * 获取所有支持的货币列表
 * @returns 货币代码和名称的数组
 */
export function getAllCurrencies(): Array<{ code: string; name: string; display: string }> {
  return Object.entries(currencyMap).map(([code, name]) => ({
    code,
    name,
    display: `${name}(${code})`,
  }));
}

/**
 * 格式化金额显示（带货币单位）
 * @param amount 金额
 * @param currencyCode 货币代码
 * @returns 格式化后的金额字符串
 */
export function formatAmount(amount: number | string, currencyCode: string): string {
  if (!amount && amount !== 0) return '-';
  const currency = formatCurrency(currencyCode);
  return `${amount} ${currency}`;
}

/**
 * 货币显示组件（用于React）
 * @param currencyCode 货币代码
 * @returns 格式化后的货币字符串，格式：中文(货币码)
 */
export function CurrencyDisplay(currencyCode?: string): string {
  if (!currencyCode) return '-';
  return formatCurrency(currencyCode);
}
