import api from "./api";

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  address?: Address;
}

export interface UpdateCustomerRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  address: Address;
}

export const getCustomers = async (): Promise<Customer[]> => {
  const response = await api.get<Customer[]>(
    "/api/v1/customers"
  );

  return response.data;
};

export const createCustomer = async (
  customer: UpdateCustomerRequest
): Promise<string> => {
  const response = await api.post<string>(
    "/api/v1/customers",
    customer
  );

  return response.data;
};

export const updateCustomer = async (
  customer: UpdateCustomerRequest
): Promise<void> => {
  await api.put(
    "/api/v1/customers",
    customer
  );
};