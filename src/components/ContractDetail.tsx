import { Badge } from './ui/badge';
import { getStatusDisplayName, getStatusColor } from '../constants/status';
import { Contract } from '../services/contractService';
import { formatCountry } from '../utils/countryMapping';
import { formatCurrency } from '../utils/currencyMapping';
import { isActiveStatus } from '../utils/statusMapping';
import { formatTrxType } from '../utils/trxTypeMapping';
import { formatTrxMethod } from '../utils/trxMethodMapping';

interface ContractDetailProps {
  contract: Contract;
}

export function ContractDetail({ contract }: ContractDetailProps) {
  // 渲染状态开关
  const renderStatusSwitch = (status: string) => {
    const isActive = isActiveStatus(status);
    return (
      <div className="flex items-center gap-2">
        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isActive ? 'bg-green-500' : 'bg-gray-300'
        }`}>
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isActive ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </div>
        <span className={`text-sm font-medium ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
          {isActive ? '激活' : '禁用'}
        </span>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const displayName = getStatusDisplayName(status);
    const color = getStatusColor(status);
    
    const getVariantAndClass = (color: string) => {
      switch (color) {
        case 'success':
          return { variant: 'default' as const, className: 'bg-green-500' };
        case 'error':
          return { variant: 'destructive' as const, className: '' };
        case 'warning':
          return { variant: 'secondary' as const, className: 'bg-yellow-500' };
        case 'info':
          return { variant: 'secondary' as const, className: 'bg-blue-500' };
        default:
          return { variant: 'secondary' as const, className: 'bg-gray-500' };
      }
    };
    
    const { variant, className } = getVariantAndClass(color);
    return <Badge variant={variant} className={className}>{displayName}</Badge>;
  };

  const formatDateTime = (timestamp: number) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const isFleetContract = contract.stype === 'cashier_team';
  const userLabel = isFleetContract ? '车队' : '商户';

  // 渲染用户信息的工具提示内容
  const renderUserTooltip = () => {
    if (!contract.user) return null;
    
    return (
      <div className="space-y-1 text-xs">
        <div><span className="text-gray-400">ID:</span> <span className="font-mono">{contract.user.user_id}</span></div>
        <div><span className="text-gray-400">类型:</span> {contract.user.user_type}</div>
        {contract.user.phone && <div><span className="text-gray-400">手机:</span> {contract.user.phone}</div>}
        {contract.user.email && <div><span className="text-gray-400">邮箱:</span> {contract.user.email}</div>}
        <div><span className="text-gray-400">状态:</span> {getStatusBadge(contract.user.status)}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-h-[500px] overflow-y-auto">
      {/* 基本信息 */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">合约ID</label>
          <p className="mt-1 font-mono text-sm">{contract.contract_id}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">原合约ID</label>
          <p className="mt-1 font-mono text-sm">{contract.ori_contract_id || '-'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">{userLabel}</label>
          {contract.user ? (
            <div className="mt-1 group relative">
              <p className="text-sm font-medium cursor-help">{contract.user.name || contract.sid}</p>
              <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-50 bg-gray-800 text-white p-3 rounded-lg shadow-lg min-w-[250px]">
                {renderUserTooltip()}
              </div>
            </div>
          ) : (
            <p className="mt-1 font-mono text-sm">{contract.sid}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">状态</label>
          <p className="mt-1">{getStatusBadge(contract.status)}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">生效时间</label>
          <p className="mt-1 text-sm">{formatDateTime(contract.start_at)}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">过期时间</label>
          <p className="mt-1 text-sm">{contract.expired_at ? formatDateTime(contract.expired_at) : '永久有效'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">创建时间</label>
          <p className="mt-1 text-sm">{formatDateTime(contract.created_at)}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">更新时间</label>
          <p className="mt-1 text-sm">{formatDateTime(contract.updated_at)}</p>
        </div>
      </div>
      
      {/* 代收配置 */}
      {contract.payin && (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">代收配置</h3>
            {renderStatusSwitch(contract.payin.status)}
          </div>
          
          {/* 交易配置列表 */}
          {contract.payin.configs && contract.payin.configs.length > 0 && (
            <div className="mb-4">
              <div className="space-y-2">
                {contract.payin.configs.map((config: any, index: number) => (
                  <div key={index} className="bg-gray-50 p-3 rounded text-sm space-y-1">
                    {config.pkg && <div><span className="text-gray-600">业务包:</span> <span className="font-medium">{config.pkg}</span></div>}
                    {config.trx_method && <div><span className="text-gray-600">支付方式:</span> <span className="font-medium">{formatTrxMethod(config.trx_method)}</span></div>}
                    {config.trx_ccy && <div><span className="text-gray-600">币种:</span> <span className="font-medium">{formatCurrency(config.trx_ccy)}</span></div>}
                    {config.country && <div><span className="text-gray-600">国家:</span> <span className="font-medium">{formatCountry(config.country)}</span></div>}
                    {!!(config.min_amount || config.max_amount) && (
                      <div>
                        <span className="text-gray-600">金额范围:</span>{' '}
                        <span className="font-medium">
                          {config.min_amount ? `${config.min_amount}` : '不限'} ~ {config.max_amount ? `${config.max_amount}` : '不限'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 结算配置列表 */}
          {contract.payin.settle && contract.payin.settle.length > 0 && (
            <div>
              {contract.payin.settle.map((settle: any, settleIndex: number) => (
                <div key={settleIndex} className="mb-4 border border-blue-200 rounded-lg overflow-hidden">
                  <div className="bg-blue-50 px-3 py-2 text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-gray-600">结算类型:</span>
                      <span className="font-medium">{settle.type}</span>
                    </div>
                    <div className="flex gap-4 flex-wrap">
                      {settle.pkg && <div><span className="text-gray-600">业务包:</span> <span className="font-medium">{settle.pkg}</span></div>}
                      {settle.trx_method && <div><span className="text-gray-600">支付方式:</span> <span className="font-medium">{formatTrxMethod(settle.trx_method)}</span></div>}
                      {settle.trx_ccy && <div><span className="text-gray-600">币种:</span> <span className="font-medium">{formatCurrency(settle.trx_ccy)}</span></div>}
                      {settle.country && <div><span className="text-gray-600">国家:</span> <span className="font-medium">{formatCountry(settle.country)}</span></div>}
                    </div>
                    {!!(settle.min_amount || settle.max_amount) && (
                      <div className="mt-1">
                        <span className="text-gray-600">金额范围:</span>{' '}
                        <span className="font-medium">
                          {settle.min_amount ? `${settle.min_amount}` : '不限'} ~ {settle.max_amount ? `${settle.max_amount}` : '不限'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* 策略列表表格 */}
                  {settle.strategy_list && settle.strategy_list.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-2 py-2 text-left font-medium text-gray-600">策略代码</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-600">车队ID</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-600">结算币种</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-600">交易类型</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-600">支付方式</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-600">国家</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-600">状态</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-600">规则</th>
                          </tr>
                        </thead>
                        <tbody>
                          {settle.strategy_list.map((strategy: any, strategyIndex: number) => (
                            <tr key={strategyIndex} className="border-t">
                              <td className="px-2 py-2">{strategy.code}</td>
                              <td className="px-2 py-2 font-mono">{strategy.sid}</td>
                              <td className="px-2 py-2">{formatCurrency(strategy.settle_ccy)}</td>
                              <td className="px-2 py-2">{formatTrxType(strategy.trx_type)}</td>
                              <td className="px-2 py-2">{formatTrxMethod(strategy.trx_method)}</td>
                              <td className="px-2 py-2">{formatCountry(strategy.country)}</td>
                              <td className="px-2 py-2">{renderStatusSwitch(strategy.status)}</td>
                              <td className="px-2 py-2">
                                {strategy.rules && strategy.rules.length > 0 ? (
                                  <div className="space-y-1">
                                    {strategy.rules.map((rule: any, ruleIndex: number) => (
                                      <div key={ruleIndex} className="text-xs bg-gray-50 p-1 rounded">
                                        <div className="font-medium">{rule.rule_id}</div>
                                        <div className="text-gray-600">
                                          费率: {rule.rate || '-'}% | 固定费: {rule.fixed_fee || '-'} {formatCurrency(rule.ccy)}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* 代付配置 */}
      {contract.payout && (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">代付配置</h3>
            {renderStatusSwitch(contract.payout.status)}
          </div>
          
          {/* 交易配置列表 */}
          {contract.payout.configs && contract.payout.configs.length > 0 && (
            <div className="mb-4">
              <div className="space-y-2">
                {contract.payout.configs.map((config: any, index: number) => (
                  <div key={index} className="bg-gray-50 p-3 rounded text-sm space-y-1">
                    {config.pkg && <div><span className="text-gray-600">业务包:</span> <span className="font-medium">{config.pkg}</span></div>}
                    {config.trx_method && <div><span className="text-gray-600">支付方式:</span> <span className="font-medium">{formatTrxMethod(config.trx_method)}</span></div>}
                    {config.trx_ccy && <div><span className="text-gray-600">币种:</span> <span className="font-medium">{formatCurrency(config.trx_ccy)}</span></div>}
                    {config.country && <div><span className="text-gray-600">国家:</span> <span className="font-medium">{formatCountry(config.country)}</span></div>}
                    {!!(config.min_amount || config.max_amount) && (
                      <div>
                        <span className="text-gray-600">金额范围:</span>{' '}
                        <span className="font-medium">
                          {config.min_amount ? `${config.min_amount}` : '不限'} ~ {config.max_amount ? `${config.max_amount}` : '不限'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 结算配置列表 */}
          {contract.payout.settle && contract.payout.settle.length > 0 && (
            <div>
              {contract.payout.settle.map((settle: any, settleIndex: number) => (
                <div key={settleIndex} className="mb-4 border border-blue-200 rounded-lg overflow-hidden">
                  <div className="bg-blue-50 px-3 py-2 text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-gray-600">结算类型:</span>
                      <span className="font-medium">{settle.type}</span>
                    </div>
                    <div className="flex gap-4 flex-wrap">
                      {settle.pkg && <div><span className="text-gray-600">业务包:</span> <span className="font-medium">{settle.pkg}</span></div>}
                      {settle.trx_method && <div><span className="text-gray-600">支付方式:</span> <span className="font-medium">{formatTrxMethod(settle.trx_method)}</span></div>}
                      {settle.trx_ccy && <div><span className="text-gray-600">币种:</span> <span className="font-medium">{formatCurrency(settle.trx_ccy)}</span></div>}
                      {settle.country && <div><span className="text-gray-600">国家:</span> <span className="font-medium">{formatCountry(settle.country)}</span></div>}
                    </div>
                    {!!(settle.min_amount || settle.max_amount) && (
                      <div className="mt-1">
                        <span className="text-gray-600">金额范围:</span>{' '}
                        <span className="font-medium">
                          {settle.min_amount ? `${settle.min_amount}` : '不限'} ~ {settle.max_amount ? `${settle.max_amount}` : '不限'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* 策略列表表格 */}
                  {settle.strategy_list && settle.strategy_list.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-2 py-2 text-left font-medium text-gray-600">策略代码</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-600">车队ID</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-600">结算币种</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-600">交易类型</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-600">支付方式</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-600">国家</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-600">状态</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-600">规则</th>
                          </tr>
                        </thead>
                        <tbody>
                          {settle.strategy_list.map((strategy: any, strategyIndex: number) => (
                            <tr key={strategyIndex} className="border-t">
                              <td className="px-2 py-2">{strategy.code}</td>
                              <td className="px-2 py-2 font-mono">{strategy.sid}</td>
                              <td className="px-2 py-2">{formatCurrency(strategy.settle_ccy)}</td>
                              <td className="px-2 py-2">{formatTrxType(strategy.trx_type)}</td>
                              <td className="px-2 py-2">{formatTrxMethod(strategy.trx_method)}</td>
                              <td className="px-2 py-2">{formatCountry(strategy.country)}</td>
                              <td className="px-2 py-2">{renderStatusSwitch(strategy.status)}</td>
                              <td className="px-2 py-2">
                                {strategy.rules && strategy.rules.length > 0 ? (
                                  <div className="space-y-1">
                                    {strategy.rules.map((rule: any, ruleIndex: number) => (
                                      <div key={ruleIndex} className="text-xs bg-gray-50 p-1 rounded">
                                        <div className="font-medium">{rule.rule_id}</div>
                                        <div className="text-gray-600">
                                          费率: {rule.rate || '-'}% | 固定费: {rule.fixed_fee || '-'} {formatCurrency(rule.ccy)}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
