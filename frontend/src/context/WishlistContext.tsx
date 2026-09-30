// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
// } from "react";

// import type { Product } from "../services/productService";
// import keycloak from "../auth/keycloak";

// interface WishlistContextType {
//   wishlistItems: Product[];
//   isWishlisted: (productId: number) => boolean;
//   toggleWishlist: (product: Product) => void;
//   removeFromWishlist: (productId: number) => void;
// }

// const WishlistContext = createContext<
//   WishlistContextType | undefined
// >(undefined);

// export function WishlistProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const isAuthenticated = keycloak.authenticated;
//   const userId = keycloak.tokenParsed?.sub;

//   const storageKey = userId
//     ? `neoshop-wishlist-${userId}`
//     : null;

//   const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

//   /*
//    * Load wishlist only for authenticated users.
//    */
//   useEffect(() => {
//     if (!isAuthenticated || !storageKey) {
//       setWishlistItems([]);
//       return;
//     }

//     const savedWishlist =
//       localStorage.getItem(storageKey);

//     if (!savedWishlist) {
//       setWishlistItems([]);
//       return;
//     }

//     try {
//       const parsedWishlist = JSON.parse(savedWishlist);

//       if (Array.isArray(parsedWishlist)) {
//         setWishlistItems(parsedWishlist);
//       } else {
//         setWishlistItems([]);
//       }
//     } catch {
//       setWishlistItems([]);
//     }
//   }, [isAuthenticated, storageKey]);

//   /*
//    * Save wishlist only for authenticated users.
//    */
//   useEffect(() => {
//     if (!isAuthenticated || !storageKey) {
//       return;
//     }

//     localStorage.setItem(
//       storageKey,
//       JSON.stringify(wishlistItems),
//     );
//   }, [wishlistItems, isAuthenticated, storageKey]);

//   const isWishlisted = (productId: number) => {
//     if (!isAuthenticated) {
//       return false;
//     }

//     return wishlistItems.some(
//       (product) => product.id === productId,
//     );
//   };

//   const toggleWishlist = (product: Product) => {
//     if (!isAuthenticated) {
//       keycloak.login();
//       return;
//     }

//     setWishlistItems((currentItems) => {
//       const exists = currentItems.some(
//         (item) => item.id === product.id,
//       );

//       if (exists) {
//         return currentItems.filter(
//           (item) => item.id !== product.id,
//         );
//       }

//       return [...currentItems, product];
//     });
//   };

//   const removeFromWishlist = (productId: number) => {
//     if (!isAuthenticated) {
//       return;
//     }

//     setWishlistItems((currentItems) =>
//       currentItems.filter(
//         (item) => item.id !== productId,
//       ),
//     );
//   };

//   return (
//     <WishlistContext.Provider
//       value={{
//         wishlistItems,
//         isWishlisted,
//         toggleWishlist,
//         removeFromWishlist,
//       }}
//     >
//       {children}
//     </WishlistContext.Provider>
//   );
// }

// export function useWishlist() {
//   const context = useContext(WishlistContext);

//   if (!context) {
//     throw new Error(
//       "useWishlist must be used inside WishlistProvider",
//     );
//   }

//   return context;
// }

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type { Product } from "../services/productService";
import keycloak from "../auth/keycloak";

interface WishlistContextType {
  wishlistItems: Product[];
  isWishlisted: (productId: number) => boolean;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
}

const WishlistContext = createContext<
  WishlistContextType | undefined
>(undefined);

export function WishlistProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

  const isAuthenticated = keycloak.authenticated;
  const userId = keycloak.tokenParsed?.sub;

  const storageKey = userId
    ? `neoshop-wishlist-${userId}`
    : null;

  useEffect(() => {
    if (!isAuthenticated || !storageKey) {
      setWishlistItems([]);
      return;
    }

    const savedWishlist = localStorage.getItem(storageKey);

    if (!savedWishlist) {
      setWishlistItems([]);
      return;
    }

    try {
      const parsedWishlist = JSON.parse(savedWishlist);

      if (Array.isArray(parsedWishlist)) {
        setWishlistItems(parsedWishlist);
      } else {
        setWishlistItems([]);
      }
    } catch {
      setWishlistItems([]);
    }
  }, [isAuthenticated, storageKey]);

  useEffect(() => {
    if (!isAuthenticated || !storageKey) {
      return;
    }

    localStorage.setItem(
      storageKey,
      JSON.stringify(wishlistItems),
    );
  }, [wishlistItems, isAuthenticated, storageKey]);

  const isWishlisted = (productId: number) => {
    if (!isAuthenticated) {
      return false;
    }

    return wishlistItems.some(
      (product) => product.id === productId,
    );
  };

  const toggleWishlist = (product: Product) => {
    if (!keycloak.authenticated) {
      return;
    }

    setWishlistItems((currentItems) => {
      const exists = currentItems.some(
        (item) => item.id === product.id,
      );

      if (exists) {
        return currentItems.filter(
          (item) => item.id !== product.id,
        );
      }

      return [...currentItems, product];
    });
  };

  const removeFromWishlist = (productId: number) => {
    if (!keycloak.authenticated) {
      return;
    }

    setWishlistItems((currentItems) =>
      currentItems.filter(
        (item) => item.id !== productId,
      ),
    );
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist must be used inside WishlistProvider",
    );
  }

  return context;
}