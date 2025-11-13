// 国家代码映射
export const countryMap: Record<string, string> = {
  'IN': '印度',
  'US': '美国',
  'CN': '中国',
  'GB': '英国',
  'SG': '新加坡',
  'MY': '马来西亚',
  'ID': '印度尼西亚',
  'TH': '泰国',
  'VN': '越南',
  'PH': '菲律宾',
  'JP': '日本',
  'KR': '韩国',
  'AU': '澳大利亚',
  'CA': '加拿大',
  'FR': '法国',
  'DE': '德国',
  'IT': '意大利',
  'ES': '西班牙',
  'BR': '巴西',
  'MX': '墨西哥',
  'RU': '俄罗斯',
  'ZA': '南非',
  'AE': '阿联酋',
  'SA': '沙特阿拉伯',
  'EG': '埃及',
  'NG': '尼日利亚',
  'KE': '肯尼亚',
};

/**
 * 格式化国家显示
 * @param code 国家代码
 * @returns 格式化后的国家名称，如：印度(IN)
 */
export function formatCountry(code: string): string {
  if (!code) return '-';
  const name = countryMap[code.toUpperCase()];
  return name ? `${name}(${code.toUpperCase()})` : code;
}

/**
 * 获取国家中文名称
 * @param code 国家代码
 * @returns 国家中文名称
 */
export function getCountryName(code: string): string {
  if (!code) return '-';
  return countryMap[code.toUpperCase()] || code;
}

/**
 * 获取所有支持的国家列表
 * @returns 国家代码和名称的数组
 */
export function getAllCountries(): Array<{ code: string; name: string; display: string }> {
  return Object.entries(countryMap).map(([code, name]) => ({
    code,
    name,
    display: `${name}(${code})`,
  }));
}
