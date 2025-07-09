let users = [];
let products = [];
let orders = [];
let apiKeys = [];
let metrics = {};
let events = []


let orderIdCounter = 1;


function getAllUsers(){
    return users;
}

function createUser(userData) {
    const newUser = {
        id: users.length+1,
        username: users.name,
        password: users.password,
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

function getUserApiKeys(userId){
    return apiKeys.filter(key => key.userId === userId)
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

function getUserOrders(userId){
    return orders.filter(order=> order.userId===parseInt(userId))
}

function getOrderById(id, userId){
    return orders.find(order => order.id === parseInt(id) && order.userId === parseInt(userId))
}

function updateOrderStatus(id, status){
    const order = orders.find(order=>order.id===parseInt(id))
    if(!order){
        return null
    }
    order.status = status
    return order;
}

function deleteProduct(id){
    const deleteIndex = orders.findIndex(product => product.id === id)
    if(!deleteIndex){
        return false
    }
    orders.splice(deleteIndex, 1)
    return true
}

module.exports = {
    users, products, orders, apiKeys, metrics, events,
    getAllUsers, createUser, getUserById, updateUser, deleteUser,
    getAllProducts, createProduct, getProductById, updateProduct, deleteProduct,
    getAllOrders, createOrder, getUserOrders, getOrderById, updateOrderStatus,
    getUserApiKeys, revokeApiKey
}
