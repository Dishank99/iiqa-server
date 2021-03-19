const express = require('express')
const router = express.Router()

const ClassroomController = require('../controllers/classroom')
const { getProfileDataFromDocId } = require('../controllers/user')
const apiResponse = require('../helpers/apiResponse')

router.get('/', async (req, res) => {
    const { studentDocId, teacherDocId, classroomDocId } = req.query
    
    try {
        let response = null
        if(studentDocId && !(teacherDocId && classroomDocId)) {
            response = await ClassroomController.getClassroomsForStudent(studentDocId)
        } else if (teacherDocId && !(studentDocId && classroomDocId)) {
            response = await ClassroomController.getClassroomsForTeacher(teacherDocId)
        } else if (classroomDocId && !(teacherDocId && studentDocId)) {
            const classroomData = await ClassroomController.getClassroomData(classroomDocId)
            const { studentIds, ...restOfData } = classroomData
            const studentDataList = await Promise.all(studentIds.map(studentDocId => getProfileDataFromDocId(studentDocId)))
            response = { ...restOfData, studentDataList  }
        } else {
            return apiResponse.incompleteRequestBodyResponse(res, 'Provide either studentDocId or teacherDocId or classroomDocId')
        }

        return apiResponse.successResponse(res, {classroomData: response})
    } catch (err) {
        return err.message === 'notfound'? apiResponse.notFoundErrorResponse(res,'Classroom for given classroomDocId doesnot exists') : apiResponse.internalServerError(res, err.message)
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

const getAllAttendeesStudentDataAsync = async function(attendeeData) {
    const { studentDocId, ...restOfTheData } = attendeeData
    const studentData = await getProfileDataFromDocId(studentDocId)
    return { studentData, ...restOfTheData }
}

router.get('/quiz', async(req, res) => {
    // if classroomDocId only then all the quizzes of that classroom
    // if both classroomDocId and quizDocId then return specified quiz data
    const { classroomDocId, quizDocId } = req.query

    try {

        let response = null
        if(classroomDocId && quizDocId) {
            response = await ClassroomController.getSpecifiedGeneratedQuiz(classroomDocId, quizDocId)
        } else if (classroomDocId && ! quizDocId) {
            response = await ClassroomController.getAllGeneratedQuiz(classroomDocId)
        } else {
            return apiResponse.incompleteRequestBodyResponse(res, 'Provide either both classroomDocId and quizDocId or just classroomDocId')
        }

        return apiResponse.successResponse(res, { quizData: response})

    } catch (err) {
        return err.message === 'notfound'? apiResponse.notFoundErrorResponse(res, 'Quiz for given data doesnot exist') : apiResponse.internalServerError(res, err.message)
    }
})

router.post('/quiz', async (req, res) => {
    // to put up new quiz
    // quiz data and classroomDocId

    const { generate } = req.query
    const { imageLinksArray, classroomDocId, quizData } = req.body

    try {

        let response = null
        if (generate && !imageLinksArray) {
            return apiResponse.incompleteRequestBodyResponse(res, 'Provide either generate param and imageLinksArray or classroomDocId and QuizData')
        } else if( generate && imageLinksArray && !(classroomDocId && quizData) ) {
            response = await ClassroomController.dummy(imageLinksArray)
        } else if ( classroomDocId && quizData && !(generate && imageLinksArray) ) {
            response = await ClassroomController.uploadGeneratedQuiz(quizData, classroomDocId)
            response = {quizDocId: response}
        } else {
            return apiResponse.incompleteRequestBodyResponse(res, 'Provide either generate param and imageLinksArray or classroomDocId and QuizData')
        }

        return apiResponse.successResponse(res, response)

    } catch (err) {
        return apiResponse.internalServerError(res, err.message)
    }

})

router.get('/quiz/attendees', async (req, res) => {
    const { classroomDocId, quizDocId, eligibilityCheck, studentDocId } = req.query

    try {

        let response = null
        if( classroomDocId && quizDocId && !(eligibilityCheck && studentDocId) ) {
            response = await ClassroomController.getAllAttendees(classroomDocId, quizDocId)
            response = await Promise.all(response.map(attendeeData => getAllAttendeesStudentDataAsync(attendeeData)))
            response = { attendees: response }
        } else if (eligibilityCheck && classroomDocId && quizDocId && studentDocId) {
            response = await ClassroomController.studentEligibiltyStatus(classroomDocId, quizDocId, studentDocId)
            response = { eligibilityStatus: response }
        } else {
            return apiResponse.incompleteRequestBodyResponse(res, 'Provide both classroomDocId and quizDocId')
        }

        return apiResponse.successResponse(res, response)

    } catch (err) {
        return apiResponse.internalServerError(res, err.message)
    }
})

router.post('/quiz/attendees', async (req, res) => {
    //api for creating the attendee obj with score
    const { classroomDocId, quizDocId, studentDocId, score, outOffScore } = req.body

    try {

        if(classroomDocId && quizDocId && studentDocId && score && outOffScore){
            const responseMessage = await ClassroomController.addAnAttendee(classroomDocId, quizDocId, studentDocId, score, outOffScore)
            return apiResponse.createdResponse(res, responseMessage)
        } else {
            return apiResponse.incompleteRequestBodyResponse(res, 'Provide classroomDocId, quizDocId, studentDocId, score, outOffScore as they all are required')
        }
    } catch (err) {
        return err.message === 'notauthorized'? apiResponse.notAuthorizedResponse(res) : apiResponse.internalServerError(res, err.message)
    }
})

router.get('/imageset', async (req, res) => {
    const { classroomDocId } = req.query

    try {

        let response = null
        if(classroomDocId) {
            response = await ClassroomController.getClassroomImageSet(classroomDocId)
        } else {
            return apiResponse.incompleteRequestBodyResponse(res, 'Provide classroomDocId')
        }
        return apiResponse.successResponse(res, { imageSets: response })
    } catch (err) {
        return apiResponse.internalServerError(res, err.message)
    }

})

router.post('/imageset', async (req, res) => {
    const { classroomDocId, imageLinks } = req.body

    try {
        if(classroomDocId && imageLinks && imageLinks.length > 0) {
            const responseMessage = await ClassroomController.createImageSetForClassroom(classroomDocId, imageLinks)
            return apiResponse.createdResponse(res, responseMessage)
        }
        return apiResponse.incompleteRequestBodyResponse(res, 'Provide both classroomDocId and imageLinks')

    } catch (err) {
        return apiResponse.internalServerError(res, err.message)
    }
})

module.exports = router