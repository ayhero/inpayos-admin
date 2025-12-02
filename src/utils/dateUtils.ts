/**
 * 格式化时间戳
 * @param timestamp - 时间戳（毫秒）
 * @param format - 格式字符串，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的时间字符串
 */
export function formatTimestamp(timestamp: number, format?: string): string {
  if (!timestamp) {
    return '-';
  }

  const date = new Date(timestamp);
  
  if (isNaN(date.getTime())) {
    return '-';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  const defaultFormat = 'YYYY-MM-DD HH:mm:ss';
  const actualFormat = format || defaultFormat;

  return actualFormat
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 格式化为日期字符串（不含时间）
 * @param timestamp - 时间戳（毫秒）
 * @returns 格式化后的日期字符串
 */
export function formatDate(timestamp: number): string {
  return formatTimestamp(timestamp, 'YYYY-MM-DD');
}

/**
 * 格式化为时间字符串（不含日期）
 * @param timestamp - 时间戳（毫秒）
 * @returns 格式化后的时间字符串
 */
export function formatTime(timestamp: number): string {
  return formatTimestamp(timestamp, 'HH:mm:ss');
}

/**
 * 计算相对时间
 * @param timestamp - 时间戳（毫秒）
 * @returns 相对时间字符串
 */
export function formatRelativeTime(timestamp: number): string {
  if (!timestamp) {
    return '-';
  }

  const now = Date.now();
  const diff = now - timestamp;
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;

  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return Math.floor(diff / minute) + ' 分钟前';
  } else if (diff < day) {
    return Math.floor(diff / hour) + ' 小时前';
  } else if (diff < week) {
    return Math.floor(diff / day) + ' 天前';
  } else if (diff < month) {
    return Math.floor(diff / week) + ' 周前';
  } else {
    return formatDate(timestamp);
  }
}