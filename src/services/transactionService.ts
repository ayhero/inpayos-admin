import { ApiResponse, api } from './api';
import { UserInfo } from './cashierService';

// 交易类型枚举 - 与后端 protocol 保持一致
export enum TransactionType {
  PAYIN = 'payin',
  PAYOUT = 'payout', 
  REFUND = 'refund'
}

// 交易状态枚举 - 与后端 const.go 保持一致
export enum TransactionStatus {
  // 基础状态
  CREATED = 'created',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUBMITTED = 'submitted',
  CONFIRMING = 'confirming',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  COMPLETED = 'completed',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  ONLINE = 'online',
  OFFLINE = 'offline',
  BUSY = 'busy',
  LOCKED = 'locked',
  ON = 'on',
  OFF = 'off'
}

// 结算状态枚举
export enum SettleStatus {
  PENDING = 0,
  SETTLED = 1,
  FAILED = 2
}

// 后端返回的分页数据结构
interface BackendPageResult<T> {
  records: T[];
  total: number;
  current: number;
  size: number;
  count: number;
}

// 派单候选人信息
interface BackendDispatchCandidate {
  user?: UserInfo;
  cid: string;
  cashier_account_id: string;
  cashier_app_account_id: string;
  upi: string;
  selected: boolean;
  fail_reason?: string;
  fail_code?: string;
  online_status: string;
  account_status: string;
  score: number;
}

// 派单历史信息
interface BackendDispatchHistory {
  history_id: string;
  dispatch_id: string;
  trx_id: string;
  trx_type: string;
  tid: string;
  dispatch_round: number;
  cid: string;
  cashier_account_id: string;
  cashier_app_account_id: string;
  dispatch_at: number;
  success: boolean;
  error_code?: string;
  error_message?: string;
  candidates: BackendDispatchCandidate[];
  total_candidates: number;
  failed_count: number;
  amount: number;
  ccy: string;
  created_at: number;
  updated_at: number;
}

// 派单记录信息
interface BackendDispatchRecord {
  dispatch_id: string;
  tid: string;
  trx_id: string;
  trx_type: string;
  cid: string;
  cashier_app_account_id: string;
  cashier_account_id: string;
  dispatch_round: number;
  dispatch_at: number;
  amount: number;
  ccy: string;
  fee: number;
  status: string;
  expired_at?: number;
  accepted_at?: number;
  rejected_at?: number;
  rejected_by?: string;
  rejected_reason?: string;
  notify_type?: string;
  created_at: number;
  updated_at: number;
}

// 后端返回的交易信息（使用下划线命名格式）
interface BackendTransactionInfo {
  id: number;
  trx_id: string;
  req_id: string;
  ori_trx_id?: string;
  ori_req_id?: string;
  status: string; // 使用字符串状态："success", "pending", "failed", "cancelled"
  channel_status?: string;
  res_code?: string;
  res_msg?: string;
  reason?: string;
  ccy: string;
  amount: string;
  actual_amount?: string;
  usd_amount?: string;
  link?: string;
  created_at: number; // 毫秒时间戳
  updated_at: number; // 毫秒时间戳
  completed_at?: number; // 毫秒时间戳
  confirmed_at?: number; // 毫秒时间戳
  expired_at?: number; // 毫秒时间戳
  trx_type: string;
  trx_method?: string;
  trx_mode?: string;
  trx_app?: string;
  channel_code?: string;
  channel_account?: string;
  channel_group?: string;
  channel_trx_id?: string;
  fee_ccy?: string;
  fee_amount?: string;
  fee_usd_amount?: string;
  channel_fee_ccy?: string;
  channel_fee_amount?: string;
  flow_no?: string;
  country?: string;
  remark?: string;
  settle_status?: string;
  settle_id?: string;
  settle_amount?: string;
  settle_usd_amount?: string;
  settled_at?: number; // 毫秒时间戳
  refunded_count?: number;
  refunded_amount?: string;
  refunded_usd_amount?: string;
  last_refunded_at?: number; // 毫秒时间戳
  detail?: any;
  mid?: string;
  product_id?: string;
  version?: number;
  // 代付收款账户信息（用户提供）
  upi?: string;
  bank_code?: string;
  bank_name?: string;
  card_number?: string;
  holder_name?: string;
  holder_phone?: string;
  holder_email?: string;
  // Cashier信息
  cid?: string;
  cashier?: UserInfo;
  cashier_account_id?: string;
  cashier_app_account_id?: string;
  dispatch_history?: BackendDispatchHistory[];
  dispatch_records?: BackendDispatchRecord[];
  // 通知相关字段
  notify_url?: string;
  notified_at?: number;
  notify_status?: string;
  notify_count?: number;
}

