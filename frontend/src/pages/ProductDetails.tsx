// import { useEffect, useState } from "react";
// import { Link, useParams } from "react-router-dom";
// import { getProductById } from "../services/productService";
// import type { Product } from "../services/productService";
// import { useCart } from "../context/CartContext";
// import { useWishlist } from "../context/WishlistContext";
// import keycloak from "../auth/keycloak";
// import {
//   getProductReviews,
//   getReviewSummary,
//   createReview,
//   deleteReview,
//   hasPurchasedProduct,
// } from "../services/reviewService";
// import type { Review, ReviewSummary } from "../services/reviewService";
// import { getProductImage } from "../services/productImage";

// function ProductDetails() {
//   const { productId } = useParams();

//   const { addToCart } = useCart();
//   const { isWishlisted, toggleWishlist } = useWishlist();

//   const [quantity, setQuantity] = useState(1);

//   const [product, setProduct] = useState<Product | null>(null);
//   const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(
//     null,
//   );

//   const [reviews, setReviews] = useState<Review[]>([]);

//   const [rating, setRating] = useState(5);
//   const [comment, setComment] = useState("");

//   const [loading, setLoading] = useState(true);
//   const [loadingReviews, setLoadingReviews] = useState(true);
//   const [submittingReview, setSubmittingReview] = useState(false);

//   const [error, setError] = useState("");
//   const [reviewError, setReviewError] = useState("");
//   const [reviewSuccess, setReviewSuccess] = useState("");

//   const [canReview, setCanReview] = useState(false);
//   const [checkingPurchase, setCheckingPurchase] = useState(true);
//   const [hasReviewed, setHasReviewed] = useState(false);

//   useEffect(() => {
//     const loadProduct = async () => {
//       try {
//         const data = await getProductById(Number(productId));
//         setProduct(data);
//       } catch (err) {
//         console.error(err);
//         setError("Failed to load product.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadProduct();
//   }, [productId]);

//   const loadReviews = async () => {
//     if (!productId) return;

//     try {
//       setLoadingReviews(true);

//       const [reviewData, summaryData] = await Promise.all([
//         getProductReviews(Number(productId)),
//         getReviewSummary(Number(productId)),
//       ]);

//       setReviews(reviewData);
//       setReviewSummary(summaryData);
//     } catch (err) {
//       console.error("Failed to load reviews:", err);
//     } finally {
//       setLoadingReviews(false);
//     }
//   };

//   useEffect(() => {
//     loadReviews();
//   }, [productId]);

//   useEffect(() => {
//     const checkPurchaseStatus = async () => {
//       const customerId = keycloak.tokenParsed?.sub;

//       if (!customerId || !productId) {
//         setCanReview(false);
//         setCheckingPurchase(false);
//         return;
//       }

//       try {
//         setCheckingPurchase(true);

//         const purchased = await hasPurchasedProduct(
//           customerId,
//           Number(productId),
//         );

//         setCanReview(purchased);
//       } catch (err) {
//         console.error("Failed to check purchase status:", err);
//         setCanReview(false);
//       } finally {
//         setCheckingPurchase(false);
//       }
//     };

//     checkPurchaseStatus();
//   }, [productId]);

//   useEffect(() => {
//     const customerId = keycloak.tokenParsed?.sub;

//     if (!customerId) {
//       setHasReviewed(false);
//       return;
//     }

//     const customerReviewExists = reviews.some(
//       (review) => review.customerId === customerId,
//     );

//     setHasReviewed(customerReviewExists);

//     if (customerReviewExists) {
//       setCanReview(false);
//     }
//   }, [reviews]);

//   const handleSubmitReview = async () => {
//     if (!productId) return;

//     if (!canReview) {
//       setReviewError("You can only review products you have purchased.");
//       return;
//     }

//     const customerId = keycloak.tokenParsed?.sub;
//     const customerName = keycloak.tokenParsed?.name;

//     if (!customerId) {
//       setReviewError("Unable to identify your account.");
//       return;
//     }

//     if (!customerName) {
//       setReviewError("Your Keycloak account does not have a name.");
//       return;
//     }

