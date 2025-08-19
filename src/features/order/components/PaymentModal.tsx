/**
 * Payment modal component
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useOrderPayment } from '../hooks/useOrderPayment';
import { useOrderDetails } from '../hooks/useOrderDetails';
import { orderService } from '../services/orderService';
import type { PaymentRequest } from '../types/order.types';

interface PaymentModalProps {
  orderId: string | undefined;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Available payment methods
const PAYMENT_METHODS = [
  { value: 'alipay', label: 'payment.alipay', icon: '💳' },
  { value: 'wechat', label: 'payment.wechat', icon: '💚' },
  { value: 'stripe', label: 'payment.stripe', icon: '💰' },
  { value: 'paypal', label: 'payment.paypal', icon: '💙' },
];

/**
 * Modal for processing order payments
 */
export function PaymentModal({
  orderId,
  open,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const { t } = useTranslation('order');
  const [selectedMethod, setSelectedMethod] = useState<string>('alipay');
  const { payOrder, isLoading: isProcessing } = useOrderPayment();
  const { order, isLoading: isLoadingOrder } = useOrderDetails(orderId);

  const handlePayment = async () => {
    if (!orderId || !selectedMethod) {
      return;
    }

    const paymentData: PaymentRequest = {
      order_id: orderId,
      payment_method: selectedMethod,
      return_url: `${window.location.origin}/orders`,
    };

    try {
      await payOrder(paymentData, {
        onSuccess: () => {
          onClose();
          if (onSuccess) {
            onSuccess();
          }
        },
      });
    } catch (_error) {
      // Error is handled by the hook
    }
  };

  const expiryInfo = order ? orderService.getExpiryTime(order) : null;

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('title.payment')}</DialogTitle>
          <DialogDescription>
            {t('messages.selectPaymentMethod')}
          </DialogDescription>
        </DialogHeader>

        {isLoadingOrder ? (
          <div className='flex items-center justify-center py-8'>
            <LoadingSpinner />
          </div>
        ) : order ? (
          <div className='space-y-4'>
            {/* Order Info */}
            <div className='rounded-lg bg-muted p-4 space-y-2'>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>
                  {t('labels.orderNo')}:
                </span>
                <span className='font-medium'>{order.order_no}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>
                  {t('labels.plan')}:
                </span>
                <span className='font-medium'>
                  {order.subscription_plan?.name}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='font-semibold'>{t('labels.amount')}:</span>
                <span className='text-lg font-bold'>
                  {orderService.formatAmount(order.amount, order.currency)}
                </span>
              </div>

              {expiryInfo &&
                !expiryInfo.expired &&
                expiryInfo.remainingMinutes > 0 && (
                  <div className='text-center text-sm text-orange-600 pt-2'>
                    {t('messages.paymentTimeLimit', {
                      minutes: expiryInfo.remainingMinutes,
                    })}
                  </div>
                )}

              {expiryInfo?.expired && (
                <div className='text-center text-sm text-red-600 pt-2'>
                  {t('messages.orderExpired')}
                </div>
              )}
            </div>

            {/* Payment Methods */}
            {!expiryInfo?.expired && (
              <div className='space-y-3'>
                <Label>{t('labels.paymentMethod')}</Label>
                <RadioGroup
                  value={selectedMethod}
                  onValueChange={setSelectedMethod}
                  className='space-y-2'
                >
                  {PAYMENT_METHODS.map(method => (
                    <div
                      key={method.value}
                      className='flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent cursor-pointer'
                    >
                      <RadioGroupItem value={method.value} id={method.value} />
                      <Label
                        htmlFor={method.value}
                        className='flex items-center gap-2 cursor-pointer flex-1'
                      >
                        <span className='text-xl'>{method.icon}</span>
                        <span>{t(method.label)}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Security Notice */}
            <div className='rounded-lg bg-blue-50 dark:bg-blue-950 p-3 text-sm text-blue-700 dark:text-blue-300'>
              {t('messages.securePayment')}
            </div>
          </div>
        ) : (
          <div className='text-center py-8 text-muted-foreground'>
            {t('messages.orderNotFound')}
          </div>
        )}

        <DialogFooter className='gap-2'>
          <Button variant='outline' onClick={onClose} disabled={isProcessing}>
            {t('actions.cancel')}
          </Button>

          {order && !expiryInfo?.expired && (
            <Button
              onClick={handlePayment}
              disabled={isProcessing || !selectedMethod}
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner className='mr-2 h-4 w-4' />
                  {t('actions.processing')}
                </>
              ) : (
                t('actions.confirmPayment')
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PaymentModal;
