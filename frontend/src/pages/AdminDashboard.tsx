import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import keycloak from "../auth/keycloak";

import { getCustomers, type Customer } from "../services/customerService";

import { getOrders, type Order } from "../services/orderService";

import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  updateProductStock,
  uploadProductImages,
  type Product,
  type ProductRequest,
} from "../services/productService";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
  type CategoryRequest,
} from "../services/categoryService";

import "./AdminDashboard.css";

type AdminTab =
  | "overview"
  | "products"
  | "categories"
  | "orders"
  | "customers";

function AdminDashboard() {
  const [tab, setTab] = useState<AdminTab>("overview");

  const [products, setProducts] = useState<Product[]>([]);

  const [orders, setOrders] = useState<Order[]>([]);

  const [customers, setCustomers] = useState<Customer[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);

  const [categorySearch, setCategorySearch] = useState("");

  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [savingCategory, setSavingCategory] = useState(false);

  const [categoryError, setCategoryError] = useState("");

  const [categoryForm, setCategoryForm] =
    useState<CategoryRequest>({
      name: "",
      description: "",
    });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const isAdmin =
    keycloak.hasRealmRole("ADMIN") ||
    keycloak.hasResourceRole("ADMIN", "neoshop");

  const [showProductForm, setShowProductForm] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [savingProduct, setSavingProduct] = useState(false);

  const [productError, setProductError] = useState("");

  const [productForm, setProductForm] =
    useState<ProductRequest>({
      name: "",
      description: "",
      availableQuantity: 0,
      price: 0,
      categoryId: 0,
    });

  const [selectedImages, setSelectedImages] =
    useState<File[]>([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState<number | "all">("all");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          productData,
          orderData,
          customerData,
          categoryData,
        ] = await Promise.all([
          getProducts(),
          getOrders(),
          getCustomers(),
          getCategories(),
        ]);

        setProducts(productData);
        setOrders(orderData);
        setCustomers(customerData);
        setCategories(categoryData);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load admin dashboard.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const refreshProducts = async () => {
    const productData = await getProducts();

    setProducts(productData);
  };

  const revenue = useMemo(
    () =>
      orders
        .filter((order) => order.status !== "CANCELLED")
        .reduce(
          (sum, order) =>
            sum + Number(order.totalAmount || 0),
          0,
        ),
    [orders],
  );

  const pendingOrders = orders.filter(
    (order) => order.status === "PENDING",
  ).length;

  const cancelledOrders = orders.filter(
    (order) => order.status === "CANCELLED",
  ).length;

  const lowStockProducts = products.filter(
    (product) => product.availableQuantity <= 5,
  ).length;

  const filteredProducts = useMemo(() => {
    const normalizedSearch =
      searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        product.description
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(product.id).includes(normalizedSearch) ||
        (product.categoryName ?? "")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesCategory =
        selectedCategory === "all" ||
        product.categoryId === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const filteredCategories = useMemo(() => {
    const normalizedSearch =
      categorySearch.trim().toLowerCase();

    return categories.filter((category) => {
      if (!normalizedSearch) {
        return true;
      }

      return (
        category.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        category.description
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(category.id).includes(normalizedSearch)
      );
    });
  }, [categories, categorySearch]);

  const openAddCategory = () => {
    setEditingCategory(null);

    setCategoryForm({
      name: "",
      description: "",
    });

    setCategoryError("");
    setShowCategoryForm(true);
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);

    setCategoryForm({
      name: category.name,
      description: category.description,
    });

    setCategoryError("");
    setShowCategoryForm(true);
  };

  const closeCategoryForm = () => {
    if (savingCategory) {
      return;
    }

    setShowCategoryForm(false);
    setEditingCategory(null);
    setCategoryError("");
  };

  const refreshCategories = async () => {
    const categoryData = await getCategories();

    setCategories(categoryData);
  };

  const handleSaveCategory = async () => {
    const name = categoryForm.name.trim();

    const description = categoryForm.description.trim();

    if (!name) {
      setCategoryError("Category name is required.");
      return;
    }

    if (!description) {
      setCategoryError(
        "Category description is required.",
      );
      return;
    }

    try {
      setSavingCategory(true);
      setCategoryError("");

      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name,
          description,
        });
      } else {
        await createCategory({
          name,
          description,
        });
      }

      await refreshCategories();

      setShowCategoryForm(false);
      setEditingCategory(null);
      setCategoryError("");
    } catch (err) {
      console.error(err);

      setCategoryError(
        err instanceof Error
          ? err.message
          : "Failed to save category.",
      );
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (
    category: Category,
  ) => {
    const productCount = products.filter(
      (product) => product.categoryId === category.id,
    ).length;

    if (productCount > 0) {
      window.alert(
        `Cannot delete "${category.name}" because it has ${productCount} product${
          productCount === 1 ? "" : "s"
        } assigned to it.`,
      );

      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteCategory(category.id);

      await refreshCategories();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete category.",
      );
    }
  };

  const openAddProduct = () => {
    setEditingProduct(null);

    setProductForm({
      name: "",
      description: "",
      availableQuantity: 0,
      price: 0,
      categoryId: 0,
    });

    setProductError("");
    setSelectedImages([]);
    setShowProductForm(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);

    setProductForm({
      name: product.name,
      description: product.description,
      availableQuantity: product.availableQuantity,
      price: Number(product.price),
      categoryId: product.categoryId,
    });

    setProductError("");
    setSelectedImages([]);
    setShowProductForm(true);
  };

  const closeProductForm = () => {
    if (savingProduct) {
      return;
    }

    setShowProductForm(false);
    setEditingProduct(null);
    setProductError("");
    setSelectedImages([]);
  };

  const handleSaveProduct = async () => {
    const name = productForm.name.trim();

    const description =
      productForm.description.trim();

    if (!name) {
      setProductError("Product name is required.");
      return;
    }

    if (!description) {
      setProductError(
        "Product description is required.",
      );
      return;
    }

    if (
      !Number.isFinite(
        productForm.availableQuantity,
      ) ||
      productForm.availableQuantity < 0
    ) {
      setProductError("Stock cannot be negative.");
      return;
    }

    if (
      !Number.isFinite(productForm.price) ||
      productForm.price <= 0
    ) {
      setProductError(
        "Price must be greater than zero.",
      );
      return;
    }

    if (
      !Number.isInteger(productForm.categoryId) ||
      productForm.categoryId <= 0
    ) {
      setProductError("Please select a category.");
      return;
    }

    const request: ProductRequest = {
      name,
      description,
      availableQuantity:
        productForm.availableQuantity,
      price: productForm.price,
      categoryId: productForm.categoryId,
    };

    try {
      setSavingProduct(true);
      setProductError("");

      let productId: number;

      if (editingProduct) {
        await updateProduct(
          editingProduct.id,
          request,
        );

        productId = editingProduct.id;
      } else {
        productId = await createProduct(request);
      }

      if (selectedImages.length > 0) {
        await uploadProductImages(
          productId,
          selectedImages,
        );
      }

      await refreshProducts();

      setShowProductForm(false);
      setEditingProduct(null);
      setSelectedImages([]);
      setProductError("");
    } catch (err) {
      console.error(err);

      setProductError(
        err instanceof Error
          ? err.message
          : "Failed to save product.",
      );
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (
    productId: number,
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteProduct(productId);

      await refreshProducts();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete product.",
      );
    }
  };

  const handleStockUpdate = async (
    productId: number,
    currentStock: number,
  ) => {
    const value = window.prompt(
      "Enter the new stock quantity:",
      String(currentStock),
    );

    if (value === null) {
      return;
    }

    const quantity = Number(value);

    if (
      !Number.isFinite(quantity) ||
      quantity < 0
    ) {
      window.alert(
        "Please enter a valid stock quantity.",
      );
      return;
    }

    try {
      setError("");

      await updateProductStock(
        productId,
        quantity,
      );

      await refreshProducts();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update stock.",
      );
    }
  };

  const openOrderDetails = (orderId: number) => {
    window.location.href = `/admin/orders/${orderId}`;
  };

  if (!isAdmin) {
    return (
      <main className="admin-page">
        <section className="admin-access-denied">
          <p className="admin-eyebrow">
            ADMIN AREA
          </p>

          <h1>Admin access required</h1>

          <p>
            Your Keycloak account does not have the
            ADMIN role.
          </p>

          <button
            type="button"
            className="admin-store-link"
            onClick={() => keycloak.logout()}
          >
            Logout
          </button>
        </section>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-loading">
          Loading dashboard...
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <span className="admin-brand-mark">
              N
            </span>

            <div>
              <strong>NeoShop</strong>

              <span>Admin Console</span>
            </div>
          </div>

          <nav className="admin-nav">
            {[
              ["overview", "Overview"],
              ["products", "Products"],
              ["categories", "Categories"],
              ["orders", "Orders"],
              ["customers", "Customers"],
            ].map(([value, label]) => (
              <button
                key={value}
                className={
                  tab === value ? "active" : ""
                }
                onClick={() =>
                  setTab(value as AdminTab)
                }
              >
                {label}
              </button>
            ))}
          </nav>

          <Link
            to="/"
            className="admin-store-link"
          >
            ← Back to Store
          </Link>
        </aside>

        <section className="admin-content">
          <header className="admin-header">
            <div>
              <p className="admin-eyebrow">
                ADMINISTRATION
              </p>

              <h1>
                {tab === "overview"
                  ? "Dashboard"
                  : tab[0].toUpperCase() +
                    tab.slice(1)}
              </h1>

              <p className="admin-subtitle">
                Manage your NeoShop store from one
                place.
              </p>
            </div>

            <div className="admin-user">
              <span>Administrator</span>

              <small>
                {keycloak.tokenParsed
                  ?.preferred_username ?? "Admin"}
              </small>
            </div>
          </header>

          {error && (
            <div className="admin-error">
              {error}
            </div>
          )}

          {tab === "overview" && (
            <>
              <div className="admin-stat-grid">
                <article className="admin-stat-card">
                  <span>Total Revenue</span>

                  <strong>
                    ₹{revenue.toFixed(2)}
                  </strong>

                  <small>
                    From non-cancelled orders
                  </small>
                </article>

                <article className="admin-stat-card">
                  <span>Total Orders</span>

                  <strong>
                    {orders.length}
                  </strong>

                  <small>
                    {pendingOrders} currently pending
                  </small>
                </article>

                <article className="admin-stat-card">
                  <span>Products</span>

                  <strong>
                    {products.length}
                  </strong>

                  <small>
                    {lowStockProducts} low-stock
                    items
                  </small>
                </article>

                <article className="admin-stat-card">
                  <span>Customers</span>

                  <strong>
                    {customers.length}
                  </strong>

                  <small>
                    Registered customer accounts
                  </small>
                </article>
              </div>

              <div className="admin-two-column">
                <section className="admin-panel">
                  <div className="admin-panel-header">
                    <div>
                      <p className="admin-eyebrow">
                        ORDERS
                      </p>

                      <h2>Recent Orders</h2>
                    </div>

                    <button
                      onClick={() =>
                        setTab("orders")
                      }
                    >
                      View all
                    </button>
                  </div>

                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Order</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {orders
                          .slice(0, 6)
                          .map((order) => (
                            <tr
                              key={order.orderId}
                              onClick={() =>
                                openOrderDetails(
                                  order.orderId,
                                )
                              }
                              style={{
                                cursor: "pointer",
                              }}
                            >
                              <td>
                                #{order.orderId}
                              </td>

                              <td>
                                ₹
                                {Number(
                                  order.totalAmount,
                                ).toFixed(2)}
                              </td>

                              <td>
                                <span className="admin-status">
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="admin-panel">
                  <div className="admin-panel-header">
                    <div>
                      <p className="admin-eyebrow">
                        INVENTORY
                      </p>

                      <h2>Low Stock</h2>
                    </div>

                    <button
                      onClick={() =>
                        setTab("products")
                      }
                    >
                      Manage
                    </button>
                  </div>

                  <div className="admin-stock-list">
                    {products
                      .filter(
                        (product) =>
                          product.availableQuantity <=
                          5,
                      )
                      .slice(0, 6)
                      .map((product) => (
                        <div
                          className="admin-stock-row"
                          key={product.id}
                        >
                          <div>
                            <strong>
                              {product.name}
                            </strong>

                            <span>
                              Product #{product.id}
                            </span>
                          </div>

                          <b>
                            {product.availableQuantity}{" "}
                            left
                          </b>
                        </div>
                      ))}

                    {lowStockProducts === 0 && (
                      <div className="admin-empty">
                        Inventory levels look
                        healthy.
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </>
          )}

          {tab === "products" && (
            <section className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <p className="admin-eyebrow">
                    CATALOG
                  </p>

                  <h2>Product Inventory</h2>
                </div>

                <div className="admin-product-header-actions">
                  <span className="admin-count">
                    {filteredProducts.length} of{" "}
                    {products.length} products
                  </span>

                  <button
                    className="admin-primary-button"
                    onClick={openAddProduct}
                  >
                    + Add Product
                  </button>
                </div>
              </div>

              <div className="admin-product-filters">
                <div className="admin-search-box">
                  <input
                    type="search"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(
                        event.target.value,
                      )
                    }
                  />
                </div>

                <div className="admin-category-filter">
                  <select
                    value={selectedCategory}
                    onChange={(event) => {
                      const value =
                        event.target.value;

                      setSelectedCategory(
                        value === "all"
                          ? "all"
                          : Number(value),
                      );
                    }}
                  >
                    <option value="all">
                      All Categories
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                {(searchTerm ||
                  selectedCategory !== "all") && (
                  <button
                    className="admin-secondary-button"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory(
                        "all",
                      );
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map(
                      (product) => (
                        <tr key={product.id}>
                          <td>
                            #{product.id}
                          </td>

                          <td>
                            <strong>
                              {product.name}
                            </strong>

                            <small>
                              {product.description}
                            </small>
                          </td>

                          <td>
                            {product.categoryName ??
                              product.categoryId}
                          </td>

                          <td>
                            ₹
                            {Number(
                              product.price,
                            ).toFixed(2)}
                          </td>

                          <td>
                            <span
                              className={
                                product.availableQuantity <=
                                5
                                  ? "admin-stock low"
                                  : "admin-stock"
                              }
                            >
                              {
                                product.availableQuantity
                              }
                            </span>
                          </td>

                          <td>
                            <div className="product-actions">
                              <button
                                className="admin-secondary-button"
                                onClick={() =>
                                  openEditProduct(
                                    product,
                                  )
                                }
                              >
                                Edit
                              </button>

                              <button
                                className="admin-secondary-button"
                                onClick={() =>
                                  handleStockUpdate(
                                    product.id,
                                    product.availableQuantity,
                                  )
                                }
                              >
                                Stock
                              </button>

                              <button
                                className="admin-danger-button"
                                onClick={() =>
                                  handleDeleteProduct(
                                    product.id,
                                  )
                                }
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ),
                    )}

                    {filteredProducts.length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="admin-empty"
                        >
                          {searchTerm ||
                          selectedCategory !==
                            "all"
                            ? "No products match your filters."
                            : "No products found."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === "categories" && (
            <section className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <p className="admin-eyebrow">
                    CATALOG
                  </p>

                  <h2>Product Categories</h2>
                </div>

                <div className="admin-product-header-actions">
                  <span className="admin-count">
                    {filteredCategories.length}{" "}
                    of {categories.length}{" "}
                    categories
                  </span>

                  <button
                    className="admin-primary-button"
                    onClick={openAddCategory}
                  >
                    + Add Category
                  </button>
                </div>
              </div>

              <div className="admin-product-filters">
                <div className="admin-search-box">
                  <input
                    type="search"
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(event) =>
                      setCategorySearch(
                        event.target.value,
                      )
                    }
                  />
                </div>

                {categorySearch && (
                  <button
                    className="admin-secondary-button"
                    onClick={() =>
                      setCategorySearch("")
                    }
                  >
                    Clear Search
                  </button>
                )}
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Products</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCategories.map(
                      (category) => {
                        const productCount =
                          products.filter(
                            (product) =>
                              product.categoryId ===
                              category.id,
                          ).length;

                        return (
                          <tr
                            key={category.id}
                          >
                            <td>
                              #{category.id}
                            </td>

                            <td>
                              <strong>
                                {category.name}
                              </strong>
                            </td>

                            <td>
                              {
                                category.description
                              }
                            </td>

                            <td>
                              <span className="admin-count">
                                {productCount}
                              </span>
                            </td>

                            <td>
                              <div className="product-actions">
                                <button
                                  className="admin-secondary-button"
                                  onClick={() =>
                                    openEditCategory(
                                      category,
                                    )
                                  }
                                >
                                  Edit
                                </button>

                                <button
                                  className="admin-danger-button"
                                  onClick={() =>
                                    handleDeleteCategory(
                                      category,
                                    )
                                  }
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      },
                    )}

                    {filteredCategories.length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="admin-empty"
                        >
                          {categorySearch
                            ? "No categories match your search."
                            : "No categories found."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === "orders" && (
            <section className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <p className="admin-eyebrow">
                    SALES
                  </p>

                  <h2>All Orders</h2>
                </div>

                <span className="admin-count">
                  {cancelledOrders} cancelled
                </span>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Reference</th>
                      <th>Customer</th>
                      <th>Payment</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.orderId}
                        onClick={() =>
                          openOrderDetails(
                            order.orderId,
                          )
                        }
                        style={{
                          cursor: "pointer",
                        }}
                      >
                        <td>
                          #{order.orderId}
                        </td>

                        <td>
                          {order.reference}
                        </td>

                        <td>
                          {order.customerId}
                        </td>

                        <td>
                          {order.paymentMethod.replace(
                            "_",
                            " ",
                          )}
                        </td>

                        <td>
                          ₹
                          {Number(
                            order.totalAmount,
                          ).toFixed(2)}
                        </td>

                        <td>
                          <span className="admin-status">
                            {order.status ??
                              "CONFIRMED"}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {orders.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="admin-empty"
                        >
                          No orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === "customers" && (
            <section className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <p className="admin-eyebrow">
                    CUSTOMERS
                  </p>

                  <h2>Customer Accounts</h2>
                </div>

                <span className="admin-count">
                  {customers.length} customers
                </span>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Email</th>
                      <th>Customer ID</th>
                    </tr>
                  </thead>

                  <tbody>
                    {customers.map(
                      (customer) => (
                        <tr
                          key={customer.id}
                        >
                          <td>
                            <strong>
                              {
                                customer.firstName
                              }{" "}
                              {
                                customer.lastName
                              }
                            </strong>
                          </td>

                          <td>
                            {customer.email}
                          </td>

                          <td>
                            {customer.id}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </section>
      </div>

      {showProductForm && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <div>
                <p className="section-label">
                  {editingProduct
                    ? "EDIT PRODUCT"
                    : "NEW PRODUCT"}
                </p>

                <h2>
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h2>
              </div>

              <button
                className="admin-modal-close"
                onClick={closeProductForm}
                disabled={savingProduct}
              >
                ×
              </button>
            </div>

            <div className="admin-form">
              <label>
                Product Name

                <input
                  type="text"
                  value={productForm.name}
                  placeholder="Enter product name"
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      name: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Description

                <textarea
                  value={
                    productForm.description
                  }
                  placeholder="Enter product description"
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      description:
                        event.target.value,
                    })
                  }
                />
              </label>

              <div className="admin-form-row">
                <label>
                  Price

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={productForm.price}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        price: Number(
                          event.target.value,
                        ),
                      })
                    }
                  />
                </label>

                <label>
                  Stock

                  <input
                    type="number"
                    min="0"
                    value={
                      productForm.availableQuantity
                    }
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        availableQuantity:
                          Number(
                            event.target.value,
                          ),
                      })
                    }
                  />
                </label>
              </div>

              <label>
                Category

                <select
                  value={productForm.categoryId}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      categoryId: Number(
                        event.target.value,
                      ),
                    })
                  }
                >
                  <option value={0}>
                    Select category
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label>
                Product Images

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(event) => {
                    const files = Array.from(
                      event.target.files ?? [],
                    );

                    setSelectedImages(files);
                  }}
                  disabled={savingProduct}
                />

                {selectedImages.length > 0 && (
                  <small>
                    {selectedImages.length} image
                    {selectedImages.length === 1
                      ? ""
                      : "s"} selected
                  </small>
                )}
              </label>

              {productError && (
                <div className="admin-error">
                  {productError}
                </div>
              )}

              <div className="admin-modal-actions">
                <button
                  className="admin-secondary-button"
                  onClick={closeProductForm}
                  disabled={savingProduct}
                >
                  Cancel
                </button>

                <button
                  className="admin-primary-button"
                  onClick={handleSaveProduct}
                  disabled={savingProduct}
                >
                  {savingProduct
                    ? "Saving..."
                    : editingProduct
                      ? "Save Changes"
                      : "Create Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCategoryForm && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <div>
                <p className="section-label">
                  {editingCategory
                    ? "EDIT CATEGORY"
                    : "NEW CATEGORY"}
                </p>

                <h2>
                  {editingCategory
                    ? "Edit Category"
                    : "Add Category"}
                </h2>
              </div>

              <button
                className="admin-modal-close"
                onClick={closeCategoryForm}
                disabled={savingCategory}
              >
                ×
              </button>
            </div>

            <div className="admin-form">
              <label>
                Category Name

                <input
                  type="text"
                  value={categoryForm.name}
                  placeholder="Enter category name"
                  onChange={(event) =>
                    setCategoryForm({
                      ...categoryForm,
                      name: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Description

                <textarea
                  value={
                    categoryForm.description
                  }
                  placeholder="Enter category description"
                  onChange={(event) =>
                    setCategoryForm({
                      ...categoryForm,
                      description:
                        event.target.value,
                    })
                  }
                />
              </label>

              {categoryError && (
                <div className="admin-error">
                  {categoryError}
                </div>
              )}

              <div className="admin-modal-actions">
                <button
                  className="admin-secondary-button"
                  onClick={closeCategoryForm}
                  disabled={savingCategory}
                >
                  Cancel
                </button>

                <button
                  className="admin-primary-button"
                  onClick={handleSaveCategory}
                  disabled={savingCategory}
                >
                  {savingCategory
                    ? "Saving..."
                    : editingCategory
                      ? "Save Changes"
                      : "Create Category"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminDashboard;
