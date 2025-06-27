let users = [];
let products = [];
let orders = [];
let apiKeys = [];
let metrics = {};

function getAllUsers(){
    return users;
}

function createUser(userData) {
    const newUser = {
        id: userData.length+1,
        username: userData.name,
        password: userData.password,
        createdAt: Date.now()
    }
    users.push(newUser)
    console.log("New user created")
    return newUser
}

function getUserById(id){
    const findUser = users.find(u=> u.id === parseInt(id))
    return findUser
}

function getAllProducts(){
    return products
}

function createProduct(productData) {
    const newProduct = {
        id: products.length+1,
        name: productData.name,
        price: productData.price,
        description: productData.description,
        createdAt: Date.now()
    }

    products.push(newProduct)
    return newProduct
}

function getAllOrders() {
    return orders
}

function createOrder(orderData) {
    const newOrder = {
        id: orders.length + 1,
        userId: orderData.userId,
        productId: orderData.productId,
        quantity: orderData.quantity,
        status: 'pending',
        createdAt: Date.now()
    }

    orders.push(newOrder)
    return newOrder
}

function getUserApiKeys(id){
    return users.find(u=> u.id === users.id)
}

function revokeApiKey(keyId, userId) {
    const apiKeyIndex = apiKeys.findIndex(key => key.id === keyId);
    if (apiKeyIndex === -1) {
        return false; 
    }
    const apiKey = apiKeys[apiKeyIndex]
    if (apiKey.userId !== userId) {
        return false; 
    }
    apiKeys.splice(apiKeyIndex, 1);
    return true; 
}

function updateUser(id, updates) {
    const userIndex = users.findIndex(u => u.id === parseInt(id)); 
    if (userIndex === -1) {
        return null;
    }
    const oldInfo = users[userIndex];
    if (updates.name !== undefined) oldInfo.name = updates.name;
    if (updates.email !== undefined) oldInfo.email = updates.email;
    if (updates.phone !== undefined) oldInfo.phone = updates.phone;
    if (updates.bio !== undefined) oldInfo.bio = updates.bio;
    oldInfo.updatedAt = new Date().toISOString();
    
    return oldInfo;
}

function getProductById(id){
    const findProduct = products.find(p => p.id === parseInt(id))
    return findProduct
}

function deleteUser(id){
    const userIndex = users.findIndex(u=> u.id === parseInt(id))
    if(userIndex === -1) {
        return false
    }
    users.splice(userIndex, 1)
    return true
}

function updateProduct(id, updates){
    const findProduct = products.find(p=> p.id === parseInt(id))
    if(!findProduct){
        return null
    }
    if(updates.name!== undefined){findProduct.name = updates.name}
    if(updates.price!== undefined){findProduct.price = updates.price}
    findProduct.updatedAt = new Date().toISOString()

    return findProduct
}



module.exports = {
    users, products, orders, apiKeys, metrics,

    getAllUsers, createUser, getUserById,

    getAllOrders, createOrder,

    getAllProducts, createProduct, 

    getUserApiKeys, revokeApiKey, 

    updateUser, getProductById, updateProduct, 

    deleteUser
}
