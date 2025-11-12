import { apiClient } from "@/lib/api-client"
import type {
  WithdrawalFeeRequest,
  WithdrawalFee,
  WithdrawalRequest,
  WithdrawalResponse,
} from "./schemas"

export async function calculateWithdrawalFee(
  params: WithdrawalFeeRequest
): Promise<WithdrawalFee> {
  return apiClient
    .get(`user/withdrawals/calculate-fee?amount=${params.amount}`)
    .json<WithdrawalFee>()
}

export async function requestWithdrawal(
  data: WithdrawalRequest
): Promise<WithdrawalResponse> {
  return apiClient
    .post("user/withdrawals/request", {
      json: data,
    })
    .json<WithdrawalResponse>()
}
