/**
 * TicketDetailPage Component
 * Page for viewing and interacting with a single ticket
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  Tag,
  Calendar,
  MessageCircle,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AdminLayout } from '@/features/dashboard/components/DashboardLayout';
import { TicketStatusBadge } from '../components/TicketStatusBadge';
import { TicketMessageList } from '../components/TicketMessageList';
import { ReplyForm } from '../components/ReplyForm';
import { useTicket, useTicketMessages } from '../hooks/useTicket';
import { useReplyTicket } from '../hooks/useReplyTicket';
import { useCloseTicket } from '../hooks/useCloseTicket';
import { formatDistanceToNow } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('tickets');
  const { t: tNav } = useTranslation('navigation');

  const ticketId = id ? parseInt(id, 10) : 0;
  const locale = i18n.language === 'zh' ? zhCN : enUS;

  // Data hooks
  const {
    data: ticket,
    isLoading: ticketLoading,
    error: ticketError,
  } = useTicket(ticketId);
  const { data: messages = [], isLoading: messagesLoading } =
    useTicketMessages(ticketId);
  const replyMutation = useReplyTicket();
  const closeMutation = useCloseTicket();

  const handleReply = (message: { content: string }) => {
    replyMutation.mutate({ ticketId, message });
  };

  const handleClose = () => {
    if (window.confirm(t('messages.confirmClose'))) {
      closeMutation.mutate(ticketId);
    }
  };

  const handleBack = () => {
    navigate('/tickets');
  };

  // Loading state
  if (ticketLoading) {
    return (
      <AdminLayout
        navigation={[
          { label: tNav('menu.dashboard'), href: '/dashboard' },
          { label: tNav('menu.subscriptions'), href: '/subscriptions' },
          { label: t('title'), href: '/tickets' },
        ]}
      >
        <div className='container mx-auto px-4 py-8'>
          <div className='flex items-center justify-center min-h-[400px]'>
            <Loader2 className='w-8 h-8 animate-spin text-primary' />
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (ticketError || !ticket) {
    return (
      <AdminLayout
        navigation={[
          { label: tNav('menu.dashboard'), href: '/dashboard' },
          { label: tNav('menu.subscriptions'), href: '/subscriptions' },
          { label: t('title'), href: '/tickets' },
        ]}
      >
        <div className='container mx-auto px-4 py-8'>
          <Card>
            <CardContent className='flex flex-col items-center justify-center py-12'>
              <AlertCircle className='w-12 h-12 text-destructive mb-4' />
              <h3 className='text-lg font-semibold mb-2'>
                {t('errors.notFound')}
              </h3>
              <Button onClick={handleBack} className='mt-4'>
                <ArrowLeft className='w-4 h-4 mr-2' />
                {t('actions.back')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const isOpen = ticket.status !== 'closed';
  const createdAt = formatDistanceToNow(new Date(ticket.created_at), {
    addSuffix: true,
    locale,
  });
  const lastUpdate = ticket.last_response_at || ticket.updated_at;
  const updatedAt = formatDistanceToNow(new Date(lastUpdate), {
    addSuffix: true,
    locale,
  });

  return (
    <AdminLayout
      navigation={[
        { label: tNav('menu.dashboard'), href: '/dashboard' },
        { label: tNav('menu.subscriptions'), href: '/subscriptions' },
        { label: t('title'), href: '/tickets' },
      ]}
    >
      <div className='container mx-auto px-4 py-8 max-w-5xl'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <Button variant='ghost' onClick={handleBack}>
            <ArrowLeft className='w-4 h-4 mr-2' />
            {t('actions.back')}
          </Button>
          {isOpen && (
            <Button
              variant='outline'
              onClick={handleClose}
              disabled={closeMutation.isPending}
            >
              {closeMutation.isPending ? (
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              ) : (
                <XCircle className='w-4 h-4 mr-2' />
              )}
              {t('actions.close')}
            </Button>
          )}
        </div>

        {/* Ticket Info Card */}
        <Card className='mb-6'>
          <CardHeader>
            <div className='flex items-start justify-between'>
              <div className='space-y-1'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <span className='font-mono'>#{ticket.ticket_no}</span>
                  <TicketStatusBadge status={ticket.status} />
                </div>
                <CardTitle className='text-2xl'>{ticket.title}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
              <div className='flex items-center gap-2 text-sm'>
                <Tag className='w-4 h-4 text-muted-foreground' />
                <span className='text-muted-foreground'>
                  {t('form.category')}:
                </span>
                <span className='font-medium'>
                  {t(`category.${ticket.category}`)}
                </span>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                <AlertCircle className='w-4 h-4 text-muted-foreground' />
                <span className='text-muted-foreground'>
                  {t('form.priority')}:
                </span>
                <span className='font-medium'>
                  {t(`priority.${ticket.priority}`)}
                </span>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                <Calendar className='w-4 h-4 text-muted-foreground' />
                <span className='text-muted-foreground'>
                  {t('labels.createdAt')}:
                </span>
                <span className='font-medium'>{createdAt}</span>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                <Clock className='w-4 h-4 text-muted-foreground' />
                <span className='text-muted-foreground'>
                  {t('labels.updatedAt')}:
                </span>
                <span className='font-medium'>{updatedAt}</span>
              </div>
            </div>
            <Separator className='my-4' />
            <div className='prose prose-sm max-w-none dark:prose-invert'>
              <p className='whitespace-pre-wrap'>{ticket.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Messages Section */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <MessageCircle className='w-5 h-5' />
              {t('labels.messages')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TicketMessageList messages={messages} loading={messagesLoading} />

            {/* Reply Form */}
            {isOpen ? (
              <>
                <Separator className='my-6' />
                <ReplyForm
                  onSubmit={handleReply}
                  isSubmitting={replyMutation.isPending}
                />
              </>
            ) : (
              <div className='mt-6 p-4 bg-muted rounded-lg text-center'>
                <p className='text-sm text-muted-foreground'>
                  {t('messages.cannotReply')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default TicketDetailPage;
