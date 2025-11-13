// 状态映射
export const statusMap: Record<string, string> = {
  'active': '激活',
  'inactive': '禁用',
  'pending': '待审核',
  'suspended': '暂停',
  'expired': '已过期',
  'disabled': '已禁用',
  'enabled': '已启用',
  'draft': '草稿',
  'approved': '已批准',
  'rejected': '已拒绝',
  'cancelled': '已取消',
  'completed': '已完成',
  'processing': '处理中',
  'failed': '失败',
};

// 状态颜色映射
export const statusColorMap: Record<string, string> = {
  'active': 'success',
  'inactive': 'default',
  'pending': 'warning',
  'suspended': 'warning',
  'expired': 'error',
  'disabled': 'default',
  'enabled': 'success',
  'draft': 'default',
  'approved': 'success',
  'rejected': 'error',
  'cancelled': 'default',
  'completed': 'success',
  'processing': 'info',
  'failed': 'error',
};

/**
 * 格式化状态显示
 * @param status 状态代码
 * @returns 状态中文名称
 */
export function formatStatus(status: string): string {
  if (!status) return '-';
  return statusMap[status.toLowerCase()] || status;
}

/**
 * 获取状态颜色
 * @param status 状态代码
 * @returns 状态对应的颜色类型
 */
export function getStatusColor(status: string): string {
  if (!status) return 'default';
  return statusColorMap[status.toLowerCase()] || 'default';
}

/**
 * 判断状态是否为激活状态
 * @param status 状态代码
 * @returns 是否为激活状态
 */
export function isActiveStatus(status: string): boolean {
  return status?.toLowerCase() === 'active' || status?.toLowerCase() === 'enabled';
}

/**
 * 获取所有状态列表
 * @returns 状态代码和名称的数组
 */
export function getAllStatuses(): Array<{ code: string; name: string; color: string }> {
  return Object.entries(statusMap).map(([code, name]) => ({
    code,
    name,
    color: statusColorMap[code] || 'default',
  }));
}
