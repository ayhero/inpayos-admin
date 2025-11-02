// 将Cron表达式转换为中文描述
export const cronToChineseDescription = (cronExpr: string): string => {
  if (!cronExpr) {
    return '未设置';
  }

  const descriptions: Record<string, string> = {
    '0 0 * * * *': '每小时执行一次',
    '0 */5 * * * *': '每5分钟执行一次',
    '0 */10 * * * *': '每10分钟执行一次',
    '0 */15 * * * *': '每15分钟执行一次',
    '0 */30 * * * *': '每30分钟执行一次',
    '0 0 0 * * *': '每天凌晨执行一次',
    '0 0 1 * * *': '每天凌晨1点执行一次',
    '0 0 2 * * *': '每天凌晨2点执行一次',
    '0 0 0 1 * *': '每月1号执行一次',
    '0 0 0 * * 0': '每周日执行一次',
    '0 0 0 * * 1': '每周一执行一次',
    '0 0 12 * * *': '每天中午12点执行一次',
    '*/10 * * * * *': '每10秒执行一次',
    '*/30 * * * * *': '每30秒执行一次',
    '0 0 */2 * * *': '每2小时执行一次',
    '0 0 */6 * * *': '每6小时执行一次',
    '0 0 */12 * * *': '每12小时执行一次',
    '0 30 9-18 * * *': '每天9:30-18:30之间每小时执行一次',
    '0 0 9 * * 1-5': '周一至周五每天9点执行一次',
  };

  if (descriptions[cronExpr]) {
    return descriptions[cronExpr];
  }

  return `自定义: ${cronExpr}`;
};

// 格式化Unix毫秒时间戳
export const formatTimestamp = (timestamp: number): string => {
  if (!timestamp || timestamp === 0) {
    return '-';
  }
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// 获取状态徽章样式
export const getStatusBadge = (status: string): { text: string; className: string } => {
  const badges: Record<string, { text: string; className: string }> = {
    enabled: { text: '已启用', className: 'bg-green-100 text-green-800' },
    disabled: { text: '已禁用', className: 'bg-gray-100 text-gray-800' },
  };
  return badges[status] || { text: status, className: 'bg-gray-100 text-gray-800' };
};
