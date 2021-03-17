const express = require('express')
const router = express.Router()

const UserController = require('../controllers/user')
const apiResponse = require('../helpers/apiResponse')

router.get('/', async (req, res) => {
    const { userDocId, userAuthId } = req.query

    try {
        let userData = null
        if(userDocId && !userAuthId) {
            userData = await UserController.getProfileDataFromDocId(userDocId)
        } else if(userAuthId && !userDocId) {
            userData = await UserController.getOnlyUserProfileFromAuthUID(userAuthId)            
        } else {
            return apiResponse.incompleteRequestBodyResponse(res, 'Either userAuthId or userDocId')
        }

        return apiResponse.successResponse(res, {user: userData})
    } catch (err) {
        return err.message === 'notfound'? apiResponse.notFoundErrorResponse(res) : apiResponse.internalServerError(res, err.message)
    }
})

router.post('/', async (req, res) => {
    const { fname, lname, uid, isTeacher, isStudent } = req.body
    console.log(req.body)
    if(!(fname && lname && uid && (isTeacher || isStudent))){
        return apiResponse.incompleteRequestBodyResponse(res, 'fname, lname, uid, isTeacher or isStudent are required')
    }
    try {
        let respMessage = ''
        if(isStudent)
            respMessage = await UserController.createUser({ fname, lname, uid, isTeacher:false, isStudent:true })
        else 
            respMessage = await UserController.createUser({ fname, lname, uid, isTeacher:true, isStudent:false })
        return apiResponse.createdResponse(res, respMessage)
    } catch (err) {
        throw err.message === 'duplicate'? apiResponse.duplicateDataResponse(res) : apiResponse.internalServerError(res, err.message)
    }
})

module.exports = router