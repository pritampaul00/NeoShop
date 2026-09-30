import { Link, useLocation } from "react-router-dom";

interface OrderConfirmationState {
  orderId?: number;
}

function OrderConfirmation() {
  const location = useLocation();

  const state = location.state as OrderConfirmationState | null;

  const orderId = state?.orderId;

  return (
    <main className="page">
      <section className="confirmation-section">
        <div className="confirmation-icon">✓</div>

        <p className="section-label">ORDER CONFIRMED</p>

        <h1>Thank you for your order!</h1>

        <p className="confirmation-message">
          Your order has been successfully placed.
          We are getting everything ready for you.
        </p>

        <div className="confirmation-card">
          <span>Order ID</span>

          <strong>
            {orderId ? `#${orderId}` : "Confirmed"}
          </strong>
        </div>

        <p className="confirmation-message">
          A confirmation email will be sent to your registered
          email address.
        </p>

        <Link
          to="/"
          className="continue-shopping-button"
        >
          Continue Shopping
        </Link>
      </section>
    </main>
  );
}

export default OrderConfirmation;