const { Router } = require('express')
const router = Router()

const ImageSetController = require('../controllers/imageSet')
const apiResponse = require('../helpers/apiResponse')

router.get('/', async (req, res) => {
    const { classroomDocId } = req.query

    try {

        let response = null
        if(classroomDocId) {
            response = await ImageSetController.getClassroomImageSet(classroomDocId)
        } else {
            response = await ImageSetController.getPredefinedImageSets()
        }
        return apiResponse.successResponse(res, { imageSets: response })
    } catch (err) {
        return apiResponse.internalServerError(res, err.message)
    }

})

router.post('/', async (req, res) => {
    const { classroomDocId, imageLinks, displayPicture, name } = req.body

    try {
        let responseMessage = ''
        if(imageLinks && imageLinks.length > 0) {
            if(name && !(classroomDocId)){
                responseMessage = await ImageSetController.createImageSet(displayPicture, imageLinks, name) 
            } else if (classroomDocId && !displayPicture) {
                responseMessage = await ImageSetController.createImageSetForClassroom(classroomDocId, imageLinks)
            }
            return apiResponse.createdResponse(res, responseMessage)
        }
        return apiResponse.incompleteRequestBodyResponse(res, 'Provide both classroomDocId and imageLinks')

    } catch (err) {
        return apiResponse.internalServerError(res, err.message)
    }
})

module.exports = router