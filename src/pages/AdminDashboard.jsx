import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
    fetchDashboardStats,
    fetchAllUsers,
    fetchAllOrders,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatusAPI,
    updateUserRoleAPI,
    deleteUserAPI,
} from '../api/client.js';

function StatsCards({ stats }) {
    return (
        <div className="admin-stats">
            <div className="stat-card">
                <i className="fas fa-users"></i>
                <div>
                    <h3>{stats.totalUsers}</h3>
                    <p>Total Users</p>
                </div>
            </div>
            <div className="stat-card">
                <i className="fas fa-box"></i>
                <div>
                    <h3>{stats.totalProducts}</h3>
                    <p>Products</p>
                </div>
            </div>
            <div className="stat-card">
                <i className="fas fa-shopping-bag"></i>
                <div>
                    <h3>{stats.totalOrders}</h3>
                    <p>Orders</p>
                </div>
            </div>
            <div className="stat-card">
                <i className="fas fa-dollar-sign"></i>
                <div>
                    <h3>${stats.totalRevenue.toFixed(2)}</h3>
                    <p>Revenue</p>
                </div>
            </div>
        </div>
    );
}

function ProductForm({ product, onSave, onCancel }) {
    const [name, setName] = useState(product?.name || '');
    const [price, setPrice] = useState(product?.price || '');
    const [category, setCategory] = useState(product?.category || 'general');
    const [description, setDescription] = useState(product?.description || '');
    const [isBestseller, setIsBestseller] = useState(product?.is_bestseller || false);
    const [rating, setRating] = useState(product?.rating || '4.5');
    const [image, setImage] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('category', category);
        formData.append('description', description);
        formData.append('is_bestseller', isBestseller);
        formData.append('rating', rating);
        if (image) formData.append('image', image);

        await onSave(formData);
        setSubmitting(false);
    };

    return (
        <form className="admin-product-form" onSubmit={handleSubmit}>
            <h3>{product ? 'Edit Product' : 'Add New Product'}</h3>
            <div className="form-group">
                <label>Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
                <label>Price ($)</label>
                <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div className="form-group">
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="general">General</option>
                    <option value="face">Face</option>
                    <option value="lips">Lips</option>
                    <option value="eyes">Eyes</option>
                    <option value="fragrance">Fragrance</option>
                    <option value="body">Body</option>
                </select>
            </div>
            <div className="form-group">
                <label>Rating</label>
                <input type="number" step="0.1" min="0" max="5" value={rating} onChange={(e) => setRating(e.target.value)} />
            </div>
            <div className="form-group">
                <label>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" />
            </div>
            <div className="form-group checkbox-group">
                <input type="checkbox" id="bestseller" checked={isBestseller} onChange={(e) => setIsBestseller(e.target.checked)} />
                <label htmlFor="bestseller">Best Seller</label>
            </div>
            <div className="form-group">
                <label>Image</label>
                <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
            </div>
            <div className="form-actions">
                <button type="submit" className="btn" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Product'}
                </button>
                <button type="button" className="btn btn-cancel" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
}

function ProductsTab() {
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        const data = await fetchProducts();
        setProducts(Array.isArray(data) ? data : []);
    };

    const handleCreate = async (formData) => {
        await createProduct(formData);
        setShowForm(false);
        loadProducts();
    };

    const handleUpdate = async (formData) => {
        await updateProduct(editingProduct.id, formData);
        setEditingProduct(null);
        loadProducts();
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this product?')) {
            await deleteProduct(id);
            loadProducts();
        }
    };

    if (showForm) {
        return <ProductForm onSave={handleCreate} onCancel={() => setShowForm(false)} />;
    }

    if (editingProduct) {
        return <ProductForm product={editingProduct} onSave={handleUpdate} onCancel={() => setEditingProduct(null)} />;
    }

    return (
        <div>
            <div className="admin-tab-header">
                <h3>Products ({products.length})</h3>
                <button className="btn" onClick={() => setShowForm(true)}>+ Add Product</button>
            </div>
            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Category</th>
                            <th>Bestseller</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p) => (
                            <tr key={p.id}>
                                <td><img src={p.image} alt={p.name} className="admin-product-thumb" /></td>
                                <td>{p.name}</td>
                                <td>${parseFloat(p.price).toFixed(2)}</td>
                                <td>{p.category}</td>
                                <td>{p.is_bestseller ? '★' : '-'}</td>
                                <td>
                                    <button className="btn-sm btn-edit" onClick={() => setEditingProduct(p)}>Edit</button>
                                    <button className="btn-sm btn-delete" onClick={() => handleDelete(p.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function OrdersTab() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        const data = await fetchAllOrders();
        setOrders(Array.isArray(data) ? data : []);
    };

    const handleStatusChange = async (id, status) => {
        await updateOrderStatusAPI(id, status);
        loadOrders();
    };

    return (
        <div>
            <h3>Orders ({orders.length})</h3>
            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((o) => (
                            <tr key={o.id}>
                                <td>#{o.id}</td>
                                <td>{o.user_name}<br /><small>{o.user_email}</small></td>
                                <td>${parseFloat(o.total).toFixed(2)}</td>
                                <td>{o.payment_method}</td>
                                <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                                <td>
                                    <select
                                        value={o.status}
                                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                                        className="status-select"
                                    >
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function UsersTab() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        const data = await fetchAllUsers();
        setUsers(Array.isArray(data) ? data : []);
    };

    const handleRoleChange = async (id, role) => {
        await updateUserRoleAPI(id, role);
        loadUsers();
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this user?')) {
            await deleteUserAPI(id);
            loadUsers();
        }
    };

    return (
        <div>
            <h3>Users ({users.length})</h3>
            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td>{u.id}</td>
                                <td>{u.name}</td>
                                <td>{u.email}</td>
                                <td>
                                    <select
                                        value={u.role}
                                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                        className="status-select"
                                        disabled={u.id === currentUser.id}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                <td>
                                    {u.id !== currentUser.id && (
                                        <button className="btn-sm btn-delete" onClick={() => handleDelete(u.id)}>Delete</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchDashboardStats().then(setStats);
    }, []);

    return (
        <section className="admin-dashboard">
            <h2>Admin Dashboard</h2>
            <div className="admin-tabs">
                <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
                <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>Products</button>
                <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>Orders</button>
                <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Users</button>
            </div>
            <div className="admin-content">
                {activeTab === 'overview' && stats && <StatsCards stats={stats} />}
                {activeTab === 'products' && <ProductsTab />}
                {activeTab === 'orders' && <OrdersTab />}
                {activeTab === 'users' && <UsersTab />}
            </div>
        </section>
    );
}
