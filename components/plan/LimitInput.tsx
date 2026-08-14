'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface LimitInputProps {
  label: string;
  description?: string;
  value: number | null | undefined; // null/undefined = unlimited
  onChange: (value: number | null) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
  min?: number;
}

/**
 * LimitInput - A component for entering numeric limits with an "Unlimited" toggle
 * 
 * Semantics:
 * - value === null → Unlimited (switch ON, input disabled)
 * - value === number → Limited (switch OFF, input enabled with that value)
 * 
 * NULL is the canonical representation of "no limit"
 */
export function LimitInput({
  label,
  description,
  value,
  onChange,
  disabled = false,
  error,
  className,
  min = 1,
}: LimitInputProps) {
  // Normalize value: undefined → null, ensure we have valid number or null
  const normalizedValue = value === undefined ? null : value;
  const isUnlimited = normalizedValue === null;
  
  const [inputValue, setInputValue] = React.useState(
    isUnlimited ? '' : normalizedValue.toString()
  );

  // Sync input when external value changes
  React.useEffect(() => {
    const normalizedValue = value === undefined ? null : value;
    const isUnlimited = normalizedValue === null;
    
    if (isUnlimited) {
      setInputValue('');
    } else if (normalizedValue !== null) {
      setInputValue(normalizedValue.toString());
    }
  }, [value]);

  // Handle unlimited toggle
  const handleUnlimitedToggle = (checked: boolean) => {
    if (checked) {
      // Switching to unlimited
      onChange(null);
      setInputValue('');
    } else {
      // Switching to limited - use min value as default
      onChange(min);
      setInputValue(min.toString());
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setInputValue(rawValue);

    // Parse and validate
    const parsed = parseInt(rawValue, 10);
    if (!isNaN(parsed) && parsed >= min) {
      onChange(parsed);
    } else if (rawValue === '') {
      // Allow empty during typing, but don't call onChange
      // The value will be validated on blur
    }
  };

  // Handle input blur - ensure valid value
  const handleInputBlur = () => {
    if (isUnlimited) return;

    const parsed = parseInt(inputValue, 10);
    if (isNaN(parsed) || parsed < min) {
      // Invalid value - reset to minimum
      onChange(min);
      setInputValue(min.toString());
    }
  };

  return (
    <div className={className}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Label className="text-base">{label}</Label>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-4 w-64">
          {/* Unlimited Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <Switch
              id={`unlimited-${label}`}
              checked={isUnlimited}
              onCheckedChange={handleUnlimitedToggle}
              disabled={disabled}
            />
            <Label
              htmlFor={`unlimited-${label}`}
              className="text-sm cursor-pointer whitespace-nowrap"
            >
              Unlimited
            </Label>
          </div>

          {/* Number Input */}
          <Input
            type="number"
            min={min}
            value={isUnlimited ? 'Unlimited' : inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            disabled={disabled || isUnlimited}
            className="w-32 text-right"
            placeholder={min.toString()}
            readOnly={isUnlimited}
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
}
