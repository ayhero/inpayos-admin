// 直接导出全局的 mapping 工具，避免重复定义
export { trxTypeMap as TRX_TYPE_MAP, formatTrxType as getTrxTypeLabel } from '../utils/trxTypeMapping';
export { trxMethodMap as TRX_METHOD_MAP, formatTrxMethod as getTrxMethodLabel } from '../utils/trxMethodMapping';
export { currencyMap as CCY_MAP, formatCurrency as getCcyLabel } from '../utils/currencyMapping';
export { countryMap as COUNTRY_MAP, formatCountry as getCountryLabel } from '../utils/countryMapping';

import { trxTypeMap } from '../utils/trxTypeMapping';
import { trxMethodMap } from '../utils/trxMethodMapping';
import { currencyMap } from '../utils/currencyMapping';
import { countryMap } from '../utils/countryMapping';

// 交易类型选项（用于下拉框）
export const TRX_TYPE_OPTIONS = Object.entries(trxTypeMap).map(([value, label]) => ({
  value,
  label,
}));

// 商户路由交易类型选项
export const MERCHANT_TRX_TYPE_OPTIONS = [
  { value: 'payin', label: trxTypeMap['payin'] },
  { value: 'payout', label: trxTypeMap['payout'] },
  { value: 'withdraw', label: '提现' },
];

// 车队路由交易类型选项
export const FLEET_TRX_TYPE_OPTIONS = [
  { value: 'cashier_payin', label: '代收' },
  { value: 'cashier_payout', label: '代付' },
  { value: 'withdraw', label: '提现' },
];

// 支付方式选项
export const TRX_METHOD_OPTIONS = [
  { value: 'all', label: '全部' },
  ...Object.entries(trxMethodMap).map(([value, label]) => ({
    value,
    label,
  }))
];

// 货币选项（使用中文名(代码)格式）
export const CCY_OPTIONS = [
  { value: 'all', label: '全部' },
  ...Object.entries(currencyMap).map(([value, label]) => ({
    value,
    label: `${label}(${value})`,
  }))
];

// 国家选项（使用三位国家码，格式：中文名(代码)）
export const COUNTRY_OPTIONS = Object.entries(countryMap).map(([value, label]) => ({
  value,
  label: `${label}(${value})`,
}));

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
