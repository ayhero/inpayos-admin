import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Building2, Mail, Phone, Users } from 'lucide-react';
import { CCY_OPTIONS } from '../../constants/business';
import { UserType } from '../CreateUserModal';

interface UserInfo {
  name: string;
  email: string;
  phone: string;
  phone_country_code: string;
  type: string;
  status: boolean;
  default_ccy: string;
}

interface UserInfoStepProps {
  data: { userInfo: UserInfo };
  updateData: (field: string, data: any) => void;
  userType: UserType;
}

export function UserInfoStep({ data, updateData, userType }: UserInfoStepProps) {
  const [localData, setLocalData] = useState<UserInfo>(data.userInfo);

  useEffect(() => {
    setLocalData(data.userInfo);
  }, [data.userInfo]);

  const updateField = (field: keyof UserInfo, value: string | boolean) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    updateData('userInfo', newData);
  };

  const getIcon = () => userType === 'merchant' ? Building2 : Users;
  const getNameLabel = () => userType === 'merchant' ? '商户名称' : '车队名称';
  const getTypeOptions = () => {
    if (userType === 'merchant') {
      return [
        { value: 'normal', label: '普通' },
        { value: 'enterprise', label: '企业' },
        { value: 'individual', label: '个人' }
      ];
    } else {
      return [
        { value: 'normal', label: '普通' },
        { value: 'premium', label: '高级' }
      ];
    }
  };

  const IconComponent = getIcon();

  return (
    <div className="space-y-6 max-h-full overflow-y-auto">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">
                {getNameLabel()} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <IconComponent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="user-name"
                  value={localData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder={`请输入${getNameLabel()}`}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-type">
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
                  {getTypeOptions().map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user-email">
                邮箱 <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="user-email"
                  type="email"
                  value={localData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="请输入邮箱"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-phone">手机</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  id="user-phone-code"
                  value={localData.phone_country_code || '+91'}
                  onChange={(e) => updateField('phone_country_code', e.target.value)}
                  placeholder="+91"
                />
                <div className="col-span-2 relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="user-phone"
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
              <Label htmlFor="user-default-ccy">默认账户</Label>
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
                  id="user-status"
                  checked={localData.status}
                  onCheckedChange={(checked: boolean) => updateField('status', checked)}
                />
                <Label htmlFor="user-status" className="text-sm font-normal cursor-pointer">
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
                <li>• {getNameLabel()}将作为显示名称，请确保准确无误</li>
                <li>• 邮箱是唯一必填项，将用于账户通知和重要信息发送</li>
                <li>• 手机号格式：区号-手机号（如：+91-2023000230）</li>
                <li>• 默认账户：如果选择，系统会自动创建该币种账户</li>
                <li>• 状态未勾选时{userType === 'merchant' ? '商户' : '车队'}将处于未激活状态</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}