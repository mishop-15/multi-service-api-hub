const { verifyJWT } = require('./auth.js');
const { apiKeys } = require('./data.js');
const {CACHE_TTL, getCacheKey, getFromCache, saveToCache, clearCachePattern} = require('./routes.js')

function authenticateJWT(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if(!token) {
        return res.status(401).json({error: "No token provided"})
    } 
    const decoded = verifyJWT(token)
    if(!decoded) {
        return res.status(401).json({error: "Invalid token"})
    }
    req.user = decoded;
    next();
}

function authenticateApiKey(req, res, next) {
    const apiKey = req.header('X-API-Key');
    if (!apiKey) {
        return res.status(401).json({ error: 'No API key provided' });
    }
    const key = apiKeys.find(k => k.key === apiKey);
    if (!key) {
        return res.status(401).json({ error: 'Invalid API key' });
    }
    req.apiKey = key;
    req.user = { userId: key.userId };
    next();
}

function transformRequest(req, res, next){
    req.requestId = 'req_' + Math.random().toString(36).substring(2,9);
    let serviceName = 'unknown'
    if(req.path.includes('/users')) serviceName = 'user-service'
    if(req.path.includes('/products')) serviceName = 'product-service'
    if(req.path.includes('/orders')) serviceName = 'order-service'
    if(req.path.includes('/analytics')) serviceName = 'analytics-service'

    req.serviceName = serviceName;

    const originalJson = res.json;
    res.json = function (data){
        res.set('X-Service-Name', req.serviceName)  
        res.set('X-Request-ID', req.requestId)
    
        const transformedData = {
            service: req.serviceName,
            data: data,                    
            timestamp: Date.now(),
            requestId: req.requestId
        };
        return originalJson.call(this, transformedData);
    }
    next();
}

function cacheMiddleware(req, res, next){
    if(req.method !== 'GET') return next();

    let ttl = 0;
    if(req.path.includes('/users')){
        ttl = CACHE_TTL.users;
    }
    else if (req.path.includes('/products')) {
        ttl = CACHE_TTL.products;
    } else if (req.path.includes('/analytics')) {
        ttl = CACHE_TTL.analytics;
    }
    
    if (ttl === 0) {
        return next();
    }

    const querystring = req.url.split('?')[1] || '';
    const userId = req.user ? req.user.userId : null;
    const cacheKey = getCacheKey(req.method, req.path, querystring, userId);
    const cachedData = getFromCache(cacheKey);
    
    if (cachedData) {
        console.log(`Cache HIT for key: ${cacheKey}`);
        return res.json(cachedData);
    }
    
    console.log(`Cache MISS for key: ${cacheKey}`);
    const originalJson = res.json;
    res.json = function(data) {
        saveToCache(cacheKey, data, ttl);
        console.log(`Cached data for key: ${cacheKey}`);
        originalJson.call(this, data);
    };
    
    next();
}

function cacheInvalidationMiddleware(req, res, next){
    const originalJson = res.json;
    res.json = function(data){
        if(res.statusCode >= 200 && res.statusCode < 300){
            if (req.path.includes('/users')) {
                clearCachePattern('/api/v1/users');
                console.log('Invalidated users cache');
            } else if (req.path.includes('/products')) {
                clearCachePattern('/api/v1/products');
                console.log('Invalidated products cache');
            } else if (req.path.includes('/orders')) {
                clearCachePattern('/api/v1/orders');
                clearCachePattern('/api/v1/analytics'); 
                console.log('Invalidated orders and analytics cache');
            }
        }
        originalJson.call(this, data);
    }
    next();
}

function setupCORS(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
    next();
}

module.exports = {
    authenticateJWT,
    authenticateApiKey,
    setupCORS, 
    transformRequest, 
    cacheMiddleware,
    cacheInvalidationMiddleware  
}