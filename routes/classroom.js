const express = require('express')
const router = express.Router()

const ClassroomController = require('../controllers/classroom')
const { getProfileDataFromDocId } = require('../controllers/user')
const apiResponse = require('../helpers/apiResponse')

router.get('/:classroomDocId', async (req, res) => {
    const { classroomDocId } = req.params
    
    if(!classroomDocId){
        return apiResponse.incompleteRequestBodyResponse(res, 'Provide classroomDocId')
    }

    try {
        let response = null
        const classroomData = await ClassroomController.getClassroomData(classroomDocId)
        const { studentIds, teacherId, ...restOfData } = classroomData
        const studentDataListPromise = Promise.all(studentIds.map(studentDocId => getProfileDataFromDocId(studentDocId)))
        const teacherDataPromise = getProfileDataFromDocId(teacherId)
        try {
            const [ teacherData, studentDataList ] = await Promise.all([teacherDataPromise, studentDataListPromise])
            response = { ...restOfData, studentDataList, teacherData  }
        } catch (err) {
            response = { ...classroomData }
        }

        return apiResponse.successResponse(res, {classroomData: response})
    } catch (err) {
        return err.message === 'notfound'? apiResponse.notFoundErrorResponse(res,'Classroom for given classroomDocId doesnot exists') : apiResponse.internalServerError(res, err.message)
    }
})

router.get('/', async (req, res) => {
    const { studentDocId, teacherDocId } = req.query
    
    try {
        let response = null
        if(studentDocId && !teacherDocId) {
            response = await ClassroomController.getClassroomsForStudent(studentDocId)
        } else if (teacherDocId && !studentDocId) {
            response = await ClassroomController.getClassroomsForTeacher(teacherDocId)
        } else {
            return apiResponse.incompleteRequestBodyResponse(res, 'Provide either studentDocId or teacherDocId or classroomDocId')
        }

        return apiResponse.successResponse(res, {classrooms: response})
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

router.patch('/:classroomDocId', async (req, res) => {
    //api for addding student into the clasroom
    const { classroomDocId } = req.params
    const dataToBePatched = req.body

    if(!(classroomDocId && dataToBePatched)) {
        return apiResponse.incompleteRequestBodyResponse(res, 'Provide both classroomDocId and request body')
    }

    try {
        if(dataToBePatched.studentDocId) await getProfileDataFromDocId(dataToBePatched.studentDocId)
    } catch (err) {
        return apiResponse.incompleteRequestBodyResponse(res, 'Student of this docId doesnot exists')
    }

    try {
        const responseMessage = await ClassroomController.updateClassroom(classroomDocId, dataToBePatched)
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

router.get('/:classroomDocId/quizzes/', async (req, res) => {
    const { classroomDocId } = req.params

    try {
        if(classroomDocId){
            const response = await ClassroomController.getAllGeneratedQuiz(classroomDocId)
            return apiResponse.successResponse(res, { quizzes: response})
        } else {
            return apiResponse.incompleteRequestBodyResponse(res, 'Provide classroomDocId')
        }
    } catch (err) {
        return apiResponse.internalServerError(res, err.message)
    }
})

router.get('/:classroomDocId/quizzes/:quizDocId', async(req, res) => {
    // if both classroomDocId and quizDocId then return specified quiz data
    const { classroomDocId, quizDocId } = req.params

    try {

        if(classroomDocId && quizDocId) {
            const response = await ClassroomController.getSpecifiedGeneratedQuiz(classroomDocId, quizDocId)
            return apiResponse.successResponse(res, { quizData: response})
        } else {
            return apiResponse.incompleteRequestBodyResponse(res, 'Provide either both classroomDocId and quizDocId or just classroomDocId')
        }


    } catch (err) {
        return err.message === 'notfound'? apiResponse.notFoundErrorResponse(res, 'Quiz for given data doesnot exist') : apiResponse.internalServerError(res, err.message)
    }
})

router.post('/quizzes', async (req, res) => {
    // to put up new quiz
    // quiz data and classroomDocId

    if(req.method == "OPTIONS"){
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(204).send('');
    }

    const { generate } = req.query
    const { imageLinksArray, classroomDocId, quizData, quizName } = req.body

    try {
        console.log('received new request')
        let response = null
        if (generate && !imageLinksArray) {
            return apiResponse.incompleteRequestBodyResponse(res, 'Provide either generate param and imageLinksArray or classroomDocId and QuizData')
        } else if( generate && imageLinksArray && !(classroomDocId && quizData) ) {
            console.log('new req',imageLinksArray)
            console.log('dateTime param', req.body.dateTime)
            response = await ClassroomController.dummy(imageLinksArray)
        } else if ( classroomDocId && quizData && !(generate && imageLinksArray) ) {
            response = await ClassroomController.uploadGeneratedQuiz(quizData, classroomDocId, quizName)
            response = {quizDocId: response}
        } else {
            return apiResponse.incompleteRequestBodyResponse(res, 'Provide either generate param and imageLinksArray or classroomDocId and QuizData')
        }

        return apiResponse.successResponse(res, response)

    } catch (err) {
        return apiResponse.internalServerError(res, 'Failed to generate quiz')
    }

})

router.get('/:classroomDocId/quizzes/:quizDocId/attendees', async (req, res) => {
    const { classroomDocId, quizDocId } = req.params

    try {
        let response = null
        if(classroomDocId && quizDocId){
            response = await ClassroomController.getAllAttendees(classroomDocId, quizDocId)
            response = await Promise.all(response.map(attendeeData => getAllAttendeesStudentDataAsync(attendeeData)))
            response = { attendees: response }
            return apiResponse.successResponse(res, response)
        } else {
            return apiResponse.incompleteRequestBodyResponse(res, 'Provide both classroomDocId and quizDocId')
        }
    } catch (err) {
        return apiResponse.internalServerError(res, err.message)
    }
})

router.get('/:classroomDocId/quizzes/:quizDocId/attendees/:studentDocId', async (req, res) => {
    const { classroomDocId, quizDocId, studentDocId } = req.params
    const { eligibilityCheck } = req.query

    try {

        let response = null
        if (eligibilityCheck && classroomDocId && quizDocId && studentDocId) {
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

router.post('/quizzes/attendees', async (req, res) => {
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

router.get('/:classroomDocId/imagesets', async (req, res) => {
    const { classroomDocId } = req.params

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

router.post('/imagesets', async (req, res) => {
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