const express = require('express');
const router = express();
router.use(express.json())
const { getAllUsers, createUser, getAllProducts, createProduct, getUserApiKeys, revokeApiKey, getUserById, updateUser } = require('./data.js');
const { generateJWT, generateApiKey } = require('./auth.js');
const { authenticateJWT, authenticateApiKey } = require('./middleware.js');

router.post('/auth/login', (req,res)=>{
    const token = generateJWT({id: 1, email: req.body.email})
    res.json({token})
})

router.post('/auth/api-key', authenticateJWT, (req,res)=> {
    const apiKey = generateApiKey(req.user.userId, req.body.permissions)
    res.json({apiKey})
})

router.get('/api/v1/users', authenticateJWT, (req, res) => {
    const users = getAllUsers();
    res.json({users});
});

router.post('/api/v1/users', authenticateJWT, (req,res)=>{
    const newUser = createUser(req.body)
    res.json({newUser})
})

router.get('/api/v1/products', (req,res)=>{
    const products = getAllProducts()
    res.json({products})
})

router.post('/api/v1/products', authenticateApiKey, (req,res)=>{
    const newProduct = createProduct(req.body)
    res.json({newProduct})
})

router.get('/auth/api-keys', authenticateJWT, (req,res)=>{
    const userApiKey = getUserApiKeys(req.user.userId);
    if(!userApiKey){
        return res.status(404).json({message: "Not Found"})
    }
    return res.status(200).json({ userkeys: userApiKey})
})

router.delete('/auth/api-key/:id', authenticateJWT, (req, res) => {
    const deleted = revokeApiKey(req.params.id, req.user.userId);
    res.json({ success: deleted });
});

router.get('/api/v1/users/:id', authenticateJWT, (req,res)=>{
    const user = getUserById(req.params.id)
    return res.status(200).json({message: `User is `+ user})
})

router.post('/api/v1/users/:id', authenticateJWT, (req,res)=>{
    const updatedUser = updateUser(req.params.id)
    return res.status(200).json(updatedUser)
})

router.get('/api/v1/user/:id', authenticateJWT, (req,res)=>{
    const user = getUserById(req.params.id)
    if(!user){
        return res.status(400).json({message: "Not found"})
    }
    return res.json(user)
})


module.exports = {router};