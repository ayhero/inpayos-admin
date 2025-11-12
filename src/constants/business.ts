// 交易类型映射
export const TRX_TYPE_MAP: { [key: string]: string } = {
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
  'withdraw': '提现',
};

// 交易类型选项（用于下拉框）
export const TRX_TYPE_OPTIONS = [
  { value: 'payin', label: '代收' },
  { value: 'payout', label: '代付' },
  { value: 'cashier_payin', label: '出纳代收' },
  { value: 'cashier_payout', label: '出纳代付' },
  { value: 'cashier_withdraw', label: '出纳提现' },
  { value: 'refund', label: '退款' },
  { value: 'deposit', label: '充值' },
  { value: 'margin_deposit', label: '保证金充值' },
  { value: 'withdraw', label: '提现' },
];

// 商户路由交易类型选项
export const MERCHANT_TRX_TYPE_OPTIONS = [
  { value: 'payin', label: '代收' },
  { value: 'payout', label: '代付' },
  { value: 'withdraw', label: '提现' },
];

// 车队路由交易类型选项
export const FLEET_TRX_TYPE_OPTIONS = [
  { value: 'cashier_payin', label: '代收' },
  { value: 'cashier_payout', label: '代付' },
  { value: 'withdraw', label: '提现' },
];

// 交易方法映射（支付方式 - 来源于const.go）
export const TRX_METHOD_MAP: { [key: string]: string } = {
  'upi': 'UPI',
  'upi_lite': 'UPI Lite',
  'wallet': '钱包',
  'bank_card': '银行卡',
  'bank_transfer': '银行转账',
  'usdt': 'USDT',
};

// 支付方式选项
export const TRX_METHOD_OPTIONS = [
  { value: 'all', label: '全部' },
  ...Object.entries(TRX_METHOD_MAP).map(([value, label]) => ({
    value,
    label,
  }))
];

// 货币映射
export const CCY_MAP: { [key: string]: string } = {
  'CNY': '人民币',
  'USD': '美元',
  'EUR': '欧元',
  'JPY': '日元',
  'GBP': '英镑',
  'HKD': '港币',
  'PHP': '菲律宾比索',
  'THB': '泰铢',
  'VND': '越南盾',
  'IDR': '印尼盾',
  'MYR': '马来西亚林吉特',
  'SGD': '新加坡元',
  'KRW': '韩元',
  'INR': '印度卢比',
  'BRL': '巴西雷亚尔',
  'USDT': 'USDT',
};

// 货币选项（带货币符号）
export const CCY_OPTIONS = [
  { value: 'all', label: '全部' },
  ...Object.entries(CCY_MAP).map(([value, label]) => ({
    value,
    label: `${label} (${value})`,
  }))
];

// 通道编码映射（渠道 - 来源于const.channel.go）
export const CHANNEL_CODE_MAP: { [key: string]: string } = {
  'test': '测试',
  'cashier': '收银员',
};

// 渠道选项
export const CHANNEL_CODE_OPTIONS = [
  { value: 'all', label: '全部' },
  ...Object.entries(CHANNEL_CODE_MAP).map(([value, label]) => ({
    value,
    label,
  }))
];

// 状态映射
export const STATUS_MAP: { [key: string]: string } = {
  'active': '启用',
  'inactive': '禁用',
  'pending': '待处理',
  'success': '成功',
  'failed': '失败',
  'cancelled': '已取消',
  'processing': '处理中',
  'completed': '已完成',
};

// 状态选项（用于下拉框）
export const STATUS_OPTIONS = [
  { value: 'active', label: '启用' },
  { value: 'inactive', label: '禁用' },
];

// 交易状态选项
export const TRANSACTION_STATUS_OPTIONS = [
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'success', label: '成功' },
  { value: 'failed', label: '失败' },
  { value: 'cancelled', label: '已取消' },
];

// 用户类型映射
export const USER_TYPE_MAP: { [key: string]: string } = {
  'merchant': '商户',
  'cashier': '出纳',
  'cashier_team': '出纳团队',
};

// 获取交易类型显示名称
export const getTrxTypeLabel = (trxType?: string): string => {
  if (!trxType) return '-';
  return TRX_TYPE_MAP[trxType] || trxType;
};

// 获取通道编码显示名称
export const getChannelCodeLabel = (channelCode?: string): string => {
  if (!channelCode) return '-';
  return CHANNEL_CODE_MAP[channelCode] || channelCode;
};

// 获取状态显示名称
export const getStatusLabel = (status?: string): string => {
  if (!status) return '-';
  return STATUS_MAP[status] || status;
};

// 获取用户类型显示名称
export const getUserTypeLabel = (userType?: string): string => {
  if (!userType) return '-';
  return USER_TYPE_MAP[userType] || userType;
};

// 获取交易方法显示名称
export const getTrxMethodLabel = (trxMethod?: string): string => {
  if (!trxMethod) return '-';
  return TRX_METHOD_MAP[trxMethod] || trxMethod;
};

// 获取货币显示名称
export const getCcyLabel = (ccy?: string): string => {
  if (!ccy) return '-';
  return CCY_MAP[ccy] || ccy;
};
