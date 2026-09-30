import api from "./api";

export interface Review {
  id: string;
  productId: number;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewSummary {
  averageRating: number;
  reviewCount: number;
}

export interface CreateReviewRequest {
  productId: number;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
}

export const getProductReviews = async (
  productId: number
): Promise<Review[]> => {
  const response = await api.get<Review[]>(
    `/api/v1/reviews/product/${productId}`
  );

  return response.data;
};

export const getReviewSummary = async (
  productId: number
): Promise<ReviewSummary> => {
  const response = await api.get<ReviewSummary>(
    `/api/v1/reviews/product/${productId}/summary`
  );

  return response.data;
};

export const createReview = async (
  review: CreateReviewRequest
): Promise<Review> => {
  const response = await api.post<Review>(
    "/api/v1/reviews",
    review
  );

  return response.data;
};

export const deleteReview = async (
  reviewId: string,
  customerId: string
): Promise<void> => {
  await api.delete(`/api/v1/reviews/${reviewId}`, {
    params: {
      customerId,
    },
  });
};

export const hasPurchasedProduct = async (
  customerId: string,
  productId: number
): Promise<boolean> => {
  const response = await api.get<boolean>(
    `/api/v1/order-lines/customer/${customerId}/product/${productId}/purchased`
  );

  return response.data;
};