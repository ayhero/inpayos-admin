import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { CCY_OPTIONS } from '../../constants/business';
import { UserType } from '../CreateUserModal';

interface AccountData {
  ccy: string;
  status: boolean;
  is_default?: boolean;
}

interface AccountStepProps {
  data: { accounts: AccountData[]; userInfo?: { default_ccy?: string } };
  updateData: (field: string, data: any) => void;
  userType: UserType;
}

export function AccountStep({ data, updateData }: AccountStepProps) {
  const [localData, setLocalData] = useState<AccountData[]>(data.accounts);
  const [newAccount, setNewAccount] = useState<Partial<AccountData>>({
    ccy: '',
    status: true // 默认激活，不需要用户选择
  });

  useEffect(() => {
    setLocalData(data.accounts);
  }, [data.accounts]);

  // Initialize default account if userInfo.default_ccy is set and no accounts exist
  useEffect(() => {
    if (data.userInfo?.default_ccy && localData.length === 0) {
      const defaultAccount: AccountData = {
        ccy: data.userInfo.default_ccy,
        status: true,
        is_default: true
      };
      updateDataState([defaultAccount]);
    }
  }, [data.userInfo?.default_ccy]);

  const updateDataState = (newData: AccountData[]) => {
    setLocalData(newData);
    updateData('accounts', newData);
  };

  const addAccount = () => {
    if (!newAccount.ccy) return;
    
    // 检查是否已存在相同币种的账户
    const exists = localData.some(account => account.ccy === newAccount.ccy);
    if (exists) {
      alert('该币种账户已存在');
      return;
    }

    const accountToAdd: AccountData = {
      ccy: newAccount.ccy,
      status: newAccount.status ?? true
    };

    const updatedData = [...localData, accountToAdd];
    updateDataState(updatedData);
    
    // 重置表单
    setNewAccount({
      ccy: '',
      status: true
    });
  };

  const removeAccount = (index: number) => {
    const account = localData[index];
    if (account.is_default) {
      alert('默认账户不能删除');
      return;
    }
    const updatedData = localData.filter((_, i) => i !== index);
    updateDataState(updatedData);
  };

  const getCcyLabel = (ccy: string) => {
    const option = CCY_OPTIONS.find(opt => opt.value === ccy);
    return option ? option.label : ccy;
  };

  return (
    <div className="space-y-6 max-h-full overflow-y-auto">
      {/* 币种选择和添加按钮 */}
      <div className="flex gap-4 items-end">
        <div className="w-48">
          <Select 
            value={newAccount.ccy || ''} 
            onValueChange={(value) => setNewAccount(prev => ({ ...prev, ccy: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择币种" />
            </SelectTrigger>
                <SelectContent>
                  {CCY_OPTIONS.filter(opt => opt.value !== 'all').map(option => {
                    const isAdded = localData.some(acc => acc.ccy === option.value);
                    return (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        disabled={isAdded}
                        className={isAdded ? 'opacity-50' : ''}
                      >
                        {option.label} {isAdded ? '(已添加)' : ''}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={addAccount}
          disabled={!newAccount.ccy}
          size="sm"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* 账户列表 */}
      {localData.length > 0 && (
        <div>
          <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>币种</TableHead>
                  <TableHead className="w-24">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localData.map((account, index) => (
                  <TableRow key={`${account.ccy}-${index}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{account.ccy}</Badge>
                        <span>{getCcyLabel(account.ccy)}</span>
                        {account.is_default && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 ml-2">
                            默认
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {!account.is_default && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAccount(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </div>
      )}
    </div>
  );
}