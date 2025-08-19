/**
 * TicketList Component
 * Wrapper component for displaying a list of tickets
 */

import { useTranslation } from 'react-i18next';
import { Plus, Search, Filter, AlertCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TicketCard } from './TicketCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type {
  TicketResponse,
  TicketStatus,
  TicketPriority,
} from '../types/ticket.types';

interface TicketListProps {
  tickets?: TicketResponse[];
  loading?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
}

export function TicketList({
  tickets = [],
  loading = false,
  error = null,
  onRefresh,
}: TicketListProps) {
  const { t } = useTranslation('tickets');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>(
    'all',
  );

  // Filter tickets based on search and filters
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          ticket.title.toLowerCase().includes(search) ||
          ticket.ticket_no.toLowerCase().includes(search) ||
          ticket.description?.toLowerCase().includes(search);
        if (!matchesSearch) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && ticket.status !== statusFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) {
        return false;
      }

      return true;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  const handleCreateTicket = () => {
    navigate('/tickets/new');
  };

  const handleTicketClick = (ticketId: number) => {
    navigate(`/tickets/${ticketId}`);
  };

  // Loading state
  if (loading && tickets.length === 0) {
    return (
      <div className='flex items-center justify-center py-12'>
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <AlertCircle className='w-12 h-12 text-destructive mb-4' />
          <h3 className='text-lg font-semibold mb-2'>
            {t('errors.loadFailed')}
          </h3>
          <p className='text-sm text-muted-foreground mb-4'>{error.message}</p>
          {onRefresh && (
            <Button onClick={onRefresh} variant='outline'>
              {t('actions.retry')}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header Actions */}
      <div className='flex flex-col sm:flex-row gap-4'>
        {/* Search */}
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input
            type='search'
            placeholder={t('actions.search')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>

        {/* Filters */}
        <div className='flex gap-2'>
          <Select
            value={statusFilter}
            onValueChange={value =>
              setStatusFilter(value as TicketStatus | 'all')
            }
          >
            <SelectTrigger className='w-[140px]'>
              <Filter className='w-4 h-4 mr-2' />
              <SelectValue placeholder={t('filters.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('filters.all')}</SelectItem>
              <SelectItem value='open'>{t('status.open')}</SelectItem>
              <SelectItem value='in_progress'>
                {t('status.in_progress')}
              </SelectItem>
              <SelectItem value='resolved'>{t('status.resolved')}</SelectItem>
              <SelectItem value='closed'>{t('status.closed')}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={priorityFilter}
            onValueChange={value =>
              setPriorityFilter(value as TicketPriority | 'all')
            }
          >
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder={t('filters.priority')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('filters.all')}</SelectItem>
              <SelectItem value='low'>{t('priority.low')}</SelectItem>
              <SelectItem value='normal'>{t('priority.normal')}</SelectItem>
              <SelectItem value='high'>{t('priority.high')}</SelectItem>
              <SelectItem value='urgent'>{t('priority.urgent')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Create Button */}
        <Button onClick={handleCreateTicket}>
          <Plus className='w-4 h-4 mr-2' />
          {t('createTicket')}
        </Button>
      </div>

      {/* Tickets Grid */}
      {filteredTickets.length === 0 ? (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <div className='text-center space-y-2'>
              <h3 className='text-lg font-semibold'>
                {t('messages.noTickets')}
              </h3>
              <p className='text-sm text-muted-foreground'>
                {searchTerm ||
                statusFilter !== 'all' ||
                priorityFilter !== 'all'
                  ? t('messages.noMatchingTickets')
                  : t('messages.createFirstTicket')}
              </p>
              {!searchTerm &&
                statusFilter === 'all' &&
                priorityFilter === 'all' && (
                  <Button onClick={handleCreateTicket} className='mt-4'>
                    <Plus className='w-4 h-4 mr-2' />
                    {t('createTicket')}
                  </Button>
                )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {filteredTickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onClick={() => handleTicketClick(ticket.id)}
            />
          ))}
        </div>
      )}

      {/* Results count */}
      {tickets.length > 0 && (
        <div className='text-sm text-muted-foreground text-center'>
          {filteredTickets.length === tickets.length
            ? t('messages.totalTickets', { count: tickets.length })
            : t('messages.showingTickets', {
                showing: filteredTickets.length,
                total: tickets.length,
              })}
        </div>
      )}
    </div>
  );
}

export default TicketList;
