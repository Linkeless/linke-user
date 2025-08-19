/**
 * ReplyForm Component
 * Form for replying to support tickets
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { CreateMessageRequest } from '../types/ticket.types';

interface ReplyFormProps {
  onSubmit: (message: CreateMessageRequest) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
}

export function ReplyForm({
  onSubmit,
  isSubmitting = false,
  disabled = false,
}: ReplyFormProps) {
  const { t } = useTranslation('tickets');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validate = (): boolean => {
    if (!content.trim()) {
      setError('Reply cannot be empty');
      return false;
    }
    if (content.length > 5000) {
      setError('Reply must be less than 5000 characters');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit({ content: content.trim() });
    setContent(''); // Clear form after successful submission
  };

  const handleChange = (value: string) => {
    setContent(value);
    // Clear error when user starts typing
    if (error && value.trim()) {
      setError(null);
    }
  };

  const isDisabled = disabled || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Textarea
          placeholder={t('form.replyPlaceholder')}
          value={content}
          onChange={e => handleChange(e.target.value)}
          disabled={isDisabled}
          className={error ? 'border-destructive' : ''}
          rows={4}
        />
        {error && <p className='text-sm text-destructive'>{error}</p>}
        <div className='flex items-center justify-between'>
          <p className='text-sm text-muted-foreground'>{content.length}/5000</p>
          <Button type='submit' disabled={isDisabled || !content.trim()}>
            {isSubmitting ? (
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            ) : (
              <Send className='w-4 h-4 mr-2' />
            )}
            {t('actions.send')}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default ReplyForm;
