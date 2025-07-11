import { parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Calendar } from './calendar';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

function formatDate(date: Date | undefined) {
    if (!date) {
        return '';
    }
    return date.toLocaleDateString();
}

function isValidDate(date: Date | undefined) {
    if (!date) {
        return false;
    }
    return !Number.isNaN(date.getTime());
}

interface DatePickerProps {
    className?: string;
    value?: Date | undefined;
    onChange?: (date: Date | undefined) => void;
}

export function DatePicker({ className, value, onChange }: DatePickerProps) {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>();

    const [month, setMonth] = useState<Date | undefined>(date);

    return (
        <div className={cn('relative flex gap-2', className)}>
            <Input
                value={formatDate(value)}
                placeholder="Выберите дату"
                className="bg-background pr-10"
                onChange={(e) => {
                    const date = parse(e.target.value, 'dd.MM.yyyy', new Date());
                    onChange?.(date);
                    if (isValidDate(date)) {
                        setDate(date);
                        setMonth(date);
                    }
                }}
                onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setOpen(true);
                    }
                }}
            />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                    >
                        <CalendarIcon className="size-3.5" />
                        <span className="sr-only">Выберите дату</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="end"
                    alignOffset={-8}
                    sideOffset={10}
                >
                    <Calendar
                        mode="single"
                        selected={date}
                        captionLayout="dropdown"
                        month={month}
                        onMonthChange={setMonth}
                        onSelect={(date) => {
                            setDate(date);
                            onChange?.(date);
                            setOpen(false);
                        }}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
};
