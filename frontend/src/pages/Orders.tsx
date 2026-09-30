import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../services/orderService";
import type { Order } from "../services/orderService";
import { getCustomers } from "../services/customerService";
import keycloak from "../auth/keycloak";

function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const email = keycloak.tokenParsed?.email;

                if (!email) {
                    throw new Error("Unable to identify the logged-in user.");
                }

                const customers = await getCustomers();

                const customer = customers.find(
                    (item) =>
                        item.email.toLowerCase() === email.toLowerCase()
                );

                if (!customer) {
                    throw new Error("Customer account not found.");
                }

                const allOrders = await getOrders();

                const customerOrders = allOrders.filter(
                    (order) => order.customerId === customer.id
                );

                setOrders(customerOrders);
            } catch (err) {
                console.error(err);

                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Failed to load orders.");
                }
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, []);

    if (loading) {
        return (
            <main className="page">
                <div className="loading">
                    Loading your orders...
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="page">
                <div className="error">{error}</div>
            </main>
        );
    }

    return (
        <main className="page">
            <section className="orders-section">
                <div className="section-header">
                    <div>
                        <p className="section-label">YOUR ACCOUNT</p>
                        <h2>My Orders</h2>
                    </div>

                    <span className="product-count">
                        {orders.length} orders
                    </span>
                </div>

                {orders.length === 0 ? (
                    <div className="orders-empty">
                        <h3>No orders yet</h3>

                        <p>
                            Your completed orders will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <article
                                className="order-card"
                                key={order.orderId}
                            >
                                <div className="order-header">
                                    <div>
                                        <span className="order-label">
                                            ORDER
                                        </span>

                                        <Link
                                            to={`/orders/${order.orderId}`}
                                            className="order-link"
                                        >
                                            #{order.orderId}
                                        </Link>
                                    </div>

                                    <span className="order-status">
                                        {order.status}
                                    </span>
                                </div>

                                <div className="order-details">
                                    <div>
                                        <span>Reference</span>
                                        <strong>{order.reference}</strong>
                                    </div>

                                    <div>
                                        <span>Payment</span>
                                        <strong>
                                            {order.paymentMethod.replace(
                                                "_",
                                                " "
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Customer</span>
                                        <strong>My Account</strong>
                                    </div>

                                    <div>
                                        <span>Total</span>
                                        <strong>
                                            ₹{order.totalAmount.toFixed(2)}
                                        </strong>
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

export default Orders;