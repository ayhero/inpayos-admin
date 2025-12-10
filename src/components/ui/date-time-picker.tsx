import { Button } from './button';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Calendar } from './calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { cn } from './utils';

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  defaultTime?: string;
}

export function DateTimePicker({ 
  value, 
  onChange, 
  placeholder = "选择时间",
  defaultTime = "00:00:00"
}: DateTimePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(new Date(value), "yyyy年M月d日 HH:mm:ss", { locale: zhCN }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="flex flex-col">
          <Calendar
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={(date) => {
              if (date) {
                const current = value ? new Date(value) : new Date();
                date.setHours(current.getHours(), current.getMinutes(), current.getSeconds());
                onChange(date.toISOString());
              }
            }}
            initialFocus
          />
          <div className="border-t p-3 flex gap-2">
            <Input
              type="time"
              step="1"
              value={value ? format(new Date(value), "HH:mm:ss") : defaultTime}
              onChange={(e) => {
                const [hours, minutes, seconds] = e.target.value.split(':').map(Number);
                const date = value ? new Date(value) : new Date();
                date.setHours(hours, minutes, seconds || 0);
                onChange(date.toISOString());
              }}
              className="flex-1"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
