import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { getProductImage } from "../services/productImage";

function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();

  const { addToCart } = useCart();

  return (
    <main className="page">
      <section className="wishlist-section">
        <div className="section-header">
          <div>
            <p className="section-label">YOUR SAVED ITEMS</p>

            <h1>Wishlist</h1>
          </div>

          <span className="product-count">{wishlistItems.length} items</span>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="empty-wishlist">
            <div className="empty-wishlist-icon">♡</div>

            <h2>Your wishlist is empty</h2>

            <p>Save products you love and come back to them later.</p>

            <Link to="/" className="continue-shopping-button">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map((product) => (
              <article className="wishlist-card" key={product.id}>
                <div className="wishlist-image">
                  <img
                    src={getProductImage(product.imageUrls, product.name)}
                    alt={product.name}
                  />
                </div>

                <div className="wishlist-content">
                  <p className="product-category">
                    {product.categoryName ?? `Category #${product.categoryId}`}
                  </p>

                  <h3>
                    <Link
                      to={`/products/${product.id}`}
                      className="product-name-link"
                    >
                      {product.name}
                    </Link>
                  </h3>

                  <p className="wishlist-description">{product.description}</p>

                  <div className="wishlist-price">
                    ₹{product.price.toFixed(2)}
                  </div>

                  <p className="wishlist-stock">
                    {product.availableQuantity > 0
                      ? `${product.availableQuantity} available`
                      : "Out of stock"}
                  </p>

                  <div className="wishlist-actions">
                    <button
                      className="wishlist-cart-button"
                      disabled={product.availableQuantity <= 0}
                      onClick={() => {
                        addToCart(product);
                        removeFromWishlist(product.id);
                      }}
                    >
                      Move to Cart
                    </button>

                    <button
                      className="wishlist-remove-button"
                      onClick={() => removeFromWishlist(product.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Wishlist;
