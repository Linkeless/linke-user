/**
 * Type definitions for ticket-related data
 * Based on the backend API specification
 */

import type { UserBasic } from '@/features/auth/types/auth.types';

/**
 * Ticket status enum
 */
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

/**
 * Ticket priority enum
 */
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Ticket category enum
 */
export type TicketCategory =
  | 'technical'
  | 'billing'
  | 'subscription'
  | 'general'
  | 'other';

/**
 * Message type enum
 */
export type MessageType = 'user' | 'admin' | 'system';

/**
 * User basic info (extending from auth module)
 */
export type UserBasicDTO = UserBasic;

/**
 * Ticket message response from API
 */
export interface TicketMessageResponse {
  id: number;
  ticket_id: number;
  user_id: number;
  content: string;
  message_type: MessageType;
  is_internal: boolean;
  attachments?: string;
  metadata?: string;
  created_at: string;
  updated_at: string;
  user?: UserBasicDTO;
}

/**
 * Main ticket response from API
 */
export interface TicketResponse {
  id: number;
  ticket_no: string;
  user_id: number;
  title: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  tags?: string;
  metadata?: string;
  assigned_to_id?: number;
  assigned_to?: UserBasicDTO;
  assigned_at?: string;
  resolved_by_id?: number;
  resolved_by?: UserBasicDTO;
  resolved_at?: string;
  resolution?: string;
  closed_at?: string;
  first_response_at?: string;
  last_response_at?: string;
  created_at: string;
  updated_at: string;
  user?: UserBasicDTO;
  messages?: TicketMessageResponse[];
}

/**
 * Create ticket request DTO
 */
export interface CreateTicketRequest {
  title: string;
  description: string;
  category: TicketCategory;
  priority?: TicketPriority;
}

/**
 * Create message request DTO
 */
export interface CreateMessageRequest {
  content: string;
}

/**
 * Ticket list filters
 */
export interface TicketFilters {
  status?: TicketStatus;
  category?: TicketCategory;
  priority?: TicketPriority;
  page?: number;
  limit?: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/**
 * Ticket statistics
 */
export interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  average_response_time?: number;
  average_resolution_time?: number;
}

/**
 * Ticket action response
 */
export interface TicketActionResponse {
  success: boolean;
  message?: string;
  ticket?: TicketResponse;
}

/**
 * Query key factory for ticket queries
 */
export const ticketQueryKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketQueryKeys.all, 'list'] as const,
  list: (filters?: TicketFilters) =>
    [...ticketQueryKeys.lists(), filters || {}] as const,
  details: () => [...ticketQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...ticketQueryKeys.details(), id] as const,
  messages: (id: number) =>
    [...ticketQueryKeys.detail(id), 'messages'] as const,
  stats: () => [...ticketQueryKeys.all, 'stats'] as const,
};