//     if (!comment.trim()) {
//       setReviewError("Please write a review.");
//       return;
//     }

//     try {
//       setSubmittingReview(true);
//       setReviewError("");
//       setReviewSuccess("");

//       await createReview({
//         productId: Number(productId),
//         customerId,
//         customerName,
//         rating,
//         comment: comment.trim(),
//       });

//       setCanReview(false);
//       setHasReviewed(true);
//       setComment("");
//       setRating(5);

//       setReviewSuccess("Your review was submitted successfully.");

//       await loadReviews();
//     } catch (err) {
//       console.error(err);

//       if (err instanceof Error) {
//         setReviewError(err.message);
//       } else {
//         setReviewError("Failed to submit review.");
//       }
//     } finally {
//       setSubmittingReview(false);
//     }
//   };

//   const handleDeleteReview = async (reviewId: string) => {
//     const customerId = keycloak.tokenParsed?.sub;

//     if (!customerId) {
//       return;
//     }

//     try {
//       await deleteReview(reviewId, customerId);

//       setHasReviewed(false);
//       setCanReview(true);
//       setReviewError("");
//       setReviewSuccess("");

//       await loadReviews();
//     } catch (err) {
//       console.error(err);
//       setReviewError("Failed to delete review.");
//     }
//   };

//   const renderStars = (value: number) => {
//     return (
//       <span className="review-stars">
//         {"★".repeat(value)}
//         {"☆".repeat(5 - value)}
//       </span>
//     );
//   };

//   if (loading) {
//     return (
//       <main className="page">
//         <div className="loading">Loading product...</div>
//       </main>
//     );
//   }

//   if (error || !product) {
//     return (
//       <main className="page">
//         <div className="error">{error || "Product not found."}</div>
//       </main>
//     );
//   }

//   const currentCustomerId = keycloak.tokenParsed?.sub;

//   return (
//     <main className="page">
//       <section className="product-details-section">
//         <Link to="/" className="back-to-products">
//           ← Back to Products
//         </Link>

//         <div className="product-details">
//           <div className="product-details-image">
//             {product.imageUrls && product.imageUrls.length > 0 ? (
//               <img
//                 src={getProductImage(product.imageUrls, product.name)}
//                 alt={product.name}
//               />
//             ) : (
//               <div className="product-image-placeholder">
//                 No image available
//               </div>
//             )}
//           </div>

//           <div className="product-details-content">
//             <div className="product-details-top">
//               <p className="product-category">
//                 {product.categoryName ?? `Category #${product.categoryId}`}
//               </p>

//               <button
//                 className={`details-wishlist-button ${
//                   isWishlisted(product.id) ? "wishlisted" : ""
//                 }`}
//                 onClick={() => {
//                   if (!keycloak.authenticated) {
//                     keycloak.login();
//                     return;
//                   }

//                   toggleWishlist(product);
//                 }}
//                 aria-label={
//                   isWishlisted(product.id)
//                     ? "Remove from wishlist"
//                     : "Add to wishlist"
//                 }
//               >
//                 {isWishlisted(product.id) ? "♥" : "♡"}
//               </button>
//             </div>

//             <h1>{product.name}</h1>

//             {!loadingReviews && reviewSummary && (
//               <div className="product-rating-summary">
//                 <span className="rating-stars">
//                   {reviewSummary.reviewCount > 0
//                     ? renderStars(Math.round(reviewSummary.averageRating))
//                     : "☆☆☆☆☆"}
//                 </span>

//                 <span className="rating-value">
//                   {reviewSummary.averageRating.toFixed(1)}
//                 </span>

//                 <span className="rating-count">
//                   ({reviewSummary.reviewCount}{" "}
//                   {reviewSummary.reviewCount === 1 ? "review" : "reviews"})
//                 </span>
//               </div>
//             )}

//             <p className="product-details-description">
//               {product.description}
//             </p>

//             <div className="product-details-price">
//               ${product.price.toFixed(2)}
//             </div>

//             <p className="product-stock-details">
//               {product.availableQuantity} available
//             </p>

//             <div className="quantity-selector">
//               <span>Quantity</span>

