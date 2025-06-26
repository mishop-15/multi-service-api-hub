const jwt = require ('jsonwebtoken')
const { apiKeys } = require('./data.js')

function generateJWT(user){
    return jwt.sign({userId: user.id}, 'secret', {expiresIn: '2h'})
}

function verifyJWT(token){
    try{
        return jwt.verify(token, 'secret')
    }
    catch(err) {
        return null;
    }
}

function generateApiKey(userId, permissions) {
    const apiKey = {
        id: Date.now(),
        key: 'api_' + Math.random().toString(36).substr(2, 9),
        userId,
        permissions,
        createdAt: Date.now()
    }

    apiKeys.push(apiKey)
    return apiKey
}

module.exports = {
    generateJWT,
    verifyJWT,
    generateApiKey
}

