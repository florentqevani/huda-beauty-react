import { useState } from "react";
import PropTypes from "prop-types";

export default function ProductCard({ product, onAddToCart }) {
    const [adding, setAdding] = useState(false);

    const handleAddToCart = async () => {
        if (!onAddToCart) return;
        setAdding(true);
        await onAddToCart(product.id);
        setAdding(false);
    };

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
        <div className="product-card">
            <div className="product-card__img">
                <img src={product.image} alt={product.name} loading="lazy" />
                <button
                    className="product-card__quick-add"
                    onClick={handleAddToCart}
                    disabled={adding}
                    aria-label="Add to cart"
                >
                    {adding ? (
                        <i className="ri-loader-4-line ri-spin"></i>
                    ) : (
                        <i className="ri-shopping-bag-line"></i>
                    )}
                </button>
            </div>
            <div className="product-card__body">
                <h3 className="product-card__name">{product.name}</h3>
                {ratingNum > 0 && (
                    <div className="product-card__rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <i key={`star-${star}`} className={getStarClass(star - 1)}></i>
                        ))}
                        <span>{ratingNum.toFixed(1)}</span>
                    </div>
                )}
                <div className="product-card__footer">
                    <span className="product-card__price">{price}</span>
                    <button
                        className="product-card__cart-btn"
                        onClick={handleAddToCart}
                        disabled={adding}
                    >
                        {adding ? "Adding..." : "Add to cart"}
                    </button>
                </div>
            </div>
        </div>
    );
}

ProductCard.propTypes = {
    product: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        image: PropTypes.string,
        price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }).isRequired,
    onAddToCart: PropTypes.func,
};
