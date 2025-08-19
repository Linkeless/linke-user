/**
 * CreateTicketPage Component
 * Page for creating new support tickets
 */

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AdminLayout } from '@/features/dashboard/components/DashboardLayout';
import { CreateTicketForm } from '../components/CreateTicketForm';

export function CreateTicketPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('tickets');
  const { t: tNav } = useTranslation('navigation');

  const handleCancel = () => {
    navigate('/tickets');
  };

  return (
    <AdminLayout
      navigation={[
        { label: tNav('menu.dashboard'), href: '/dashboard' },
        { label: tNav('menu.subscriptions'), href: '/subscriptions' },
        { label: t('title'), href: '/tickets' },
        { label: t('createTicket'), href: '/tickets/new', active: true },
      ]}
    >
      <div className='container mx-auto px-4 py-8 max-w-3xl'>
        {/* Back Button */}
        <div className='mb-6'>
          <Button variant='ghost' onClick={handleCancel}>
            <ArrowLeft className='w-4 h-4 mr-2' />
            {t('actions.back')}
          </Button>
        </div>

        {/* Create Ticket Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('createTicket')}</CardTitle>
            <CardDescription>
              Fill out the form below to submit a support request. Our team will
              respond as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateTicketForm onCancel={handleCancel} />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default CreateTicketPage;