//               <div className="quantity-controls">
//                 <button
//                   onClick={() =>
//                     setQuantity((current) => Math.max(current - 1, 1))
//                   }
//                   disabled={quantity <= 1}
//                 >
//                   −
//                 </button>

//                 <span>{quantity}</span>

//                 <button
//                   onClick={() =>
//                     setQuantity((current) =>
//                       Math.min(current + 1, product.availableQuantity),
//                     )
//                   }
//                   disabled={quantity >= product.availableQuantity}
//                 >
//                   +
//                 </button>
//               </div>
//             </div>

//             <button
//               className="details-add-button"
//               disabled={product.availableQuantity <= 0}
//               onClick={() => {
//                 for (let i = 0; i < quantity; i++) {
//                   addToCart(product);
//                 }
//               }}
//             >
//               Add {quantity} to Cart
//             </button>
//           </div>
//         </div>

//         <section className="reviews-section">
//           <div className="section-header">
//             <div>
//               <p className="section-label">REVIEWS</p>
//               <h2>Customer Reviews</h2>
//             </div>
//           </div>

//           {loadingReviews ? (
//             <div className="loading">Loading reviews...</div>
//           ) : (
//             <>
//               <div className="reviews-overview">
//                 <span className="reviews-average">
//                   {reviewSummary?.averageRating.toFixed(1) ?? "0.0"}
//                 </span>

//                 <div>
//                   <div className="reviews-average-stars">
//                     {renderStars(
//                       Math.round(reviewSummary?.averageRating ?? 0),
//                     )}
//                   </div>

//                   <span className="reviews-total">
//                     {reviewSummary?.reviewCount ?? 0}{" "}
//                     {reviewSummary?.reviewCount === 1
//                       ? "review"
//                       : "reviews"}
//                   </span>
//                 </div>
//               </div>

//               {checkingPurchase ? (
//                 <div className="write-review">
//                   <p>Checking purchase status...</p>
//                 </div>
//               ) : canReview ? (
//                 <div className="write-review">
//                   <h3>Write a Review</h3>

//                   <div className="review-rating-input">
//                     <span>Your Rating</span>

//                     <div className="rating-selector">
//                       {[1, 2, 3, 4, 5].map((star) => (
//                         <button
//                           key={star}
//                           type="button"
//                           className={star <= rating ? "selected" : ""}
//                           onClick={() => setRating(star)}
//                         >
//                           ★
//                         </button>
//                       ))}
//                     </div>
//                   </div>

//                   <textarea
//                     value={comment}
//                     onChange={(event) => setComment(event.target.value)}
//                     placeholder="Share your experience with this product..."
//                     rows={5}
//                   />

//                   {reviewError && (
//                     <p className="review-error">{reviewError}</p>
//                   )}

//                   {reviewSuccess && (
//                     <p className="review-success">{reviewSuccess}</p>
//                   )}

//                   <button
//                     className="submit-review-button"
//                     onClick={handleSubmitReview}
//                     disabled={submittingReview}
//                   >
//                     {submittingReview ? "Submitting..." : "Submit Review"}
//                   </button>
//                 </div>
//               ) : hasReviewed ? (
//                 <div className="write-review">
//                   <h3>Thank you for your review</h3>
//                   <p>You have already reviewed this product.</p>
//                 </div>
//               ) : (
//                 <div className="write-review">
//                   <h3>Write a Review</h3>
//                   <p>You can only review products you have purchased.</p>
//                 </div>
//               )}

//               <div className="reviews-list">
//                 {reviews.length === 0 ? (
//                   <p className="reviews-empty">
//                     No reviews yet. Be the first to review this product.
//                   </p>
//                 ) : (
//                   reviews.map((review) => (
//                     <article className="review-card" key={review.id}>
//                       <div className="review-card-header">
//                         <div>
//                           <h3>{review.customerName}</h3>
//                           <div>{renderStars(review.rating)}</div>
//                         </div>

//                         <span className="review-date">
//                           {new Date(review.createdAt).toLocaleDateString()}
//                         </span>
//                       </div>

//                       <p>{review.comment}</p>

