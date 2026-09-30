import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";

import Products from "./pages/Products";
import Cart from "./pages/Cart";
import keycloak from "./auth/keycloak";
import { useCart } from "./context/CartContext";
import { useWishlist } from "./context/WishlistContext";

import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrderDetails from "./pages/AdminOrderDetails";

function App() {
  const username = keycloak.tokenParsed?.preferred_username;

  const { cartCount } = useCart();
  const { wishlistItems } = useWishlist();

  const isAuthenticated = keycloak.authenticated;

  const isAdmin =
    keycloak.hasRealmRole("ADMIN") ||
    keycloak.hasResourceRole("ADMIN", "neoshop");

  return (
    <BrowserRouter>
      <header className="navbar">
        <div className="navbar-inner">
          <Link to={isAdmin ? "/admin" : "/"} className="logo">
            NeoShop
          </Link>

          {!isAdmin && (
            <nav className="nav-links">
              <Link to="/">Products</Link>

              {isAuthenticated && (
                <>
                  <Link to="/orders">
                    My Orders
                  </Link>

                  <Link to="/wishlist">
                    Wishlist ({wishlistItems.length})
                  </Link>
                </>
              )}

              <Link to="/cart">
                Cart ({cartCount})
              </Link>

              {isAuthenticated && (
                <Link to="/profile">
                  Profile
                </Link>
              )}
            </nav>
          )}

          <div className="user-section">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    to="/profile"
                    className="profile-link"
                  >
                    Profile
                  </Link>
                )}

                <span>Hi, {username}</span>

                <button
                  className="logout-button"
                  onClick={() => keycloak.logout()}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <span>Hi, Guest</span>

                <button
                  className="logout-button"
                  onClick={() => keycloak.login()}
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <Routes>
        {/* Public routes */}

        <Route
          path="/"
          element={
            isAdmin ? (
              <Navigate to="/admin" replace />
            ) : (
              <Products />
            )
          }
        />

        <Route
          path="/products/:productId"
          element={
            isAdmin ? (
              <Navigate to="/admin" replace />
            ) : (
              <ProductDetails />
            )
          }
        />

        {/* Cart is public */}

        <Route
          path="/cart"
          element={
            isAdmin ? (
              <Navigate to="/admin" replace />
            ) : (
              <Cart />
            )
          }
        />

        {/* Checkout requires authentication */}

        <Route
          path="/checkout"
          element={
            !isAuthenticated ? (
              <Navigate to="/cart" replace />
            ) : isAdmin ? (
              <Navigate to="/admin" replace />
            ) : (
              <Checkout />
            )
          }
        />

        {/* Order confirmation requires authentication */}

        <Route
          path="/order-confirmation"
          element={
            !isAuthenticated ? (
              <Navigate to="/" replace />
            ) : isAdmin ? (
              <Navigate to="/admin" replace />
            ) : (
              <OrderConfirmation />
            )
          }
        />

        {/* Orders require authentication */}

        <Route
          path="/orders"
          element={
            !isAuthenticated ? (
              <Navigate to="/" replace />
            ) : isAdmin ? (
              <Navigate to="/admin" replace />
            ) : (
              <Orders />
            )
          }
        />

        <Route
          path="/orders/:orderId"
          element={
            !isAuthenticated ? (
              <Navigate to="/" replace />
            ) : isAdmin ? (
              <Navigate to="/admin" replace />
            ) : (
              <OrderDetails />
            )
          }
        />

        {/* Wishlist requires authentication */}

        <Route
          path="/wishlist"
          element={
            !isAuthenticated ? (
              <Navigate to="/" replace />
            ) : isAdmin ? (
              <Navigate to="/admin" replace />
            ) : (
              <Wishlist />
            )
          }
        />

        {/* Profile requires authentication */}

        <Route
          path="/profile"
          element={
            !isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Profile />
            )
          }
        />

        {/* Admin */}

        <Route
          path="/admin"
          element={
            isAdmin ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/admin/orders/:orderId"
          element={
            isAdmin ? (
              <AdminOrderDetails />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Unknown route */}

        <Route
          path="*"
          element={
            <Navigate
              to={isAdmin ? "/admin" : "/"}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;