const express = require('express');
const router = express.Router(); 
router.use(express.json())

const { 
    getAllUsers, createUser, getAllProducts, createProduct, 
    getUserApiKeys, revokeApiKey, getUserById, updateUser, deleteUser,
    getProductById, updateProduct, deleteProduct,
    getAllOrders, createOrder, getUserOrders, getOrderById, updateOrderStatus, events, metrics
} = require('./data.js');

const { generateJWT, generateApiKey, authenticateUser } = require('./auth.js');
const { authenticateJWT, authenticateApiKey, transformRequest, cacheMiddleware, cacheInvalidationMiddleware } = require('./middleware.js');

// Apply middlewares in correct order
router.use(transformRequest);
router.use(cacheMiddleware);
// Apply cache invalidation only to POST/PUT/DELETE routes
router.use(['POST', 'PUT', 'DELETE'], cacheInvalidationMiddleware);

const cache = new Map();
const CACHE_TTL = {
    users: 5 * 60 * 1000,      
    products: 10 * 60 * 1000,     
    analytics: 1 * 60 * 1000    
};

function getCacheKey(method, url, querystring = '', userId = null){
    return `${method}:${url}:${querystring}${userId ? ':' + userId : ''}`
}

function getFromCache(key){
    const cached = cache.get(key);
    if(!cached) return null;
    
    // FIX: Changed Date.now() > CACHE_TTL to Date.now() > cached.expiresAt
    if(Date.now() > cached.expiresAt){
        cache.delete(key)
        return null
    }
    return cached.data
}

function saveToCache(key, data, ttl){
    cache.set(key, {
        data: data,
        expiresAt: Date.now() + ttl,
        createdAt: Date.now()
    })
}

function clearCachePattern(pattern) {
    for (let key of cache.keys()) {
        if (key.includes(pattern)) {
            cache.delete(key);
        }
    }
}

// AUTH ROUTES
router.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    const result = authenticateUser(username, password);
    
    if (!result) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = generateJWT({ userId: result.user.id, username: result.user.username });
    res.json({ token, user: result.user });
});

router.post('/auth/api-key', authenticateJWT, (req, res) => {
    const apiKey = generateApiKey(req.user.userId, req.body.permissions);
    if (!apiKey) {
        return res.status(400).json({ message: 'Failed to generate API key' });
    }
    res.json({ apiKey });
});

router.get('/auth/api-keys', authenticateJWT, (req, res) => {
    const userApiKeys = getUserApiKeys(req.user.userId);
    res.json({ apiKeys: userApiKeys });
});

router.delete('/auth/api-key/:id', authenticateJWT, (req, res) => {
    const deleted = revokeApiKey(parseInt(req.params.id), req.user.userId);
    if (!deleted) {
        return res.status(404).json({ message: 'API key not found' });
    }
    res.json({ success: true });
});

// USER ROUTES
router.get('/api/v1/users', authenticateJWT, (req, res) => {
    const users = getAllUsers();
    res.json({ users });
});

router.post('/api/v1/users', authenticateJWT, (req, res) => {
    const newUser = createUser(req.body);
    res.status(201).json({ user: newUser });
});

router.get('/api/v1/users/:id', authenticateJWT, (req, res) => {
    const user = getUserById(req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
});

router.put('/api/v1/users/:id', authenticateJWT, (req, res) => {
    const updatedUser = updateUser(req.params.id, req.body);
    if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user: updatedUser });
});

router.delete('/api/v1/users/:id', authenticateJWT, (req, res) => {
    const deleted = deleteUser(req.params.id);
    if (!deleted) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json({ success: true });
});

// PRODUCT ROUTES
router.get('/api/v1/products', (req, res) => {
    const products = getAllProducts();
    res.json({ products });
});

router.post('/api/v1/products', authenticateApiKey, (req, res) => {
    const newProduct = createProduct(req.body);
    res.status(201).json({ product: newProduct });
});

