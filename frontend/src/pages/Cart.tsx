import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { getProductImage } from "../services/productImage";

function Cart() {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    cartTotal,
    clearCart,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <main className="page">
        <section className="cart-empty">
          <p className="section-label">YOUR CART</p>

          <h1>Your Cart</h1>

          <p>Add some products to get started.</p>

          <Link to="/" className="continue-shopping-button">
            Continue Shopping
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="cart-section">
        <div className="section-header">
          <div>
            <p className="section-label">YOUR CART</p>
            <h2>Shopping Cart</h2>
          </div>

          <button
            className="clear-cart-button"
            onClick={() => {
              if (window.confirm("Remove all items from your cart?")) {
                clearCart();
              }
            }}
          >
            Clear Cart
          </button>
        </div>

        <div className="cart-layout">
          <div className="cart-items">
            {cartItems.map((item) => (
              <article className="cart-item" key={item.id}>
                <div className="cart-item-image">
                  <img
                    src={getProductImage(item.imageUrls, item.name)}
                    alt={item.name}
                  />
                </div>

                <div className="cart-item-info">
                  <p className="product-category">
                    Category {item.categoryId}
                  </p>

                  <h3>{item.name}</h3>

                  <p className="cart-item-price">
                    ${item.price.toFixed(2)}
                  </p>

                  <button
                    className="remove-button"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>

                <div className="quantity-control">
                  <button onClick={() => decreaseQuantity(item.id)}>
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() => increaseQuantity(item.id)}
                    disabled={item.quantity >= item.availableQuantity}
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-total">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </article>
            ))}
          </div>

          <aside className="cart-summary">
            <h3>Order Summary</h3>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>

            <div className="summary-divider" />

            <div className="summary-total">
              <span>Total</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>

            <Link to="/checkout" className="checkout-button">
              Proceed to Checkout
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default Cart;