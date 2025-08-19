/**
 * useTickets Hook
 * Manages ticket list data fetching with filters and pagination
 */

import { useQuery } from '@tanstack/react-query';
import { ticketService } from '../services/ticketService';
import { ticketQueryKeys, type TicketFilters } from '../types/ticket.types';

/**
 * Hook for fetching ticket list with filters
 */
export function useTickets(filters?: TicketFilters) {
  return useQuery({
    queryKey: ticketQueryKeys.list(filters),
    queryFn: () => ticketService.getTickets(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook for fetching ticket statistics
 */
export function useTicketStats() {
  return useQuery({
    queryKey: ticketQueryKeys.stats(),
    queryFn: () => ticketService.getTicketStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

export default useTickets;
