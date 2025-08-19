import * as React from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(event.target.checked);
      props.onChange?.(event);
    };

    return (
      <input
        ref={ref}
        type='checkbox'
        data-slot='checkbox'
        className={cn(
          'size-4 rounded border border-input bg-background shadow-xs transition-colors',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          'checked:bg-primary checked:border-primary checked:text-primary-foreground',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:bg-input/30 dark:border-input',
          className
        )}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
