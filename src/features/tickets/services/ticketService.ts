/**
 * Ticket Service
 * Handles API calls related to support tickets and messages
 */

import { apiClient } from '@/lib/api/client';
import { TICKET_ENDPOINTS, EndpointBuilders } from '@/lib/api/endpoints';
import type {
  TicketResponse,
  TicketMessageResponse,
  CreateTicketRequest,
  CreateMessageRequest,
  TicketFilters,
  PaginatedResponse,
  TicketStats,
} from '../types/ticket.types';

/**
 * Ticket Service Class
 */
export class TicketService {
  /**
   * Get user's tickets with optional filters
   */
  async getTickets(
    filters?: TicketFilters,
  ): Promise<PaginatedResponse<TicketResponse>> {
    try {
      const params = new URLSearchParams();

      if (filters?.status) {
        params.append('status', filters.status);
      }
      if (filters?.category) {
        params.append('category', filters.category);
      }
      if (filters?.priority) {
        params.append('priority', filters.priority);
      }
      if (filters?.page) {
        params.append('page', filters.page.toString());
      }
      if (filters?.limit) {
        params.append('limit', filters.limit.toString());
      }

      const response = await apiClient.get(
        `${TICKET_ENDPOINTS.MY_TICKETS}${params.toString() ? `?${params.toString()}` : ''}`,
      );

      // Handle response - adapt to API response structure
      const data = response.data;

      // Check if response is HAL format or standard format
      if (data._embedded?.tickets) {
        return {
          data: data._embedded.tickets,
          total: data.total || data._embedded.tickets.length,
          page: filters?.page || 1,
          limit: filters?.limit || 20,
          total_pages: Math.ceil(
            (data.total || data._embedded.tickets.length) /
              (filters?.limit || 20),
          ),
        };
      }

      // Standard response format
      return {
        data: Array.isArray(data) ? data : data.data || [],
        total: data.total || (Array.isArray(data) ? data.length : 0),
        page: filters?.page || 1,
        limit: filters?.limit || 20,
        total_pages: data.total_pages || 1,
      };
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      throw new Error('Failed to fetch tickets');
    }
  }

  /**
   * Get single ticket by ID
   */
  async getTicket(id: number): Promise<TicketResponse> {
    try {
      const response = await apiClient.get<TicketResponse>(
        EndpointBuilders.ticketById(id),
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch ticket ${id}:`, error);
      throw new Error('Failed to fetch ticket details');
    }
  }

  /**
   * Create a new ticket
   */
  async createTicket(data: CreateTicketRequest): Promise<TicketResponse> {
    try {
      const response = await apiClient.post<TicketResponse>(
        TICKET_ENDPOINTS.TICKETS,
        data,
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create ticket:', error);
      throw new Error('Failed to create ticket');
    }
  }

  /**
   * Close a ticket
   */
  async closeTicket(id: number): Promise<TicketResponse> {
    try {
      const response = await apiClient.put<TicketResponse>(
        EndpointBuilders.closeTicket(id),
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to close ticket ${id}:`, error);
      throw new Error('Failed to close ticket');
    }
  }

  /**
   * Get messages for a ticket
   */
  async getMessages(ticketId: number): Promise<TicketMessageResponse[]> {
    try {
      const response = await apiClient.get<TicketMessageResponse[]>(
        EndpointBuilders.ticketMessages(ticketId),
      );

      // Handle array or object response
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }

      // Handle HAL format
      if ((data as any)._embedded?.messages) {
        return (data as any)._embedded.messages;
      }

      return [];
    } catch (error) {
      console.error(`Failed to fetch messages for ticket ${ticketId}:`, error);
      throw new Error('Failed to fetch ticket messages');
    }
  }

  /**
   * Create a message/reply for a ticket
   */
  async createMessage(
    ticketId: number,
    data: CreateMessageRequest,
  ): Promise<TicketMessageResponse> {
    try {
      const response = await apiClient.post<TicketMessageResponse>(
        EndpointBuilders.ticketMessages(ticketId),
        data,
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to create message for ticket ${ticketId}:`, error);
      throw new Error('Failed to send reply');
    }
  }

  /**
   * Get ticket statistics
   */
  async getTicketStats(): Promise<TicketStats> {
    try {
      const tickets = await this.getTickets({ limit: 100 });
      const allTickets = tickets.data;

      const stats: TicketStats = {
        total: tickets.total,
        open: allTickets.filter(t => t.status === 'open').length,
        in_progress: allTickets.filter(t => t.status === 'in_progress').length,
        resolved: allTickets.filter(t => t.status === 'resolved').length,
        closed: allTickets.filter(t => t.status === 'closed').length,
      };

      return stats;
    } catch (error) {
      console.error('Failed to fetch ticket statistics:', error);
      throw new Error('Failed to fetch ticket statistics');
    }
  }

  /**
   * Helper: Get status color classes
   */
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      open: 'blue',
      in_progress: 'yellow',
      resolved: 'green',
      closed: 'gray',
    };
    return colors[status] || 'gray';
  }

  /**
   * Helper: Get priority color classes
   */
  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      low: 'gray',
      normal: 'blue',
      high: 'yellow',
      urgent: 'red',
    };
    return colors[priority] || 'gray';
  }

  /**
   * Helper: Format ticket number for display
   */
  formatTicketNumber(ticketNo: string): string {
    return `#${ticketNo}`;
  }
}

/**
 * Singleton instance
 */
export const ticketService = new TicketService();

/**
 * Export default service
 */
export default ticketService;
