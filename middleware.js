const { verifyJWT } = require('./auth.js');
const { apiKeys } = require('./data.js');

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

function setupCORS(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
    next();
}

module.exports = {
    authenticateJWT,
    authenticateApiKey,
    setupCORS
}