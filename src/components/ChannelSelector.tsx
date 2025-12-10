import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CHANNEL_CODE_OPTIONS } from '../constants/business';

interface ChannelSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showAllOption?: boolean;
  className?: string;
  disabled?: boolean;
}

export function ChannelSelector({
  value = 'all',
  onChange,
  placeholder = '选择渠道',
  showAllOption = true,
  className = '',
  disabled = false
}: ChannelSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {showAllOption && <SelectItem value="all">全部渠道</SelectItem>}
        {CHANNEL_CODE_OPTIONS.filter(opt => opt.value !== 'all').map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
