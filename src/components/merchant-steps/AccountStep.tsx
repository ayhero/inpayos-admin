import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Plus, Trash2, Wallet } from 'lucide-react';
import { CCY_OPTIONS } from '../../constants/business';

interface AccountData {
  ccy: string;
  status: boolean;
  is_default?: boolean;
}

interface AccountStepProps {
  data: AccountData[];
  merchantInfo?: { default_ccy?: string };
  onChange: (data: AccountData[]) => void;
}

export function AccountStep({ data, merchantInfo, onChange }: AccountStepProps) {
  const [localData, setLocalData] = useState<AccountData[]>(data);
  const [newAccount, setNewAccount] = useState<Partial<AccountData>>({
    ccy: '',
    status: true // 默认激活，不需要用户选择
  });

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  // Initialize default account if merchantInfo.default_ccy is set and no accounts exist
  useEffect(() => {
    if (merchantInfo?.default_ccy && localData.length === 0) {
      const defaultAccount: AccountData = {
        ccy: merchantInfo.default_ccy,
        status: true,
        is_default: true
      };
      updateData([defaultAccount]);
    }
  }, [merchantInfo?.default_ccy]);

  const updateData = (newData: AccountData[]) => {
    setLocalData(newData);
    onChange(newData);
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
    updateData(updatedData);
    
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
    updateData(updatedData);
  };

  const getCcyLabel = (ccy: string) => {
    const option = CCY_OPTIONS.find(opt => opt.value === ccy);
    return option ? option.label : ccy;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Wallet className="h-6 w-6 text-primary" />
        <h3 className="text-lg font-semibold">账户配置</h3>
      </div>

      {/* 简单的币种选择和添加按钮 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Select
                value={newAccount.ccy || ''}
                onValueChange={(value) => setNewAccount({ ...newAccount, ccy: value })}
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
                        className={isAdded ? 'text-muted-foreground' : ''}
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
            >
              <Plus className="w-4 h-4 mr-1" />
              添加账户
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 账户列表 */}
      {localData.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>币种</TableHead>
                  <TableHead className="w-20">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localData.map((account, index) => (
                  <TableRow key={`${account.ccy}-${index}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getCcyLabel(account.ccy)}
                        {account.is_default && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                            默认
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAccount(index)}
                        disabled={account.is_default}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

    </div>
  );
}