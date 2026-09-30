import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import keycloak from "../auth/keycloak";
import { getOrderById, cancelOrder } from "../services/orderService";
import type { Order } from "../services/orderService";

function OrderDetails() {
  const { orderId } = useParams();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");

        if (!orderId) {
          throw new Error("Order ID is missing.");
        }

        const data = await getOrderById(Number(orderId));

        setOrder(data);
      } catch (err) {
        console.error(err);

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load order.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!order) {
      return;
    }

    const customerId = keycloak.tokenParsed?.sub;

    if (!customerId) {
      setCancelError("Unable to identify your customer account.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelling(true);
      setCancelError("");
      setCancelSuccess("");

      await cancelOrder(order.orderId, customerId);

      setOrder({
        ...order,
        status: "CANCELLED",
      });

      setCancelSuccess("Order cancelled successfully.");
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setCancelError(err.message);
      } else {
        setCancelError("Failed to cancel the order.");
      }
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <main className="page">
        <div className="loading">Loading order...</div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="page">
        <div className="error">{error || "Order not found."}</div>
      </main>
    );
  }

  const canCancel = order.status === "PENDING" || order.status === "CONFIRMED";

  const formatDate = (date: string | null) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOrderPlaced = !!order.createdDate;
  const isShipped = order.status === "SHIPPED" || order.status === "DELIVERED";

  const isDelivered = order.status === "DELIVERED";

  return (
    <main className="page">
      <section className="order-details-section">
        <Link to="/orders" className="back-to-orders">
          ← Back to My Orders
        </Link>

        <div className="order-details-header">
          <div>
            <p className="section-label">ORDER DETAILS</p>

            <h1>Order #{order.orderId}</h1>
          </div>

          <span className="order-status">{order.status}</span>
        </div>

        <div className="order-details-grid">
          <div className="order-info-card">
            <span>Order Reference</span>
            <strong>{order.reference}</strong>
          </div>

          <div className="order-info-card">
            <span>Payment Method</span>
            <strong>{order.paymentMethod.replace("_", " ")}</strong>
          </div>

          <div className="order-info-card">
            <span>Payment Status</span>
            <strong>{order.paymentStatus || "PENDING"}</strong>
          </div>

          <div className="order-info-card">
            <span>Customer</span>
            <strong>My Account</strong>
          </div>

          <div className="order-info-card">
            <span>Total Amount</span>
            <strong>₹{order.totalAmount.toFixed(2)}</strong>
          </div>
        </div>

        {order.shippingAddress && (
          <div className="order-shipping-address">
            <h3>Shipping Address</h3>

            <p>
              {order.shippingAddress.street}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state}
              <br />
              {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
            </p>
          </div>
        )}

        <div className="order-tracking-card">
          <h2>Order Tracking</h2>

          <div className="tracking-timeline">
            <div
              className={`tracking-step ${isOrderPlaced ? "completed" : ""}`}
            >
              <div className="tracking-icon">{isOrderPlaced ? "✓" : "○"}</div>

              <div className="tracking-content">
                <strong>Order Placed</strong>

                {order.createdDate && (
                  <span>{formatDate(order.createdDate)}</span>
                )}
              </div>
            </div>

            <div className={`tracking-line ${isShipped ? "completed" : ""}`} />

            <div className={`tracking-step ${isShipped ? "completed" : ""}`}>
              <div className="tracking-icon">{isShipped ? "✓" : "○"}</div>

              <div className="tracking-content">
                <strong>Shipped</strong>

                {order.shippedDate && (
                  <span>{formatDate(order.shippedDate)}</span>
                )}
              </div>
            </div>

            <div
              className={`tracking-line ${isDelivered ? "completed" : ""}`}
            />

            <div className={`tracking-step ${isDelivered ? "completed" : ""}`}>
              <div className="tracking-icon">{isDelivered ? "✓" : "○"}</div>

              <div className="tracking-content">
                <strong>Delivered</strong>

                {order.deliveredDate && (
                  <span>{formatDate(order.deliveredDate)}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="order-total-card">
          <span>Order Total</span>

          <strong>₹{order.totalAmount.toFixed(2)}</strong>
        </div>

        {cancelError && <div className="profile-error">{cancelError}</div>}

        {cancelSuccess && (
          <div className="profile-success">{cancelSuccess}</div>
        )}

        {canCancel && (
          <div className="order-cancel-section">
            <button
              className="checkout-button"
              onClick={handleCancelOrder}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default OrderDetails;
