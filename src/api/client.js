const API_BASE = '/api';

let accessToken = localStorage.getItem('accessToken');
let refreshToken = localStorage.getItem('refreshToken');

export function setTokens(access, refresh) {
    accessToken = access;
    refreshToken = refresh;
    if (access) localStorage.setItem('accessToken', access);
    else localStorage.removeItem('accessToken');
    if (refresh) localStorage.setItem('refreshToken', refresh);
    else localStorage.removeItem('refreshToken');
}

export function getStoredTokens() {
    return {
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken'),
    };
}

export function clearTokens() {
    accessToken = null;
    refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
}

async function refreshAccessToken() {
    const stored = getStoredTokens();
    if (!stored.refreshToken) return null;

    try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: stored.refreshToken }),
        });

        if (!res.ok) {
            clearTokens();
            return null;
        }

        const data = await res.json();
        setTokens(data.accessToken, stored.refreshToken);
        return data.accessToken;
    } catch {
        clearTokens();
        return null;
    }
}

export async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = { ...options.headers };

    if (accessToken && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    let res = await fetch(url, { ...options, headers });

    if (res.status === 403 || res.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
            headers['Authorization'] = `Bearer ${newToken}`;
            res = await fetch(url, { ...options, headers });
        }
    }

    return res;
}

// Auth API
export async function loginAPI(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    return res.json();
}

export async function registerAPI(name, email, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });
    return res.json();
}

export async function logoutAPI() {
    const stored = getStoredTokens();
    await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: stored.refreshToken }),
    });
    clearTokens();
}

// Products API
export async function fetchProducts(category) {
    const url = category ? `${API_BASE}/products?category=${encodeURIComponent(category)}` : `${API_BASE}/products`;
    const res = await fetch(url);
    return res.json();
}

export async function fetchBestSellers() {
    const res = await fetch(`${API_BASE}/products/bestsellers`);
    return res.json();
}

export async function createProduct(formData) {
    const res = await apiFetch('/products', { method: 'POST', body: formData });
    return res.json();
}

export async function updateProduct(id, formData) {
    const res = await apiFetch(`/products/${id}`, { method: 'PUT', body: formData });
    return res.json();
}

export async function deleteProduct(id) {
    const res = await apiFetch(`/products/${id}`, { method: 'DELETE' });
    return res.json();
}

// Cart API
export async function fetchCart() {
    const res = await apiFetch('/cart');
    if (!res.ok) return [];
    return res.json();
}

export async function addToCartAPI(productId, quantity = 1) {
    const res = await apiFetch('/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
    });
    return res.json();
}

export async function updateCartItemAPI(id, quantity) {
    const res = await apiFetch(`/cart/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
    });
    return res.json();
}

export async function removeFromCartAPI(id) {
    const res = await apiFetch(`/cart/${id}`, { method: 'DELETE' });
    return res.json();
}

// Orders API
export async function createOrderAPI(orderData) {
    const res = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
    });
    return res.json();
}

export async function fetchUserOrders() {
    const res = await apiFetch('/orders');
    if (!res.ok) return [];
    return res.json();
}

// Admin API
export async function fetchDashboardStats() {
    const res = await apiFetch('/admin/stats');
    return res.json();
}

export async function fetchAllUsers() {
    const res = await apiFetch('/admin/users');
    return res.json();
}

export async function fetchAllOrders() {
    const res = await apiFetch('/orders/all');
    return res.json();
}

export async function updateOrderStatusAPI(id, status) {
    const res = await apiFetch(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
    return res.json();
}

export async function updateUserRoleAPI(id, role) {
    const res = await apiFetch(`/admin/users/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
    });
    return res.json();
}

export async function deleteUserAPI(id) {
    const res = await apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
    return res.json();
}

// Reviews API
export async function fetchProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    return res.json();
}

export async function fetchReviews(productId) {
    const res = await fetch(`${API_BASE}/products/${productId}/reviews`);
    return res.json();
}

export async function createReviewAPI(productId, rating, comment) {
    const res = await apiFetch(`/products/${productId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment }),
    });
    return res.json();
}

export async function deleteReviewAPI(productId, reviewId) {
    const res = await apiFetch(`/products/${productId}/reviews/${reviewId}`, { method: 'DELETE' });
    return res.json();
}
