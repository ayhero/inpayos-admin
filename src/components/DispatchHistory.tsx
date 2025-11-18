import { Badge } from './ui/badge';
import { DispatchHistory as DispatchHistoryType } from '../services/transactionService';
import { OnlineStatusBadge, AccountStatusBadge } from './StatusBadges';

interface DispatchHistoryProps {
  dispatchHistory?: DispatchHistoryType[];
  formatDateTime: (dateString: string) => string;
}

export function DispatchHistory({ dispatchHistory, formatDateTime }: DispatchHistoryProps) {
  if (!dispatchHistory || dispatchHistory.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 pb-2 border-b">派单历史</h3>
      <div className="space-y-4">
        {dispatchHistory.map((history) => (
          <div key={history.historyId} className="border rounded-lg p-4 bg-muted/30">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">第 {history.dispatchRound} 轮</Badge>
                <Badge variant={history.success ? 'default' : 'destructive'} className={history.success ? 'bg-green-500' : ''}>
                  {history.success ? '成功' : '失败'}
                </Badge>
                <span className="text-sm text-muted-foreground">{formatDateTime(history.dispatchAt)}</span>
                {!history.success && history.errorCode && (
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-xs">
                      {history.errorCode}
                    </Badge>
                    {history.errorMessage && (
                      <span className="text-xs text-red-600">{history.errorMessage}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            {history.candidates && history.candidates.length > 0 && (
              <div className="mt-3">
                <div className="border rounded overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-2 py-2 text-center font-medium">已选中</th>
                        <th className="px-2 py-2 text-left font-medium">UPI</th>
                        <th className="px-2 py-2 text-left font-medium">账户ID</th>
                        <th className="px-2 py-2 text-center font-medium">在线状态</th>
                        <th className="px-2 py-2 text-center font-medium">账户状态</th>
                        <th className="px-2 py-2 text-center font-medium">分数</th>
                        <th className="px-2 py-2 text-left font-medium">失败原因</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.candidates.map((candidate, cidx) => (
                        <tr key={cidx} className="border-t hover:bg-muted/30">
                          <td className="px-2 py-2 text-center">
                            {candidate.selected ? (
                              <Badge variant="default" className="bg-blue-500 text-xs">✓</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-2 py-2 font-mono">{candidate.upi}</td>
                          <td className="px-2 py-2 font-mono text-xs">{candidate.cashierAppAccountId}</td>
                          <td className="px-2 py-2 text-center">
                            <OnlineStatusBadge status={candidate.onlineStatus} />
                          </td>
                          <td className="px-2 py-2 text-center">
                            <AccountStatusBadge status={candidate.accountStatus} />
                          </td>
                          <td className="px-2 py-2 text-center font-semibold">{candidate.score}</td>
                          <td className="px-2 py-2">
                            {candidate.failReason ? (
                              <div className="flex items-center gap-1">
                                {candidate.failCode && (
                                  <Badge variant="outline" className="text-xs">{candidate.failCode}</Badge>
                                )}
                                <span className="text-xs text-red-600">{candidate.failReason}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
