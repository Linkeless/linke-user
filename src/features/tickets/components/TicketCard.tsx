/**
 * TicketCard Component
 * Displays a single ticket in card format
 */

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, MessageCircle, Tag, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TicketStatusBadge } from './TicketStatusBadge';
import { cn } from '@/lib/utils';
import type { TicketResponse, TicketPriority } from '../types/ticket.types';

interface TicketCardProps {
  ticket: TicketResponse;
  className?: string;
}

export function TicketCard({ ticket, className }: TicketCardProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('tickets');

  const handleClick = () => {
    navigate(`/tickets/${ticket.id}`);
  };

  const getPriorityIcon = (priority: TicketPriority) => {
    if (priority === 'urgent' || priority === 'high') {
      return <AlertCircle className='w-3 h-3 text-red-500' />;
    }
    return null;
  };

  const getPriorityStyles = (priority: TicketPriority) => {
    const styles = {
      low: 'text-gray-500',
      normal: 'text-blue-500',
      high: 'text-orange-500',
      urgent: 'text-red-500',
    };
    return styles[priority] || styles.normal;
  };

  const locale = i18n.language === 'zh' ? zhCN : enUS;
  const lastUpdate = ticket.last_response_at || ticket.updated_at;

  return (
    <Card
      className={cn(
        'cursor-pointer hover:shadow-md transition-shadow',
        className
      )}
      onClick={handleClick}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex-1 space-y-1'>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-muted-foreground font-mono'>
                #{ticket.ticket_no}
              </span>
              {getPriorityIcon(ticket.priority)}
              <TicketStatusBadge status={ticket.status} />
            </div>
            <h3 className='font-semibold text-base line-clamp-1'>
              {ticket.title}
            </h3>
          </div>
        </div>
      </CardHeader>
      <CardContent className='pt-0'>
        <p className='text-sm text-muted-foreground line-clamp-2 mb-3'>
          {ticket.description}
        </p>
        <div className='flex items-center gap-4 text-xs text-muted-foreground'>
          <div className='flex items-center gap-1'>
            <Tag className='w-3 h-3' />
            <span>{t(`category.${ticket.category}`)}</span>
          </div>
          <div className='flex items-center gap-1'>
            <span
              className={cn('font-medium', getPriorityStyles(ticket.priority))}
            >
              {t(`priority.${ticket.priority}`)}
            </span>
          </div>
          <div className='flex items-center gap-1 ml-auto'>
            <Clock className='w-3 h-3' />
            <span>
              {formatDistanceToNow(new Date(lastUpdate), {
                addSuffix: true,
                locale,
              })}
            </span>
          </div>
          {ticket.messages && ticket.messages.length > 0 && (
            <div className='flex items-center gap-1'>
              <MessageCircle className='w-3 h-3' />
              <span>{ticket.messages.length}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default TicketCard;
