import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, X, Save, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { merchantService, Merchant, MerchantSecret } from '../services/merchantService';
import { toast } from '../utils/toast';
import { UserTypeLabel } from './UserTypeLabel';
import { ConfirmDialog } from './ui/confirm-dialog';

interface MerchantSecretWithVisibility extends MerchantSecret {
  showSecret?: boolean;
}

interface MerchantSecretModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchant: Merchant | null;
}

export function MerchantSecretModal({ open, onOpenChange, merchant }: MerchantSecretModalProps) {
  const [merchantSecrets, setMerchantSecrets] = useState<MerchantSecretWithVisibility[]>([]);
  const [isAddingSecret, setIsAddingSecret] = useState(false);
  const [newSecret, setNewSecret] = useState<{app_name: string; sandbox: boolean}>({app_name: '', sandbox: false});
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // 当弹窗打开时加载密钥列表
  const loadSecrets = useCallback(async () => {
    if (!merchant) return;
    
    setLoading(true);
    try {
      const response = await merchantService.getMerchantSecrets({ user_id: merchant.user_id });
      if (response.success) {
        setMerchantSecrets(response.data || []);
      } else {
        toast.error('获取商户密钥失败', response.msg);
      }
    } catch (error) {
      console.error('获取商户密钥失败:', error);
      toast.error('获取商户密钥失败', '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [merchant]);

  // 监听弹窗打开
  useEffect(() => {
    if (open && merchant) {
      loadSecrets();
    }
  }, [open, merchant, loadSecrets]);

  // 新增密钥
  const handleAddNewSecret = () => {
    setIsAddingSecret(true);
    setNewSecret({app_name: '', sandbox: false});
  };

  // 取消新增密钥
  const handleCancelNewSecret = () => {
    setIsAddingSecret(false);
    setNewSecret({app_name: '', sandbox: false});
  };

  // 保存新密钥
  const handleSaveNewSecret = () => {
    if (!merchant || !newSecret.app_name.trim()) {
      toast.error('保存失败', '应用名称不能为空');
      return;
    }
    setShowConfirm(true);
  };

  // 确认创建密钥
  const confirmCreateSecret = async () => {
    if (!merchant) return;

    try {
      const response = await merchantService.createMerchantSecret({
        user_id: merchant.user_id,
        app_name: newSecret.app_name,
        sandbox: newSecret.sandbox
      });

      if (response.success) {
        toast.success('创建密钥成功', '');
        setIsAddingSecret(false);
        setNewSecret({app_name: '', sandbox: false});
        // 重新加载密钥列表
        await loadSecrets();
      } else {
        toast.error('创建密钥失败', response.msg);
      }
    } catch (error) {
      console.error('创建密钥失败:', error);
      toast.error('创建密钥失败', '网络错误，请稍后重试');
    }
  };

  // 切换密钥可见性
  const toggleSecretVisibility = (id: number) => {
    setMerchantSecrets(prev => prev.map(secret => 
      secret.id === id ? {...secret, showSecret: !secret.showSecret} : secret
    ));
  };

  // 掩码显示密钥
  const maskSecretKey = (secretKey: string) => {
    if (!secretKey) return '';
    const parts = secretKey.split('_');
    if (parts.length >= 2) {
      const prefix = `${parts[0]}_${parts[1]}_`;
      const remaining = secretKey.substring(prefix.length);
      return prefix + '*'.repeat(remaining.length);
    }
    const visiblePart = secretKey.substring(0, 8);
    const hiddenPart = secretKey.substring(8);
    return visiblePart + '*'.repeat(hiddenPart.length);
  };

  // 格式化时间
  const formatDateTime = (timestamp: number) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString('zh-CN');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[75vw] w-[75vw] min-w-[900px] max-h-[85vh] overflow-y-auto" style={{width: '75vw', maxWidth: '75vw'}}>
        <DialogHeader>
          <DialogTitle>密钥管理</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2">
              <UserTypeLabel type={merchant?.type || ''} />
              <span>{merchant?.name}</span>
              <span className="text-muted-foreground">({merchant?.user_id})</span>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleAddNewSecret} disabled={isAddingSecret} className="h-9">
              <Plus className="h-4 w-4 mr-1" />
              新建
            </Button>
            <Button size="sm" variant="outline" onClick={loadSecrets} className="h-9">
              <RefreshCw className="h-4 w-4 mr-1" />
              刷新
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">加载中...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>应用名称</TableHead>
                  <TableHead>APP ID</TableHead>
                  <TableHead>Secret Key</TableHead>
                  <TableHead>环境</TableHead>
                  <TableHead>创建时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {merchantSecrets.map((secret) => (
                  <TableRow key={secret.id}>
                    <TableCell>{secret.app_name}</TableCell>
                    <TableCell className="font-mono text-xs">{secret.app_id}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {secret.showSecret ? secret.secret_key : maskSecretKey(secret.secret_key)}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-6 px-2"
                        onClick={() => toggleSecretVisibility(secret.id)}
                      >
                        {secret.showSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge variant={secret.sandbox ? "outline" : "default"}>
                        {secret.sandbox ? "沙箱" : "生产"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{formatDateTime(secret.created_at)}</TableCell>
                  </TableRow>
                ))}
                
                {isAddingSecret && (
                  <TableRow>
                    <TableCell>
                      <Input
                        placeholder="应用名称"
                        value={newSecret.app_name}
                        onChange={(e) => setNewSecret({...newSecret, app_name: e.target.value})}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">自动生成</TableCell>
                    <TableCell className="text-muted-foreground">自动生成</TableCell>
                    <TableCell>
                      <Select
                        value={newSecret.sandbox.toString()}
                        onValueChange={(value) => setNewSecret({...newSecret, sandbox: value === "true"})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">生产</SelectItem>
                          <SelectItem value="true">沙箱</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={handleSaveNewSecret}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleCancelNewSecret}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="确认创建新密钥？"
        description="创建后将生成新的 APP ID 和 Secret Key"
        confirmText="确认创建"
        cancelText="取消"
        onConfirm={confirmCreateSecret}
      />
    </Dialog>
  );
}
