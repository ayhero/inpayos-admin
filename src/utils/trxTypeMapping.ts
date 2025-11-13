/**
 * 交易类型映射工具
 * Transaction Type (TrxType) Mapping Utility
 * 参考后端定义：internal/protocol/const.go
 */

// 交易类型映射表 - 对应后端 TrxType 常量
export const trxTypeMap: Record<string, string> = {
  'payin': '代收',
  'payout': '代付',
  'cashier_payin': '出纳代收',
  'cashier_payout': '出纳代付',
  'cashier_withdraw': '出纳提现',
  'refund': '退款',
  'deposit': '充值',
  'margin_deposit': '保证金充值',
  'swap': '余额转保证金',
  'margin_release': '保证金释放',
  'transfer': '转账',
  'dividend': '分红',
  'fee': '手续费',
  'adjustment': '余额调整',
  'chargeback': '退单',
  'settle': '结算',
  'freeze': '冻结',
  'unfreeze': '解冻',
  'rf_recover': '退款回撤',
  'wd_recover': '提现回撤',
};

/**
 * 格式化交易类型显示
 * @param trxType 交易类型代码
 * @returns 交易类型中文名称
 */
export function formatTrxType(trxType: string | null | undefined): string {
  if (!trxType) return '-';
  return trxTypeMap[trxType.toLowerCase()] || trxType;
}

/**
 * 获取所有交易类型列表
 * @returns 交易类型代码和名称的数组
 */
export function getAllTrxTypes(): Array<{ code: string; name: string }> {
  return Object.entries(trxTypeMap).map(([code, name]) => ({
    code,
    name,
  }));
}
