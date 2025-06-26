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
    const findUser = users.find(u=> u.id === users.id)
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

module.exports = {
    users, products, orders, apiKeys, metrics,

    getAllUsers, createUser, getUserById,

    getAllOrders, createOrder,

    getAllProducts, createProduct, 

    getUserApiKeys, revokeApiKey
}
