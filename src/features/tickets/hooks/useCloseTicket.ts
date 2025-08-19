/**
 * useCloseTicket Hook
 * Manages ticket closing mutation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { ticketService } from '../services/ticketService';
import { ticketQueryKeys } from '../types/ticket.types';

/**
 * Hook for closing tickets
 */
export function useCloseTicket() {
  const queryClient = useQueryClient();
  const { t } = useTranslation('tickets');

  return useMutation({
    mutationFn: (ticketId: number) => ticketService.closeTicket(ticketId),

    onSuccess: (_, ticketId) => {
      // Invalidate ticket detail to show updated status
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.detail(ticketId),
      });

      // Invalidate ticket list to update status there too
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.lists(),
      });

      // Show success message
      toast.success(t('messages.ticketClosed'));
    },

    onError: error => {
      console.error('Failed to close ticket:', error);
      toast.error(t('errors.closeFailed'), {
        description:
          error instanceof Error ? error.message : t('errors.generic'),
      });
    },
  });
}

export default useCloseTicket;