// 派单候选人信息
export interface DispatchCandidate {
  user?: UserInfo;
  cid: string;
  cashierAccountId: string;
  cashierAppAccountId: string;
  upi: string;
  selected: boolean;
  failReason?: string;
  failCode?: string;
  onlineStatus: string;
  accountStatus: string;
  score: number;
}

// 派单历史信息
export interface DispatchHistory {
  historyId: string;
  dispatchId: string;
  trxId: string;
  trxType: string;
  tid: string;
  dispatchRound: number;
  cid: string;
  cashierAccountId: string;
  cashierAppAccountId: string;
  dispatchAt: string;
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
  candidates: DispatchCandidate[];
  totalCandidates: number;
  failedCount: number;
  amount: number;
  ccy: string;
  createdAt: string;
  updatedAt: string;
}

// 派单记录信息
export interface DispatchRecord {
  dispatchId: string;
  tid: string;
  trxId: string;
  trxType: string;
  cid: string;
  cashierAppAccountId: string;
  cashierAccountId: string;
  dispatchRound: number;
  dispatchAt: string;
  amount: number;
  ccy: string;
  fee: number;
  status: string;
  expiredAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectedReason?: string;
  notifyType?: string;
  createdAt: string;
  updatedAt: string;
}

// 统一交易信息接口 - 与后端 protocol.TransactionInfo 保持一致
export interface TransactionInfo {
  trxID: string;
  reqID: string;
  oriTrxID?: string;
  oriReqID?: string;
  status: TransactionStatus;
  channelStatus?: string;
  resCode?: string;
  resMsg?: string;
  reason?: string;
  ccy: string;
  amount: string;
  usdAmount: string;
  link?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  confirmedAt?: string;
  expiredAt?: string;
  trxType: TransactionType;
  trxMethod?: string;
  trxMode?: string;
  trxApp?: string;
  channelCode?: string;
  channelAccount?: string;
  channelGroup?: string;
  channelTrxID?: string;
  feeCcy?: string;
  feeAmount?: string;
  feeUsdAmount?: string;
  channelFeeCcy?: string;
  channelFeeAmount?: string;
  flowNo?: string;
  country?: string;
  remark?: string;
  settleStatus?: SettleStatus;
  settleID?: string;
  settleAmount?: string;
  settleUsdAmount?: string;
  settledAt?: string;
  refundedCount?: number;
  refundedAmount?: string;
  refundedUsdAmount?: string;
  lastRefundedAt?: string;
  detail?: string;
  // 代付收款账户信息（用户提供）
  upi?: string;
  bankCode?: string;
  bankName?: string;
  cardNumber?: string;
  holderName?: string;
  holderPhone?: string;
  holderEmail?: string;
  // Cashier信息
  cid?: string;
  cashier?: UserInfo;
  cashierAccountId?: string;
  cashierAppAccountId?: string;
  dispatchHistory?: DispatchHistory[];
  dispatchRecords?: DispatchRecord[];
  // 通知相关字段
  notifyUrl?: string;
  notifiedAt?: string;
  notifyStatus?: string;
  notifyCount?: number;
}

// 查询参数接口
export interface TransactionQueryParams {
  trxType: TransactionType;
  page: number;
  pageSize: number;
  keyword?: string;  // 关键字搜索（支持trx_id和req_id）
  startDate?: string;
  endDate?: string;
  status?: TransactionStatus;
  trxMethod?: string;
  ccy?: string;
  trxID?: string;
  reqID?: string;
  uid?: string;
  channelCode?: string;
}

// 分页响应接口
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 今日统计数据接口
export interface TodayStats {
  totalAmount: string;
  totalCount: number;
  successCount: number;
  successRate: number;
  pendingCount: number;
}

// 时间戳转换为 ISO 字符串的辅助函数
const timestampToISOString = (timestamp?: number): string | undefined => {
  return timestamp ? new Date(timestamp).toISOString() : undefined; // 后端返回毫秒时间戳，直接使用
};

