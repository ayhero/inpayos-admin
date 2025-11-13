/**
 * 交易方式映射工具
 * Transaction Method (TrxMethod) Mapping Utility
 * 参考后端定义：internal/protocol/const.go
 */

// 交易方式映射表 - 对应后端 TrxMethod 常量（严格按照后端定义）
export const trxMethodMap: Record<string, string> = {
  'upi': 'UPI',
  'upi_lite': 'UPI Lite',
  'wallet': '钱包',
  'bank_card': '银行卡',
  'bank_transfer': '银行转账',
  'usdt': 'USDT',
};

/**
 * 格式化交易方式显示
 * @param trxMethod 交易方式代码
 * @returns 交易方式显示名称
 */
export function formatTrxMethod(trxMethod: string | null | undefined): string {
  if (!trxMethod) return '-';
  return trxMethodMap[trxMethod.toLowerCase()] || trxMethod.toUpperCase();
}

/**
 * 获取所有交易方式列表
 * @returns 交易方式代码和名称的数组
 */
export function getAllTrxMethods(): Array<{ code: string; name: string }> {
  return Object.entries(trxMethodMap).map(([code, name]) => ({
    code,
    name,
  }));
}
