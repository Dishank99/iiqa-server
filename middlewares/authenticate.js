const {auth} = require('../configs/firebase')
const apiResponse = require('../helpers/apiResponse')
const { parseCookies } = require('../helpers/utilities')

// middlewares have next parameter which points to the next middleware 
const authenticate = async (req, res, next) => {
    try {
        if(req.headers.cookie){
            const { token } = parseCookies(req.headers.cookie)
            if(token){
                const decodedToken = await auth.verifyIdToken(token)
                console.log(decodedToken)
                const { uid } = decodedToken
                req.user = { token, uid }
                // console.log('authenticated', token)
                return next()
            }
        }
        return apiResponse.incompleteRequestBodyResponse(res, 'Please provide token for authentication')
    } catch (err) {
        console.log(err)
        return apiResponse.notFoundErrorResponse(res, 'User not found')
    }
}

module.exports = authenticate