//                       {currentCustomerId === review.customerId && (
//                         <button
//                           className="delete-review-button"
//                           onClick={() => handleDeleteReview(review.id)}
//                         >
//                           Delete
//                         </button>
//                       )}
//                     </article>
//                   ))
//                 )}
//               </div>
//             </>
//           )}
//         </section>
//       </section>
//     </main>
//   );
// }

// export default ProductDetails;

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProductById } from "../services/productService";
import type { Product } from "../services/productService";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import keycloak from "../auth/keycloak";
import {
  getProductReviews,
  getReviewSummary,
  createReview,
  deleteReview,
  hasPurchasedProduct,
} from "../services/reviewService";
import type { Review, ReviewSummary } from "../services/reviewService";
import { getProductImage } from "../services/productImage";

function ProductDetails() {
  const { productId } = useParams();

  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);

  const [product, setProduct] = useState<Product | null>(null);
  const [reviewSummary, setReviewSummary] =
    useState<ReviewSummary | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);

  const [error, setError] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const [canReview, setCanReview] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);
  const [hasReviewed, setHasReviewed] = useState(false);

  /*
   * Load product
   */
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await getProductById(Number(productId));
        setProduct(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  /*
   * Guest wishlist flow
   *
   * Guest clicks the heart:
   * 1. Save product ID in sessionStorage
   * 2. Open Keycloak login
   * 3. After login, return to this product
   * 4. Automatically add the product to wishlist
   */
  const handleWishlistClick = async () => {
  console.log("Heart clicked");
  console.log("Keycloak authenticated:", keycloak.authenticated);
  console.log("Keycloak initialized:", keycloak.didInitialize);

  if (!product) {
    console.log("No product found");
    return;
  }

  if (!keycloak.authenticated) {
    console.log("Guest user. Starting Keycloak login...");

    sessionStorage.setItem(
      "neoshop-pending-wishlist",
      String(product.id)
    );

    try {
      await keycloak.login({
        redirectUri: window.location.href,
      });
    } catch (error) {
      console.error("Keycloak login failed:", error);
    }

    return;
  }

  console.log("Authenticated user. Toggling wishlist.");

  toggleWishlist(product);
};

  /*
   * Automatically add the product to wishlist
   * after the guest completes Keycloak login.
   */
  useEffect(() => {
    if (!keycloak.authenticated || !product) {
      return;
    }

    const pendingProductId = sessionStorage.getItem(
      "neoshop-pending-wishlist",
    );

    if (pendingProductId !== String(product.id)) {
      return;
    }

    sessionStorage.removeItem(
      "neoshop-pending-wishlist",
    );

    if (!isWishlisted(product.id)) {
      toggleWishlist(product);
    }
  }, [product]);

  /*
   * Load reviews
   */
  const loadReviews = async () => {
    if (!productId) return;

    try {
      setLoadingReviews(true);

      const [reviewData, summaryData] = await Promise.all([
        getProductReviews(Number(productId)),
        getReviewSummary(Number(productId)),
      ]);

      setReviews(reviewData);
      setReviewSummary(summaryData);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  /*
   * Check whether the customer purchased this product
   */
  useEffect(() => {
    const checkPurchaseStatus = async () => {
      const customerId = keycloak.tokenParsed?.sub;

      if (!customerId || !productId) {
        setCanReview(false);
        setCheckingPurchase(false);
        return;
      }

      try {
        setCheckingPurchase(true);

        const purchased = await hasPurchasedProduct(
          customerId,
          Number(productId),
        );

        setCanReview(purchased);
      } catch (err) {
        console.error(
          "Failed to check purchase status:",
          err,
        );

        setCanReview(false);
      } finally {
        setCheckingPurchase(false);
      }
    };

    checkPurchaseStatus();
  }, [productId]);

  /*
   * Check whether the current customer has already reviewed
   */
  useEffect(() => {
    const customerId = keycloak.tokenParsed?.sub;

    if (!customerId) {
      setHasReviewed(false);
      return;
    }

    const customerReviewExists = reviews.some(
      (review) => review.customerId === customerId,
    );

    setHasReviewed(customerReviewExists);

    if (customerReviewExists) {
      setCanReview(false);
    }
  }, [reviews]);

  /*
   * Submit review
   */
  const handleSubmitReview = async () => {
    if (!productId) return;

    if (!canReview) {
      setReviewError(
        "You can only review products you have purchased.",
      );
      return;
    }

    const customerId = keycloak.tokenParsed?.sub;
    const customerName = keycloak.tokenParsed?.name;

    if (!customerId) {
      setReviewError("Unable to identify your account.");
      return;
    }

    if (!customerName) {
      setReviewError(
        "Your Keycloak account does not have a name.",
      );
      return;
    }

    if (!comment.trim()) {
      setReviewError("Please write a review.");
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError("");
      setReviewSuccess("");

      await createReview({
        productId: Number(productId),
        customerId,
        customerName,
        rating,
        comment: comment.trim(),
      });

      setCanReview(false);
      setHasReviewed(true);
      setComment("");
      setRating(5);

      setReviewSuccess(
        "Your review was submitted successfully.",
      );

      await loadReviews();
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setReviewError(err.message);
      } else {
        setReviewError("Failed to submit review.");
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  /*
   * Delete review
   */
  const handleDeleteReview = async (reviewId: string) => {
    const customerId = keycloak.tokenParsed?.sub;

    if (!customerId) {
      return;
    }

    try {
      await deleteReview(reviewId, customerId);

      setHasReviewed(false);
      setCanReview(true);
      setReviewError("");
      setReviewSuccess("");

      await loadReviews();
    } catch (err) {
      console.error(err);
      setReviewError("Failed to delete review.");
    }
  };

  /*
   * Render stars
   */
  const renderStars = (value: number) => {
    return (
      <span className="review-stars">
        {"★".repeat(value)}
        {"☆".repeat(5 - value)}
      </span>
    );
  };

  /*
   * Loading state
   */
  if (loading) {
    return (
      <main className="page">
        <div className="loading">
          Loading product...
        </div>
      </main>
    );
  }

  /*
   * Error state
   */
  if (error || !product) {
    return (
      <main className="page">
        <div className="error">
          {error || "Product not found."}
        </div>
      </main>
    );
  }

  const currentCustomerId = keycloak.tokenParsed?.sub;

  return (
    <main className="page">
      <section className="product-details-section">
        <Link
          to="/"
          className="back-to-products"
        >
          ← Back to Products
        </Link>

        <div className="product-details">
          <div className="product-details-image">
            {product.imageUrls &&
            product.imageUrls.length > 0 ? (
              <img
                src={getProductImage(
                  product.imageUrls,
                  product.name,
                )}
                alt={product.name}
              />
            ) : (
              <div className="product-image-placeholder">
                No image available
              </div>
            )}
          </div>

          <div className="product-details-content">
            <div className="product-details-top">
              <p className="product-category">
                {product.categoryName ??
                  `Category #${product.categoryId}`}
              </p>

              {/* Wishlist */}
              <button
                 type="button"
                className={`details-wishlist-button ${
                  keycloak.authenticated &&
                  isWishlisted(product.id)
                    ? "wishlisted"
                    : ""
                }`}
                onClick={handleWishlistClick}
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
            </div>

            <h1>{product.name}</h1>

            {!loadingReviews &&
              reviewSummary && (
                <div className="product-rating-summary">
                  <span className="rating-stars">
                    {reviewSummary.reviewCount > 0
                      ? renderStars(
                          Math.round(
                            reviewSummary.averageRating,
                          ),
                        )
                      : "☆☆☆☆☆"}
                  </span>

                  <span className="rating-value">
                    {reviewSummary.averageRating.toFixed(
                      1,
                    )}
                  </span>

                  <span className="rating-count">
                    ({reviewSummary.reviewCount}{" "}
                    {reviewSummary.reviewCount === 1
                      ? "review"
                      : "reviews"}
                    )
                  </span>
                </div>
              )}

            <p className="product-details-description">
              {product.description}
            </p>

            <div className="product-details-price">
              ₹{product.price.toFixed(2)}
            </div>

            <p className="product-stock-details">
              {product.availableQuantity} available
            </p>

            <div className="quantity-selector">
              <span>Quantity</span>

              <div className="quantity-controls">
                <button
                  onClick={() =>
                    setQuantity((current) =>
                      Math.max(current - 1, 1),
                    )
                  }
                  disabled={quantity <= 1}
                >
                  −
                </button>

                <span>{quantity}</span>

                <button
                  onClick={() =>
                    setQuantity((current) =>
                      Math.min(
                        current + 1,
                        product.availableQuantity,
                      ),
                    )
                  }
                  disabled={
                    quantity >=
                    product.availableQuantity
                  }
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart remains available for guests */}
            <button
              className="details-add-button"
              disabled={product.availableQuantity <= 0}
              onClick={() => {
                for (let i = 0; i < quantity; i++) {
                  addToCart(product);
                }
              }}
            >
              Add {quantity} to Cart
            </button>
          </div>
        </div>

        <section className="reviews-section">
          <div className="section-header">
            <div>
              <p className="section-label">
                REVIEWS
              </p>

              <h2>Customer Reviews</h2>
            </div>
          </div>

          {loadingReviews ? (
            <div className="loading">
              Loading reviews...
            </div>
          ) : (
            <>
              <div className="reviews-overview">
                <span className="reviews-average">
                  {reviewSummary?.averageRating.toFixed(
                    1,
                  ) ?? "0.0"}
                </span>

                <div>
                  <div className="reviews-average-stars">
                    {renderStars(
                      Math.round(
                        reviewSummary?.averageRating ??
                          0,
                      ),
                    )}
                  </div>

                  <span className="reviews-total">
                    {reviewSummary?.reviewCount ?? 0}{" "}
                    {reviewSummary?.reviewCount === 1
                      ? "review"
                      : "reviews"}
                  </span>
                </div>
              </div>

              {checkingPurchase ? (
                <div className="write-review">
                  <p>
                    Checking purchase status...
                  </p>
                </div>
              ) : canReview ? (
                <div className="write-review">
                  <h3>Write a Review</h3>

                  <div className="review-rating-input">
                    <span>Your Rating</span>

                    <div className="rating-selector">
                      {[1, 2, 3, 4, 5].map(
                        (star) => (
                          <button
                            key={star}
                            type="button"
                            className={
                              star <= rating
                                ? "selected"
                                : ""
                            }
                            onClick={() =>
                              setRating(star)
                            }
                          >
                            ★
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  <textarea
                    value={comment}
                    onChange={(event) =>
                      setComment(event.target.value)
                    }
                    placeholder="Share your experience with this product..."
                    rows={5}
                  />

                  {reviewError && (
                    <p className="review-error">
                      {reviewError}
                    </p>
                  )}

                  {reviewSuccess && (
                    <p className="review-success">
                      {reviewSuccess}
                    </p>
                  )}

                  <button
                    className="submit-review-button"
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                  >
                    {submittingReview
                      ? "Submitting..."
                      : "Submit Review"}
                  </button>
                </div>
              ) : hasReviewed ? (
                <div className="write-review">
                  <h3>
                    Thank you for your review
                  </h3>

                  <p>
                    You have already reviewed this
                    product.
                  </p>
                </div>
              ) : (
                <div className="write-review">
                  <h3>Write a Review</h3>

                  <p>
                    You can only review products you
                    have purchased.
                  </p>
                </div>
              )}

              <div className="reviews-list">
                {reviews.length === 0 ? (
                  <p className="reviews-empty">
                    No reviews yet. Be the first to
                    review this product.
                  </p>
                ) : (
                  reviews.map((review) => (
                    <article
                      className="review-card"
                      key={review.id}
                    >
                      <div className="review-card-header">
                        <div>
                          <h3>
                            {review.customerName}
                          </h3>

                          <div>
                            {renderStars(
                              review.rating,
                            )}
                          </div>
                        </div>

                        <span className="review-date">
                          {new Date(
                            review.createdAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      <p>{review.comment}</p>

                      {currentCustomerId ===
                        review.customerId && (
                        <button
                          className="delete-review-button"
                          onClick={() =>
                            handleDeleteReview(
                              review.id,
                            )
                          }
                        >
                          Delete
                        </button>
                      )}
                    </article>
                  ))
                )}
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  );
}

export default ProductDetails;