import type * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import type { VariantProps } from 'class-variance-authority';
import type { toggleVariants } from './toggle';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';

export interface IToggleExtOption {
    key: string;
    value: any;
    label?: string;
    className?: string;
}

export interface IToggleExtProps {
    options: IToggleExtOption[];
    itemClassName?: string;
}

type ToggleExtProps = React.ComponentProps<typeof ToggleGroupPrimitive.Root> & IToggleExtProps & VariantProps<typeof toggleVariants>;

export function ToggleExt({ options, itemClassName, ...props }: ToggleExtProps) {
    return (
        <ToggleGroup {...props}>
            {options.map(({ key, value, label, className }) => (
                <ToggleGroupItem key={key} value={value} className={className}>
                    <div>{label || key}</div>
                </ToggleGroupItem>
            ))}
        </ToggleGroup>
    );
}
