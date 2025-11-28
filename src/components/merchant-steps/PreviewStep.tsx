import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Building2, Wallet, FileText, Route } from 'lucide-react';
import { MerchantFormData } from '../CreateMerchantModal';

interface PreviewStepProps {
  data: MerchantFormData;
}

export function PreviewStep({ data }: PreviewStepProps) {
  const getStatusBadge = (status: string | boolean) => {
    if (typeof status === 'boolean') {
      return status ? 
        <Badge className="bg-green-100 text-green-800 border-green-300">激活</Badge> : 
        <Badge variant="secondary">未激活</Badge>;
    }
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-300">激活</Badge>;
      case 'inactive':
        return <Badge variant="secondary">未激活</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 border-red-300">暂停</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTrxTypeBadge = (trxType: string) => {
    switch (trxType) {
      case 'payin':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">代收</Badge>;
      case 'payout':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300">代付</Badge>;
      default:
        return <Badge variant="outline">{trxType}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const getMerchantTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'normal': '普通',
      'enterprise': '企业',
      'individual': '个人',
      'premium': '高级'
    };
    return types[type] || type;
  };

  const formatAmountRange = (ccy: string, minAmount: number, maxAmount: number) => {
    // Format: "CCY min - max" or "min - max" if no currency
    // Handle zero values gracefully
    const prefix = ccy ? `${ccy} ` : '';
    
    if (minAmount === 0 && maxAmount === 0) {
      return `${prefix}不限`;
    }
    
    if (minAmount === 0) {
      return `${prefix}0 - ${maxAmount}`;
    }
    
    if (maxAmount === 0) {
      return `${prefix}${minAmount} 起`;
    }
    
    return `${prefix}${minAmount} - ${maxAmount}`;
  };

  return (
    <div className="space-y-6 max-h-full overflow-y-auto">
      {/* 汇总统计 */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-700">1</div>
              <div className="text-sm text-blue-600">商户</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">{data.accounts.length}</div>
              <div className="text-sm text-blue-600">账户</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">{data.contracts.length}</div>
              <div className="text-sm text-blue-600">合同</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">{data.routers.length}</div>
              <div className="text-sm text-blue-600">路由</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 商户信息预览 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            商户基本信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">商户名称</label>
              <p className="font-semibold">{data.merchantInfo.name}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">商户类型</label>
              <p className="font-semibold">{getMerchantTypeLabel(data.merchantInfo.type)}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">邮箱地址</label>
              <p className="font-semibold">{data.merchantInfo.email}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">手机号码</label>
              <p className="font-semibold">{data.merchantInfo.phone}</p>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">初始状态</label>
            <div className="mt-1">
              {getStatusBadge(data.merchantInfo.status)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 账户信息预览 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            账户配置 ({data.accounts.length} 个账户)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.accounts.length === 0 ? (
            <p className="text-muted-foreground">暂无账户配置</p>
          ) : (
            <div className="space-y-2">
              {data.accounts.map((account, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                  <div className="font-semibold">{account.ccy}</div>
                  {account.is_default && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                      默认
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 合同信息预览 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5" />
            合同配置 ({data.contracts.length} 个合同)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.contracts.length === 0 ? (
            <p className="text-muted-foreground">暂无合同配置</p>
          ) : (
            <div className="space-y-3">
              {data.contracts.map((contract, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold font-mono">{contract.contract_id || '（系统生成）'}</div>
                    <div>{getStatusBadge(contract.status)}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {contract.expired_at ? 
                      `有效期：${formatDate(contract.start_at)} 至 ${formatDate(contract.expired_at)}` :
                      `生效时间：${formatDate(contract.start_at)} （无过期时间）`
                    }
                  </div>
                  <div className="flex gap-2">
                    {contract.payin && (
                      <Badge variant="outline" className="text-xs">代收</Badge>
                    )}
                    {contract.payout && (
                      <Badge variant="outline" className="text-xs">代付</Badge>
                    )}
                    {!contract.payin && !contract.payout && (
                      <span className="text-muted-foreground text-xs">无权限</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 路由信息预览 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Route className="h-5 w-5" />
            路由配置 ({data.routers.length} 个路由)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.routers.length === 0 ? (
            <p className="text-muted-foreground">暂无路由配置</p>
          ) : (
            <div className="space-y-3">
              {data.routers.map((router, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getTrxTypeBadge(router.trx_type)}
                    <Badge variant="outline">{router.trx_method.toUpperCase()}</Badge>
                    {router.country && <Badge variant="outline">{router.country}</Badge>}
                    {getStatusBadge(router.status)}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">渠道：</span>
                      <span className="font-medium">{router.channel_code}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">交易金额：</span>
                      <span className="font-medium">
                        {formatAmountRange(router.ccy, router.min_amount, router.max_amount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">优先级：</span>
                      <span className="font-medium">{router.priority}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* 提交提示 */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">
              !
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-amber-800">提交确认</h4>
              <p className="mt-1 text-sm text-amber-700">
                点击"创建商户"按钮后，系统将按照上述配置创建商户及相关资源。
                此操作不可撤销，请确认所有信息正确无误。
              </p>
              <ul className="mt-2 text-sm text-amber-700 space-y-1">
                <li>• 商户创建后将自动分配用户ID</li>
                <li>• 系统将自动生成API密钥</li>
                <li>• 配置的账户、合同、路由将立即生效</li>
                <li>• 可以在商户管理页面进行后续修改</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}