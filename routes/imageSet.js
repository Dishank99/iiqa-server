const { Router } = require('express')
const router = Router()

const ImageSetController = require('../controllers/imageSet')
const apiResponse = require('../helpers/apiResponse')

router.get('/', async (req, res) => {
    try {
        const response = await ImageSetController.getPredefinedImageSets()
        return apiResponse.successResponse(res, { imageSets: response })
    } catch (err) {
        return apiResponse.internalServerError(res, err.message)
    }

})

router.post('/', async (req, res) => {
    const { imageLinks, displayPicture, name } = req.body

    try {
        if(imageLinks && imageLinks.length > 0 && name) {
            const responseMessage = await ImageSetController.createImageSet(displayPicture, imageLinks, name) 
            return apiResponse.createdResponse(res, responseMessage)
        }
        return apiResponse.incompleteRequestBodyResponse(res, 'Provide both imageLinks and name as they are required')
    } catch (err) {
        return apiResponse.internalServerError(res, err.message)
    }
})

module.exports = router