import { CheckIcon, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';
import * as RPNInput from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';

import { Button } from '@/components/ui/button';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type PhoneInputProps = Omit<
    React.ComponentProps<'input'>,
    'onChange' | 'value' | 'ref'
>
& Omit<RPNInput.Props<typeof RPNInput.default>, 'onChange'> & {
    onChange?: (value: RPNInput.Value) => void;
};

function InputComponent({ ref, className, ...props }: React.ComponentProps<'input'> & { ref?: React.RefObject<HTMLInputElement | null> }) {
    return (
        <input
            className={cn('bg-white p-6 rounded-2xl rounded-l-none text-lg min-w-0', className)}
            {...props}
            ref={ref}
        />
    );
}
InputComponent.displayName = 'InputComponent';

interface CountryEntry { label: string; value: RPNInput.Country | undefined }

interface CountrySelectProps {
    disabled?: boolean;
    value: RPNInput.Country;
    options: CountryEntry[];
    onChange: (country: RPNInput.Country) => void;
}

function CountrySelect({
    disabled,
    value: selectedCountry,
    options: countryList,
    onChange,
}: CountrySelectProps) {
    const scrollAreaRef = React.useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen} modal>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="secondary"
                    className="py-[38px!important] px-[24px!important] shadow-none bg-white flex rounded-2xl rounded-r-none border-r-0 focus:z-10"
                    disabled={disabled}
                >
                    <FlagComponent
                        country={selectedCountry}
                        countryName={selectedCountry}
                    />
                    <ChevronsUpDown
                        className={cn(
                            '-mr-2 size-4 opacity-50',
                            disabled ? 'hidden' : 'opacity-100',
                        )}
                    />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
                <ScrollArea ref={scrollAreaRef}>
                    {countryList.map(({ value, label }) =>
                        value
                            ? (
                                    <CountrySelectOption
                                        key={value}
                                        country={value}
                                        countryName={label}
                                        selectedCountry={selectedCountry}
                                        onChange={onChange}
                                        onSelectComplete={() => setIsOpen(false)}
                                    />
                                )
                            : null,
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}

interface CountrySelectOptionProps extends RPNInput.FlagProps {
    selectedCountry: RPNInput.Country;
    onChange: (country: RPNInput.Country) => void;
    onSelectComplete: () => void;
}

function FlagComponent({ country, countryName }: RPNInput.FlagProps) {
    const Flag = flags[country];

    return (
        <span className="flex h-4 w-6 overflow-hidden bg-foreground/20 [&_svg:not([class*='size-'])]:size-full">
            {Flag && <Flag title={countryName} />}
        </span>
    );
}

function CountrySelectOption({
    country,
    countryName,
    selectedCountry,
    onChange,
    onSelectComplete,
}: CountrySelectOptionProps) {
    const handleSelect = () => {
        onChange(country);
        onSelectComplete();
    };

    return (
        <div className="flex gap-2 p-4 hover:bg-slate-100 cursor-pointer" onClick={handleSelect}>
            <FlagComponent country={country} countryName={countryName} />
            <span className="flex-1 text-sm">{countryName}</span>
            <span className="text-sm text-foreground/50">{`+${RPNInput.getCountryCallingCode(country)}`}</span>
            <CheckIcon
                className={`ml-auto size-4 ${country === selectedCountry ? 'opacity-100' : 'opacity-0'}`}
            />
        </div>
    );
}

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps>
    = ({ ref, className, onChange, value, ...props }: PhoneInputProps & { ref?: React.RefObject<React.ElementRef<typeof RPNInput.default> | null> }) => {
        return (
            <RPNInput.default
                ref={ref}
                className={cn('flex', className)}
                flagComponent={FlagComponent}
                countrySelectComponent={CountrySelect}
                inputComponent={InputComponent}
                smartCaret={false}
                value={value || undefined}
                /**
                 * Handles the onChange event.
                 *
                 * react-phone-number-input might trigger the onChange event as undefined
                 * when a valid phone number is not entered. To prevent this,
                 * the value is coerced to an empty string.
                 *
                 * @param {E164Number | undefined} value - The entered value
                 */
                onChange={(value) => onChange?.(value || ('' as RPNInput.Value))}
                {...props}
            />
        );
    };
PhoneInput.displayName = 'PhoneInput';

export { PhoneInput };
