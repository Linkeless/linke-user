/**
 * TicketStatusBadge Component
 * Displays ticket status with appropriate color coding
 */

import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { TicketStatus } from '../types/ticket.types';

interface TicketStatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

export function TicketStatusBadge({
  status,
  className,
}: TicketStatusBadgeProps) {
  const { t } = useTranslation('tickets');

  const getStatusStyles = (status: TicketStatus) => {
    const styles = {
      open: 'bg-blue-100 text-blue-800 border-blue-200',
      in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      closed: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return styles[status] || styles.closed;
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        getStatusStyles(status),
        className
      )}
    >
      {t(`status.${status}`)}
    </span>
  );
}

export default TicketStatusBadge;
