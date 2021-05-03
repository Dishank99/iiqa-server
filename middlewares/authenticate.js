const {auth} = require('../configs/firebase')
const apiResponse = require('../helpers/apiResponse')
const { parseCookies } = require('../helpers/utilities')

// middlewares have next parameter which points to the next middleware 
const authenticate = async (req, res, next) => {
    try {
        console.log(req.cookies)
        if(req.cookies.session){
            const decodedClaims = await auth.verifySessionCookie(req.cookies.session, true)
            console.log(decodedClaims)
            const {uid} = decodedClaims
            req.user = {uid}
            console.log('requser', req.user)
            return next()
        }
        return apiResponse.incompleteRequestBodyResponse(res, 'Please provide token for authentication')
    } catch (err) {
        console.log(err)
        return apiResponse.notFoundErrorResponse(res, 'User not found')
    }
}

module.exports = authenticate