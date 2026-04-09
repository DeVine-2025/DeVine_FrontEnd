// src/shared/apis/payment/payment-queries.ts
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { completePayment, getMyCredits, type PaymentCompleteRequest } from './payment';

export const paymentQueryKeys = {
  myCredits: ['payment', 'my-credits'] as const,
};

export const myCreditsQuery = (enabled: boolean) =>
  queryOptions({
    queryKey: paymentQueryKeys.myCredits,
    queryFn: getMyCredits,
    enabled,
  });

export function useCompletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PaymentCompleteRequest) => completePayment(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.myCredits });
    },
  });
}