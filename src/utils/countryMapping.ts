// 国家代码映射（ISO 3166-1 alpha-3 三位码）
export const countryMap: Record<string, string> = {
  'IND': '印度',
  'USA': '美国',
  'CHN': '中国',
  'GBR': '英国',
  'SGP': '新加坡',
  'MYS': '马来西亚',
  'IDN': '印度尼西亚',
  'THA': '泰国',
  'VNM': '越南',
  'PHL': '菲律宾',
  'JPN': '日本',
  'KOR': '韩国',
  'AUS': '澳大利亚',
  'CAN': '加拿大',
  'FRA': '法国',
  'DEU': '德国',
  'ITA': '意大利',
  'ESP': '西班牙',
  'BRA': '巴西',
  'MEX': '墨西哥',
  'RUS': '俄罗斯',
  'ZAF': '南非',
  'ARE': '阿联酋',
  'SAU': '沙特阿拉伯',
  'EGY': '埃及',
  'NGA': '尼日利亚',
  'KEN': '肯尼亚',
};

// 两位码到三位码的映射（ISO 3166-1 alpha-2 to alpha-3）
const countryCodeMap: Record<string, string> = {
  'IN': 'IND',
  'US': 'USA',
  'CN': 'CHN',
  'GB': 'GBR',
  'SG': 'SGP',
  'MY': 'MYS',
  'ID': 'IDN',
  'TH': 'THA',
  'VN': 'VNM',
  'PH': 'PHL',
  'JP': 'JPN',
  'KR': 'KOR',
  'AU': 'AUS',
  'CA': 'CAN',
  'FR': 'FRA',
  'DE': 'DEU',
  'IT': 'ITA',
  'ES': 'ESP',
  'BR': 'BRA',
  'MX': 'MEX',
  'RU': 'RUS',
  'ZA': 'ZAF',
  'AE': 'ARE',
  'SA': 'SAU',
  'EG': 'EGY',
  'NG': 'NGA',
  'KE': 'KEN',
};

/**
 * 格式化国家显示
 * @param code 国家代码（支持两位码或三位码）
 * @returns 格式化后的国家名称，如：印度(IND)
 */
export function formatCountry(code: string): string {
  if (!code) return '-';
  const upperCode = code.toUpperCase();
  
  // 如果是两位码，转换为三位码
  const threeLetterCode = upperCode.length === 2 ? countryCodeMap[upperCode] : upperCode;
  const name = threeLetterCode ? countryMap[threeLetterCode] : countryMap[upperCode];
  
  return name ? `${name}(${threeLetterCode || upperCode})` : code;
}

/**
 * 获取国家中文名称
 * @param code 国家代码（支持两位码或三位码）
 * @returns 国家中文名称
 */
export function getCountryName(code: string): string {
  if (!code) return '-';
  const upperCode = code.toUpperCase();
  
  // 如果是两位码，转换为三位码
  const threeLetterCode = upperCode.length === 2 ? countryCodeMap[upperCode] : upperCode;
  return (threeLetterCode ? countryMap[threeLetterCode] : countryMap[upperCode]) || code;
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
