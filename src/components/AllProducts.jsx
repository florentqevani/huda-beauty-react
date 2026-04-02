import { useState, useEffect } from "react";
import { fetchProducts } from "../api/client";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { allProducts as staticProducts } from "../data/products";
import ProductCard from "./ProductCard";

const CATEGORIES = [
    { key: "", label: "All" },
    { key: "face", label: "Face" },
    { key: "lips", label: "Lips" },
    { key: "eyes", label: "Eyes" },
    { key: "fragrance", label: "Fragrance" },
];

export default function AllProducts() {
    const [products, setProducts] = useState(staticProducts);
    const [activeFilter, setActiveFilter] = useState("");
    const { addToCart } = useCart();
    const { user } = useAuth();

    useEffect(() => {
        fetchProducts(activeFilter || undefined).then((data) => {
            if (Array.isArray(data)) setProducts(data);
        }).catch(() => { });
    }, [activeFilter]);

    const handleAddToCart = async (productId) => {
        if (!user) return alert("Please log in to add items to cart");
        await addToCart(productId);
    };

    return (
        <section className="n-product" id="Arrivals">
            <div className="center-text">
                <h2>All Products</h2>
            </div>
            <div className="filter-tabs">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.key}
                        className={`filter-tab${activeFilter === cat.key ? " active" : ""}`}
                        onClick={() => setActiveFilter(cat.key)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>
            <div className="product-grid">
                {products.length > 0 ? products.map((product) => (
                    <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                )) : (
                    <p className="no-products">No products found.</p>
                )}
            </div>
        </section>
    );
}
