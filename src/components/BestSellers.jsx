import { useState, useEffect } from "react";
import { fetchBestSellers } from "../api/client";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { bestSellers as staticBestSellers } from "../data/products";
import ProductCard from "./ProductCard";

export default function BestSellers() {
    const [bestSellers, setBestSellers] = useState(staticBestSellers);
    const { addToCart } = useCart();
    const { user } = useAuth();

    useEffect(() => {
        fetchBestSellers().then((data) => {
            if (Array.isArray(data) && data.length > 0) setBestSellers(data);
        }).catch(() => { });
    }, []);

    const handleAddToCart = async (productId) => {
        if (!user) return alert("Please log in to add items to cart");
        await addToCart(productId);
    };

    return (
        <section className="selling" id="Reviews">
            <div className="center-text">
                <h2>Best Sellers</h2>
            </div>
            <div className="product-grid">
                {bestSellers.map((item) => (
                    <ProductCard key={item.id} product={item} onAddToCart={handleAddToCart} />
                ))}
            </div>
        </section>
    );
}
