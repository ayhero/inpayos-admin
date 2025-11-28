import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Building2, Mail, Phone } from 'lucide-react';
import { CCY_OPTIONS } from '../../constants/business';

interface MerchantInfo {
  name: string;
  email: string;
  phone: string;
  phone_country_code: string;
  type: string;
  status: boolean;
  default_ccy: string;
}

interface MerchantInfoStepProps {
  data: MerchantInfo;
  onChange: (data: MerchantInfo) => void;
}

export function MerchantInfoStep({ data, onChange }: MerchantInfoStepProps) {
  const [localData, setLocalData] = useState<MerchantInfo>(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const updateField = (field: keyof MerchantInfo, value: string | boolean) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="h-6 w-6 text-primary" />
        <h3 className="text-lg font-semibold">基本信息</h3>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="merchant-name">
                名称 <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="merchant-name"
                  value={localData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="请输入名称"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchant-type">
                类型 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={localData.type}
                onValueChange={(value) => updateField('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="merchant">普通</SelectItem>
                  <SelectItem value="enterprise">企业</SelectItem>
                  <SelectItem value="individual">个人</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="merchant-email">
                邮箱 <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="merchant-email"
                  type="email"
                  value={localData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="请输入邮箱"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchant-phone">手机</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  id="merchant-phone-code"
                  value={localData.phone_country_code || '+91'}
                  onChange={(e) => updateField('phone_country_code', e.target.value)}
                  placeholder="+91"
                />
                <div className="col-span-2 relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="merchant-phone"
                    value={localData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="请输入手机号"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="merchant-default-ccy">默认账户</Label>
              <Select
                value={localData.default_ccy || ''}
                onValueChange={(value) => updateField('default_ccy', value === '__clear__' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择默认币种（可选）" />
                </SelectTrigger>
                <SelectContent>
                  {localData.default_ccy && (
                    <SelectItem value="__clear__" className="text-red-600">
                      清除选择
                    </SelectItem>
                  )}
                  {CCY_OPTIONS.filter(opt => opt.value !== 'all').map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>状态</Label>
              <div className="flex items-center space-x-2 h-10">
                <Checkbox
                  id="merchant-status"
                  checked={localData.status}
                  onCheckedChange={(checked: boolean) => updateField('status', checked)}
                />
                <Label htmlFor="merchant-status" className="text-sm font-normal cursor-pointer">
                  激活
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 验证提示 */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">
              !
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-amber-800">填写说明</h4>
              <ul className="mt-2 text-sm text-amber-700 space-y-1">
                <li>• 商户名称将作为显示名称，请确保准确无误</li>
                <li>• 邮箱是唯一必填项，将用于账户通知和重要信息发送</li>
                <li>• 手机号格式：区号-手机号（如：+91-2023000230）</li>
                <li>• 默认账户：如果选择，系统会自动创建该币种账户</li>
                <li>• 状态未勾选时商户将处于未激活状态</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}