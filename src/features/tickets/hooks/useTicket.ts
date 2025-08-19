/**
 * useTicket Hook
 * Manages single ticket data fetching
 */

import { useQuery } from '@tanstack/react-query';
import { ticketService } from '../services/ticketService';
import { ticketQueryKeys } from '../types/ticket.types';

/**
 * Hook for fetching single ticket details
 */
export function useTicket(id: number | string, enabled = true) {
  const ticketId = typeof id === 'string' ? parseInt(id, 10) : id;

  return useQuery({
    queryKey: ticketQueryKeys.detail(ticketId),
    queryFn: () => ticketService.getTicket(ticketId),
    enabled: enabled && !isNaN(ticketId) && ticketId > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook for fetching ticket messages
 */
export function useTicketMessages(id: number | string, enabled = true) {
  const ticketId = typeof id === 'string' ? parseInt(id, 10) : id;

  return useQuery({
    queryKey: ticketQueryKeys.messages(ticketId),
    queryFn: () => ticketService.getMessages(ticketId),
    enabled: enabled && !isNaN(ticketId) && ticketId > 0,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time feel
  });
}

export default useTicket;
