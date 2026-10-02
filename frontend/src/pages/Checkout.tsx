import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import keycloak from "../auth/keycloak";
import {
  getCustomers,
  updateCustomer,
} from "../services/customerService";
import {
  createOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../services/orderService";
import type { PaymentMethod } from "../services/orderService";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("RAZORPAY");

  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  const [loadingAddress, setLoadingAddress] =
    useState(true);

  useEffect(() => {
    if (!keycloak.authenticated) {
      keycloak.login();
    }
  }, []);

  useEffect(() => {
    const loadSavedAddress = async () => {
      if (!keycloak.authenticated) {
        setLoadingAddress(false);
        return;
      }

      try {
        const email = keycloak.tokenParsed?.email;

        if (!email) {
          return;
        }

        const customers = await getCustomers();

        const customer = customers.find(
          (item) =>
            item.email.toLowerCase() ===
            email.toLowerCase()
        );

        if (customer?.address) {
          setAddress({
            street:
              customer.address.street || "",
            city:
              customer.address.city || "",
            state:
              customer.address.state || "",
            postalCode:
              customer.address.postalCode || "",
            country:
              customer.address.country || "India",
          });
        }
      } catch (err) {
        console.error(
          "Failed to load saved address:",
          err
        );
      } finally {
        setLoadingAddress(false);
      }
    };

    if (keycloak.authenticated) {
      loadSavedAddress();
    }
  }, [keycloak.authenticated]);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script =
        document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async (
    orderId: number,
    customer: any
  ) => {
    const scriptLoaded =
      await loadRazorpayScript();

    if (!scriptLoaded) {
      throw new Error(
        "Unable to load Razorpay Checkout."
      );
    }

    const razorpayOrder =
      await createRazorpayOrder(
        cartTotal,
        orderId
      );

    return new Promise<void>((resolve, reject) => {
      const options = {
        key: razorpayOrder.keyId,

        amount: Math.round(
          razorpayOrder.amount * 100
        ),

        currency: razorpayOrder.currency,

        name: "NeoShop",

        description: "NeoShop Order",

        order_id:
          razorpayOrder.razorpayOrderId,

        prefill: {
          name:
            `${customer.firstName} ${customer.lastName}`.trim(),
          email: customer.email,
        },

        notes: {
          neoShopOrderId:
            String(orderId),
        },

        theme: {
          color: "#111827",
        },

        handler: async function (
          response: any
        ) {
          try {
            await verifyRazorpayPayment({
              razorpayOrderId:
                response.razorpay_order_id,

              razorpayPaymentId:
                response.razorpay_payment_id,

              razorpaySignature:
                response.razorpay_signature,

              orderId,
            });

            resolve();
          } catch (err) {
            reject(
              new Error(
                "Payment verification failed."
              )
            );
          }
        },

        modal: {
          ondismiss: function () {
            reject(
              new Error(
                "Payment was cancelled."
              )
            );
          },
        },
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response: any) {
          console.error(
            "Razorpay payment failed:",
            response
          );

          reject(
            new Error(
              "Razorpay payment failed. Please try again."
            )
          );
        }
      );

      razorpay.open();
    });
  };

  const handlePlaceOrder = async () => {
    if (
      !address.street.trim() ||
      !address.city.trim() ||
      !address.state.trim() ||
      !address.postalCode.trim() ||
      !address.country.trim()
    ) {
      setError(
        "Please complete your shipping address."
      );
      return;
    }

    try {
      setPlacingOrder(true);
      setError("");

      const email =
        keycloak.tokenParsed?.email;

      if (!email) {
        throw new Error(
          "Your Keycloak account does not have an email address."
        );
      }

      const customers = await getCustomers();

      const normalizedKeycloakEmail =
        email
          .normalize("NFKC")
          .trim()
          .toLowerCase();

      const customer = customers.find(
        (item) => {
          const normalizedCustomerEmail =
            String(item.email)
              .normalize("NFKC")
              .trim()
              .toLowerCase();

          return (
            normalizedCustomerEmail ===
            normalizedKeycloakEmail
          );
        }
      );

      if (!customer) {
        throw new Error(
          `No customer account found for email: ${email}`
        );
      }

      await updateCustomer({
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        address,
      });

      /*
       * STEP 1
       *
       * Create the NeoShop order.
       */
      const orderId =
        await createOrder({
          reference:
            `NEOSHOP-${Date.now()}`,

          amount: cartTotal,

          paymentMethod,

          customerId: customer.id,

          shippingAddress: address,

          products:
            cartItems.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
            })),
        });

      /*
       * STEP 2
       *
       * Razorpay payment.
       */
      if (paymentMethod === "RAZORPAY") {

        await handleRazorpayPayment(
          orderId,
          customer
        );
      }

      /*
       * STEP 3
       *
       * Payment completed or COD selected.
       */
      clearCart();

      navigate(
        "/order-confirmation",
        {
          state: {
            orderId,
          },
        }
      );

    } catch (err) {

      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Failed to place the order."
        );
      }

    } finally {

      setPlacingOrder(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="page">
        <section className="cart-empty">

          <p className="section-label">
            CHECKOUT
          </p>

          <h1>Your cart is empty</h1>

          <p>
            Add products before proceeding
            to checkout.
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

  if (!keycloak.authenticated) {
    return (
      <main className="page">
        <section className="cart-empty">

          <p className="section-label">
            CHECKOUT
          </p>

          <h1>Login Required</h1>

          <p>
            Please login to continue with
            your order.
          </p>

          <button
            className="checkout-button"
            onClick={() =>
              keycloak.login()
            }
          >
            Login to Continue
          </button>

          <Link
            to="/cart"
            className="continue-shopping-button"
          >
            Back to Cart
          </Link>

        </section>
      </main>
    );
  }

  return (
    <main className="page">

      <section className="checkout-section">

        <div className="section-header">

          <div>

            <p className="section-label">
              CHECKOUT
            </p>

            <h2>
              Complete Your Order
            </h2>

          </div>

        </div>

        <div className="checkout-section">

          <h2>
            Shipping Address
          </h2>

          {loadingAddress && (
            <p>
              Loading your saved address...
            </p>
          )}

          <div className="address-form">

            <input
              type="text"
              placeholder="Street Address"
              value={address.street}
              required
              onChange={(e) =>
                setAddress({
                  ...address,
                  street:
                    e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="City"
              value={address.city}
              required
              onChange={(e) =>
                setAddress({
                  ...address,
                  city:
                    e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="State"
              value={address.state}
              required
              onChange={(e) =>
                setAddress({
                  ...address,
                  state:
                    e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Postal Code"
              value={address.postalCode}
              required
              onChange={(e) =>
                setAddress({
                  ...address,
                  postalCode:
                    e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Country"
              value={address.country}
              required
              onChange={(e) =>
                setAddress({
                  ...address,
                  country:
                    e.target.value,
                })
              }
            />

          </div>

        </div>

        <div className="checkout-layout">

          <div className="checkout-form">

            <div className="checkout-card">

              <h3>
                Payment Method
              </h3>

              <label className="payment-option">

                <input
                  type="radio"
                  value="RAZORPAY"
                  checked={
                    paymentMethod ===
                    "RAZORPAY"
                  }
                  onChange={(event) =>
                    setPaymentMethod(
                      event.target
                        .value as PaymentMethod
                    )
                  }
                />

                <span>
                  Razorpay
                </span>

              </label>

              <label className="payment-option">

                <input
                  type="radio"
                  value="COD"
                  checked={
                    paymentMethod === "COD"
                  }
                  onChange={(event) =>
                    setPaymentMethod(
                      event.target
                        .value as PaymentMethod
                    )
                  }
                />

                <span>
                  Cash on Delivery
                </span>

              </label>

              {paymentMethod ===
                "RAZORPAY" && (
                <div className="payment-info">

                  <p>
                    Pay securely using
                    Razorpay.
                  </p>

                  <small>
                    Credit / Debit Card,
                    UPI, Net Banking,
                    Wallets and EMI
                    are available.
                  </small>

                </div>
              )}

              {paymentMethod === "COD" && (
                <div className="payment-info">

                  <p>
                    Pay when your order
                    is delivered.
                  </p>

                </div>
              )}

            </div>

          </div>

          <aside className="checkout-summary">

            <h3>
              Order Summary
            </h3>

            {cartItems.map((item) => (

              <div
                className="checkout-item"
                key={item.id}
              >

                <div>

                  <span>
                    {item.name}
                  </span>

                  <small>
                    {item.quantity} × ₹ 
                    {item.price.toFixed(2)}
                  </small>

                </div>

                <strong>
                  ₹ 
                  {(
                    item.price *
                    item.quantity
                  ).toFixed(2)}
                </strong>

              </div>

            ))}

            <div className="summary-divider" />

            <div className="summary-total">

              <span>
                Total
              </span>

              <span>
                ₹ {cartTotal.toFixed(2)}
              </span>

            </div>

            {error && (
              <div className="checkout-error">
                {error}
              </div>
            )}

            <button
              className="checkout-button"
              onClick={handlePlaceOrder}
              disabled={placingOrder}
            >
              {placingOrder
                ? "Processing..."
                : paymentMethod ===
                  "RAZORPAY"
                ? "Pay with Razorpay"
                : "Place COD Order"}
            </button>

            <Link
              to="/cart"
              className="back-to-cart"
            >
              ← Back to Cart
            </Link>

          </aside>

        </div>

      </section>

    </main>
  );
}

export default Checkout;