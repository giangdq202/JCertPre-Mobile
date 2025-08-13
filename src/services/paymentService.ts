import axiosInstance from "../const/axios/axiosInstance";
import {
  GET_PAYMENT_HISTORY_URL,
  GET_CREDIT_HISTORY_URL,
  CHECK_CREDIT_URL,
  CREATE_CREDIT_PURCHASE_URL,
} from "../const/apiUrl/baseUrl";

import {
  PaymentHistoryItem,
  CreditTransactionItem,
  CreditCheckResponse,
  CreateCreditPurchaseRequest,
  CreateCreditPurchaseResponse,
} from "../navigation/types";

/**
 * Lấy lịch sử thanh toán của student
 * @param studentId ID của student
 */
export const getStudentPaymentHistory = async (
  studentId: string
): Promise<PaymentHistoryItem[]> => {
  try {
    const { data } = await axiosInstance.get<PaymentHistoryItem[]>(
      GET_PAYMENT_HISTORY_URL(studentId)
    );
    return data;
  } catch (error) {
    console.error(
      "[StudentPaymentService] getStudentPaymentHistory error:",
      error
    );
    throw error;
  }
};

/**
 * Lấy lịch sử nạp credit của student
 * @param studentId ID của student
 */
export const getStudentCreditHistory = async (
  studentId: string
): Promise<CreditTransactionItem[]> => {
  try {
    const { data } = await axiosInstance.get<CreditTransactionItem[]>(
      GET_CREDIT_HISTORY_URL(studentId)
    );
    return data;
  } catch (error) {
    console.error(
      "[StudentPaymentService] getStudentCreditHistory error:",
      error
    );
    throw error;
  }
};

/**
 * Kiểm tra student có đủ credit để thanh toán
 * @param studentId ID của student
 * @param amount Số tiền cần kiểm tra
 */
export const checkStudentCredit = async (
  studentId: string,
  amount: number
): Promise<CreditCheckResponse> => {
  try {
    const { data } = await axiosInstance.get<CreditCheckResponse>(
      CHECK_CREDIT_URL(studentId, amount)
    );
    return data;
  } catch (error) {
    console.error("[StudentPaymentService] checkStudentCredit error:", error);
    throw error;
  }
};

/**
 * Tạo giao dịch mua credit cho student
 * @param request Dữ liệu giao dịch
 */
export const createStudentCreditPurchase = async (
  request: CreateCreditPurchaseRequest
): Promise<CreateCreditPurchaseResponse> => {
  try {
    const { data } = await axiosInstance.post<CreateCreditPurchaseResponse>(
      CREATE_CREDIT_PURCHASE_URL,
      request
    );
    return data;
  } catch (error) {
    console.error(
      "[StudentPaymentService] createStudentCreditPurchase error:",
      error
    );
    throw error;
  }
};
