// import { createContext, useContext, useEffect, useState } from "react";
// import type { ReactNode } from "react";
// import type { Product } from "../services/productService";

// export interface CartItem extends Product {
//   quantity: number;
// }

// interface CartContextType {
//   cartItems: CartItem[];
//   addToCart: (product: Product) => void;
//   removeFromCart: (productId: number) => void;
//   increaseQuantity: (productId: number) => void;
//   decreaseQuantity: (productId: number) => void;
//   clearCart: () => void;
//   cartCount: number;
//   cartTotal: number;
// }

// const CartContext = createContext<CartContextType | undefined>(undefined);

// interface CartProviderProps {
//   children: ReactNode;
// }

// export function CartProvider({ children }: CartProviderProps) {
//   const [cartItems, setCartItems] = useState<CartItem[]>(() => {
//     const savedCart = localStorage.getItem("neoshop-cart");

//     if (!savedCart) {
//       return [];
//     }

//     try {
//       return JSON.parse(savedCart);
//     } catch {
//       return [];
//     }
//   });

//   useEffect(() => {
//     localStorage.setItem(
//       "neoshop-cart",
//       JSON.stringify(cartItems)
//     );
//   }, [cartItems]);

//   const addToCart = (product: Product) => {
//     setCartItems((currentItems) => {
//       const existingItem = currentItems.find(
//         (item) => item.id === product.id
//       );

//       if (existingItem) {
//         if (
//           existingItem.quantity >=
//           product.availableQuantity
//         ) {
//           return currentItems;
//         }

//         return currentItems.map((item) =>
//           item.id === product.id
//             ? {
//               ...item,
//               availableQuantity:
//                 product.availableQuantity,
//               quantity: item.quantity + 1,
//             }
//             : item
//         );
//       }

//       return [
//         ...currentItems,
//         {
//           ...product,
//           quantity: 1,
//         },
//       ];
//     });
//   };

//   const removeFromCart = (productId: number) => {
//     setCartItems((currentItems) =>
//       currentItems.filter((item) => item.id !== productId)
//     );
//   };

//   const increaseQuantity = (productId: number) => {
//     setCartItems((currentItems) =>
//       currentItems.map((item) =>
//         item.id === productId &&
//           item.quantity < item.availableQuantity
//           ? {
//             ...item,
//             quantity: item.quantity + 1,
//           }
//           : item
//       )
//     );
//   };

//   const decreaseQuantity = (productId: number) => {
//     setCartItems((currentItems) =>
//       currentItems
//         .map((item) =>
//           item.id === productId
//             ? { ...item, quantity: item.quantity - 1 }
//             : item
//         )
//         .filter((item) => item.quantity > 0)
//     );
//   };

//   const cartCount = cartItems.reduce(
//     (total, item) => total + item.quantity,
//     0
//   );

//   const cartTotal = cartItems.reduce(
//     (total, item) => total + item.price * item.quantity,
//     0
//   );

//   const clearCart = () => {
//     setCartItems([]);
//   };

//   return (
//     <CartContext.Provider
//       value={{
//         cartItems,
//         addToCart,
//         removeFromCart,
//         increaseQuantity,
//         decreaseQuantity,
//         cartCount,
//         cartTotal,
//         clearCart
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// }

// export function useCart() {
//   const context = useContext(CartContext);

//   if (!context) {
//     throw new Error("useCart must be used inside CartProvider");
//   }

//   return context;
// }

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Product } from "../services/productService";
import keycloak from "../auth/keycloak";

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(
  undefined,
);

interface CartProviderProps {
  children: ReactNode;
}

const GUEST_CART_KEY = "neoshop-cart-guest";

function getCustomerCartKey(userId: string) {
  return `neoshop-cart-${userId}`;
}

function loadCart(key: string): CartItem[] {
  const savedCart = localStorage.getItem(key);

  if (!savedCart) {
    return [];
  }

  try {
    const parsedCart = JSON.parse(savedCart);

    if (Array.isArray(parsedCart)) {
      return parsedCart;
    }

    return [];
  } catch {
    return [];
  }
}

function mergeCarts(
  customerCart: CartItem[],
  guestCart: CartItem[],
): CartItem[] {
  const mergedCart = [...customerCart];

  for (const guestItem of guestCart) {
    const existingItem = mergedCart.find(
      (item) => item.id === guestItem.id,
    );

    if (existingItem) {
      const mergedQuantity =
        existingItem.quantity + guestItem.quantity;

      existingItem.quantity = Math.min(
        mergedQuantity,
        existingItem.availableQuantity,
      );

      existingItem.availableQuantity =
        guestItem.availableQuantity;
    } else {
      mergedCart.push({
        ...guestItem,
      });
    }
  }

  return mergedCart;
}

export function CartProvider({
  children,
}: CartProviderProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [currentUserId, setCurrentUserId] = useState<
    string | null
  >(null);

  /*
   * Detect the currently authenticated Keycloak user.
   */
  useEffect(() => {
    const userId = keycloak.tokenParsed?.sub ?? null;

    setCurrentUserId(userId);
  }, [keycloak.authenticated]);

  /*
   * Load the correct cart whenever the authentication
   * state changes.
   */
  useEffect(() => {
    const userId = keycloak.tokenParsed?.sub;

    /*
     * Guest mode
     */
    if (!keycloak.authenticated || !userId) {
      const guestCart = loadCart(GUEST_CART_KEY);

      setCartItems(guestCart);
      setCurrentUserId(null);

      return;
    }

    /*
     * Customer mode
     */
    const customerCartKey =
      getCustomerCartKey(userId);

    const customerCart = loadCart(customerCartKey);
    const guestCart = loadCart(GUEST_CART_KEY);

    /*
     * Merge guest cart into customer's existing cart.
     */
    if (guestCart.length > 0) {
      const mergedCart = mergeCarts(
        customerCart,
        guestCart,
      );

      localStorage.setItem(
        customerCartKey,
        JSON.stringify(mergedCart),
      );

      /*
       * Guest cart has now been transferred
       * to the customer.
       */
      localStorage.removeItem(GUEST_CART_KEY);

      setCartItems(mergedCart);
    } else {
      setCartItems(customerCart);
    }

    setCurrentUserId(userId);
  }, [keycloak.authenticated]);

  /*
   * Save the current cart to the correct storage key.
   */
  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(
        getCustomerCartKey(currentUserId),
        JSON.stringify(cartItems),
      );
    } else {
      localStorage.setItem(
        GUEST_CART_KEY,
        JSON.stringify(cartItems),
      );
    }
  }, [cartItems, currentUserId]);

  const addToCart = (product: Product) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.id === product.id,
      );

      if (existingItem) {
        if (
          existingItem.quantity >=
          product.availableQuantity
        ) {
          return currentItems;
        }

        return currentItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                availableQuantity:
                  product.availableQuantity,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) => item.id !== productId,
      ),
    );
  };

  const increaseQuantity = (productId: number) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === productId &&
        item.quantity < item.availableQuantity
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  };

  const decreaseQuantity = (productId: number) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const cartTotal = cartItems.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0,
  );

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        cartCount,
        cartTotal,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider",
    );
  }

  return context;
}