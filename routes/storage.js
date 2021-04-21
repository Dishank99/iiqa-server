const { Router } = require('express')
const router = Router()
const path = require('path')

const apiResponse = require('../helpers/apiResponse')
const { processFileName } = require('../helpers/utilities')
const StorageController = require('../controllers/storage')
const { authorize } = require('../middlewares')
global.XMLHttpRequest = require('xhr2')
const multer  = require('multer')
const upload = multer({dest:path.dirname(require.main.filename)+'/media'})

router.post('/', upload.array('images'), authorize(['Teacher']), async (req, res) => {
    try {
        console.log('new storage req')
        // console.log(req)
        // let { images } = req.files
        // console.log(images)
        // return res.json('success')
        if(!req.files) {
            return apiResponse.incompleteRequestBodyResponse(res, 'Provide Images to be uploaded.')
        }
        let images = req.files

        images = images.map(imageFile => {
            const newName = processFileName(imageFile.originalname)
            return {...imageFile, name: newName}
        })

        const uploadedImagesData = await StorageController.uploadImagesToFireBaseStorage(images)

        return apiResponse.successResponse(res, {uploadedFilesURLs:uploadedImagesData})
    } catch (err) {
        return apiResponse.internalServerError(res, err.message)
    }

})

module.exports = router