// 后端数据转换为前端格式
const convertBackendToFrontend = (backend: BackendTransactionInfo): TransactionInfo => {
  return {
    trxID: backend.trx_id,
    reqID: backend.req_id,
    oriTrxID: backend.ori_trx_id,
    oriReqID: backend.ori_req_id,
    status: backend.status as TransactionStatus,
    channelStatus: backend.channel_status,
    resCode: backend.res_code,
    resMsg: backend.res_msg,
    reason: backend.reason,
    ccy: backend.ccy,
    amount: backend.amount,
    usdAmount: backend.usd_amount || backend.amount, // 如果没有usd_amount，使用amount
    link: backend.link,
    createdAt: timestampToISOString(backend.created_at) || '',
    updatedAt: timestampToISOString(backend.updated_at) || '',
    completedAt: timestampToISOString(backend.completed_at),
    confirmedAt: timestampToISOString(backend.confirmed_at),
    expiredAt: timestampToISOString(backend.expired_at),
    trxType: backend.trx_type as TransactionType,
    trxMethod: backend.trx_method,
    trxMode: backend.trx_mode,
    trxApp: backend.trx_app,
    channelCode: backend.channel_code,
    channelAccount: backend.channel_account,
    channelGroup: backend.channel_group,
    channelTrxID: backend.channel_trx_id,
    feeCcy: backend.fee_ccy,
    feeAmount: backend.fee_amount,
    feeUsdAmount: backend.fee_usd_amount,
    channelFeeCcy: backend.channel_fee_ccy,
    channelFeeAmount: backend.channel_fee_amount,
    flowNo: backend.flow_no,
    country: backend.country,
    remark: backend.remark,
    settleStatus: backend.settle_status ? (backend.settle_status as unknown as SettleStatus) : undefined,
    settleID: backend.settle_id,
    settleAmount: backend.settle_amount,
    settleUsdAmount: backend.settle_usd_amount,
    settledAt: timestampToISOString(backend.settled_at),
    refundedCount: backend.refunded_count,
    refundedAmount: backend.refunded_amount,
    refundedUsdAmount: backend.refunded_usd_amount,
    lastRefundedAt: timestampToISOString(backend.last_refunded_at),
    detail: backend.detail ? JSON.stringify(backend.detail) : undefined,
    // 代付收款账户信息
    upi: backend.upi,
    bankCode: backend.bank_code,
    bankName: backend.bank_name,
    cardNumber: backend.card_number,
    holderName: backend.holder_name,
    holderPhone: backend.holder_phone,
    holderEmail: backend.holder_email,
    // Cashier信息
    cid: backend.cid,
    cashier: backend.cashier,
    cashierAccountId: backend.cashier_account_id,
    cashierAppAccountId: backend.cashier_app_account_id,
    dispatchHistory: backend.dispatch_history?.map(h => ({
      historyId: h.history_id,
      dispatchId: h.dispatch_id,
      trxId: h.trx_id,
      trxType: h.trx_type,
      tid: h.tid,
      dispatchRound: h.dispatch_round,
      cid: h.cid,
      cashierAccountId: h.cashier_account_id,
      cashierAppAccountId: h.cashier_app_account_id,
      dispatchAt: timestampToISOString(h.dispatch_at) || '',
      success: h.success,
      errorCode: h.error_code,
      errorMessage: h.error_message,
      candidates: h.candidates?.map(c => ({
        user: c.user,
        cid: c.cid,
        cashierAccountId: c.cashier_account_id,
        cashierAppAccountId: c.cashier_app_account_id,
        upi: c.upi,
        selected: c.selected,
        failReason: c.fail_reason,
        failCode: c.fail_code,
        onlineStatus: c.online_status,
        accountStatus: c.account_status,
        score: c.score
      })) || [],
      totalCandidates: h.total_candidates,
      failedCount: h.failed_count,
      amount: h.amount,
      ccy: h.ccy,
      createdAt: timestampToISOString(h.created_at) || '',
      updatedAt: timestampToISOString(h.updated_at) || ''
    })),
    dispatchRecords: backend.dispatch_records?.map(r => ({
      dispatchId: r.dispatch_id,
      tid: r.tid,
      trxId: r.trx_id,
      trxType: r.trx_type,
      cid: r.cid,
      cashierAppAccountId: r.cashier_app_account_id,
      cashierAccountId: r.cashier_account_id,
      dispatchRound: r.dispatch_round,
      dispatchAt: timestampToISOString(r.dispatch_at) || '',
      amount: r.amount,
      ccy: r.ccy,
      fee: r.fee,
      status: r.status,
      expiredAt: timestampToISOString(r.expired_at),
      acceptedAt: timestampToISOString(r.accepted_at),
      rejectedAt: timestampToISOString(r.rejected_at),
      rejectedBy: r.rejected_by,
      rejectedReason: r.rejected_reason,
      notifyType: r.notify_type,
      createdAt: timestampToISOString(r.created_at) || '',
      updatedAt: timestampToISOString(r.updated_at) || ''
    })),
    // 通知相关字段
    notifyUrl: backend.notify_url,
    notifiedAt: timestampToISOString(backend.notified_at),
    notifyStatus: backend.notify_status,
    notifyCount: backend.notify_count
  };
};

