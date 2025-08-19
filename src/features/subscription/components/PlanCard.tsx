/**
 * Plan Card Component
 *
 * Displays subscription plan information with features,
 * pricing, and purchase/selection options
 */

import { Check, Star, Zap, Users, Database, Server } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { SubscriptionPlanResponse } from '../types/subscription.types';
import { subscriptionPlanService } from '../services/subscriptionPlanService';

/**
 * Props for PlanCard component
 */
interface PlanCardProps {
  plan: SubscriptionPlanResponse;
  onSelect?: (planId: number) => void;
  onPurchase?: (planId: number) => void;
  isSelected?: boolean;
  showFeatures?: boolean;
  isPopular?: boolean;
  comparisonMode?: boolean;
  monthlyPrice?: number; // For comparison with other billing cycles
}

/**
 * Feature item component
 */
function FeatureItem({
  children,
  included = true,
}: {
  children: React.ReactNode;
  included?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 ${included ? 'text-foreground' : 'text-muted-foreground'}`}
    >
      <Check
        className={`w-4 h-4 ${included ? 'text-green-600' : 'text-gray-400'}`}
      />
      <span className='text-sm'>{children}</span>
    </div>
  );
}

/**
 * Popular badge component
 */
function PopularBadge() {
  const { t } = useTranslation('subscription');

  return (
    <div className='absolute -top-2 left-1/2 transform -translate-x-1/2'>
      <div className='bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1'>
        <Star className='w-3 h-3 fill-current' />
        {t('billing.mostPopular')}
      </div>
    </div>
  );
}

/**
 * PlanCard component
 */
export function PlanCard({
  plan,
  onSelect,
  onPurchase,
  isSelected = false,
  showFeatures = true,
  isPopular = false,
  comparisonMode = false,
  monthlyPrice,
}: PlanCardProps) {
  const { t } = useTranslation('subscription');

  const formatPrice = (price: number, currency: string) => {
    return subscriptionPlanService.formatPrice(price, currency);
  };

  const formatDataLimit = (limit?: number) => {
    if (!limit || limit === -1) {
      return t('labels.unlimited');
    }
    if (limit >= 1024 * 1024 * 1024 * 1024) {
      return `${(limit / (1024 * 1024 * 1024 * 1024)).toFixed(0)}TB`;
    }
    if (limit >= 1024 * 1024 * 1024) {
      return `${(limit / (1024 * 1024 * 1024)).toFixed(0)}GB`;
    }
    return `${limit}B`;
  };

  const formatSpeed = (speed?: number) => {
    if (!speed || speed === -1) {
      return t('labels.unlimited');
    }
    if (speed >= 1000) {
      return `${(speed / 1000).toFixed(0)}Gbps`;
    }
    return `${speed}Mbps`;
  };

  const billingCycleKey = `billing.${plan.billing_cycle}` as const;
  const calculateMonthlyPrice = subscriptionPlanService.calculateMonthlyPrice(
    plan.price,
    plan.billing_cycle,
    plan.billing_interval
  );

  // Calculate discount if monthly price is provided
  const discount = monthlyPrice
    ? subscriptionPlanService.calculateDiscount(plan.price, monthlyPrice * 12)
    : 0;

  const isYearly = plan.billing_cycle === 'yearly';
  const showDiscount = isYearly && discount > 0;

  return (
    <Card
      className={`relative transition-all duration-200 hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary border-primary' : ''
      } ${isPopular ? 'border-2 border-blue-500 scale-105' : ''} ${
        comparisonMode ? 'h-full' : ''
      }`}
    >
      {isPopular && <PopularBadge />}

      <CardHeader className={`text-center ${isPopular ? 'pt-6' : 'pt-4'}`}>
        <CardTitle className='text-xl font-bold'>{plan.name}</CardTitle>
        {plan.description && (
          <p className='text-sm text-muted-foreground mt-1'>
            {plan.description}
          </p>
        )}

        {/* Pricing */}
        <div className='mt-4'>
          <div className='flex items-baseline justify-center gap-1'>
            <span className='text-3xl font-bold'>
              {formatPrice(plan.price, plan.currency)}
            </span>
            <span className='text-sm text-muted-foreground'>
              / {t(billingCycleKey)}
            </span>
          </div>

          {plan.billing_cycle !== 'monthly' && (
            <div className='text-sm text-muted-foreground mt-1'>
              {formatPrice(calculateMonthlyPrice, plan.currency)}{' '}
              {t('billing.perMonth')}
            </div>
          )}

          {showDiscount && (
            <div className='mt-2'>
              <span className='bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium'>
                {t('billing.savePercent', { percent: discount })}
              </span>
            </div>
          )}

          {plan.trial_days && plan.trial_days > 0 && (
            <div className='mt-2 text-sm text-blue-600'>
              {t('billing.trialDays', { days: plan.trial_days })}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Key Features Summary */}
        <div className='grid grid-cols-2 gap-4 py-4 border-y'>
          <div className='text-center'>
            <div className='flex items-center justify-center mb-1'>
              <Database className='w-4 h-4 text-blue-600' />
            </div>
            <div className='text-sm font-medium'>
              {formatDataLimit(plan.data_limit)}
            </div>
            <div className='text-xs text-muted-foreground'>
              {t('labels.data')}
            </div>
          </div>

          <div className='text-center'>
            <div className='flex items-center justify-center mb-1'>
              <Zap className='w-4 h-4 text-yellow-600' />
            </div>
            <div className='text-sm font-medium'>
              {formatSpeed(plan.speed_limit)}
            </div>
            <div className='text-xs text-muted-foreground'>
              {t('labels.speed')}
            </div>
          </div>

          <div className='text-center'>
            <div className='flex items-center justify-center mb-1'>
              <Server className='w-4 h-4 text-green-600' />
            </div>
            <div className='text-sm font-medium'>
              {plan.server_count || '∞'}
            </div>
            <div className='text-xs text-muted-foreground'>
              {t('labels.servers')}
            </div>
          </div>

          <div className='text-center'>
            <div className='flex items-center justify-center mb-1'>
              <Users className='w-4 h-4 text-purple-600' />
            </div>
            <div className='text-sm font-medium'>
              {plan.device_limit === -1 ? '∞' : plan.device_limit}
            </div>
            <div className='text-xs text-muted-foreground'>
              {t('labels.devices')}
            </div>
          </div>
        </div>

        {/* Detailed Features */}
        {showFeatures && plan.features && plan.features.length > 0 && (
          <div className='space-y-3'>
            <h4 className='text-sm font-medium'>{t('labels.features')}</h4>
            <div className='space-y-2'>
              {plan.features.map((feature, index) => (
                <FeatureItem key={index}>{feature}</FeatureItem>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className='flex gap-2 pt-4'>
          {onSelect && (
            <Button
              variant={isSelected ? 'default' : 'outline'}
              className='flex-1'
              onClick={() => onSelect(plan.id)}
            >
              {isSelected ? t('actions.selected') : t('actions.selectPlan')}
            </Button>
          )}

          {onPurchase && (
            <Button
              className={`flex-1 ${isPopular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
              onClick={() => onPurchase(plan.id)}
            >
              {t('actions.buyNow')}
            </Button>
          )}

          {!onSelect && !onPurchase && (
            <Button className='w-full' disabled>
              {t('actions.choosePlan')}
            </Button>
          )}
        </div>

        {plan.setup_fee && plan.setup_fee > 0 && (
          <div className='text-xs text-muted-foreground text-center pt-2'>
            {t('billing.setupFee', {
              fee: formatPrice(plan.setup_fee, plan.currency),
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PlanCard;
