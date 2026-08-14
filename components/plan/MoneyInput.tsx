'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MoneyInputProps {
  label?: string;
  value: number; // Integer cents
  onChange: (cents: number) => void;
  currency?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function MoneyInput({
  label,
  value,
  onChange,
  currency = 'USD',
  placeholder,
  required = false,
  error,
  disabled = false,
  className,
}: MoneyInputProps) {
  // Convert cents to display value (dollars with 2 decimals)
  const displayValue = (value / 100).toFixed(2);
  const [inputValue, setInputValue] = React.useState(displayValue);

  // Update input when external value changes
  React.useEffect(() => {
    setInputValue((value / 100).toFixed(2));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setInputValue(rawValue);

    // Parse the value and convert to cents
    const parsed = parseFloat(rawValue);
    if (!isNaN(parsed)) {
      const cents = Math.round(parsed * 100);
      onChange(cents);
    } else if (rawValue === '' || rawValue === '.') {
      // Allow empty or just decimal point
      onChange(0);
    }
  };

  const handleBlur = () => {
    // Format on blur
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed)) {
      setInputValue((parsed).toFixed(2));
    } else {
      setInputValue('0.00');
      onChange(0);
    }
  };

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      case 'SAR':
        return 'ر.س';
      case 'AED':
        return 'د.إ';
      default:
        return curr;
    }
  };

  return (
    <div className={className}>
      {label && (
        <Label className="mb-2 block">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {getCurrencySymbol(currency)}
        </span>
        <Input
          type="text"
          inputMode="decimal"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder || '0.00'}
          required={required}
          disabled={disabled}
          className="pl-10"
        />
      </div>
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      <p className="text-xs text-muted-foreground mt-1">
        Stored as: {value} cents
      </p>
    </div>
  );
}
