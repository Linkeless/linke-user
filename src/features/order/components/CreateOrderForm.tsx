/**
 * Create order form component
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useCreateOrder } from '../hooks/useCreateOrder';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { SUBSCRIPTION_ENDPOINTS } from '@/lib/api/endpoints';
import { orderService } from '../services/orderService';
import type { CreateOrderRequest } from '../types/order.types';
import type { SubscriptionPlanResponse } from '@/features/subscription/types/subscription.types';

interface CreateOrderFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (orderId: string) => void;
}

/**
 * Form for creating new orders
 */
export function CreateOrderForm({
  open,
  onClose,
  onSuccess,
}: CreateOrderFormProps) {
  const { t } = useTranslation('order');
  const { createOrder, isLoading: isCreating } = useCreateOrder();
  const [selectedPlan, setSelectedPlan] =
    useState<SubscriptionPlanResponse | null>(null);

  // Fetch available subscription plans
  const { data: plans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const response = await apiClient.get<SubscriptionPlanResponse[]>(
        SUBSCRIPTION_ENDPOINTS.PLANS
      );
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const form = useForm<CreateOrderRequest>({
    defaultValues: {
      subscription_plan_id: 0,
      billing_cycle: 'monthly',
      quantity: 1,
      coupon_code: '',
    },
  });

  // Update selected plan when form value changes
  useEffect(() => {
    const planId = form.watch('subscription_plan_id');
    if (planId && plans) {
      const plan = plans.find(p => p.id === planId);
      setSelectedPlan(plan || null);
    }
  }, [form.watch('subscription_plan_id'), plans]);

  const onSubmit = async (data: CreateOrderRequest) => {
    try {
      // Remove empty coupon code
      if (!data.coupon_code) {
        delete data.coupon_code;
      }

      await createOrder(data, {
        onSuccess: order => {
          form.reset();
          onClose();
          if (onSuccess) {
            onSuccess(order.id);
          }
        },
      });
    } catch (_error) {
      // Error is handled by the hook
    }
  };

  const calculateTotal = () => {
    if (!selectedPlan) {
      return 0;
    }
    const quantity = form.watch('quantity') || 1;
    return selectedPlan.price * quantity;
  };

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('title.createOrder')}</DialogTitle>
        </DialogHeader>

        {isLoadingPlans ? (
          <div className='flex items-center justify-center py-8'>
            <LoadingSpinner />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='subscription_plan_id'
                rules={{ required: t('validation.planRequired') }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('labels.selectPlan')}</FormLabel>
                    <Select
                      onValueChange={value => field.onChange(Number(value))}
                      value={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t('placeholders.selectPlan')}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {plans?.map(plan => (
                          <SelectItem key={plan.id} value={String(plan.id)}>
                            <div className='flex justify-between items-center w-full'>
                              <span>{plan.name}</span>
                              <span className='ml-2 text-muted-foreground'>
                                {orderService.formatAmount(
                                  plan.price,
                                  plan.currency
                                )}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {selectedPlan?.description}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='billing_cycle'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('labels.billingCycle')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='monthly'>
                          {t('billing.monthly')}
                        </SelectItem>
                        <SelectItem value='quarterly'>
                          {t('billing.quarterly')}
                        </SelectItem>
                        <SelectItem value='yearly'>
                          {t('billing.yearly')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='quantity'
                rules={{
                  required: t('validation.quantityRequired'),
                  min: { value: 1, message: t('validation.quantityMin') },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('labels.quantity')}</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        min='1'
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='coupon_code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('labels.couponCode')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('placeholders.couponCode')}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('labels.couponOptional')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedPlan && (
                <div className='rounded-lg bg-muted p-4'>
                  <div className='flex justify-between items-center'>
                    <span className='font-semibold'>{t('labels.total')}:</span>
                    <span className='text-lg font-bold'>
                      {orderService.formatAmount(
                        calculateTotal(),
                        selectedPlan.currency
                      )}
                    </span>
                  </div>
                </div>
              )}

              <DialogFooter className='gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={onClose}
                  disabled={isCreating}
                >
                  {t('actions.cancel')}
                </Button>
                <Button
                  type='submit'
                  disabled={isCreating || !form.watch('subscription_plan_id')}
                >
                  {isCreating
                    ? t('actions.creating')
                    : t('actions.createOrder')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default CreateOrderForm;
