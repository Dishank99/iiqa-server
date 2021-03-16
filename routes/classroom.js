const express = require('express')
const router = express.Router()

const ClassroomController = require('../controllers/classroom')
const apiResponse = require('../helpers/apiResponse')

router.get('/', async (req, res) => {
    // TODO: add condition for getting classroom data
    const { studentDocId, teacherDocId } = req.query
    
    try {
        let response = null
        if(studentDocId && !teacherDocId) {
            response = await ClassroomController.getClassroomsForStudent(studentDocId)
        } else if (teacherDocId && !studentDocId) {
            response = await ClassroomController.getClassroomsForTeacher(teacherDocId)
        } else {
            return apiResponse.incompleteRequestBodyResponse(res, 'Provide either studentDocId or teacherDocId')
        }

        return apiResponse.successResponse(res, response)
    } catch (err) {
        return apiResponse.internalServerError(res, err.message)
    }
})

router.post('/', async (req, res) => {
    const { name, color, teacherDocId, displayPicture } = req.body

    if(!(name && color && teacherDocId && displayPicture)){
        return apiResponse.incompleteRequestBodyResponse(res, 'Provide name, color teacherDocId, displayPicture as they are required')
    }

    try {
        const responseMessage = await ClassroomController.createNewClassroom(name, color, teacherDocId, displayPicture)
        return apiResponse.createdResponse(res, responseMessage)
    } catch (err) {
        return apiResponse.internalServerError(res, err.message)
    }

})

router.put('/', async (req, res) => {
    //api for addding student into the clasroom
    const { classroomDocId, studentDocId } = req.body

    if(!(classroomDocId && studentDocId)) {
        return apiResponse.incompleteRequestBodyResponse(res, 'Provide both classroomDocId and StudentDocId')
    }

    try {
        const responseMessage = await ClassroomController.addStudentInClassroom(classroomDocId, studentDocId)
        return apiResponse.createdResponse(res, responseMessage)
    } catch (err) {
        console.log(err.message)
        if(err.message === 'notfound')
            return apiResponse.notFoundErrorResponse(res, 'Classroom for given classroomDocId doesnot exists')
        else if (err.message === 'duplicate')
            return apiResponse.duplicateDataResponse(res, 'Student already exists in this classroom')
        else
            return apiResponse.internalServerError(res, err.message)
    }
})

module.exports = router