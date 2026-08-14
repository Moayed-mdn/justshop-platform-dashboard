'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { LocalizedString } from '@/lib/types/plan';

interface LocalizedInputProps {
  label: string;
  value: LocalizedString;
  onChange: (value: LocalizedString) => void;
  type?: 'input' | 'textarea';
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function LocalizedInput({
  label,
  value,
  onChange,
  type = 'input',
  placeholder,
  required = false,
  error,
  disabled = false,
  className,
}: LocalizedInputProps) {
  const handleChange = (locale: string, text: string) => {
    onChange({
      ...value,
      [locale]: text,
    });
  };

  const InputComponent = type === 'textarea' ? Textarea : Input;

  return (
    <div className={className}>
      <Label className="mb-2 block">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Tabs defaultValue="en" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="en">English</TabsTrigger>
          <TabsTrigger value="ar">العربية (Arabic)</TabsTrigger>
        </TabsList>
        <TabsContent value="en" className="mt-2">
          <InputComponent
            value={value.en || ''}
            onChange={(e) => handleChange('en', e.target.value)}
            placeholder={placeholder ? `${placeholder} (English)` : 'English'}
            required={required}
            disabled={disabled}
            className="w-full"
            {...(type === 'textarea' ? { rows: 4 } : {})}
          />
        </TabsContent>
        <TabsContent value="ar" className="mt-2">
          <InputComponent
            value={value.ar || ''}
            onChange={(e) => handleChange('ar', e.target.value)}
            placeholder={placeholder ? `${placeholder} (Arabic)` : 'Arabic'}
            disabled={disabled}
            className="w-full text-right"
            dir="rtl"
            lang="ar"
            {...(type === 'textarea' ? { rows: 4 } : {})}
          />
        </TabsContent>
      </Tabs>
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
}
