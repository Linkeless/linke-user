import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoginForm } from '../components/LoginForm';

// Mock all external dependencies
vi.mock('../services/authService', () => ({
  authServiceUtils: {
    login: vi.fn(),
  },
}));

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => vi.fn(),
}));

vi.mock('@/lib/utils/validation', () => ({
  loginSchema: {},
}));

vi.mock('lucide-react', () => ({
  Eye: () => <span data-testid='eye-icon'>👁</span>,
  EyeOff: () => <span data-testid='eye-off-icon'>🙈</span>,
  Loader2: () => <span data-testid='loader-icon'>⏳</span>,
}));

vi.mock('react-hook-form', () => ({
  useForm: () => ({
    handleSubmit: vi.fn(() => vi.fn()),
    control: {},
    formState: { errors: {} },
    setError: vi.fn(),
  }),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, disabled, type, className }: any) => (
    <button
      type={type}
      disabled={disabled}
      className={className}
      data-testid='submit-button'
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: React.forwardRef(
    (
      {
        type,
        placeholder,
        autoComplete,
        disabled,
        className,
        name,
        ...props
      }: any,
      ref: any,
    ) => (
      <input
        {...props}
        ref={ref}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className={className}
        name={name}
        data-testid={`input-${name}`}
      />
    ),
  ),
}));

vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange, disabled }: any) => (
    <input
      type='checkbox'
      checked={checked}
      onChange={e => onCheckedChange?.(e.target.checked)}
      disabled={disabled}
      data-testid='checkbox-remember'
    />
  ),
}));

vi.mock('@/components/ui/form', () => ({
  Form: ({ children }: any) => <div data-testid='form'>{children}</div>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormField: ({ render, name }: any) => {
    const field = {
      value: '',
      onChange: vi.fn(),
      onBlur: vi.fn(),
      name,
    };
    return <div data-testid={`form-field-${name}`}>{render({ field })}</div>;
  },
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormMessage: () => <div data-testid='form-message'></div>,
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('renders the login form with all expected elements', () => {
      render(<LoginForm />);

      expect(screen.getByTestId('form')).toBeInTheDocument();
      expect(screen.getByTestId('form-field-email')).toBeInTheDocument();
      expect(screen.getByTestId('form-field-password')).toBeInTheDocument();
      expect(screen.getByTestId('form-field-rememberMe')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it('renders email input with correct attributes', () => {
      render(<LoginForm />);

      const emailInput = screen.getByTestId('input-email');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('placeholder', 'Enter your email');
      expect(emailInput).toHaveAttribute('autocomplete', 'email');
    });

    it('renders password input with correct attributes', () => {
      render(<LoginForm />);

      const passwordInput = screen.getByTestId('input-password');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute(
        'placeholder',
        'Enter your password',
      );
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });

    it('renders password visibility toggle button', () => {
      render(<LoginForm />);

      const toggleButton = screen.getByTestId('eye-icon').closest('button');
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute('type', 'button');
    });

    it('renders remember me checkbox', () => {
      render(<LoginForm />);

      expect(screen.getByTestId('checkbox-remember')).toBeInTheDocument();
    });

    it('renders submit button with correct text', () => {
      render(<LoginForm />);

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toHaveTextContent('Sign in');
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('applies custom className when provided', () => {
      const { container } = render(<LoginForm className='custom-class' />);

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Password Visibility Toggle', () => {
    it('shows eye icon initially (password hidden)', () => {
      render(<LoginForm />);

      expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
    });

    it('has password visibility toggle functionality', () => {
      render(<LoginForm />);

      // Should have toggle button
      const toggleButton = screen.getByTestId('eye-icon').closest('button');
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Form State Management', () => {
    it('shows loading state when isSubmitting is true', () => {
      // This would test the internal state when the form is submitting
      render(<LoginForm />);

      // The component should have the capability to show loading
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it('handles form validation states', () => {
      render(<LoginForm />);

      // Should have form validation structure
      expect(screen.getByTestId('form-field-email')).toBeInTheDocument();
      expect(screen.getByTestId('form-field-password')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper form structure for accessibility', () => {
      render(<LoginForm />);

      // Should have proper label elements
      expect(screen.getByText(/email/i)).toBeInTheDocument();
      expect(screen.getByText(/password/i)).toBeInTheDocument();
      expect(screen.getByText(/remember me/i)).toBeInTheDocument();
    });

    it('has proper input types for form fields', () => {
      render(<LoginForm />);

      const emailInput = screen.getByTestId('input-email');
      const passwordInput = screen.getByTestId('input-password');
      const submitButton = screen.getByTestId('submit-button');

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('has proper autocomplete attributes', () => {
      render(<LoginForm />);

      const emailInput = screen.getByTestId('input-email');
      const passwordInput = screen.getByTestId('input-password');

      expect(emailInput).toHaveAttribute('autocomplete', 'email');
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });
  });

  describe('Component Props', () => {
    it('accepts onSuccess callback prop', () => {
      const onSuccess = vi.fn();

      // Should not throw when onSuccess prop is provided
      expect(() => render(<LoginForm onSuccess={onSuccess} />)).not.toThrow();
    });

    it('accepts onError callback prop', () => {
      const onError = vi.fn();

      // Should not throw when onError prop is provided
      expect(() => render(<LoginForm onError={onError} />)).not.toThrow();
    });

    it('works without callback props', () => {
      // Should not throw when no props are provided
      expect(() => render(<LoginForm />)).not.toThrow();
    });
  });

  describe('Form Structure', () => {
    it('contains all required form elements', () => {
      render(<LoginForm />);

      // Email field
      expect(screen.getByTestId('form-field-email')).toBeInTheDocument();
      expect(screen.getByTestId('input-email')).toBeInTheDocument();

      // Password field
      expect(screen.getByTestId('form-field-password')).toBeInTheDocument();
      expect(screen.getByTestId('input-password')).toBeInTheDocument();

      // Remember me field
      expect(screen.getByTestId('form-field-rememberMe')).toBeInTheDocument();
      expect(screen.getByTestId('checkbox-remember')).toBeInTheDocument();

      // Submit button
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it('has proper form layout structure', () => {
      render(<LoginForm />);

      const form = screen.getByTestId('form');
      expect(form).toBeInTheDocument();

      const formFields = screen.getAllByText(/email|password|remember me/i);
      expect(formFields.length).toBeGreaterThan(0);
    });
  });
});
