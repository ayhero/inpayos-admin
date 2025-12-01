import { useState, useEffect, useRef, forwardRef } from 'react';
import { Input } from './ui/input';
import { X, ChevronDown, Loader2 } from 'lucide-react';
import UserService, { User } from '../services/userService';

// 简单的 className 合并工具
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

interface UserSelectorProps {
  value?: string; // user_id
  onChange: (userId: string, userName: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  userType: 'merchant' | 'cashier_team'; // 用户类型
  autoLoad?: boolean; // 是否自动加载（模态窗打开时）
  disabled?: boolean; // 是否禁用
}

export const UserSelector = forwardRef<HTMLDivElement, UserSelectorProps>(function UserSelector({
  value, 
  onChange, 
  onClear,
  placeholder = '选择用户 (空=全局)',
  className,
  userType,
  autoLoad = false,
  disabled = false
}, ref) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 加载用户列表（根据搜索词）
  useEffect(() => {
    const loadUsers = async () => {
      // 只有在下拉框打开或autoLoad时才加载
      if (!isOpen && !autoLoad) return;
      
      setLoading(true);
      try {
        const response = await UserService.listUsers({
          user_type: userType,
          keyword: searchTerm || undefined, // 使用 keyword 进行模糊查询
          page: 1,
          size: 20
        });

        if (response.success && response.data && response.data.records) {
          setUsers(response.data.records);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error('加载用户列表失败:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    // 防抖处理
    const timer = setTimeout(() => {
      loadUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, isOpen, userType, autoLoad]);

  // 当外部value变化时，加载对应的用户信息
  useEffect(() => {
    const loadSelectedUser = async () => {
      if (!value) {
        setSelectedUser(null);
        setSearchTerm('');
        return;
      }

      // 如果已选中的用户ID匹配，不重新加载
      if (selectedUser?.user_id === value) {
        return;
      }

      try {
        const response = await UserService.listUsers({
          user_type: userType,
          user_id: value,
          page: 1,
          size: 1
        });

        if (response.success && response.data?.records.length > 0) {
          const user = response.data.records[0];
          setSelectedUser(user);
          setSearchTerm(user.name || user.user_id);
        }
      } catch (error) {
        console.error('加载用户信息失败:', error);
      }
    };

    loadSelectedUser();
  }, [value, userType]);

  const handleSelect = (user: User) => {
    setSelectedUser(user);
    setSearchTerm(user.name || user.user_id);
    setIsOpen(false);
    onChange(user.user_id, user.name);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUser(null);
    setSearchTerm('');
    setIsOpen(false);
    if (onClear) {
      onClear();
    } else {
      onChange('', '');
    }
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(true);
    
    // 如果清空了输入，也清空选中
    if (!value && selectedUser) {
      setSelectedUser(null);
      if (onClear) {
        onClear();
      } else {
        onChange('', '');
      }
    }
  };

  const handleInputFocus = () => {
    if (disabled) return;
    setIsOpen(true);
  };

  return (
    <div ref={ref || dropdownRef} className={cn("relative", className)}>
      <div className="relative">
        <Input
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="pr-16"
          ref={inputRef as any}
          disabled={disabled}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {selectedUser && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="清除"
            >
              <X className="h-3.5 w-3.5 text-gray-500" />
            </button>
          )}
          <ChevronDown 
            className={cn(
              "h-4 w-4 text-gray-500 transition-transform",
              isOpen && "transform rotate-180"
            )} 
          />
        </div>
      </div>

      {/* 下拉列表 */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-3">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">加载中...</span>
            </div>
          ) : !users || users.length === 0 ? (
            <div className="py-3 px-4 text-sm text-gray-500 text-center">
              {searchTerm ? '未找到匹配的用户' : '暂无用户数据'}
            </div>
          ) : (
            <div className="py-1">
              {users.map((user) => (
                <button
                  key={user.user_id}
                  type="button"
                  onClick={() => handleSelect(user)}
                  className={cn(
                    "w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors",
                    selectedUser?.user_id === user.user_id && "bg-blue-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        ID: {user.user_id}
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      )}>
                        {user.status === 'active' ? '启用' : user.status === 'inactive' ? '禁用' : user.status}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
