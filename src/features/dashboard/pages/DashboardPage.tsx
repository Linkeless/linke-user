/**
 * Dashboard page component
 *
 * Main dashboard interface using the new component architecture
 * with proper layout, welcome card, quick stats, and recent activity.
 * Includes dynamic title management with username display and i18n support.
 */

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserTitle } from '@/hooks/useDocumentTitle';
import { useCurrentUser } from '@/features/auth/stores/authStore';

import { DashboardLayout } from '../components/DashboardLayout';
import { WelcomeCard } from '../components/WelcomeCard';
import { QuickStats } from '../components/QuickStats';
import { AuthDebugInfo } from '../components/AuthDebugInfo';
import { ApiTestButton } from '../components/ApiTestButton';

/**
 * DashboardPage component
 *
 * Features:
 * - Professional dashboard layout with header and navigation
 * - Personalized welcome card
 * - Quick stats overview
 * - Recent activity section
 * - Responsive design with proper spacing
 * - Modern, clean styling
 * - Dynamic title with username display
 */
export function DashboardPage() {
  const { t } = useTranslation();
  const user = useCurrentUser();

  // Set dynamic title with username using translated title
  useUserTitle(t('dashboard:title'), user?.username, {
    showNotificationCount: true,
    isLoading: !user,
  });
  return (
    <DashboardLayout>
      <AuthDebugInfo />
      <ApiTestButton />
      <div className='container mx-auto p-6 space-y-8'>
        {/* Welcome Section */}
        <WelcomeCard />

        {/* Quick Stats */}
        <div className='space-y-4'>
          <div className='space-y-2'>
            <h2 className='text-xl font-semibold text-foreground'>
              {t('dashboard:sections.serviceStatus.title')}
            </h2>
            <p className='text-muted-foreground text-sm'>
              {t('dashboard:sections.serviceStatus.description')}
            </p>
          </div>
          <QuickStats />
        </div>

        {/* Recent Activity */}
        <div className='space-y-4'>
          <div className='space-y-2'>
            <h2 className='text-xl font-semibold text-foreground'>
              {t('dashboard:sections.recentActivity.title')}
            </h2>
            <p className='text-muted-foreground text-sm'>
              {t('dashboard:sections.recentActivity.description')}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>
                {t('dashboard:sections.recentActivity.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-center py-12 text-muted-foreground'>
                <div className='space-y-3'>
                  <div className='w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center'>
                    <svg
                      className='w-8 h-8 text-muted-foreground'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                      />
                    </svg>
                  </div>
                  <div className='space-y-1'>
                    <p className='font-medium'>
                      {t('dashboard:sections.recentActivity.noActivity')}
                    </p>
                    <p className='text-sm'>
                      {t(
                        'dashboard:sections.recentActivity.noActivityDescription'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className='space-y-4'>
          <div className='space-y-2'>
            <h2 className='text-xl font-semibold text-foreground'>
              {t('dashboard:sections.quickActions.title')}
            </h2>
            <p className='text-muted-foreground text-sm'>
              {t('dashboard:sections.quickActions.description')}
            </p>
          </div>

          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            <Card className='hover:shadow-md transition-shadow cursor-pointer'>
              <CardHeader>
                <CardTitle className='text-base flex items-center space-x-2'>
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                    />
                  </svg>
                  <span>{t('dashboard:cards.downloadConfig.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>
                  {t('dashboard:cards.downloadConfig.description')}
                </p>
              </CardContent>
            </Card>

            <Card className='hover:shadow-md transition-shadow cursor-pointer'>
              <CardHeader>
                <CardTitle className='text-base flex items-center space-x-2'>
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                    />
                  </svg>
                  <span>{t('dashboard:cards.mySubscription.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>
                  {t('dashboard:cards.mySubscription.description')}
                </p>
              </CardContent>
            </Card>

            <Card className='hover:shadow-md transition-shadow cursor-pointer'>
              <CardHeader>
                <CardTitle className='text-base flex items-center space-x-2'>
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  <span>{t('dashboard:cards.nodeList.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>
                  {t('dashboard:cards.nodeList.description')}
                </p>
              </CardContent>
            </Card>

            <Card className='hover:shadow-md transition-shadow cursor-pointer'>
              <CardHeader>
                <CardTitle className='text-base flex items-center space-x-2'>
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  <span>{t('dashboard:cards.usageDetails.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>
                  {t('dashboard:cards.usageDetails.description')}
                </p>
              </CardContent>
            </Card>

            <Card className='hover:shadow-md transition-shadow cursor-pointer'>
              <CardHeader>
                <CardTitle className='text-base flex items-center space-x-2'>
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z'
                    />
                  </svg>
                  <span>{t('dashboard:cards.getSupport.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>
                  {t('dashboard:cards.getSupport.description')}
                </p>
              </CardContent>
            </Card>

            <Card className='hover:shadow-md transition-shadow cursor-pointer'>
              <CardHeader>
                <CardTitle className='text-base flex items-center space-x-2'>
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                  </svg>
                  <span>{t('dashboard:cards.accountSettings.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>
                  {t('dashboard:cards.accountSettings.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

/**
 * Default export
 */
export default DashboardPage;
