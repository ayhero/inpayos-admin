// 路由相关常量定义

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
  'rf_recover': '退款回撤',
  'wd_recover': '提现回撤',
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
];

// 通道编码映射（可根据实际通道扩展）
export const CHANNEL_CODE_MAP: { [key: string]: string } = {
  'alipay': '支付宝',
  'wechat': '微信支付',
  'bank': '银行卡',
  'usdt': 'USDT',
  'unionpay': '银联',
  'paypal': 'PayPal',
};

// 路由状态映射
export const ROUTER_STATUS_MAP: { [key: string]: string } = {
  'active': '启用',
  'inactive': '禁用',
};

// 路由状态选项（用于下拉框）
export const ROUTER_STATUS_OPTIONS = [
  { value: 'active', label: '启用' },
  { value: 'inactive', label: '禁用' },
];

// 获取交易类型显示名称
export const getTrxTypeLabel = (trxType: string): string => {
  return TRX_TYPE_MAP[trxType] || trxType;
};

// 获取通道编码显示名称
export const getChannelCodeLabel = (channelCode: string): string => {
  return CHANNEL_CODE_MAP[channelCode] || channelCode;
};

// 获取路由状态显示名称
export const getRouterStatusLabel = (status: string): string => {
  return ROUTER_STATUS_MAP[status] || status;
};
