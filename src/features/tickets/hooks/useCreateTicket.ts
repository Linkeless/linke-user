/**
 * useCreateTicket Hook
 * Manages ticket creation mutation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { ticketService } from '../services/ticketService';
import {
  ticketQueryKeys,
  type CreateTicketRequest,
} from '../types/ticket.types';

/**
 * Hook for creating new tickets
 */
export function useCreateTicket() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t } = useTranslation('tickets');

  return useMutation({
    mutationFn: (data: CreateTicketRequest) => ticketService.createTicket(data),

    onSuccess: newTicket => {
      // Invalidate ticket list to show new ticket
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.lists() });

      // Show success message
      toast.success(t('messages.ticketCreated'));

      // Navigate to the new ticket detail page
      navigate(`/tickets/${newTicket.id}`);
    },

    onError: error => {
      console.error('Failed to create ticket:', error);
      toast.error(t('errors.createFailed'), {
        description:
          error instanceof Error ? error.message : t('errors.generic'),
      });
    },
  });
}

export default useCreateTicket;
