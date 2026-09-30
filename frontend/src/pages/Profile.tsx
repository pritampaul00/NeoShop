import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import keycloak from "../auth/keycloak";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
} from "../services/customerService";
import type {
  Address,
  Customer,
  UpdateCustomerRequest,
} from "../services/customerService";

function Profile() {
  const isAdmin =
    keycloak.hasRealmRole("ADMIN") ||
    keycloak.hasResourceRole("ADMIN", "neoshop");

  const [customer, setCustomer] = useState<Customer | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const token = keycloak.tokenParsed;

        const customerId = token?.sub;
        const email = token?.email;

        /*
         * ADMIN PROFILE
         *
         * Admins do not need a Customer record.
         * Load their basic information directly from Keycloak.
         */
        if (isAdmin) {
          setForm({
            firstName: token?.given_name || "",
            lastName: token?.family_name || "",
            email: email || "",
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "India",
          });

          return;
        }

        /*
         * USER PROFILE
         */

        if (!customerId) {
          throw new Error(
            "Your Keycloak account does not have a user ID."
          );
        }

        if (!email) {
          throw new Error(
            "Your Keycloak account does not have an email address."
          );
        }

        const customers = await getCustomers();

        const foundCustomer = customers.find(
          (item) => item.id === customerId
        );

        /*
         * Existing customer
         */
        if (foundCustomer) {
          setCustomer(foundCustomer);

          setForm({
            firstName: foundCustomer.firstName,
            lastName: foundCustomer.lastName,
            email: foundCustomer.email,
            street: foundCustomer.address?.street || "",
            city: foundCustomer.address?.city || "",
            state: foundCustomer.address?.state || "",
            postalCode:
              foundCustomer.address?.postalCode || "",
            country:
              foundCustomer.address?.country || "India",
          });

          return;
        }

        /*
         * Customer does not exist yet.
         * Create one automatically from Keycloak information.
         */

        const firstName = token?.given_name || "Neo";
        const lastName = token?.family_name || "Shop";

        const newCustomer: UpdateCustomerRequest = {
          id: customerId,
          firstName,
          lastName,
          email,
          address: {
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "India",
          },
        };

        await createCustomer(newCustomer);

        const createdCustomer: Customer = {
          id: customerId,
          firstName,
          lastName,
          email,
          address: {
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "India",
          },
        };

        setCustomer(createdCustomer);

        setForm({
          firstName,
          lastName,
          email,
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "India",
        });
      } catch (err) {
        console.error(err);

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load profile.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isAdmin]);

  const handleChange = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /*
   * Save customer profile
   *
   * This is only used for normal users.
   */
  const handleSave = async () => {
    if (isAdmin) {
      return;
    }

    if (!customer) {
      return;
    }

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.street.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.postalCode.trim() ||
      !form.country.trim()
    ) {
      setError("Please complete all profile fields.");
      setSuccess("");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const address: Address = {
        street: form.street.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        postalCode: form.postalCode.trim(),
        country: form.country.trim(),
      };

      await updateCustomer({
        id: customer.id,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: customer.email,
        address,
      });

      const updatedCustomer: Customer = {
        ...customer,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: customer.email,
        address,
      };

      setCustomer(updatedCustomer);

      setForm({
        firstName: updatedCustomer.firstName,
        lastName: updatedCustomer.lastName,
        email: updatedCustomer.email,
        street:
          updatedCustomer.address?.street || "",
        city:
          updatedCustomer.address?.city || "",
        state:
          updatedCustomer.address?.state || "",
        postalCode:
          updatedCustomer.address?.postalCode || "",
        country:
          updatedCustomer.address?.country || "India",
      });

      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  /*
   * Open Keycloak's password update flow.
   */
  const handleChangePassword = async () => {
    try {
      setError("");
      setSuccess("");

      await keycloak.login({
        action: "UPDATE_PASSWORD",
        redirectUri: `${window.location.origin}/profile`,
      });
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to open password change.");
      }
    }
  };

  if (loading) {
    return (
      <main className="page">
        <div className="loading">
          Loading profile...
        </div>
      </main>
    );
  }

  if (error && !customer && !isAdmin) {
    return (
      <main className="page">
        <div className="error">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="profile-section">
        <div className="section-header">
          <div>
            <p className="section-label">
              MY ACCOUNT
            </p>

            <h1>Profile</h1>

            <p>
              {isAdmin
                ? "Manage your administrator account."
                : "Manage your personal information and saved shipping address."}
            </p>
          </div>
        </div>

        {/* PERSONAL INFORMATION */}

        <div className="profile-card">
          <h2>Personal Information</h2>

          <div className="profile-form">
            <div className="profile-field">
              <label>First Name</label>

              <input
                type="text"
                value={form.firstName}
                readOnly={isAdmin}
                onChange={(event) =>
                  handleChange(
                    "firstName",
                    event.target.value
                  )
                }
              />
            </div>

            <div className="profile-field">
              <label>Last Name</label>

              <input
                type="text"
                value={form.lastName}
                readOnly={isAdmin}
                onChange={(event) =>
                  handleChange(
                    "lastName",
                    event.target.value
                  )
                }
              />
            </div>

            <div className="profile-field profile-full">
              <label>Email</label>

              <input
                type="email"
                value={form.email}
                readOnly
              />
            </div>
          </div>

          {isAdmin && (
            <p className="profile-description">
              Administrator account information is managed
              through Keycloak.
            </p>
          )}
        </div>

        {/* SAVED SHIPPING ADDRESS
            USERS ONLY
        */}

        {!isAdmin && (
          <div className="profile-card">
            <h2>Saved Shipping Address</h2>

            <div className="profile-form">
              <div className="profile-field profile-full">
                <label>Street Address</label>

                <input
                  type="text"
                  value={form.street}
                  onChange={(event) =>
                    handleChange(
                      "street",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="profile-field">
                <label>City</label>

                <input
                  type="text"
                  value={form.city}
                  onChange={(event) =>
                    handleChange(
                      "city",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="profile-field">
                <label>State</label>

                <input
                  type="text"
                  value={form.state}
                  onChange={(event) =>
                    handleChange(
                      "state",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="profile-field">
                <label>Postal Code</label>

                <input
                  type="text"
                  value={form.postalCode}
                  onChange={(event) =>
                    handleChange(
                      "postalCode",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="profile-field">
                <label>Country</label>

                <input
                  type="text"
                  value={form.country}
                  onChange={(event) =>
                    handleChange(
                      "country",
                      event.target.value
                    )
                  }
                />
              </div>
            </div>

            {error && (
              <div className="profile-error">
                {error}
              </div>
            )}

            {success && (
              <div className="profile-success">
                {success}
              </div>
            )}

            <div className="profile-actions">
              <button
                className="checkout-button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

              <Link
                to="/orders"
                className="back-to-orders"
              >
                View My Orders
              </Link>
            </div>
          </div>
        )}

        {/* ADMIN ERROR / SUCCESS */}

        {isAdmin && error && (
          <div className="profile-error">
            {error}
          </div>
        )}

        {isAdmin && success && (
          <div className="profile-success">
            {success}
          </div>
        )}

        {/* CHANGE PASSWORD */}

        <div className="profile-card">
          <h2>Change Password</h2>

          <p className="profile-description">
            Your password is managed securely by
            Keycloak.
          </p>

          <div className="profile-actions">
            <button
              className="checkout-button"
              onClick={handleChangePassword}
            >
              Change Password
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Profile;