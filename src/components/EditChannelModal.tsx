import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { X } from 'lucide-react';
import { ChannelData } from '../services/channelService';
import { CHANNEL_CODE_OPTIONS } from '../constants/business';

interface EditChannelModalProps {
  open: boolean;
  channel: ChannelData | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function EditChannelModal({ open, channel, onClose, onSubmit }: EditChannelModalProps) {
  const [formData, setFormData] = useState({
    channel_code: '',
    account_id: '',
    secret: '',
    status: 'active',
    pkgs: [] as string[],
    groups: [] as string[],
    detail: {},
    settings: {}
  });

  const [newPkg, setNewPkg] = useState('');
  const [newGroup, setNewGroup] = useState('');

  // 当channel数据变化时，更新表单数据
  useEffect(() => {
    if (channel) {
      setFormData({
        channel_code: channel.channel_code || '',
        account_id: channel.account_id || '',
        secret: channel.secret || '',
        status: channel.status || 'active',
        pkgs: channel.pkgs || [],
        groups: channel.groups || [],
        detail: channel.detail || {},
        settings: channel.settings || {}
      });
    }
  }, [channel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleAddPkg = () => {
    if (newPkg.trim() && !formData.pkgs.includes(newPkg.trim())) {
      setFormData(prev => ({
        ...prev,
        pkgs: [...prev.pkgs, newPkg.trim()]
      }));
      setNewPkg('');
    }
  };

  const handleRemovePkg = (pkg: string) => {
    setFormData(prev => ({
      ...prev,
      pkgs: prev.pkgs.filter(p => p !== pkg)
    }));
  };

  const handleAddGroup = () => {
    if (newGroup.trim() && !formData.groups.includes(newGroup.trim())) {
      setFormData(prev => ({
        ...prev,
        groups: [...prev.groups, newGroup.trim()]
      }));
      setNewGroup('');
    }
  };

  const handleRemoveGroup = (group: string) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.filter(g => g !== group)
    }));
  };

  const handleClose = () => {
    setNewPkg('');
    setNewGroup('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>编辑渠道</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="channel_code">渠道代码 *</Label>
            <Select
              value={formData.channel_code}
              onValueChange={(value) => setFormData(prev => ({ ...prev, channel_code: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择渠道代码" />
              </SelectTrigger>
              <SelectContent>
                {CHANNEL_CODE_OPTIONS.filter(option => option.value !== 'all').map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="account_id">账户ID *</Label>
            <Input
              id="account_id"
              value={formData.account_id}
              onChange={(e) => setFormData(prev => ({ ...prev, account_id: e.target.value }))}
              placeholder="输入账户ID"
              required
            />
          </div>

          <div>
            <Label htmlFor="secret">密钥</Label>
            <Input
              id="secret"
              type="password"
              value={formData.secret}
              onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
              placeholder="输入密钥（可选）"
            />
          </div>

          <div>
            <Label htmlFor="status">状态 *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">激活</SelectItem>
                <SelectItem value="inactive">未激活</SelectItem>
                <SelectItem value="disabled">禁用</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>支持包</Label>
            <div className="flex space-x-2 mb-2">
              <Input
                value={newPkg}
                onChange={(e) => setNewPkg(e.target.value)}
                placeholder="输入包名"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPkg())}
              />
              <Button type="button" variant="outline" onClick={handleAddPkg}>
                添加
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.pkgs.map((pkg, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {pkg}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleRemovePkg(pkg)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>分组</Label>
            <div className="flex space-x-2 mb-2">
              <Input
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)}
                placeholder="输入分组名"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGroup())}
              />
              <Button type="button" variant="outline" onClick={handleAddGroup}>
                添加
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.groups.map((group, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {group}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleRemoveGroup(group)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              取消
            </Button>
            <Button type="submit">
              更新
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}