// 交易服务
export const transactionService = {
  // 获取交易列表
  getTransactions: async (params: TransactionQueryParams): Promise<ApiResponse<PaginatedResponse<TransactionInfo>>> => {
    try {
      // 构建查询参数 - 后端 API 期望下划线格式的参数
      const queryParams: Record<string, any> = {
        trx_type: params.trxType,
        page: params.page,
        size: params.pageSize,
      };

      // 添加可选筛选条件
      if (params.keyword) {
        queryParams.keyword = params.keyword;
      }
      if (params.status !== undefined) {
        queryParams.status = params.status;
      }
      if (params.trxMethod) {
        queryParams.trx_method = params.trxMethod;
      }
      if (params.ccy) {
        queryParams.ccy = params.ccy;
      }
      if (params.uid) {
        queryParams.mid = params.uid; // 商户ID映射为后端的mid字段
      }
      if (params.channelCode) {
        queryParams.channel_code = params.channelCode;
      }
      if (params.trxID) {
        queryParams.trx_id = params.trxID;
      }
      if (params.reqID) {
        queryParams.req_id = params.reqID;
      }
      if (params.startDate) {
        queryParams.created_at_start = new Date(params.startDate).getTime();
      }
      if (params.endDate) {
        queryParams.created_at_end = new Date(params.endDate).getTime();
      }

      // 调用后端 API - 通过代理转发
      const response = await api.post<BackendPageResult<BackendTransactionInfo>>('/transactions/list', queryParams);

      if (response.code === '0000') {
        // 转换数据格式 - 处理records为null的情况
        const convertedItems = (response.data.records || []).map(convertBackendToFrontend);
        
        return {
          code: '200',
          msg: response.msg || '获取成功',
          success: true,
          data: {
            items: convertedItems,
            total: response.data.total,
            page: response.data.current,
            pageSize: response.data.size,
            totalPages: response.data.count,
          },
        };
      } else {
        return {
          code: response.code,
          msg: response.msg || '获取失败',
          success: false,
          data: {
            items: [],
            total: 0,
            page: params.page,
            pageSize: params.pageSize,
            totalPages: 0,
          },
        };
      }
    } catch (error: any) {
      console.error('获取交易列表失败:', error);
      return {
        code: '500',
        msg: error.message || '网络错误',
        success: false,
        data: {
          items: [],
          total: 0,
          page: params.page,
          pageSize: params.pageSize,
          totalPages: 0,
        },
      };
    }
  },

  // 获取交易详情
  getTransactionDetail: async (trxID: string, trxType?: TransactionType): Promise<ApiResponse<TransactionInfo>> => {
    try {
      const response = await api.post<BackendTransactionInfo>('/transactions/detail', {
        trx_id: trxID,
        trx_type: trxType || TransactionType.PAYIN
      });

      if (response.code === '0000') {
        return {
          code: '200',
          msg: response.msg || '获取成功',
          success: true,
          data: convertBackendToFrontend(response.data),
        };
      } else {
        return {
          code: response.code,
          msg: response.msg || '获取失败',
          success: false,
          data: {} as TransactionInfo,
        };
      }
    } catch (error: any) {
      console.error('获取交易详情失败:', error);
      return {
        code: '500',
        msg: error.message || '网络错误',
        success: false,
        data: {} as TransactionInfo,
      };
    }
  },

  // 获取今日统计
  getTodayStats: async (trxType: TransactionType): Promise<ApiResponse<TodayStats>> => {
    try {
      const response = await api.post<TodayStats>('/transactions/today-stats', {
        trx_type: trxType,
      });

      if (response.code === '0000') {
        return {
          code: '200',
          msg: response.msg || '获取成功',
          success: true,
          data: response.data,
        };
      } else {
        return {
          code: response.code,
          msg: response.msg || '获取失败',
          success: false,
          data: {
            totalAmount: '0',
            totalCount: 0,
            successCount: 0,
            successRate: 0,
            pendingCount: 0
          },
        };
      }
    } catch (error: any) {
      console.error('获取今日统计失败:', error);
      return {
        code: '500',
        msg: error.message || '网络错误',
        success: false,
        data: {
          totalAmount: '0',
          totalCount: 0,
          successCount: 0,
          successRate: 0,
          pendingCount: 0
        },
      };
    }
  },

  // 重试通知 - 如果后端有对应接口，可以修改为真实调用
  retryNotification: async (trxID: string): Promise<ApiResponse<null>> => {
    try {
      // 这里假设后端有重试通知的接口，需要根据实际情况调整
      // const response = await api.post('/transactions/retry-notification', { trx_id: trxID });
      
      // 暂时使用模拟响应
      console.log('Retrying notification for transaction:', trxID);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            code: '200',
            msg: '重试通知成功',
            success: true,
            data: null
          });
        }, 1000);
      });
    } catch (error: any) {
      console.error('重试通知失败:', error);
      return {
        code: '500',
        msg: error.message || '网络错误',
        success: false,
        data: null,
      };
    }
  },

  // 手动通知商户交易
  notifyTransaction: async (trxID: string, trxType: TransactionType): Promise<ApiResponse<string>> => {
    try {
      const response = await api.post<string>('/transactions/notify', {
        trx_id: trxID,
        trx_type: trxType
      });

      if (response.code === '0000') {
        return {
          code: '200',
          msg: response.msg || '通知发送成功',
          success: true,
          data: response.data,
        };
      } else {
        return {
          code: response.code,
          msg: response.msg || '通知发送失败',
          success: false,
          data: '',
        };
      }
    } catch (error: any) {
      console.error('通知交易失败:', error);
      return {
        code: '500',
        msg: error.message || '网络错误',
        success: false,
        data: '',
      };
    }
  },

  // 创建退款 - 如果后端有对应接口，可以修改为真实调用
  createRefund: async (params: {
    oriTrxID: string;
    amount: string;
    reason?: string;
  }): Promise<ApiResponse<TransactionInfo>> => {
    try {
      // 这里假设后端有创建退款的接口，需要根据实际情况调整
      // const response = await api.post('/transactions/refund', {
      //   ori_trx_id: params.oriTrxID,
      //   amount: params.amount,
      //   reason: params.reason,
      // });
      
      // 暂时使用模拟响应
      return new Promise((resolve) => {
        setTimeout(() => {
          const refund: TransactionInfo = {
            trxID: `REFUND${Date.now()}`,
            reqID: `REQ${Date.now()}`,
            oriTrxID: params.oriTrxID,
            status: TransactionStatus.PENDING,
            channelStatus: ChannelStatus.PENDING,
            resCode: '9999',
            resMsg: 'Pending',
            reason: params.reason,
            ccy: 'INR',
            amount: params.amount,
            usdAmount: (parseFloat(params.amount) * 0.012).toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            trxType: TransactionType.REFUND,
            trxMethod: 'UPI',
            country: 'IN'
          };

          resolve({
            code: '200',
            msg: '退款申请已提交',
            success: true,
            data: refund
          });
        }, 1000);
      });
    } catch (error: any) {
      console.error('创建退款失败:', error);
      return {
        code: '500',
        msg: error.message || '网络错误',
        success: false,
        data: {} as TransactionInfo,
      };
    }
  },

  // 确认交易
  confirmTransaction: async (params: {
    trxID: string;
    referenceID: string;
    trxType: TransactionType;
  }): Promise<ApiResponse<TransactionInfo>> => {
    try {
      const response = await api.post<BackendTransactionInfo>('/transactions/confirm', {
        trx_id: params.trxID,
        reference_id: params.referenceID,
        trx_type: params.trxType,
      });

      if (response.code === '0000') {
        return {
          code: '200',
          msg: response.msg || '确认成功',
          success: true,
          data: convertBackendToFrontend(response.data),
        };
      } else {
        return {
          code: response.code,
          msg: response.msg || '确认失败',
          success: false,
          data: {} as TransactionInfo,
        };
      }
    } catch (error: any) {
      console.error('确认交易失败:', error);
      return {
        code: '500',
        msg: error.message || '网络错误',
        success: false,
        data: {} as TransactionInfo,
      };
    }
  },
};
