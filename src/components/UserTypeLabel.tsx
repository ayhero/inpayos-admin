import { Badge } from './ui/badge';

interface UserTypeLabelProps {
  type: string;
  className?: string;
}

export function UserTypeLabel({ type, className }: UserTypeLabelProps) {
  const getTypeConfig = (userType: string) => {
    const configs: Record<string, { label: string; className: string }> = {
      'merchant': { label: '商户', className: 'bg-blue-500 hover:bg-blue-600' },
      'cashier': { label: '收银员', className: 'bg-green-500 hover:bg-green-600' },
      'cashier_team': { label: '车队', className: 'bg-cyan-500 hover:bg-cyan-600' },
      'agent': { label: '代理', className: 'bg-purple-500 hover:bg-purple-600' },
      'admin': { label: '管理员', className: 'bg-red-500 hover:bg-red-600' },
      'system': { label: '系统', className: 'bg-gray-500 hover:bg-gray-600' },
    };
    return configs[userType?.toLowerCase()] || { label: userType || '-', className: 'bg-gray-400 hover:bg-gray-500' };
  };

  const config = getTypeConfig(type);

  return (
    <Badge variant="default" className={`${config.className} ${className || ''}`}>
      {config.label}
    </Badge>
  );
}
