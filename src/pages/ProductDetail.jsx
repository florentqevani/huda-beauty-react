import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProduct, fetchReviews, createReviewAPI, deleteReviewAPI, updateProduct } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    // Review form
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Admin edit
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [editImage, setEditImage] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchProduct(id), fetchReviews(id)])
            .then(([prod, revs]) => {
                setProduct(prod);
                setReviews(Array.isArray(revs) ? revs : []);
                setEditForm({
                    name: prod.name || "",
                    description: prod.description || "",
                    price: prod.price || "",
                    rating: prod.rating || "",
                    category: prod.category || "",
                    is_bestseller: prod.is_bestseller || false,
                });
            })
            .catch(() => setProduct(null))
            .finally(() => setLoading(false));
    }, [id]);

    const handleAddToCart = async () => {
        if (!user) return alert("Please log in to add items to cart");
        setAdding(true);
        await addToCart(product.id);
        setAdding(false);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) return alert("Please log in to leave a review");
        setSubmitting(true);
        try {
            await createReviewAPI(id, rating, comment);
            const revs = await fetchReviews(id);
            setReviews(Array.isArray(revs) ? revs : []);
            const prod = await fetchProduct(id);
            setProduct(prod);
            setComment("");
            setRating(5);
        } catch {
            alert("Failed to submit review");
        }
        setSubmitting(false);
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            await deleteReviewAPI(id, reviewId);
            const revs = await fetchReviews(id);
            setReviews(Array.isArray(revs) ? revs : []);
            const prod = await fetchProduct(id);
            setProduct(prod);
        } catch {
            alert("Failed to delete review");
        }
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("name", editForm.name);
            formData.append("description", editForm.description);
            formData.append("price", editForm.price);
            formData.append("rating", editForm.rating);
            formData.append("category", editForm.category);
            formData.append("is_bestseller", editForm.is_bestseller);
            if (editImage) formData.append("image", editImage);

            const updated = await updateProduct(product.id, formData);
            setProduct(updated);
            setEditing(false);
            setEditImage(null);
        } catch {
            alert("Failed to update product");
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <section className="product-detail">
                <p className="product-detail__loading">Loading...</p>
            </section>
        );
    }

    if (!product || product.error) {
        return (
            <section className="product-detail">
                <p className="product-detail__loading">Product not found.</p>
                <button className="btn" onClick={() => navigate("/")}>Back to Home</button>
            </section>
        );
    }

    const price = typeof product.price === "number"
        ? `$${product.price.toFixed(2)}`
        : product.price;

    const ratingNum = typeof product.rating === "number"
        ? product.rating
        : Number.parseFloat(product.rating) || 0;

    const fullStars = Math.floor(ratingNum);
    const hasHalf = ratingNum % 1 >= 0.25;
    const getStarClass = (index) => {
        if (index < fullStars) return "ri-star-fill";
        if (index === fullStars && hasHalf) return "ri-star-half-fill";
        return "ri-star-line";
    };

    return (
        <section className="product-detail">
            <button className="product-detail__back" onClick={() => navigate(-1)}>
                <i className="ri-arrow-left-line"></i> Back
            </button>

            <div className="product-detail__main">
                <div className="product-detail__image">
                    <img src={product.image} alt={product.name} />
                </div>

                <div className="product-detail__info">
                    {!editing ? (
                        <>
                            <h1 className="product-detail__name">{product.name}</h1>
                            {product.category && (
                                <span className="product-detail__category">{product.category}</span>
                            )}
                            <div className="product-detail__rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <i key={`star-${star}`} className={getStarClass(star - 1)}></i>
                                ))}
                                <span>{ratingNum.toFixed(1)}</span>
                                <span className="product-detail__review-count">
                                    ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                                </span>
                            </div>
                            <p className="product-detail__price">{price}</p>
                            {product.description && (
                                <p className="product-detail__description">{product.description}</p>
                            )}
                            <button
                                className="btn product-detail__add-btn"
                                onClick={handleAddToCart}
                                disabled={adding}
                            >
                                {adding ? "Adding..." : "Add to Cart"}
                            </button>
                            {isAdmin && (
                                <button
                                    className="btn product-detail__edit-btn"
                                    onClick={() => setEditing(true)}
                                >
                                    <i className="ri-edit-line"></i> Edit Product
                                </button>
                            )}
                        </>
                    ) : (
                        <form className="product-detail__edit-form" onSubmit={handleSaveEdit}>
                            <h2>Edit Product</h2>
                            <label>
                                Name
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                Description
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    rows={3}
                                />
                            </label>
                            <label>
                                Price
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editForm.price}
                                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                Category
                                <select
                                    value={editForm.category}
                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                >
                                    <option value="general">General</option>
                                    <option value="face">Face</option>
                                    <option value="lips">Lips</option>
                                    <option value="eyes">Eyes</option>
                                    <option value="fragrance">Fragrance</option>
                                </select>
                            </label>
                            <label className="product-detail__checkbox">
                                <input
                                    type="checkbox"
                                    checked={editForm.is_bestseller}
                                    onChange={(e) => setEditForm({ ...editForm, is_bestseller: e.target.checked })}
                                />
                                Best Seller
                            </label>
                            <label>
                                Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setEditImage(e.target.files[0])}
                                />
                            </label>
                            <div className="product-detail__edit-actions">
                                <button type="submit" className="btn" disabled={saving}>
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                                <button
                                    type="button"
                                    className="btn product-detail__cancel-btn"
                                    onClick={() => { setEditing(false); setEditImage(null); }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Reviews Section */}
            <div className="product-detail__reviews">
                <h2>Reviews & Comments</h2>

                {user && (
                    <form className="product-detail__review-form" onSubmit={handleSubmitReview}>
                        <div className="product-detail__review-rating">
                            <span>Your Rating:</span>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <i
                                    key={`rate-${star}`}
                                    className={star <= rating ? "ri-star-fill" : "ri-star-line"}
                                    onClick={() => setRating(star)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') setRating(star); }}
                                    role="button"
                                    tabIndex={0}
                                    style={{ cursor: "pointer" }}
                                ></i>
                            ))}
                        </div>
                        <textarea
                            className="product-detail__review-input"
                            placeholder="Write your review..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3}
                        />
                        <button className="btn" type="submit" disabled={submitting}>
                            {submitting ? "Submitting..." : "Submit Review"}
                        </button>
                    </form>
                )}
                {!user && <p className="product-detail__login-hint">Log in to leave a review.</p>}

                <div className="product-detail__review-list">
                    {reviews.length === 0 && <p className="product-detail__no-reviews">No reviews yet. Be the first!</p>}
                    {reviews.map((review) => (
                        <div key={review.id} className="product-detail__review-item">
                            <div className="product-detail__review-header">
                                <strong>{review.user_name}</strong>
                                <div className="product-detail__review-stars">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <i
                                            key={`rev-${review.id}-${star}`}
                                            className={star <= review.rating ? "ri-star-fill" : "ri-star-line"}
                                        ></i>
                                    ))}
                                </div>
                                <span className="product-detail__review-date">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </span>
                                {(isAdmin || (user && user.id === review.user_id)) && (
                                    <button
                                        className="product-detail__review-delete"
                                        onClick={() => handleDeleteReview(review.id)}
                                        title="Delete review"
                                    >
                                        <i className="ri-delete-bin-line"></i>
                                    </button>
                                )}
                            </div>
                            {review.comment && (
                                <p className="product-detail__review-comment">{review.comment}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
