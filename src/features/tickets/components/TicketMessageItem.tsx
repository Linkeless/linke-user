/**
 * TicketMessageItem Component
 * Displays a single message in a ticket conversation
 */

import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { User, Headphones, Bot } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { TicketMessageResponse } from '../types/ticket.types';

interface TicketMessageItemProps {
  message: TicketMessageResponse;
  isCurrentUser?: boolean;
}

export function TicketMessageItem({
  message,
  isCurrentUser = false,
}: TicketMessageItemProps) {
  const { t, i18n } = useTranslation('tickets');
  const locale = i18n.language === 'zh' ? zhCN : enUS;

  const getMessageIcon = () => {
    switch (message.message_type) {
      case 'admin':
        return <Headphones className='w-4 h-4' />;
      case 'system':
        return <Bot className='w-4 h-4' />;
      default:
        return <User className='w-4 h-4' />;
    }
  };

  const getSenderName = () => {
    if (message.user) {
      return message.user.username || message.user.email;
    }

    switch (message.message_type) {
      case 'admin':
        return t('labels.support');
      case 'system':
        return 'System';
      default:
        return t('labels.you');
    }
  };

  const getSenderStyles = () => {
    if (message.message_type === 'admin') {
      return 'bg-blue-50 border-blue-200';
    }
    if (message.message_type === 'system') {
      return 'bg-gray-50 border-gray-200';
    }
    if (isCurrentUser) {
      return 'bg-primary/5 border-primary/20';
    }
    return 'bg-background border-border';
  };

  const timeAgo = formatDistanceToNow(new Date(message.created_at), {
    addSuffix: true,
    locale,
  });

  return (
    <div
      className={cn(
        'p-4 rounded-lg border transition-colors',
        getSenderStyles()
      )}
    >
      <div className='flex items-start gap-3'>
        <div className='flex-shrink-0'>
          <div className='w-8 h-8 rounded-full bg-muted flex items-center justify-center'>
            {getMessageIcon()}
          </div>
        </div>
        <div className='flex-1 space-y-1'>
          <div className='flex items-center gap-2'>
            <span className='font-semibold text-sm'>{getSenderName()}</span>
            <span className='text-xs text-muted-foreground'>{timeAgo}</span>
          </div>
          <div className='prose prose-sm max-w-none dark:prose-invert'>
            <p className='whitespace-pre-wrap break-words'>{message.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketMessageItem;
