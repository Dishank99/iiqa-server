const {auth, firestore} = require('../configs/firebase')
const apiResponse = require('../helpers/apiResponse')
const { getOnlyUserProfileFromAuthUID } = require('../controllers/user')

// middlewares have next parameter which points to the next middleware 
const authorize = (roles = []) => {
    roles = roles.map(roleTitle => `is${roleTitle}`)

    async function authorizeMiddleWare(req, res, next){
        try {
            const { token } = req.user
            try {
                var { uid } = await auth.verifyIdToken(token)
            } catch (err) {
                return apiResponse.notFoundErrorResponse(res, 'Please provide valid token for authentication')
            }
            if (!uid){
                return apiResponse.notFoundErrorResponse(res, 'User not found')
            }
            const userData = await getOnlyUserProfileFromAuthUID(uid)
            console.log(userData)
            const isAnyRoleSatified = roles.some(role => userData[role])
            if (isAnyRoleSatified) {
                req.user = {...res.user, ...userData}
                return next()
            }
            return apiResponse.notAuthorizedResponse(res)
        } catch (err) {
            console.log(err)
            return apiResponse.internalServerError(res, err.message)
        }
    }

    return authorizeMiddleWare
}

module.exports = authorize