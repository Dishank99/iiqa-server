const { Router } = require('express')
const router = Router()
const apiResponse = require('../helpers/apiResponse')
const { auth } = require('../configs/firebase')

router.post('/login', async (req, res) => {
    const { token } = req.body
    if(!token){
        return apiResponse.incompleteRequestBodyResponse(res, 'Provide token for session login')
    }

    try {
        const expiresIn = 60 * 60 * 24 * 5 * 1000;
        const sessionCookie = await auth.createSessionCookie(token, {expiresIn})
        res.cookie('session', sessionCookie, { maxAge: expiresIn, httpOnly:true, sameSite:'none', secure:true, path:'/'})
        return apiResponse.createdResponse(res, 'Cookie created')
    } catch(err) {
        console.log(err)
        return apiResponse.internalServerError(res, err.message)
    }
})

router.post('/logout', (req, res) => {
    try {
        res.clearCookie('session', { httpOnly:true, sameSite:'none', secure:true, path:'/'})
        return apiResponse.createdResponse(res, 'Session erased')
    } catch(err) {
        return apiResponse.internalServerError(res, err.message)
    }
})

module.exports = router