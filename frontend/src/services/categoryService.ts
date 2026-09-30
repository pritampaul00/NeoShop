import api from "./api";

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface CategoryRequest {
  name: string;
  description: string;
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>(
    "/api/v1/categories"
  );

  return response.data;
};

export const getCategoryName = async (
  categoryId: number
): Promise<string> => {
  const response = await api.get<Category>(
    `/api/v1/categories/${categoryId}`
  );

  return response.data.name;
};

export const createCategory = async (
  category: CategoryRequest
): Promise<number> => {
  const response = await api.post<number>(
    "/api/v1/categories",
    category
  );

  return response.data;
};

export const updateCategory = async (
  categoryId: number,
  category: CategoryRequest
): Promise<Category> => {
  const response = await api.put<Category>(
    `/api/v1/categories/${categoryId}`,
    category
  );

  return response.data;
};

export const deleteCategory = async (
  categoryId: number
): Promise<void> => {
  await api.delete(
    `/api/v1/categories/${categoryId}`
  );
};