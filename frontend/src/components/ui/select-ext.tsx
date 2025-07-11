'use client';

import type * as SelectPrimitive from '@radix-ui/react-select';

import type { MouseEventHandler } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './select';

export interface ISelectExtOption {
    key: string;
    value: string;
    label?: string;
}

export function SelectExt({
    className,
    placeholder = 'Выберите из списка',
    options,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Root> & {
    className?: string;
    placeholder?: React.ReactNode;
    options: ISelectExtOption[];
}) {
    const hasValue = Boolean(props.value);

    const handleClear: MouseEventHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        props?.onValueChange?.('');
    };

    return (
        <Select {...props}>
            <div className={cn('w-fit relative', className)}>
                <SelectTrigger className="pr-8 w-full">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <div className="absolute right-2 top-0 h-full flex items-center">
                    {hasValue
                        ? (
                                <X
                                    className="h-4 w-4 opacity-70 hover:opacity-100 cursor-pointer"
                                    onClick={handleClear}
                                />
                            )
                        : <ChevronDown className="h-4 w-4 opacity-70" />}
                </div>
            </div>
            <SelectContent>
                {options.map(({ key, value, label }) => (
                    <SelectItem key={key} value={value}>{label || value}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
