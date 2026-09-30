import api from "./api";

export type PaymentMethod =
  | "RAZORPAY"
  | "COD";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED";

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  orderId: number;
  reference: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  paymentStatus: PaymentStatus | null;
  customerId: string;
  shippingAddress: ShippingAddress;
  createdDate: string;
  shippedDate: string | null;
  outForDeliveryDate: string | null;
  deliveredDate: string | null;
}

export interface OrderProduct {
  productId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  reference: string;
  amount: number;
  paymentMethod: PaymentMethod;
  customerId: string;
  shippingAddress: ShippingAddress;
  products: OrderProduct[];
}

export interface RazorpayOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface RazorpayPaymentVerificationRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  orderId: number;
}

export const createOrder = async (
  order: CreateOrderRequest
): Promise<number> => {
  const response = await api.post<number>(
    "/api/v1/orders",
    order
  );

  return response.data;
};

export const createRazorpayOrder = async (
  amount: number,
  orderId: number
): Promise<RazorpayOrderResponse> => {
  const response =
    await api.post<RazorpayOrderResponse>(
      "/api/v1/payments/razorpay/order",
      {
        amount,
        orderId,
      }
    );

  return response.data;
};

export const verifyRazorpayPayment = async (
  request: RazorpayPaymentVerificationRequest
): Promise<void> => {
  await api.post(
    "/api/v1/payments/razorpay/verify",
    request
  );
};

export const getOrders = async (): Promise<Order[]> => {
  const response = await api.get<Order[]>(
    "/api/v1/orders"
  );

  return response.data;
};

export const getOrderById = async (
  orderId: number
): Promise<Order> => {
  const response = await api.get<Order>(
    `/api/v1/orders/${orderId}`
  );

  return response.data;
};

export const cancelOrder = async (
  orderId: number,
  customerId: string
): Promise<void> => {
  await api.patch(
    `/api/v1/orders/${orderId}/cancel`,
    null,
    {
      params: {
        customerId,
      },
    }
  );
};