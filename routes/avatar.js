const { Router } = require('express')
const router = Router()

const AvatarController = require('../controllers/avatar')
const apiResponse = require('../helpers/apiResponse')
const { authorize } = require('../middlewares')

router.get('/', async (req, res) => {
    try {
        const response = await AvatarController.getAvatarImageLinks()
        return apiResponse.successResponse(res, { avatars: response })
    } catch (err) {
        return apiResponse.internalServerError(res, err.message)
    }
})

module.exports = router