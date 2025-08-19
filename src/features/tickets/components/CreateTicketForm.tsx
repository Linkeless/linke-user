/**
 * CreateTicketForm Component
 * Form for creating new support tickets
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateTicket } from '../hooks/useCreateTicket';
import type {
  CreateTicketRequest,
  TicketCategory,
  TicketPriority,
} from '../types/ticket.types';

interface CreateTicketFormProps {
  onCancel?: () => void;
}

export function CreateTicketForm({ onCancel }: CreateTicketFormProps) {
  const { t } = useTranslation('tickets');
  const createTicketMutation = useCreateTicket();

  const [formData, setFormData] = useState<CreateTicketRequest>({
    title: '',
    description: '',
    category: 'general',
    priority: 'normal',
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateTicketRequest, string>>
  >({});

  const categories: TicketCategory[] = [
    'technical',
    'billing',
    'subscription',
    'general',
    'other',
  ];
  const priorities: TicketPriority[] = ['low', 'normal', 'high', 'urgent'];

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateTicketRequest, string>> = {};

    if (!formData.title || formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.description || formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }
    if (formData.description.length > 5000) {
      newErrors.description = 'Description must be less than 5000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    createTicketMutation.mutate(formData);
  };

  const handleChange = (field: keyof CreateTicketRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const isSubmitting = createTicketMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Title Field */}
      <div className='space-y-2'>
        <Label htmlFor='title'>
          {t('form.title')} <span className='text-destructive'>*</span>
        </Label>
        <Input
          id='title'
          type='text'
          placeholder={t('form.titlePlaceholder')}
          value={formData.title}
          onChange={e => handleChange('title', e.target.value)}
          disabled={isSubmitting}
          className={errors.title ? 'border-destructive' : ''}
        />
        {errors.title && (
          <p className='text-sm text-destructive'>{errors.title}</p>
        )}
      </div>

      {/* Category Field */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='category'>
            {t('form.category')} <span className='text-destructive'>*</span>
          </Label>
          <Select
            value={formData.category}
            onValueChange={value => handleChange('category', value)}
            disabled={isSubmitting}
          >
            <SelectTrigger id='category'>
              <SelectValue placeholder={t('form.categoryPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {t(`category.${category}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority Field */}
        <div className='space-y-2'>
          <Label htmlFor='priority'>{t('form.priority')}</Label>
          <Select
            value={formData.priority}
            onValueChange={value => handleChange('priority', value)}
            disabled={isSubmitting}
          >
            <SelectTrigger id='priority'>
              <SelectValue placeholder={t('form.priorityPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {priorities.map(priority => (
                <SelectItem key={priority} value={priority}>
                  {t(`priority.${priority}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description Field */}
      <div className='space-y-2'>
        <Label htmlFor='description'>
          {t('form.description')} <span className='text-destructive'>*</span>
        </Label>
        <Textarea
          id='description'
          placeholder={t('form.descriptionPlaceholder')}
          value={formData.description}
          onChange={e => handleChange('description', e.target.value)}
          disabled={isSubmitting}
          className={errors.description ? 'border-destructive' : ''}
          rows={6}
        />
        {errors.description && (
          <p className='text-sm text-destructive'>{errors.description}</p>
        )}
        <p className='text-sm text-muted-foreground'>
          {formData.description.length}/5000
        </p>
      </div>

      {/* Action Buttons */}
      <div className='flex justify-end gap-4'>
        {onCancel && (
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t('actions.cancel')}
          </Button>
        )}
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
          {t('actions.create')}
        </Button>
      </div>
    </form>
  );
}

export default CreateTicketForm;
