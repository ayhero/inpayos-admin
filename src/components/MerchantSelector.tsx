import { useState, useEffect, useCallback, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Search, Building2 } from 'lucide-react';
import { merchantService, Merchant, MerchantListParams } from '../services/merchantService';

interface MerchantSelectorProps {
  value?: string;
  onChange: (merchantId: string) => void;
  placeholder?: string;
  showAllOption?: boolean;
  allOptionLabel?: string;
  className?: string;
  disabled?: boolean;
}

export function MerchantSelector({
  value,
  onChange,
  placeholder = '选择商户',
  showAllOption = true,
  allOptionLabel = '全部商户',
  className = '',
  disabled = false
}: MerchantSelectorProps) {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 获取商户列表
  const fetchMerchants = useCallback(async (keyword: string = '', pageNum: number = 1, append: boolean = false) => {
    setLoading(true);
    try {
      const params: MerchantListParams = {
        page: pageNum,
        size: 20
      };

      // 智能搜索：根据关键字类型设置不同的搜索字段
      if (keyword) {
        if (keyword.includes('@')) {
          // 包含 @ 符号：邮箱搜索
          params.email = keyword;
        } else if (keyword.startsWith('M') || keyword.startsWith('U')) {
          // 以 M 或 U 开头：用户ID搜索
          params.user_id = keyword;
        } else {
          // 其他：名称搜索
          params.name = keyword;
        }
      }

      const response = await merchantService.getMerchantList(params);
      if (response.success) {
        const newMerchants = response.data.list;
        if (append) {
          setMerchants(prev => [...prev, ...newMerchants]);
        } else {
          setMerchants(newMerchants);
        }
        setHasMore(newMerchants.length === params.size);
      } else {
        if (!append) {
          setMerchants([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error('获取商户列表失败:', error);
      if (!append) {
        setMerchants([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    if (open) {
      setPage(1);
      fetchMerchants(searchTerm, 1, false);
    }
  }, [open, fetchMerchants]);

  // 搜索防抖
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      setPage(1);
      fetchMerchants(searchTerm, 1, false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchMerchants, open]);

  // 加载更多
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMerchants(searchTerm, nextPage, true);
    }
  }, [loading, hasMore, page, searchTerm, fetchMerchants]);

  // 滚动监听
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrolledToBottom = 
      target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    
    if (scrolledToBottom) {
      handleLoadMore();
    }
  }, [handleLoadMore]);

  // 获取选中商户的显示文本
  const getSelectedMerchantDisplay = () => {
    if (!value || value === 'all') {
      return showAllOption ? allOptionLabel : placeholder;
    }
    const selectedMerchant = merchants.find(m => m.user_id === value);
    if (selectedMerchant) {
      return selectedMerchant.name;
    }
    return value;
  };

  return (
    <div className={`relative ${className}`}>
      <Select 
        value={value || 'all'} 
        onValueChange={onChange}
        open={open}
        onOpenChange={setOpen}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <SelectValue>
              {getSelectedMerchantDisplay()}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-[400px]">
          {/* 搜索框 */}
          <div className="sticky top-0 z-10 bg-background p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索商户名称、邮箱或MID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* 滚动区域 */}
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="max-h-[300px] overflow-y-auto"
          >
            {/* 全部选项 */}
            {showAllOption && (
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{allOptionLabel}</span>
                </div>
              </SelectItem>
            )}

            {/* 商户列表 */}
            {loading && page === 1 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                加载中...
              </div>
            ) : merchants.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {searchTerm ? '未找到匹配的商户' : '暂无商户'}
              </div>
            ) : (
              <>
                {merchants.map((merchant) => (
                  <SelectItem key={merchant.user_id} value={merchant.user_id}>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{merchant.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {merchant.user_id}
                        </span>
                      </div>
                      {merchant.email && (
                        <span className="text-xs text-muted-foreground">
                          {merchant.email}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
                
                {/* 加载更多指示器 */}
                {loading && page > 1 && (
                  <div className="p-2 text-center text-xs text-muted-foreground">
                    加载中...
                  </div>
                )}
                
                {!loading && hasMore && (
                  <div className="p-2 text-center text-xs text-muted-foreground">
                    向下滚动加载更多
                  </div>
                )}
              </>
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}
