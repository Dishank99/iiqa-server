const {auth} = require('../configs/firebase')
const apiResponse = require('../helpers/apiResponse')

// middlewares have next parameter which points to the next middleware 
const authenticate = async (req, res, next) => {
    try {
        console.log(req.headers.authorization)
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            const token = req.headers.authorization.split(' ')[1]
            if(token){
                const { uid } = await auth.verifyIdToken(token)
                req.user = { token, uid }
                // console.log('authenticated', token)
                return next()
            }
        }
        return apiResponse.incompleteRequestBodyResponse(res, 'Please provide token for authentication')
    } catch (err) {
        return apiResponse.notFoundErrorResponse(res, 'User not found')
    }
}

module.exports = authenticate