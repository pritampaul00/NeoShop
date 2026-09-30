import api from "./api";

export interface Product {
  id: number;
  name: string;
  description: string;
  availableQuantity: number;
  price: number;
  categoryId: number;
  categoryName?: string;
  categoryDescription?: string;
  imageUrls?: string[];
}

export interface ProductRequest {
  name: string;
  description: string;
  availableQuantity: number;
  price: number;
  categoryId: number;
}

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>("/api/v1/products");
  return response.data;
};

export const getProductById = async (productId: number): Promise<Product> => {
  const response = await api.get<Product>(`/api/v1/products/${productId}`);
  return response.data;
};

export const createProduct = async (
  product: ProductRequest,
): Promise<number> => {
  const response = await api.post<number>("/api/v1/products", product);

  return response.data;
};

export const updateProduct = async (
  productId: number,
  product: ProductRequest,
): Promise<Product> => {
  const response = await api.put<Product>(
    `/api/v1/products/${productId}`,
    product,
  );

  return response.data;
};

export const updateProductStock = async (
  productId: number,
  quantity: number,
): Promise<Product> => {
  const response = await api.patch<Product>(
    `/api/v1/products/${productId}/stock`,
    null,
    {
      params: {
        quantity,
      },
    },
  );

  return response.data;
};

export const deleteProduct = async (productId: number): Promise<void> => {
  await api.delete(`/api/v1/products/${productId}`);
};

export const uploadProductImages = async (
  productId: number,
  images: File[],
): Promise<string[]> => {
  const formData = new FormData();

  images.forEach((image) => {
    formData.append("images", image);
  });

  const response = await api.post<string[]>(
    `/api/v1/products/${productId}/images`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};
