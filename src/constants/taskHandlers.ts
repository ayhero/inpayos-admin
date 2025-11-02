// 任务处理器常量和标签映射
export const TASK_HANDLERS = {
  // 信号处理
  signal_processor: '信号处理器',
  
  // 交易相关
  MerchantConfirmingTrx: '商户确认交易',
  CashierTrxCompleted: '出纳交易完成',
  merchant_confirming_transaction: '商户交易处理任务',
  
  // 通知相关
  'notification.retry': '通知重试任务',
  
  // 交易结算ID修复
  '_transaction_settle_id_fix': '商户交易结算ID修复',
  'transaction.settle.id.fix': '商户交易结算ID修复',
  'merchant_transaction_settle_id_fix': '商户交易结算ID修复',
  'merchant.transaction.settle.id.fix': '商户交易结算ID修复',
  
  // 结算处理 - 通用
  '_settle_accounting': '商户结算记账处理',
  '_settle_process_payout': '商户出金结算处理',
  '_settle_process_payin': '商户入金结算处理',
  
  // 结算处理 - 商户
  'merchant_settle_accounting': '商户结算记账处理',
  'merchant.settle.accounting': '商户结算记账处理',
  'merchant_settle_process_payout': '商户出金结算处理',
  'merchant.settle.process': '商户出金结算处理',
  'merchant_settle_process_payin': '商户入金结算处理',
  
  // 结算处理 - 通用API
  'settle.process': '结算处理',
  'settle.accounting': '结算记账',
  
  // 统计相关
  'statistics_recent': '近期统计数据更新',
  'statistics.recent': '近期统计数据更新',
  'statistics_historical': '历史统计数据更新',
  'statistics.historical': '历史统计数据更新',
  
  // 渠道相关
  channel_sync: '渠道同步',
} as const;

// 获取Handler的显示标签
export const getHandlerLabel = (handlerKey: string): string => {
  return TASK_HANDLERS[handlerKey as keyof typeof TASK_HANDLERS] || handlerKey;
};

// 获取所有Handler选项
export const getHandlerOptions = () => {
  return Object.entries(TASK_HANDLERS).map(([key, label]) => ({
    value: key,
    label: label,
  }));
};