router.get('/api/v1/products/:id', (req, res) => {
    const product = getProductById(req.params.id);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ product });
});

router.put('/api/v1/products/:id', authenticateApiKey, (req, res) => {
    const updatedProduct = updateProduct(req.params.id, req.body);
    if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ product: updatedProduct });
});

router.delete('/api/v1/products/:id', authenticateApiKey, (req, res) => {
    const deleted = deleteProduct(req.params.id);
    if (!deleted) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ success: true });
});

// ORDER ROUTES
router.get('/api/v1/orders', authenticateJWT, (req, res) => {
    const userOrders = getUserOrders(req.user.userId);
    res.json({ orders: userOrders });
});

router.post('/api/v1/orders', authenticateJWT, (req, res) => {
    const orderData = { ...req.body, userId: req.user.userId };
    const newOrder = createOrder(orderData);
    res.status(201).json({ order: newOrder });
});

router.get('/api/v1/orders/:id', authenticateJWT, (req, res) => {
    const order = getOrderById(req.params.id, req.user.userId);
    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ order });
});

router.put('/api/v1/orders/:id/status', authenticateJWT, (req, res) => {
    const updatedOrder = updateOrderStatus(req.params.id, req.body.status);
    if (!updatedOrder) {
        return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ order: updatedOrder });
});

// ANALYTICS ROUTES
router.get('/api/v1/analytics/dashboard', authenticateJWT, (req, res) => {
    const totalUsers = getAllUsers().length
    const totalProducts = getAllProducts().length
    const totalOrders = getAllOrders().length

    res.status(200).json({
        totalUsers: totalUsers,
        totalProducts: totalProducts,
        totalOrders: totalOrders,
        timestamp: Date.now()
    })
});

router.post('/api/v1/analytics/events', authenticateJWT, (req, res) => {
    const eventData = {
        id: Date.now(),
        userId: req.user.userId,
        eventType: req.body.eventType,
        data: req.body.data,
        timestamp: Date.now()
    };
    events.push(eventData);
    
    res.status(201).json({ message: 'Event tracked', event: eventData });
});

// HEALTH & SYSTEM ROUTES
router.get('/health', (req, res) => { 
    const overallHealth = {
        status: 'healthy',
        services: {
            users: 'healthy',
            products: 'healthy', 
            orders: 'healthy',
            analytics: 'healthy'
        },
        timestamp: Date.now()
    };
    
    return res.status(200).json(overallHealth);
});

router.get('/health/:service', authenticateJWT, (req, res) => {
    const service = req.params.service;
    const validServices = ['users', 'products', 'orders', 'analytics'];
    if (!validServices.includes(service)) {
        return res.status(404).json({ error: 'Service not found' });
    }
    const serviceHealth = {
        service: service,
        status: 'healthy',
        responseTime: Math.random() * 100, 
        timestamp: Date.now()
    };
    res.json(serviceHealth);
});

router.get('/metrics', authenticateJWT, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    const systemMetrics = {
        totalRequests: 1250,
        averageResponseTime: 45,
        errorRate: 2.3,
        activeConnections: 15,
        uptime: Date.now() - (24 * 60 * 60 * 1000), 
        memoryUsage: '45MB',
        timestamp: Date.now()
    };
    return res.status(200).json({ metrics: systemMetrics });
});

// CACHE STATS ROUTE (for debugging)
router.get('/cache-stats', authenticateJWT, (req, res) => {
    const stats = {
        totalEntries: cache.size,
        entries: []
    };
    
    for (let [key, value] of cache.entries()) {
        const timeLeft = Math.max(0, value.expiresAt - Date.now());
        stats.entries.push({
            key: key,
            timeLeft: Math.round(timeLeft / 1000) + 's',
            createdAt: new Date(value.createdAt).toISOString(),
            isExpired: timeLeft === 0
        });
    }
    
    res.json(stats);
});




module.exports = {router, CACHE_TTL, getCacheKey, getFromCache, saveToCache, clearCachePattern};