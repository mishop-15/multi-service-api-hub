const express = require('express');
const app = express();
app.use(express.json())
const { getAllUsers, createUser, getAllProducts, createProduct, getUserApiKeys, revokeApiKey } = require('./data.js');
const { generateJWT, generateApiKey } = require('./auth.js');
const { authenticateJWT, authenticateApiKey } = require('./middleware.js');

app.post('/auth/login', (req,res)=>{
    const token = generateJWT({id: 1, email: req.body.email})
    res.json({token})
})

app.post('/auth/api-key', authenticateJWT, (req,res)=> {
    const apiKey = generateApiKey(req.user.userId, req.body.permissions)
    res.json({apiKey})
})

app.get('/api/v1/users', authenticateJWT, (req, res) => {
    const users = getAllUsers();
    res.json({users});
});

app.post('/api/v1/users', authenticateJWT, (req,res)=>{
    const newUser = createUser(req.body)
    res.json({newUser})
})

app.get('/api/v1/products', (req,res)=>{
    const products = getAllProducts()
    res.json({products})
})

app.post('/api/v1/products', authenticateApiKey, (req,res)=>{
    const newProduct = createProduct(req.body)
    res.json({newProduct})
})

app.get('/auth/api-keys', authenticateJWT, (req,res)=>{
    const userApiKey = getUserApiKeys(req.user.userId);
    if(!userApiKey){
        return res.status(404).json({message: "Not Found"})
    }
    return res.status(200).json({ userkeys: userApiKey})
})

app.delete('/auth/api-key/:id', authenticateJWT, (req, res) => {
    const deleted = revokeApiKey(req.params.id, req.user.userId);
    res.json({ success: deleted });
});



module.exports = app;