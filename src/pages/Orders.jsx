import { useAuth } from '../context/AuthContext.jsx';
import { fetchUserOrders } from '../api/client.js';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Orders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchUserOrders()
                .then((data) => setOrders(Array.isArray(data) ? data : []))
                .finally(() => setLoading(false));
        }
    }, [user]);

    if (!user) {
        return (
            <section className="orders-page">
                <h2>My Orders</h2>
                <p>Please log in to view your orders.</p>
            </section>
        );
    }

    if (loading) {
        return (
            <section className="orders-page">
                <h2>My Orders</h2>
                <p>Loading...</p>
            </section>
        );
    }

    if (orders.length === 0) {
        return (
            <section className="orders-page">
                <h2>My Orders</h2>
                <p className="cart-empty">No orders yet.</p>
                <Link to="/" className="btn">Start Shopping</Link>
            </section>
        );
    }

    return (
        <section className="orders-page">
            <h2>My Orders</h2>
            <div className="orders-list">
                {orders.map((order) => (
                    <div className="order-card" key={order.id}>
                        <div className="order-card-header">
                            <div>
                                <strong>Order #{order.id}</strong>
                                <span className={`status-badge status-${order.status}`}>{order.status}</span>
                            </div>
                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="order-card-items">
                            {order.items.map((item, i) => (
                                <div className="order-item" key={i}>
                                    <img src={item.image} alt={item.name} />
                                    <div>
                                        <p>{item.name}</p>
                                        <small>Qty: {item.quantity} × ${parseFloat(item.price).toFixed(2)}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="order-card-footer">
                            <span>Payment: {order.payment_method}</span>
                            <strong>Total: ${parseFloat(order.total).toFixed(2)}</strong>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
