import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/productService";
import type { Product } from "../services/productService";
import { getProductImage } from "../services/productImage";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import keycloak from "../auth/keycloak";

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [sort, setSort] = useState("DEFAULT");

  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  /*
   * Handles wishlist button clicks.
   *
   * Guest:
   * 1. Save the product ID
   * 2. Open Keycloak login
   * 3. Return to the Products page
   * 4. Automatically add that product to wishlist
   *
   * Logged-in customer:
   * Toggle the wishlist normally.
   */
  const handleWishlistClick = (product: Product) => {
    console.log("Wishlist clicked:", product.name);
    console.log("Authenticated:", keycloak.authenticated);

    if (!keycloak.authenticated) {
      console.log("Guest user. Starting Keycloak login...");

      sessionStorage.setItem(
        "neoshop-pending-wishlist",
        String(product.id),
      );

      keycloak.login({
        redirectUri: window.location.href,
      });

      return;
    }

    console.log("Authenticated user. Toggling wishlist.");

    toggleWishlist(product);
  };

  /*
   * After Keycloak login, check whether the user
   * clicked a wishlist button before logging in.
   */
  useEffect(() => {
    if (!keycloak.authenticated) {
      return;
    }

    const pendingProductId = sessionStorage.getItem(
      "neoshop-pending-wishlist",
    );

    if (!pendingProductId) {
      return;
    }

    const pendingProduct = products.find(
      (product) =>
        String(product.id) === pendingProductId,
    );

    if (!pendingProduct) {
      return;
    }

    sessionStorage.removeItem(
      "neoshop-pending-wishlist",
    );

    if (!isWishlisted(pendingProduct.id)) {
      toggleWishlist(pendingProduct);
    }
  }, [products]);

  const categories = [
    "ALL",
    ...Array.from(
      new Set(
        products
          .map((product) => product.categoryName)
          .filter(
            (name): name is string => Boolean(name),
          ),
      ),
    ),
  ];

  const filteredProducts = products
    .filter((product) => {
      const normalizedSearch = search.toLowerCase();

      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        product.description
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesCategory =
        category === "ALL" ||
        product.categoryName === category;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sort === "PRICE_LOW") {
        return a.price - b.price;
      }

      if (sort === "PRICE_HIGH") {
        return b.price - a.price;
      }

      if (sort === "NAME") {
        return a.name.localeCompare(b.name);
      }

      return 0;
    });

  if (loading) {
    return (
      <main className="page">
        <div className="loading">
          Loading products...
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
      <section className="hero">
        <div>
          <p className="hero-label">
            WELCOME TO NEOSHOP
          </p>

          <h1>
            Everything you need, in one place.
          </h1>

          <p>
            Explore our collection of quality products
            and find something you'll love.
          </p>
        </div>
      </section>

      <section className="products-section">
        <div className="section-header">
          <div>
            <p className="section-label">
              OUR COLLECTION
            </p>

            <h2>Featured Products</h2>
          </div>

          <span className="product-count">
            {filteredProducts.length} products
          </span>
        </div>

        <div className="product-controls">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
          >
            {categories.map((item) => (
              <option value={item} key={item}>
                {item === "ALL"
                  ? "All Categories"
                  : item}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(event) =>
              setSort(event.target.value)
            }
          >
            <option value="DEFAULT">
              Sort By
            </option>

            <option value="PRICE_LOW">
              Price: Low to High
            </option>

            <option value="PRICE_HIGH">
              Price: High to Low
            </option>

            <option value="NAME">
              Name: A to Z
            </option>
          </select>
        </div>

        <div className="product-grid">
          {filteredProducts.map((product) => (
            <article
              className="product-card"
              key={product.id}
            >
              <button
                type="button"
                className={`wishlist-button ${
                  keycloak.authenticated &&
                  isWishlisted(product.id)
                    ? "wishlisted"
                    : ""
                }`}
                onClick={() =>
                  handleWishlistClick(product)
                }
                aria-label={
                  keycloak.authenticated &&
                  isWishlisted(product.id)
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
              >
                {keycloak.authenticated &&
                isWishlisted(product.id)
                  ? "♥"
                  : "♡"}
              </button>

              <div className="product-image">
                <img
                  src={getProductImage(
                    product.imageUrls,
                    product.name,
                  )}
                  alt={product.name}
                />
              </div>

              <div className="product-content">
                <p className="product-category">
                  {product.categoryName ??
                    `Category #${product.categoryId}`}
                </p>

                <h3>
                  <Link
                    to={`/products/${product.id}`}
                    className="product-name-link"
                  >
                    {product.name}
                  </Link>
                </h3>

                <p className="product-description">
                  {product.description}
                </p>

                <div className="product-footer">
                  <div>
                    <span className="price">
                      ₹{product.price.toFixed(2)}
                    </span>

                    <span className="stock">
                      {product.availableQuantity > 0
                        ? `${product.availableQuantity} available`
                        : "Out of stock"}
                    </span>
                  </div>

                  <button
                    className="add-button"
                    disabled={
                      product.availableQuantity <= 0
                    }
                    onClick={() =>
                      addToCart(product)
                    }
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="empty-state">
            No products found.
          </div>
        )}
      </section>
    </main>
  );
}

export default Products;