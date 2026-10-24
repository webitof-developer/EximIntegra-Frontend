import { api } from "./api";

export interface PublicPaymentConfig {
  isActive: boolean;
  isTestMode: boolean;
  keyId: string;
  currencyInrEnabled: boolean;
  currencyUsdEnabled: boolean;
}

export interface CreateOrderPayload {
  planId: string;
  billingCycle: "monthly" | "yearly";
  currency: "INR" | "USD";
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  planName: string;
  organizationName: string;
  userEmail: string;
  userName: string;
  isSimulated?: boolean;
}

export interface VerifyPaymentPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  planId: string;
  billingCycle: string;
  currency: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  transactionId: string;
  tier: string;
  tierBadge?: string;
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  billingCycle: string;
  planId: string;
  createdAt: string;
  receiptUrl?: string;
}

export interface AdminPaymentConfig {
  id?: string;
  keyId: string;
  keySecretMasked: string;
  webhookSecretMasked: string;
  isActive: boolean;
  isTestMode: boolean;
  currencyInrEnabled: boolean;
  currencyUsdEnabled: boolean;
  autoCapture: boolean;
  updatedAt?: string;
}

export interface UpdateAdminPaymentConfigPayload {
  keyId: string;
  keySecret?: string;
  webhookSecret?: string;
  isActive: boolean;
  isTestMode: boolean;
  currencyInrEnabled: boolean;
  currencyUsdEnabled: boolean;
  autoCapture: boolean;
}

export interface AdminTransactionItem {
  id: string;
  orderId: string;
  paymentId?: string;
  userEmail?: string;
  userName?: string;
  organizationName?: string;
  planId: string;
  billingCycle: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export const paymentsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPublicPaymentConfig: builder.query<PublicPaymentConfig, void>({
      query: () => "/payments/config",
      providesTags: ["Payments"],
    }),

    createSubscriptionOrder: builder.mutation<
      CreateOrderResponse,
      CreateOrderPayload
    >({
      query: (body) => ({
        url: "/payments/create-order",
        method: "POST",
        body,
      }),
    }),

    verifyPayment: builder.mutation<VerifyPaymentResponse, VerifyPaymentPayload>({
      query: (body) => ({
        url: "/payments/verify-payment",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Payments", "Auth", "Pricing", "Admin"],
    }),

    getInvoices: builder.query<InvoiceItem[], void>({
      query: () => "/payments/invoices",
      transformResponse: (response: { invoices?: InvoiceItem[] } | InvoiceItem[]) => {
        if (Array.isArray(response)) return response;
        return response?.invoices || [];
      },
      providesTags: ["Payments"],
    }),

    getAdminPaymentConfig: builder.query<AdminPaymentConfig, void>({
      query: () => "/admin/payments/config",
      providesTags: ["Payments"],
    }),

    updateAdminPaymentConfig: builder.mutation<
      AdminPaymentConfig,
      UpdateAdminPaymentConfigPayload
    >({
      query: (body) => ({
        url: "/admin/payments/config",
        method: "PUT",
        body,
      }),
      transformResponse: (
        response: { config?: AdminPaymentConfig } | AdminPaymentConfig
      ) => {
        if (response && "config" in response && response.config) {
          return response.config;
        }
        return response as AdminPaymentConfig;
      },
      invalidatesTags: ["Payments"],
    }),

    getAdminTransactions: builder.query<AdminTransactionItem[], void>({
      query: () => "/admin/payments/transactions",
      transformResponse: (
        response: { transactions?: AdminTransactionItem[] } | AdminTransactionItem[]
      ) => {
        if (Array.isArray(response)) return response;
        return response?.transactions || [];
      },
      providesTags: ["Payments"],
    }),
  }),
});

export const {
  useGetPublicPaymentConfigQuery,
  useCreateSubscriptionOrderMutation,
  useVerifyPaymentMutation,
  useGetInvoicesQuery,
  useGetAdminPaymentConfigQuery,
  useUpdateAdminPaymentConfigMutation,
  useGetAdminTransactionsQuery,
} = paymentsApi;
