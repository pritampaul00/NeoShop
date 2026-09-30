import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import keycloak from "../auth/keycloak";
import {
  getOrderById,
} from "../services/orderService";
import type { Order } from "../services/orderService";

function AdminOrderDetails() {
  const { orderId } = useParams();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdmin =
    keycloak.hasRealmRole("ADMIN") ||
    keycloak.hasResourceRole("ADMIN", "neoshop");

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

  if (!isAdmin) {
    return (
      <main className="page">
        <div className="error">
          Admin access required.
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="page">
        <div className="loading">
          Loading order...
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="page">
        <div className="error">
          {error || "Order not found."}
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="order-details-section">

        <Link
          to="/admin"
          className="back-to-orders"
        >
          ← Back to Admin Dashboard
        </Link>

        <div className="order-details-header">
          <div>
            <p className="section-label">
              ADMIN ORDER DETAILS
            </p>

            <h1>Order #{order.orderId}</h1>
          </div>

          <span className="order-status">
            {order.status}
          </span>
        </div>

        <div className="order-details-grid">

          <div className="order-info-card">
            <span>Order Reference</span>
            <strong>
              {order.reference}
            </strong>
          </div>

          <div className="order-info-card">
            <span>Payment Method</span>
            <strong>
              {order.paymentMethod.replace("_", " ")}
            </strong>
          </div>

          <div className="order-info-card">
            <span>Payment Status</span>
            <strong>
              {order.paymentStatus}
            </strong>
          </div>

          <div className="order-info-card">
            <span>Customer ID</span>
            <strong>
              {order.customerId}
            </strong>
          </div>

          <div className="order-info-card">
            <span>Order Status</span>
            <strong>
              {order.status}
            </strong>
          </div>

          <div className="order-info-card">
            <span>Total Amount</span>
            <strong>
              ${Number(order.totalAmount).toFixed(2)}
            </strong>
          </div>

        </div>

        {order.shippingAddress && (
          <div className="order-shipping-address">
            <h3>Shipping Address</h3>

            <p>
              {order.shippingAddress.street}
              <br />

              {order.shippingAddress.city},{" "}
              {order.shippingAddress.state}

              <br />

              {order.shippingAddress.postalCode}

              <br />

              {order.shippingAddress.country}
            </p>
          </div>
        )}

        <div className="order-total-card">
          <span>Order Total</span>

          <strong>
            ${Number(order.totalAmount).toFixed(2)}
          </strong>
        </div>

      </section>
    </main>
  );
}

export default AdminOrderDetails;