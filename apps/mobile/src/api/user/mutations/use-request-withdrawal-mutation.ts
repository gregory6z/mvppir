import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestWithdrawal, type RequestWithdrawalRequest } from "../client/user.api";

export function useRequestWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RequestWithdrawalRequest) => requestWithdrawal(data),
    onSuccess: () => {
      // Invalidate balance and transactions to reflect the locked balance
      queryClient.invalidateQueries({ queryKey: ["user", "balance"] });
      queryClient.invalidateQueries({ queryKey: ["user", "transactions"] });
    },
  });
}
