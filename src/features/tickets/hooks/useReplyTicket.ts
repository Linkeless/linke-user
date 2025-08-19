/**
 * useReplyTicket Hook
 * Manages ticket reply/message creation mutation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { ticketService } from '../services/ticketService';
import {
  ticketQueryKeys,
  type CreateMessageRequest,
} from '../types/ticket.types';

interface ReplyTicketParams {
  ticketId: number;
  message: CreateMessageRequest;
}

/**
 * Hook for replying to tickets
 */
export function useReplyTicket() {
  const queryClient = useQueryClient();
  const { t } = useTranslation('tickets');

  return useMutation({
    mutationFn: ({ ticketId, message }: ReplyTicketParams) =>
      ticketService.createMessage(ticketId, message),

    onSuccess: (_, variables) => {
      // Invalidate messages to show new reply
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.messages(variables.ticketId),
      });

      // Also invalidate ticket detail to update last_response_at
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.detail(variables.ticketId),
      });

      // Show success message
      toast.success(t('messages.replySent'));
    },

    onError: error => {
      console.error('Failed to send reply:', error);
      toast.error(t('errors.replyFailed'), {
        description:
          error instanceof Error ? error.message : t('errors.generic'),
      });
    },
  });
}

export default useReplyTicket;
