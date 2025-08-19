/**
 * TicketMessageList Component
 * Displays a list of messages in a ticket conversation
 */

import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { TicketMessageItem } from './TicketMessageItem';
import { useCurrentUser } from '@/features/auth/stores/authStore';
import type { TicketMessageResponse } from '../types/ticket.types';

interface TicketMessageListProps {
  messages: TicketMessageResponse[];
  loading?: boolean;
}

export function TicketMessageList({
  messages,
  loading = false,
}: TicketMessageListProps) {
  const { t } = useTranslation('tickets');
  const currentUser = useCurrentUser();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages.length]);

  if (loading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-center space-y-2'>
          <MessageCircle className='w-8 h-8 text-muted-foreground mx-auto animate-pulse' />
          <p className='text-sm text-muted-foreground'>
            {t('messages.loading')}
          </p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-center space-y-2'>
          <MessageCircle className='w-8 h-8 text-muted-foreground mx-auto' />
          <p className='text-sm text-muted-foreground'>No messages yet</p>
        </div>
      </div>
    );
  }

  // Sort messages by creation date (oldest first)
  const sortedMessages = [...messages].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <ScrollArea className='h-[500px] pr-4' ref={scrollAreaRef}>
      <div className='space-y-4'>
        {sortedMessages.map(message => (
          <TicketMessageItem
            key={message.id}
            message={message}
            isCurrentUser={message.user_id === currentUser?.id}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

export default TicketMessageList;
